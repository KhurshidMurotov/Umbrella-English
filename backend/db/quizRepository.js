import { quizzes as fallbackQuizzes } from "../data/quizStore.js";
import { hasDatabase, query } from "./client.js";

function mapQuizRows(quizRows, questionRows) {
  return quizRows.map((quiz) => ({
    id: quiz.id,
    title: quiz.title,
    description: quiz.description,
    difficulty: quiz.difficulty,
    estimatedTime: quiz.estimated_time,
    questions: questionRows
      .filter((question) => question.quiz_id === quiz.id)
      .sort((first, second) => first.position - second.position)
      .map((question) => ({
        id: question.id,
        prompt: question.prompt,
        options: question.options_json ?? [],
        correctAnswer: question.correct_answer ?? "",
        ...(question.metadata_json ?? {})
      }))
  }));
}

export async function getQuizzes() {
  if (!hasDatabase()) {
    return fallbackQuizzes;
  }

  const [quizResult, questionResult] = await Promise.all([
    query("SELECT * FROM quizzes ORDER BY created_at ASC, id ASC"),
    query("SELECT * FROM quiz_questions ORDER BY quiz_id ASC, position ASC")
  ]);

  return mapQuizRows(quizResult.rows, questionResult.rows);
}

export async function getQuizById(id) {
  const quizzes = await getQuizzes();
  return quizzes.find((quiz) => quiz.id === id) ?? quizzes[0] ?? null;
}
