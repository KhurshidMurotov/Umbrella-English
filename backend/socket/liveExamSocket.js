import { getRoomByCode, saveRoom } from "../db/roomRepository.js";
import { roomStore } from "../models/roomStore.js";

const BASE_CORRECT_POINTS = 60;
const MAX_SPEED_BONUS = 40;

function sanitizeQuestions(questions) {
  return questions.map((question) => ({
    id: question.id,
    prompt: question.prompt,
    options: question.options
  }));
}

function getAverageResponseTimeSeconds(player) {
  if (!player.answeredQuestions) {
    return 0;
  }

  return Number(((player.totalResponseTimeMs ?? 0) / player.answeredQuestions / 1000).toFixed(2));
}

function sanitizePlayers(players) {
  return [...players]
    .sort((first, second) =>
      (second.score ?? 0) - (first.score ?? 0) ||
      (second.correctAnswers ?? 0) - (first.correctAnswers ?? 0) ||
      getAverageResponseTimeSeconds(first) - getAverageResponseTimeSeconds(second)
    )
    .map((player) => ({
      socketId: player.socketId,
      name: player.name,
      score: player.score,
      correctAnswers: player.correctAnswers ?? 0,
      answeredQuestions: player.answeredQuestions ?? 0,
      averageResponseTimeSeconds: getAverageResponseTimeSeconds(player),
      connected: player.connected ?? Boolean(player.socketId),
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
  room.questionStartedAt = Date.now();
  room.questionDeadlineAt = room.questionStartedAt + room.questionTime * 1000;
}

function getPlayer(room, socket, name) {
  return room.players.find((item) => item.socketId === socket.id || item.name === name);
}

function getDeadlineAt(room, player) {
  if (room.mode === "student-paced") {
    const startedAt = player.questionStartedAt ?? Date.now();
    return startedAt + room.questionTime * 1000;
  }

  return room.questionDeadlineAt ?? Date.now();
}

function clampResponseTimeMs(room, responseTimeMs) {
  return Math.max(0, Math.min(room.questionTime * 1000, responseTimeMs));
}

function getResponseTimeMs(room, player, answeredAt) {
  const startedAt = room.mode === "student-paced"
    ? (player.questionStartedAt ?? answeredAt)
    : (room.questionStartedAt ?? answeredAt);

  return clampResponseTimeMs(room, answeredAt - startedAt);
}

function calculateAwardedScore(room, responseTimeMs) {
  const duration = room.questionTime * 1000;
  if (!duration) {
    return BASE_CORRECT_POINTS;
  }

  const safeResponseTime = clampResponseTimeMs(room, responseTimeMs);
  const speedRatio = Math.max(0, 1 - safeResponseTime / duration);
  return BASE_CORRECT_POINTS + Math.round(speedRatio * MAX_SPEED_BONUS);
}

function applyPlayerMetrics(player, { correct, responseTimeMs, awardedScore }) {
  player.answeredQuestions = (player.answeredQuestions ?? 0) + 1;
  player.totalResponseTimeMs = (player.totalResponseTimeMs ?? 0) + responseTimeMs;
  player.score += awardedScore;

  if (correct) {
    player.correctAnswers = (player.correctAnswers ?? 0) + 1;
  }
}

function advanceStudentPlayer(room, player) {
  player.answeredCurrent = false;
  player.currentQuestionIndex += 1;
  player.completed = player.currentQuestionIndex >= room.questions.length;
  player.questionStartedAt = player.completed ? null : Date.now();
}

async function persistAndBroadcast(io, room) {
  await saveRoom(room);
  io.to(room.code).emit("roomState", roomPayload(room));
}

export function registerLiveExamSocket(io) {
  io.on("connection", (socket) => {
    socket.on("joinRoom", async ({ roomCode, name, role, hostToken }) => {
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
            joinedAt: Date.now(),
            disconnectedAt: null,
            score: 0,
            correctAnswers: 0,
            answeredQuestions: 0,
            totalResponseTimeMs: 0,
            answeredCurrent: false,
            violations: 0,
            currentQuestionIndex: 0,
            questionStartedAt: room.started && room.mode === "student-paced" ? Date.now() : null,
            completed: false
          });
        }
      }

      await persistAndBroadcast(io, room);
    });

    socket.on("startExam", async ({ roomCode }) => {
      const room = await getRoomByCode(roomCode.toUpperCase());
      if (!room || !isAuthorizedHost(room, socket)) {
        socket.emit("roomError", { message: "Only the teacher can start this exam." });
        return;
      }

      room.started = true;
      room.currentQuestionIndex = 0;
      room.questionPhase = room.mode === "instructor-paced" ? "prompt" : "answers";
      if (room.mode === "instructor-paced") {
        room.questionStartedAt = null;
        room.questionDeadlineAt = null;
      } else {
        resetInstructorClock(room);
      }
      room.players = room.players.map((player) => ({
        ...player,
        connected: player.connected ?? Boolean(player.socketId),
        score: 0,
        correctAnswers: 0,
        answeredQuestions: 0,
        totalResponseTimeMs: 0,
        answeredCurrent: false,
        currentQuestionIndex: 0,
        questionStartedAt: Date.now(),
        completed: false
      }));

      await persistAndBroadcast(io, room);
    });

    socket.on("revealAnswers", async ({ roomCode }) => {
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

    socket.on("submitAnswer", async ({ roomCode, answer, name }) => {
      const room = await getRoomByCode(roomCode.toUpperCase());
      if (!room) {
        return;
      }

      if (room.mode === "instructor-paced" && room.questionPhase !== "answers") {
        return;
      }

      const player = getPlayer(room, socket, name);
      if (!player || player.answeredCurrent || player.completed) {
        return;
      }

      const questionIndex = room.mode === "student-paced" ? player.currentQuestionIndex : room.currentQuestionIndex;
      const currentQuestion = room.questions[questionIndex];
      if (!currentQuestion) {
        player.completed = true;
        await persistAndBroadcast(io, room);
        return;
      }

      const answeredAt = Date.now();
      const deadlineAt = getDeadlineAt(room, player);
      const responseTimeMs = getResponseTimeMs(room, player, answeredAt);
      if (answeredAt > deadlineAt) {
        applyPlayerMetrics(player, {
          correct: false,
          responseTimeMs: room.questionTime * 1000,
          awardedScore: 0
        });

        if (room.mode === "student-paced") {
          advanceStudentPlayer(room, player);
        } else {
          player.answeredCurrent = true;
        }

        socket.emit("answerFeedback", {
          correct: false,
          awardedScore: 0,
          timedOut: true,
          responseTimeSeconds: Number((room.questionTime).toFixed(2))
        });
        await persistAndBroadcast(io, room);
        return;
      }

      player.answeredCurrent = true;
      const correct = currentQuestion.correctAnswer === answer;
      const awardedScore = correct ? calculateAwardedScore(room, responseTimeMs) : 0;
      applyPlayerMetrics(player, { correct, responseTimeMs, awardedScore });

      socket.emit("answerFeedback", {
        correct,
        awardedScore,
        timedOut: false,
        responseTimeSeconds: Number((responseTimeMs / 1000).toFixed(2))
      });

      if (room.mode === "student-paced") {
        advanceStudentPlayer(room, player);
      }

      await persistAndBroadcast(io, room);
    });

    socket.on("questionTimeout", async ({ roomCode, name }) => {
      const room = await getRoomByCode(roomCode.toUpperCase());
      if (!room) {
        return;
      }

      const player = getPlayer(room, socket, name);
      if (!player || player.completed || player.answeredCurrent) {
        return;
      }

      applyPlayerMetrics(player, {
        correct: false,
        responseTimeMs: room.questionTime * 1000,
        awardedScore: 0
      });

      if (room.mode === "student-paced") {
        advanceStudentPlayer(room, player);
      } else {
        player.answeredCurrent = true;
      }

      socket.emit("answerFeedback", {
        correct: false,
        awardedScore: 0,
        timedOut: true,
        responseTimeSeconds: Number(room.questionTime.toFixed(2))
      });
      await persistAndBroadcast(io, room);
    });

    socket.on("nextQuestion", async ({ roomCode }) => {
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
      room.questionPhase = room.currentQuestionIndex < room.questions.length ? "prompt" : "answers";
      room.players = room.players.map((player) => ({
        ...player,
        answeredCurrent: false
      }));

      if (room.currentQuestionIndex < room.questions.length) {
        room.questionStartedAt = null;
        room.questionDeadlineAt = null;
      } else {
        room.questionStartedAt = null;
        room.questionDeadlineAt = null;
      }

      await persistAndBroadcast(io, room);
    });

    socket.on("antiCheatFlag", async ({ roomCode, name, count }) => {
      const room = await getRoomByCode(roomCode.toUpperCase());
      if (!room) {
        return;
      }

      const player = room.players.find((item) => item.name === name);
      if (player) {
        player.violations = count;
      }
      await persistAndBroadcast(io, room);
    });

    socket.on("disconnect", async () => {
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
