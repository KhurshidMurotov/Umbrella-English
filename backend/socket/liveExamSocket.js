import { quizzes } from "../data/quizStore.js";
import { getRoomByCode, saveRoom } from "../db/roomRepository.js";
import { roomStore } from "../models/roomStore.js";

const BASE_CORRECT_POINTS = 60;
const MAX_ANTI_CHEAT_VIOLATIONS = 2;
const quizConfigById = new Map(quizzes.map((quiz) => [quiz.id, quiz]));

function sanitizeQuestions(questions) {
  return questions.map((question) => ({
    id: question.id,
    prompt: question.prompt,
    options: question.options ?? [],
    type: question.type ?? "choice",
    graded: question.graded !== false,
    points: Number(question.points) || 0,
    part: question.part ?? "",
    partTitle: question.partTitle ?? "",
    instructions: question.instructions ?? [],
    responseFields: question.responseFields ?? [],
    placeholder: question.placeholder ?? "",
    textTemplate: question.textTemplate ?? "",
    wordBank: question.wordBank ?? [],
    items: question.items ?? [],
    people: question.people ?? [],
    choices: question.choices ?? [],
    passage: question.passage ?? "",
    hidePassageForStudents: question.hidePassageForStudents === true,
    audioSrc: question.audioSrc ?? "",
    revealMode: question.revealMode ?? "",
    acceptedAnswers: question.acceptedAnswers ?? [],
    correctSequence: question.correctSequence ?? []
  }));
}

function isScoredQuestion(question) {
  return Boolean(question) && question.graded !== false;
}

function getQuizConfig(roomOrQuizId) {
  const quizId = typeof roomOrQuizId === "string" ? roomOrQuizId : roomOrQuizId?.quizId;
  return quizConfigById.get(quizId) ?? null;
}

function getQuestionTotalUnits(question) {
  if (question?.type === "grouped-choice-list") {
    return question.items?.length || 1;
  }

  if (question?.type === "listening-text-input-group") {
    return question.items?.length || 1;
  }

  if (question?.type === "banked-text-input-group") {
    return question.items?.length || 1;
  }

  if (question?.type === "cefr-listening-group") {
    return question.items?.length || 1;
  }

  if (question?.type === "simple-matching") {
    return question.items?.length || 1;
  }

  if (question?.type === "cefr-reading-matching") {
    return question.people?.length || 1;
  }

  if (question?.type === "sentence-builder-group") {
    return question.items?.length || 1;
  }

  return 1;
}

function sanitizePlayers(players) {
  return [...players]
    .sort((first, second) =>
      (second.score ?? 0) - (first.score ?? 0) ||
      (second.correctAnswers ?? 0) - (first.correctAnswers ?? 0)
    )
    .map((player) => ({
      socketId: player.socketId,
      name: player.name,
      score: player.score,
      correctAnswers: player.correctAnswers ?? 0,
      answeredQuestions: player.answeredQuestions ?? 0,
      connected: player.connected ?? Boolean(player.socketId),
      disqualified: player.disqualified ?? false,
      violations: player.violations,
      currentQuestionIndex: player.currentQuestionIndex,
      completed: player.completed,
      answeredCurrent: player.answeredCurrent,
      questionStartedAt: player.questionStartedAt ?? null
    }));
}

function roomPayload(room) {
  const connectedPlayers = room.players.filter((player) => player.connected !== false);

  return {
    code: room.code,
    hostName: room.hostName,
    hostConnected: Boolean(room.hostSocketId),
    mode: room.mode,
    quizId: room.quizId,
    quizTitle: room.quizTitle,
    flow: getQuizConfig(room)?.flow ?? "",
    questionTime: room.questionTime,
    questions: sanitizeQuestions(room.questions),
    currentQuestionIndex: room.currentQuestionIndex,
    questionPhase: room.questionPhase,
    questionStartedAt: room.questionStartedAt,
    questionDeadlineAt: room.questionDeadlineAt,
    started: room.started,
    participantCount: connectedPlayers.length + (room.hostSocketId ? 1 : 0),
    players: sanitizePlayers(room.players)
  };
}

