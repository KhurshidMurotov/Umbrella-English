import { Router } from "express";
import { quizzes } from "../data/quizStore.js";

const router = Router();

router.get("/", (_request, response) => {
  response.json({ quizzes });
});

export default router;
