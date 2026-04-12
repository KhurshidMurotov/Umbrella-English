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
  const safeTime = Math.max(0, timeLeft);
  if (!safeTime || !duration) {
    return 0;
  }

  return Math.min(100, Math.max(1, Math.ceil((safeTime / duration) * 100)));
}

export function computeScore(questionScores) {
  return questionScores.reduce((total, score) => total + score, 0);
}
