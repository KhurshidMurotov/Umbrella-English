import { Router } from "express";
import { nanoid } from "nanoid";
import { getQuizById } from "../db/quizRepository.js";
import { getRoomByCode, getRoomSessionStats, getTopLivePlayers, saveRoom } from "../db/roomRepository.js";

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
  const questionsSource = quiz.shuffleQuestions === false ? [...quiz.questions] : shuffleArray(quiz.questions);

  return questionsSource.map((question) => {
    const options = Array.isArray(question.options) ? question.options : [];
    const shouldShuffleOptions = (question.shuffleOptions ?? quiz.shuffleOptions) !== false;

    return {
      ...question,
      options: shouldShuffleOptions ? shuffleArray(options) : [...options]
    };
  });
}

function roomSummary(room) {
  return {
    code: room.code,
    hostName: room.hostName,
    mode: room.mode,
    quizId: room.quizId,
    quizTitle: room.quizTitle,
    questionTime: room.questionTime,
    questionPhase: room.questionPhase,
    started: room.started,
    currentQuestionIndex: room.currentQuestionIndex
  };
}

router.get("/leaderboard", async (_request, response) => {
  try {
    const players = await getTopLivePlayers();
    response.json({ players });
  } catch (error) {
    response.status(500).json({ error: "Failed to load leaderboard.", details: error.message });
  }
});

router.get("/stats", async (request, response) => {
  const accessCode = String(request.query.accessCode ?? "");
  if (accessCode !== TEACHER_ACCESS_CODE) {
    response.status(403).json({ error: "Teacher access required." });
    return;
  }

  try {
    const stats = await getRoomSessionStats();
    response.json({ stats });
  } catch (error) {
    response.status(500).json({ error: "Failed to load student statistics.", details: error.message });
  }
});

router.post("/create", async (request, response) => {
  const { hostName = "Teacher", accessCode = "", mode = "instructor-paced", quizId, questionTime = 15 } = request.body;

  if (accessCode !== TEACHER_ACCESS_CODE) {
    response.status(403).json({ error: "Invalid teacher access code." });
    return;
  }

  const quiz = await getQuizById(quizId);
  if (!quiz) {
    response.status(404).json({ error: "Quiz not found." });
    return;
  }

  const code = nanoid(6).toUpperCase();
  const hostToken = nanoid(24);
  const safeQuestionTime = Math.min(600, Math.max(5, Number(questionTime) || 15));

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
    questionPhase: mode === "instructor-paced" ? "prompt" : "answers",
    questionStartedAt: null,
    questionDeadlineAt: null,
    started: false,
    players: [],
    createdAt: Date.now()
  };

  await saveRoom(room);
  response.json({ room: roomSummary(room), hostToken });
});

router.get("/:code", async (request, response) => {
  try {
    const room = await getRoomByCode(request.params.code.toUpperCase());
    if (!room) {
      response.status(404).json({ error: "Room not found" });
      return;
    }

    response.json({ room: roomSummary(room) });
  } catch (error) {
    response.status(500).json({ error: "Failed to load room.", details: error.message });
  }
});

export default router;
