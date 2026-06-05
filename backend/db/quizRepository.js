import { quizzes as fallbackQuizzes } from "../data/quizStore.js";
import { hasDatabase, query, withTransaction } from "./client.js";

// Ids of the hard-coded sample tests — these can never be edited or deleted by teachers.
const builtInIds = new Set(fallbackQuizzes.map((quiz) => quiz.id));

// In-memory store of teacher-created tests, used only when no DATABASE_URL is configured
// (local dev). Mirrors the roomStore fallback pattern; resets on backend restart.
const customQuizzes = [];

export function isBuiltInQuiz(id) {
  return builtInIds.has(id);
}

function mapQuizRows(quizRows, questionRows) {
  return quizRows.map((quiz) => ({
    id: quiz.id,
    title: quiz.title,
    description: quiz.description,
    difficulty: quiz.difficulty,
    estimatedTime: quiz.estimated_time,
    ...(quiz.metadata_json ?? {}),
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
    return [...fallbackQuizzes, ...customQuizzes];
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

// Insert or replace a quiz and its questions in the DB. Reuses the exact column-stripping
// scheme as schema.js seedQuizzes(): known columns are stored as columns, everything else
// (flow, fixedUnitScoring, type, items, choices, …) goes into metadata_json and is spread
// back on read by mapQuizRows.
async function persistQuizToDb(quiz) {
  await withTransaction(async (client) => {
    const { id, title, description, difficulty, estimatedTime, questions, ...metadata } = quiz;

    await client.query(
      `
        INSERT INTO quizzes (id, title, description, difficulty, estimated_time, metadata_json, created_at)
        VALUES ($1, $2, $3, $4, $5, $6::jsonb, $7)
        ON CONFLICT (id) DO UPDATE SET
          title = EXCLUDED.title,
          description = EXCLUDED.description,
          difficulty = EXCLUDED.difficulty,
          estimated_time = EXCLUDED.estimated_time,
          metadata_json = EXCLUDED.metadata_json;
      `,
      [id, title, description ?? "", difficulty ?? "", estimatedTime ?? "", JSON.stringify(metadata), Date.now()]
    );

    await client.query("DELETE FROM quiz_questions WHERE quiz_id = $1", [id]);

    for (const [index, question] of (questions ?? []).entries()) {
      const { id: questionId, prompt, options = [], correctAnswer = "", ...questionMetadata } = question;

      await client.query(
        `
          INSERT INTO quiz_questions (id, quiz_id, prompt, options_json, correct_answer, metadata_json, position)
          VALUES ($1, $2, $3, $4::jsonb, $5, $6::jsonb, $7)
          ON CONFLICT (id) DO UPDATE SET
            prompt = EXCLUDED.prompt,
            options_json = EXCLUDED.options_json,
            correct_answer = EXCLUDED.correct_answer,
            metadata_json = EXCLUDED.metadata_json,
            position = EXCLUDED.position;
        `,
        [questionId, id, prompt ?? "", JSON.stringify(options), correctAnswer, JSON.stringify(questionMetadata), index]
      );
    }
  });
}

export async function createQuiz(quiz) {
  if (hasDatabase()) {
    await persistQuizToDb(quiz);
  } else {
    const existingIndex = customQuizzes.findIndex((item) => item.id === quiz.id);
    if (existingIndex !== -1) {
      customQuizzes[existingIndex] = quiz;
    } else {
      customQuizzes.push(quiz);
    }
  }

  return quiz;
}

export async function updateQuiz(id, quiz) {
  if (isBuiltInQuiz(id)) {
    const error = new Error("Built-in sample tests cannot be edited. Duplicate it first.");
    error.statusCode = 403;
    throw error;
  }

  const nextQuiz = { ...quiz, id };

  if (hasDatabase()) {
    await persistQuizToDb(nextQuiz);
  } else {
    const existingIndex = customQuizzes.findIndex((item) => item.id === id);
    if (existingIndex === -1) {
      const error = new Error("Test not found.");
      error.statusCode = 404;
      throw error;
    }
    customQuizzes[existingIndex] = nextQuiz;
  }

  return nextQuiz;
}

export async function deleteQuiz(id) {
  if (isBuiltInQuiz(id)) {
    const error = new Error("Built-in sample tests cannot be deleted.");
    error.statusCode = 403;
    throw error;
  }

  if (hasDatabase()) {
    await query("DELETE FROM quizzes WHERE id = $1", [id]);
  } else {
    const existingIndex = customQuizzes.findIndex((item) => item.id === id);
    if (existingIndex !== -1) {
      customQuizzes.splice(existingIndex, 1);
    }
  }

  return { id };
}
