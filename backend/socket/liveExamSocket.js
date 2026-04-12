import { roomStore } from "../models/roomStore.js";

function sanitizeQuestions(questions) {
  return questions.map((question) => ({
    id: question.id,
    prompt: question.prompt,
    options: question.options
  }));
}

function sanitizePlayers(players) {
  return [...players]
    .sort((first, second) => second.score - first.score)
    .map((player) => ({
      socketId: player.socketId,
      name: player.name,
      score: player.score,
      violations: player.violations,
      currentQuestionIndex: player.currentQuestionIndex,
      completed: player.completed,
      answeredCurrent: player.answeredCurrent,
      questionStartedAt: player.questionStartedAt ?? null
    }));
}

function roomPayload(room) {
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
    participantCount: room.players.length + (room.hostSocketId ? 1 : 0),
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

function calculateAwardedScore(room, deadlineAt, answeredAt) {
  const duration = room.questionTime * 1000;
  const remaining = Math.max(0, deadlineAt - answeredAt);
  if (!remaining || !duration) {
    return 0;
  }

  return Math.min(100, Math.max(1, Math.ceil((remaining / duration) * 100)));
}

function advanceStudentPlayer(room, player) {
  player.answeredCurrent = false;
  player.currentQuestionIndex += 1;
  player.completed = player.currentQuestionIndex >= room.questions.length;
  player.questionStartedAt = player.completed ? null : Date.now();
}

export function registerLiveExamSocket(io) {
  io.on("connection", (socket) => {
    socket.on("joinRoom", ({ roomCode, name, role, hostToken }) => {
      const code = roomCode.toUpperCase();
      const room = roomStore.get(code);
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

      if (role !== "host" && !room.players.find((player) => player.socketId === socket.id)) {
        room.players.push({
          socketId: socket.id,
          name,
          score: 0,
          answeredCurrent: false,
          violations: 0,
          currentQuestionIndex: 0,
          questionStartedAt: room.started && room.mode === "student-paced" ? Date.now() : null,
          completed: false
        });
      }

      io.to(code).emit("roomState", roomPayload(room));
    });

    socket.on("startExam", ({ roomCode }) => {
      const room = roomStore.get(roomCode.toUpperCase());
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
        answeredCurrent: false,
        currentQuestionIndex: 0,
        questionStartedAt: Date.now(),
        completed: false
      }));

      io.to(room.code).emit("roomState", roomPayload(room));
    });

    socket.on("revealAnswers", ({ roomCode }) => {
      const room = roomStore.get(roomCode.toUpperCase());
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
      io.to(room.code).emit("roomState", roomPayload(room));
    });

    socket.on("submitAnswer", ({ roomCode, answer, name }) => {
      const room = roomStore.get(roomCode.toUpperCase());
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
        io.to(room.code).emit("roomState", roomPayload(room));
        return;
      }

      const answeredAt = Date.now();
      const deadlineAt = getDeadlineAt(room, player);
      if (answeredAt > deadlineAt) {
        socket.emit("answerFeedback", { correct: false, awardedScore: 0, timedOut: true });
        return;
      }

      player.answeredCurrent = true;
      const correct = currentQuestion.correctAnswer === answer;
      const awardedScore = correct ? calculateAwardedScore(room, deadlineAt, answeredAt) : 0;
      player.score += awardedScore;

      socket.emit("answerFeedback", { correct, awardedScore, timedOut: false });

      if (room.mode === "student-paced") {
        advanceStudentPlayer(room, player);
      }

      io.to(room.code).emit("roomState", roomPayload(room));
    });

    socket.on("questionTimeout", ({ roomCode, name }) => {
      const room = roomStore.get(roomCode.toUpperCase());
      if (!room) {
        return;
      }

      const player = getPlayer(room, socket, name);
      if (!player || player.completed) {
        return;
      }

      if (room.mode === "student-paced") {
        advanceStudentPlayer(room, player);
      } else {
        player.answeredCurrent = true;
      }

      socket.emit("answerFeedback", { correct: false, awardedScore: 0, timedOut: true });
      io.to(room.code).emit("roomState", roomPayload(room));
    });

    socket.on("nextQuestion", ({ roomCode }) => {
      const room = roomStore.get(roomCode.toUpperCase());
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

      io.to(room.code).emit("roomState", roomPayload(room));
    });

    socket.on("antiCheatFlag", ({ roomCode, name, count }) => {
      const room = roomStore.get(roomCode.toUpperCase());
      if (!room) {
        return;
      }

      const player = room.players.find((item) => item.name === name);
      if (player) {
        player.violations = count;
      }
      io.to(room.code).emit("roomState", roomPayload(room));
    });

    socket.on("disconnect", () => {
      for (const room of roomStore.values()) {
        if (room.hostSocketId === socket.id) {
          room.hostSocketId = null;
        }

        const nextPlayers = room.players.filter((player) => player.socketId !== socket.id);
        if (nextPlayers.length !== room.players.length) {
          room.players = nextPlayers;
          io.to(room.code).emit("roomState", roomPayload(room));
        }
      }
    });
  });
}