function isAuthorizedHost(room, socket) {
  return room.hostSocketId === socket.id;
}

function resetInstructorClock(room) {
  // Kept only so the room snapshot has a consistent timestamp; the value is no
  // longer used for scoring or any timer (students are never cut off by time).
  room.questionStartedAt = Date.now();
  room.questionDeadlineAt = null;
}

function getPlayer(room, socket, name) {
  return room.players.find((item) => item.socketId === socket.id || item.name === name);
}

function requiresManualReveal(question) {
  return question?.revealMode === "manual-audio";
}

// Scoring is purely correctness-based — answer speed/time never affects the score.
function getAwardedScore(room, question, correct) {
  if (!correct || !isScoredQuestion(question)) {
    return 0;
  }

  if (room.quizId === "a1-unit-4-busy-week" || getQuizConfig(room)?.fixedUnitScoring === true) {
    return Number(question.points) || 1;
  }

  return BASE_CORRECT_POINTS;
}

function normalizeAnswerText(value) {
  return String(value ?? "")
    .toLowerCase()
    .replace(/[’']/g, "")
    .replace(/\bdoes not\b/g, "doesnt")
    .replace(/\bdo not\b/g, "dont")
    .replace(/\s+/g, " ")
    .trim();
}

function evaluateAnswer(question, answer) {
  const totalCount = getQuestionTotalUnits(question);

  if (!question) {
    return { correct: false, correctCount: 0, totalCount };
  }

  if (question.type === "part1-drag-order") {
    if (!Array.isArray(answer) || !Array.isArray(question.correctSequence) || answer.length !== question.correctSequence.length) {
      return { correct: false, correctCount: 0, totalCount };
    }

    const correct = answer.every((item, index) => normalizeAnswerText(item) === normalizeAnswerText(question.correctSequence[index]));
    return { correct, correctCount: correct ? 1 : 0, totalCount };
  }

  if (question.type === "part2-text-input") {
    const acceptedAnswers = question.acceptedAnswers?.length ? question.acceptedAnswers : [question.correctAnswer];
    const normalizedInput = normalizeAnswerText(answer);
    const correct = acceptedAnswers.some((item) => normalizeAnswerText(item) === normalizedInput);
    return { correct, correctCount: correct ? 1 : 0, totalCount };
  }

  if (question.type === "grouped-choice-list") {
    const selectedAnswers = answer && typeof answer === "object" ? answer : {};
    const correctCount = (question.items ?? []).reduce(
      (total, item) => total + (normalizeAnswerText(selectedAnswers[item.number]) === normalizeAnswerText(item.correctAnswer) ? 1 : 0),
      0
    );

    return { correct: correctCount === totalCount, correctCount, totalCount };
  }

  if (question.type === "listening-text-input-group") {
    const selectedAnswers = answer && typeof answer === "object" ? answer : {};
    const correctCount = (question.items ?? []).reduce((total, item) => {
      const acceptedAnswers = item.acceptedAnswers?.length ? item.acceptedAnswers : [item.correctAnswer];
      const normalizedInput = normalizeAnswerText(selectedAnswers[item.number]);
      const isCorrect = acceptedAnswers.some((acceptedAnswer) => normalizeAnswerText(acceptedAnswer) === normalizedInput);
      return total + (isCorrect ? 1 : 0);
    }, 0);

    return { correct: correctCount === totalCount, correctCount, totalCount };
  }

  if (question.type === "banked-text-input-group") {
    const selectedAnswers = answer && typeof answer === "object" ? answer : {};
    const correctCount = (question.items ?? []).reduce(
      (total, item) => total + (normalizeAnswerText(selectedAnswers[item.number]) === normalizeAnswerText(item.correctAnswer) ? 1 : 0),
      0
    );

    return { correct: correctCount === totalCount, correctCount, totalCount };
  }

  if (question.type === "cefr-listening-group") {
    const selectedAnswers = answer && typeof answer === "object" ? answer : {};
    const correctCount = (question.items ?? []).reduce(
      (total, item) => total + (normalizeAnswerText(selectedAnswers[item.number]) === normalizeAnswerText(item.correctAnswer) ? 1 : 0),
      0
    );

    return { correct: correctCount === totalCount, correctCount, totalCount };
  }

  if (question.type === "simple-matching") {
    const selectedAnswers = answer && typeof answer === "object" ? answer : {};
    const correctCount = (question.items ?? []).reduce(
      (total, item) => total + (normalizeAnswerText(selectedAnswers[item.number]) === normalizeAnswerText(item.correctAnswer) ? 1 : 0),
      0
    );

    return { correct: correctCount === totalCount, correctCount, totalCount };
  }

  if (question.type === "cefr-reading-matching") {
    const selectedAnswers = answer && typeof answer === "object" ? answer : {};
    const correctCount = (question.people ?? []).reduce(
      (total, person) => total + (normalizeAnswerText(selectedAnswers[person.number]) === normalizeAnswerText(person.correctAnswer) ? 1 : 0),
      0
    );

    return { correct: correctCount === totalCount, correctCount, totalCount };
  }

  if (question.type === "sentence-builder-group") {
    const selectedAnswers = answer && typeof answer === "object" ? answer : {};
    const correctCount = (question.items ?? []).reduce((total, item) => {
      const response = selectedAnswers[item.number] ?? {};
      const acceptedAnswers = item.acceptedTextAnswers?.length ? item.acceptedTextAnswers : [item.correctTextAnswer];
      const normalizedInput = normalizeAnswerText(response.text);
      const textCorrect = acceptedAnswers.some((acceptedAnswer) => normalizeAnswerText(acceptedAnswer) === normalizedInput);
      const sequence = Array.isArray(response.sequence) ? response.sequence : [];
      const sequenceCorrect =
        Array.isArray(item.correctSequence) &&
        sequence.length === item.correctSequence.length &&
        sequence.every((word, index) => normalizeAnswerText(word) === normalizeAnswerText(item.correctSequence[index]));

      return total + (textCorrect && sequenceCorrect ? 1 : 0);
    }, 0);

    return { correct: correctCount === totalCount, correctCount, totalCount };
  }

  const correct = String(answer ?? "") === String(question.correctAnswer ?? "");
  return { correct, correctCount: correct ? 1 : 0, totalCount };
}

function cloneAnswerPayload(answer) {
  if (Array.isArray(answer)) {
    return [...answer];
  }

  if (answer && typeof answer === "object") {
    return { ...answer };
  }

  return answer ?? "";
}

function storeAnswerDetails(player, question, answer, outcome, extra = {}) {
  if (!player || !question?.id) {
    return;
  }

  player.answerDetails = {
    ...(player.answerDetails ?? {}),
    [question.id]: {
      questionId: question.id,
      questionType: question.type ?? "choice",
      submittedAnswer: cloneAnswerPayload(answer),
      correctCount: outcome?.correctCount ?? 0,
      totalCount: outcome?.totalCount ?? getQuestionTotalUnits(question),
      correct: outcome?.correct ?? false,
      ...extra
    }
  };
}

function applyPlayerMetrics(player, { correctCount, totalCount, awardedScore }) {
  player.answeredQuestions = (player.answeredQuestions ?? 0) + totalCount;
  player.score += awardedScore;
  player.correctAnswers = (player.correctAnswers ?? 0) + correctCount;
}

function advanceStudentPlayer(room, player) {
  player.answeredCurrent = false;
  player.currentQuestionIndex += 1;
  player.completed = player.currentQuestionIndex >= room.questions.length;
  player.questionStartedAt = player.completed ? null : Date.now();
}

function disqualifyPlayer(room, player, count) {
  player.violations = Math.max(player.violations ?? 0, count);
  player.disqualified = true;
  player.completed = true;
  player.answeredCurrent = true;
  player.questionStartedAt = null;

  if (room.mode === "student-paced") {
    player.currentQuestionIndex = room.questions.length;
  }
}

async function persistAndBroadcast(io, room) {
  // Broadcast the live state first so clients update instantly. The in-memory room
  // is already mutated, so we don't make players wait for the database transaction
  // (which deletes and re-inserts every player row) before they see the new state.
  io.to(room.code).emit("roomState", roomPayload(room));
  await saveRoom(room);
}

export function registerLiveExamSocket(io) {
  io.on("connection", (socket) => {
    function handleAsyncSocketEvent(eventName, handler) {
      socket.on(eventName, (...args) => {
        Promise.resolve(handler(...args)).catch((error) => {
          console.error(`[socket:${eventName}]`, error);
          socket.emit("roomError", {
            message: "Temporary server error. Please try again."
          });
        });
      });
    }

    handleAsyncSocketEvent("joinRoom", async ({ roomCode, name, role, hostToken }) => {
      const code = roomCode.toUpperCase();
      const room = await getRoomByCode(code);
      if (!room) {
        socket.emit("roomError", { message: "Room not found." });
        return;
      }

      if (role === "host") {
        if (hostToken !== room.hostToken) {
          socket.emit("roomError", { message: "Teacher access required for host controls." });
          return;
        }
        room.hostSocketId = socket.id;
      }

      socket.join(code);

      if (role !== "host") {
        const existingPlayer = room.players.find((player) => player.name === name || player.socketId === socket.id);

        if (existingPlayer) {
          existingPlayer.socketId = socket.id;
          existingPlayer.connected = true;
          existingPlayer.disconnectedAt = null;
          if (!existingPlayer.joinedAt) {
          existingPlayer.joinedAt = Date.now();
          }
        } else {
          room.players.push({
            socketId: socket.id,
            name,
            connected: true,
            disqualified: false,
            joinedAt: Date.now(),
            disconnectedAt: null,
            score: 0,
            correctAnswers: 0,
            answeredQuestions: 0,
            answeredCurrent: false,
            violations: 0,
            currentQuestionIndex: 0,
            writingResponseText: "",
            answerDetails: {},
            questionStartedAt: room.started && room.mode === "student-paced" ? Date.now() : null,
            completed: false
          });
        }
      }

      await persistAndBroadcast(io, room);

      if (role !== "host") {
        const player = room.players.find((item) => item.name === name);
        if (player?.disqualified) {
          socket.emit("antiCheatLocked", { count: player.violations ?? MAX_ANTI_CHEAT_VIOLATIONS });
        }
      }
    });

    handleAsyncSocketEvent("startExam", async ({ roomCode }) => {
      const room = await getRoomByCode(roomCode.toUpperCase());
      if (!room || !isAuthorizedHost(room, socket)) {
        socket.emit("roomError", { message: "Only the teacher can start this exam." });
        return;
      }

      // Only listening questions (manual-audio) still use a "prompt" board phase so the
      // teacher can start the audio. Every other question opens straight to "answers" —
      // no board countdown, the question shows immediately.
      const startsOnPrompt = room.mode === "instructor-paced" && requiresManualReveal(room.questions?.[0]);

      room.started = true;
      room.currentQuestionIndex = 0;
      room.questionPhase = startsOnPrompt ? "prompt" : "answers";
      if (startsOnPrompt) {
        room.questionStartedAt = null;
        room.questionDeadlineAt = null;
      } else {
        resetInstructorClock(room);
      }
      room.players = room.players.map((player) => ({
        ...player,
        connected: player.connected ?? Boolean(player.socketId),
        disqualified: false,
        score: 0,
        correctAnswers: 0,
        answeredQuestions: 0,
        answeredCurrent: false,
        currentQuestionIndex: 0,
        writingResponseText: "",
        answerDetails: {},
        questionStartedAt: Date.now(),
        completed: false
      }));

      await persistAndBroadcast(io, room);
    });

    handleAsyncSocketEvent("revealAnswers", async ({ roomCode }) => {
      const room = await getRoomByCode(roomCode.toUpperCase());
      if (!room || !isAuthorizedHost(room, socket)) {
        socket.emit("roomError", { message: "Only the teacher can reveal answers." });
        return;
      }

      if (room.mode !== "instructor-paced") {
        socket.emit("roomError", { message: "Answer reveal is only used in instructor-paced mode." });
        return;
      }

      room.questionPhase = "answers";
      room.players = room.players.map((player) => ({
        ...player,
        answeredCurrent: false
      }));
      resetInstructorClock(room);
      await persistAndBroadcast(io, room);
    });

    handleAsyncSocketEvent("submitAnswer", async ({ roomCode, answer, name }) => {
      const room = await getRoomByCode(roomCode.toUpperCase());
      if (!room) {
        return;
      }

      if (room.mode === "instructor-paced" && room.questionPhase !== "answers") {
        return;
      }

      const player = getPlayer(room, socket, name);
      if (!player || player.answeredCurrent || player.completed || player.disqualified) {
        if (player?.disqualified) {
          socket.emit("antiCheatLocked", { count: player.violations ?? MAX_ANTI_CHEAT_VIOLATIONS });
        }
        return;
      }

      const questionIndex = room.mode === "student-paced" ? player.currentQuestionIndex : room.currentQuestionIndex;
      const currentQuestion = room.questions[questionIndex];
      if (!currentQuestion) {
        player.completed = true;
        await persistAndBroadcast(io, room);
        return;
      }

      if (!isScoredQuestion(currentQuestion)) {
        player.answeredCurrent = true;
        if (room.quizId === "a1-unit-4-busy-week" && currentQuestion.type === "writing") {
          player.writingResponseText = typeof answer === "string" ? answer.trim() : "";
        }
        storeAnswerDetails(
          player,
          currentQuestion,
          answer,
          { correct: false, correctCount: 0, totalCount: 0 },
          { awardedScore: 0, timedOut: false, ungraded: true }
        );

        if (room.mode === "student-paced") {
          advanceStudentPlayer(room, player);
        }

        socket.emit("answerFeedback", {
          correct: false,
          awardedScore: 0,
          timedOut: false,
          ungraded: true,
          text: "Part 4 is included in the book version and is not scored."
        });
        await persistAndBroadcast(io, room);
        return;
      }

      player.answeredCurrent = true;
      const outcome = evaluateAnswer(currentQuestion, answer);
      const baseAwardedScore = getAwardedScore(room, currentQuestion, outcome.correct);
      const awardedScore =
        outcome.totalCount > 1
          ? Math.round((Number(currentQuestion.points) || baseAwardedScore) * (outcome.correctCount / outcome.totalCount))
          : baseAwardedScore;
      storeAnswerDetails(player, currentQuestion, answer, outcome, {
        awardedScore,
        timedOut: false
      });
      applyPlayerMetrics(player, {
        correctCount: outcome.correctCount,
        totalCount: outcome.totalCount,
        awardedScore
      });

      socket.emit("answerFeedback", {
        correct: outcome.correct,
        awardedScore,
        timedOut: false,
        correctCount: outcome.correctCount,
        totalCount: outcome.totalCount
      });

      if (room.mode === "student-paced") {
        advanceStudentPlayer(room, player);
      }

      await persistAndBroadcast(io, room);
    });

    // Self-paced (free-navigation) exams: the student answers in any order and
    // submits everything once. We score the whole submission here in one pass.
    handleAsyncSocketEvent("submitAll", async ({ roomCode, name, answers }) => {
      const room = await getRoomByCode(roomCode.toUpperCase());
      if (!room) {
        return;
      }

      const player = getPlayer(room, socket, name);
      if (!player || player.completed || player.disqualified) {
        if (player?.disqualified) {
          socket.emit("antiCheatLocked", { count: player.violations ?? MAX_ANTI_CHEAT_VIOLATIONS });
        }
        return;
      }

      const submitted = answers && typeof answers === "object" ? answers : {};

      player.score = 0;
      player.correctAnswers = 0;
      player.answeredQuestions = 0;
      player.answerDetails = {};

      let totalScore = 0;
      let totalCorrect = 0;
      let totalUnits = 0;

      for (const question of room.questions) {
        const answer = submitted[question.id];

        if (!isScoredQuestion(question)) {
          if (question.type === "writing" && typeof answer === "string") {
            player.writingResponseText = answer.trim();
          }
          storeAnswerDetails(
            player,
            question,
            answer ?? "",
            { correct: false, correctCount: 0, totalCount: 0 },
            { awardedScore: 0, timedOut: false, ungraded: true }
          );
          continue;
        }

        const outcome = evaluateAnswer(question, answer);
        const basePoints = Number(question.points) || 1;
        const awardedScore = outcome.correctCount
          ? outcome.totalCount > 1
            ? Math.round(basePoints * (outcome.correctCount / outcome.totalCount))
            : basePoints
          : 0;

        storeAnswerDetails(player, question, answer ?? "", outcome, { awardedScore, timedOut: false });

        totalScore += awardedScore;
        totalCorrect += outcome.correctCount;
        totalUnits += outcome.totalCount;
      }

      player.score = totalScore;
      player.correctAnswers = totalCorrect;
      player.answeredQuestions = totalUnits;
      player.completed = true;
      player.answeredCurrent = true;
      player.currentQuestionIndex = room.questions.length;
      player.questionStartedAt = null;

      socket.emit("submitResult", { score: totalScore, correctAnswers: totalCorrect, totalUnits });
      await persistAndBroadcast(io, room);
    });

    handleAsyncSocketEvent("questionTimeout", async () => {
      // The answer timer is fully removed from live exams, so timeouts never apply.
      // The handler is kept as a no-op for backward compatibility with older clients.
    });

    handleAsyncSocketEvent("nextQuestion", async ({ roomCode }) => {
      const room = await getRoomByCode(roomCode.toUpperCase());
      if (!room || !isAuthorizedHost(room, socket)) {
        socket.emit("roomError", { message: "Only the teacher can move to the next question." });
        return;
      }

      if (room.mode !== "instructor-paced") {
        socket.emit("roomError", { message: "Student-paced rooms advance automatically for each student." });
        return;
      }

      room.currentQuestionIndex = Math.min(room.currentQuestionIndex + 1, room.questions.length);
      room.players = room.players.map((player) => ({
        ...player,
        answeredCurrent: false
      }));

      const nextQuestion = room.questions?.[room.currentQuestionIndex];
      const hasMoreQuestions = room.currentQuestionIndex < room.questions.length;
      // Listening questions still wait on a manual-audio "prompt" board; everything
      // else opens straight to the answers so the question shows immediately.
      const startsOnPrompt = hasMoreQuestions && requiresManualReveal(nextQuestion);

      room.questionPhase = startsOnPrompt ? "prompt" : "answers";
      if (hasMoreQuestions && !startsOnPrompt) {
        resetInstructorClock(room);
      } else {
        room.questionStartedAt = null;
        room.questionDeadlineAt = null;
      }

      await persistAndBroadcast(io, room);
    });

    handleAsyncSocketEvent("antiCheatFlag", async ({ roomCode, name, count, disqualified = false }) => {
      const room = await getRoomByCode(roomCode.toUpperCase());
      if (!room) {
        return;
      }

      const player = room.players.find((item) => item.name === name);
      if (player) {
        const safeCount = Math.max(player.violations ?? 0, Number(count) || 0);
        player.violations = safeCount;

        if (disqualified || safeCount >= MAX_ANTI_CHEAT_VIOLATIONS) {
          disqualifyPlayer(room, player, safeCount);
          socket.emit("antiCheatLocked", { count: safeCount });
        }
      }
      await persistAndBroadcast(io, room);
    });

    handleAsyncSocketEvent("disconnect", async () => {
      for (const room of roomStore.values()) {
        let changed = false;

        if (room.hostSocketId === socket.id) {
          room.hostSocketId = null;
          changed = true;
        }

        const disconnectedAt = Date.now();
        const player = room.players.find((item) => item.socketId === socket.id);
        if (player) {
          player.socketId = null;
          player.connected = false;
          player.disconnectedAt = disconnectedAt;
          changed = true;
        }

        if (changed) {
          await persistAndBroadcast(io, room);
        }
      }
    });
  });
}
