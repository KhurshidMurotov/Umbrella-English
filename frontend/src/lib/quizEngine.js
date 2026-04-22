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
  const questionsSource = quiz.shuffleQuestions === false ? [...quiz.questions] : shuffleArray(quiz.questions);

  return {
    ...quiz,
    questions: questionsSource.map((question) => {
      const options = Array.isArray(question.options) ? question.options : [];
      const shouldShuffleOptions = (question.shuffleOptions ?? quiz.shuffleOptions) !== false;

      return {
        ...question,
        options: shouldShuffleOptions ? shuffleArray(options) : [...options]
      };
    })
  };
}

export function isScoredQuestion(question) {
  return Boolean(question) && question.graded !== false;
}

export function countScoredQuestions(quiz) {
  return (quiz?.questions ?? []).filter(isScoredQuestion).length;
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

export function normalizeAnswerText(value) {
  return String(value ?? "")
    .toLowerCase()
    .replace(/[’']/g, "")
    .replace(/\bdoes not\b/g, "doesnt")
    .replace(/\bdo not\b/g, "dont")
    .replace(/\s+/g, " ")
    .trim();
}

function compareTextAnswer(answer, acceptedAnswers = []) {
  const normalizedInput = normalizeAnswerText(answer);
  return acceptedAnswers.some((item) => normalizeAnswerText(item) === normalizedInput);
}

export function isAnswerCorrect(question, answer) {
  if (!question) {
    return false;
  }

  if (question.type === "part1-drag-order") {
    if (!Array.isArray(answer) || !Array.isArray(question.correctSequence)) {
      return false;
    }

    if (answer.length !== question.correctSequence.length) {
      return false;
    }

    return answer.every((item, index) => normalizeAnswerText(item) === normalizeAnswerText(question.correctSequence[index]));
  }

  if (question.type === "part2-text-input") {
    const acceptedAnswers = question.acceptedAnswers?.length ? question.acceptedAnswers : [question.correctAnswer];
    return compareTextAnswer(answer, acceptedAnswers);
  }

  return String(answer ?? "") === String(question.correctAnswer ?? "");
}
