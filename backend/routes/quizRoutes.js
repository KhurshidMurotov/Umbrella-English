import { Router } from "express";
import { removeQuizConfig, setQuizConfig } from "../data/quizConfigRegistry.js";
import { createQuiz, deleteQuiz, getQuizById, getQuizzes, updateQuiz } from "../db/quizRepository.js";
import { normalizeQuiz, QuizValidationError } from "../lib/quizValidation.js";

const router = Router();
const TEACHER_ACCESS_CODE = "teacher";

function isTeacher(request) {
  const accessCode = request.body?.accessCode ?? request.query?.accessCode ?? "";
  return String(accessCode) === TEACHER_ACCESS_CODE;
}

function handleWriteError(error, response) {
  if (error instanceof QuizValidationError || error.statusCode) {
    response.status(error.statusCode ?? 400).json({ error: error.message });
    return;
  }
  response.status(500).json({ error: "Failed to save test.", details: error.message });
}

router.get("/", async (_request, response) => {
  try {
    const quizzes = await getQuizzes();
    response.json({ quizzes });
  } catch (error) {
    response.status(500).json({ error: "Failed to load quizzes.", details: error.message });
  }
});

router.get("/:id", async (request, response) => {
  try {
    const quizzes = await getQuizzes();
    const quiz = quizzes.find((item) => item.id === request.params.id);
    if (!quiz) {
      response.status(404).json({ error: "Test not found." });
      return;
    }
    response.json({ quiz });
  } catch (error) {
    response.status(500).json({ error: "Failed to load test.", details: error.message });
  }
});

router.post("/", async (request, response) => {
  if (!isTeacher(request)) {
    response.status(403).json({ error: "Teacher access required." });
    return;
  }

  try {
    const quiz = normalizeQuiz(request.body?.quiz);
    const saved = await createQuiz(quiz);
    setQuizConfig(saved);
    response.status(201).json({ quiz: saved });
  } catch (error) {
    handleWriteError(error, response);
  }
});

router.put("/:id", async (request, response) => {
  if (!isTeacher(request)) {
    response.status(403).json({ error: "Teacher access required." });
    return;
  }

  try {
    const quiz = normalizeQuiz(request.body?.quiz, { existingId: request.params.id });
    const saved = await updateQuiz(request.params.id, quiz);
    setQuizConfig(saved);
    response.json({ quiz: saved });
  } catch (error) {
    handleWriteError(error, response);
  }
});

router.delete("/:id", async (request, response) => {
  if (!isTeacher(request)) {
    response.status(403).json({ error: "Teacher access required." });
    return;
  }

  try {
    await deleteQuiz(request.params.id);
    removeQuizConfig(request.params.id);
    response.json({ ok: true });
  } catch (error) {
    handleWriteError(error, response);
  }
});

export default router;
