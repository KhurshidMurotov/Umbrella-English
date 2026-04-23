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

export function getQuestionTotalUnits(question) {
  if (question?.type === "grouped-choice-list") {
    return question.items?.length || 1;
  }

  if (question?.type === "listening-text-input-group") {
    return question.items?.length || 1;
  }

  if (question?.type === "banked-text-input-group") {
    return question.items?.length || 1;
  }

  if (question?.type === "cefr-listening-group") {
    return question.items?.length || 1;
  }

  if (question?.type === "simple-matching") {
    return question.items?.length || 1;
  }

  if (question?.type === "cefr-reading-matching") {
    return question.people?.length || 1;
  }

  if (question?.type === "sentence-builder-group") {
    return question.items?.length || 1;
  }

  return 1;
}

export function countScoredQuestions(quiz) {
  return (quiz?.questions ?? [])
    .filter(isScoredQuestion)
    .reduce((total, question) => total + getQuestionTotalUnits(question), 0);
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

export function evaluateAnswer(question, answer) {
  const totalCount = getQuestionTotalUnits(question);

  if (!question) {
    return { correct: false, correctCount: 0, totalCount };
  }

  if (question.type === "part1-drag-order") {
    if (!Array.isArray(answer) || !Array.isArray(question.correctSequence) || answer.length !== question.correctSequence.length) {
      return { correct: false, correctCount: 0, totalCount };
    }

    const correct = answer.every((item, index) => normalizeAnswerText(item) === normalizeAnswerText(question.correctSequence[index]));
    return { correct, correctCount: correct ? 1 : 0, totalCount };
  }

  if (question.type === "part2-text-input") {
    const acceptedAnswers = question.acceptedAnswers?.length ? question.acceptedAnswers : [question.correctAnswer];
    const correct = compareTextAnswer(answer, acceptedAnswers);
    return { correct, correctCount: correct ? 1 : 0, totalCount };
  }

  if (question.type === "grouped-choice-list") {
    const selectedAnswers = answer && typeof answer === "object" ? answer : {};
    const correctCount = (question.items ?? []).reduce(
      (total, item) => total + (normalizeAnswerText(selectedAnswers[item.number]) === normalizeAnswerText(item.correctAnswer) ? 1 : 0),
      0
    );

    return {
      correct: correctCount === totalCount,
      correctCount,
      totalCount
    };
  }

  if (question.type === "listening-text-input-group") {
    const selectedAnswers = answer && typeof answer === "object" ? answer : {};
    const correctCount = (question.items ?? []).reduce((total, item) => {
      const acceptedAnswers = item.acceptedAnswers?.length ? item.acceptedAnswers : [item.correctAnswer];
      return total + (compareTextAnswer(selectedAnswers[item.number], acceptedAnswers) ? 1 : 0);
    }, 0);

    return {
      correct: correctCount === totalCount,
      correctCount,
      totalCount
    };
  }

  if (question.type === "banked-text-input-group") {
    const selectedAnswers = answer && typeof answer === "object" ? answer : {};
    const correctCount = (question.items ?? []).reduce(
      (total, item) => total + (normalizeAnswerText(selectedAnswers[item.number]) === normalizeAnswerText(item.correctAnswer) ? 1 : 0),
      0
    );

    return {
      correct: correctCount === totalCount,
      correctCount,
      totalCount
    };
  }

  if (question.type === "cefr-listening-group") {
    const selectedAnswers = answer && typeof answer === "object" ? answer : {};
    const correctCount = (question.items ?? []).reduce(
      (total, item) => total + (normalizeAnswerText(selectedAnswers[item.number]) === normalizeAnswerText(item.correctAnswer) ? 1 : 0),
      0
    );

    return {
      correct: correctCount === totalCount,
      correctCount,
      totalCount
    };
  }

  if (question.type === "simple-matching") {
    const selectedAnswers = answer && typeof answer === "object" ? answer : {};
    const correctCount = (question.items ?? []).reduce(
      (total, item) => total + (normalizeAnswerText(selectedAnswers[item.number]) === normalizeAnswerText(item.correctAnswer) ? 1 : 0),
      0
    );

    return {
      correct: correctCount === totalCount,
      correctCount,
      totalCount
    };
  }

  if (question.type === "cefr-reading-matching") {
    const selectedAnswers = answer && typeof answer === "object" ? answer : {};
    const correctCount = (question.people ?? []).reduce(
      (total, person) => total + (normalizeAnswerText(selectedAnswers[person.number]) === normalizeAnswerText(person.correctAnswer) ? 1 : 0),
      0
    );

    return {
      correct: correctCount === totalCount,
      correctCount,
      totalCount
    };
  }

  if (question.type === "sentence-builder-group") {
    const selectedAnswers = answer && typeof answer === "object" ? answer : {};
    const correctCount = (question.items ?? []).reduce((total, item) => {
      const response = selectedAnswers[item.number] ?? {};
      const acceptedAnswers = item.acceptedTextAnswers?.length ? item.acceptedTextAnswers : [item.correctTextAnswer];
      const textCorrect = compareTextAnswer(response.text, acceptedAnswers);
      const sequence = Array.isArray(response.sequence) ? response.sequence : [];
      const sequenceCorrect =
        Array.isArray(item.correctSequence) &&
        sequence.length === item.correctSequence.length &&
        sequence.every((word, index) => normalizeAnswerText(word) === normalizeAnswerText(item.correctSequence[index]));

      return total + (textCorrect && sequenceCorrect ? 1 : 0);
    }, 0);

    return {
      correct: correctCount === totalCount,
      correctCount,
      totalCount
    };
  }

  const correct = String(answer ?? "") === String(question.correctAnswer ?? "");
  return { correct, correctCount: correct ? 1 : 0, totalCount };
}

export function isAnswerCorrect(question, answer) {
  return evaluateAnswer(question, answer).correct;
}
