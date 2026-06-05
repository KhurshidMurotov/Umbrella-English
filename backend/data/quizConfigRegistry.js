import { quizzes as builtInQuizzes } from "./quizStore.js";

// Dynamic registry of quiz-level config (flow, fixedUnitScoring, ...) keyed by quiz id.
// The live socket needs these flags synchronously while broadcasting/scoring, so we keep
// an in-memory map instead of hitting the DB on every event. It is seeded with the built-in
// quizzes at import, replaced with the full set (built-ins + DB-persisted custom tests) at
// server boot via loadQuizConfigs, and patched whenever a teacher creates/edits/deletes a
// custom test — so custom tests honor their own flow/scoring without a server restart.
const registry = new Map(builtInQuizzes.map((quiz) => [quiz.id, quiz]));

export function setQuizConfig(quiz) {
  if (quiz?.id) {
    registry.set(quiz.id, quiz);
  }
}

export function removeQuizConfig(quizId) {
  if (quizId) {
    registry.delete(quizId);
  }
}

export function loadQuizConfigs(quizzes = []) {
  registry.clear();
  for (const quiz of quizzes) {
    if (quiz?.id) {
      registry.set(quiz.id, quiz);
    }
  }
}

export function getQuizConfig(roomOrQuizId) {
  const quizId = typeof roomOrQuizId === "string" ? roomOrQuizId : roomOrQuizId?.quizId;
  return registry.get(quizId) ?? null;
}
