import { Router } from "express";
import { getQuizzes } from "../db/quizRepository.js";

const router = Router();

router.get("/", async (_request, response) => {
  try {
    const quizzes = await getQuizzes();
    response.json({ quizzes });
  } catch (error) {
    response.status(500).json({ error: "Failed to load quizzes.", details: error.message });
  }
});

export default router;
