import { Router } from "express";
import { nanoid } from "nanoid";
import { quizzes } from "../data/quizStore.js";
import { roomStore } from "../models/roomStore.js";

const router = Router();
const TEACHER_ACCESS_CODE = "teacher";

function shuffleArray(items) {
  const copy = [...items];
  for (let index = copy.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    [copy[index], copy[swapIndex]] = [copy[swapIndex], copy[index]];
  }
  return copy;
}

function buildQuestions(quiz) {
  return shuffleArray(quiz.questions).map((question) => ({
    ...question,
    options: shuffleArray(question.options)
  }));
}

function roomSummary(room) {
  return {
    code: room.code,
    hostName: room.hostName,
    mode: room.mode,
    quizId: room.quizId,
    quizTitle: room.quizTitle,
    questionTime: room.questionTime,
    started: room.started,
    currentQuestionIndex: room.currentQuestionIndex
  };
}

router.post("/create", (request, response) => {
  const { hostName = "Teacher", accessCode = "", mode = "instructor-paced", quizId, questionTime = 15 } = request.body;

  if (accessCode !== TEACHER_ACCESS_CODE) {
    response.status(403).json({ error: "Invalid teacher access code." });
    return;
  }

  const quiz = quizzes.find((item) => item.id === quizId) ?? quizzes[0];
  const code = nanoid(6).toUpperCase();
  const hostToken = nanoid(24);
  const safeQuestionTime = Math.min(60, Math.max(5, Number(questionTime) || 15));

  const room = {
    code,
    hostName,
    hostToken,
    hostSocketId: null,
    mode,
    quizId: quiz.id,
    quizTitle: quiz.title,
    questionTime: safeQuestionTime,
    questions: buildQuestions(quiz),
    currentQuestionIndex: 0,
    questionStartedAt: null,
    questionDeadlineAt: null,
    started: false,
    players: [],
    createdAt: Date.now()
  };

  roomStore.set(code, room);
  response.json({ room: roomSummary(room), hostToken });
});

router.get("/:code", (request, response) => {
  const room = roomStore.get(request.params.code.toUpperCase());
  if (!room) {
    response.status(404).json({ error: "Room not found" });
    return;
  }

  response.json({ room: roomSummary(room) });
});

export default router;
