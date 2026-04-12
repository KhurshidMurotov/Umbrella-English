const BASE_CORRECT_POINTS = 60;
const MAX_SPEED_BONUS = 40;

export function shuffleArray(items) {
  const copy = [...items];
  for (let index = copy.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    [copy[index], copy[swapIndex]] = [copy[swapIndex], copy[index]];
  }
  return copy;
}

export function buildPlayableQuiz(quiz) {
  return {
    ...quiz,
    questions: shuffleArray(quiz.questions).map((question) => ({
      ...question,
      options: shuffleArray(question.options)
    }))
  };
}

export function calculateQuestionScore(timeLeft, duration) {
  if (!duration) {
    return BASE_CORRECT_POINTS;
  }

  const safeTime = Math.max(0, Math.min(duration, timeLeft));
  const speedRatio = safeTime / duration;
  const speedBonus = Math.round(speedRatio * MAX_SPEED_BONUS);
  return BASE_CORRECT_POINTS + speedBonus;
}

export function computeScore(questionScores) {
  return questionScores.reduce((total, score) => total + score, 0);
}
