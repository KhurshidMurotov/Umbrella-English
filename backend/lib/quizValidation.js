import { nanoid } from "nanoid";

// Thrown for invalid teacher-submitted quiz data; the route turns it into a 400.
export class QuizValidationError extends Error {
  constructor(message) {
    super(message);
    this.name = "QuizValidationError";
    this.statusCode = 400;
  }
}

const QUESTION_TYPES = new Set([
  "choice",
  "part2-text-input",
  "part1-drag-order",
  "grouped-choice-list",
  "simple-matching",
  "banked-text-input-group",
  "listening-text-input-group",
  "cefr-listening-group",
  "cefr-reading-matching",
  "sentence-builder-group",
  "writing"
]);

function asArray(value) {
  return Array.isArray(value) ? value : [];
}

function cleanString(value) {
  return typeof value === "string" ? value.trim() : "";
}

function countBlanks(template) {
  return cleanString(template).split("___").length - 1;
}

function slugify(text) {
  const slug = String(text ?? "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 40);
  return slug || "test";
}

function uniqueStrings(values) {
  return Array.from(new Set(asArray(values).map(cleanString).filter(Boolean)));
}

function normalizeQuestion(input, quizId, index) {
  const label = `Question ${index + 1}`;
  if (!input || typeof input !== "object") {
    throw new QuizValidationError(`${label} is invalid.`);
  }

  const type = cleanString(input.type) || "choice";
  if (!QUESTION_TYPES.has(type)) {
    throw new QuizValidationError(`${label}: unknown question type "${type}".`);
  }

  const base = {
    id: cleanString(input.id) || `${quizId}-q${index + 1}`,
    type,
    part: cleanString(input.part),
    partTitle: cleanString(input.partTitle),
    prompt: cleanString(input.prompt),
    graded: type === "writing" ? false : input.graded !== false,
    points: type === "writing" ? 0 : Math.max(1, Number(input.points) || 1)
  };

  switch (type) {
    case "choice": {
      if (!base.prompt) throw new QuizValidationError(`${label}: add the question text.`);
      const options = uniqueStrings(input.options);
      if (options.length < 2) throw new QuizValidationError(`${label}: add at least two options.`);
      const correctAnswer = cleanString(input.correctAnswer);
      if (base.graded && !options.includes(correctAnswer)) {
        throw new QuizValidationError(`${label}: mark which option is correct.`);
      }
      return { ...base, options, correctAnswer };
    }

    case "part2-text-input": {
      if (!base.prompt) throw new QuizValidationError(`${label}: add the question text.`);
      const correctAnswer = cleanString(input.correctAnswer);
      if (base.graded && !correctAnswer) throw new QuizValidationError(`${label}: add the correct answer.`);
      const accepted = uniqueStrings(input.acceptedAnswers);
      return {
        ...base,
        correctAnswer,
        acceptedAnswers: accepted.length ? accepted : correctAnswer ? [correctAnswer] : [],
        hint: cleanString(input.hint)
      };
    }

    case "part1-drag-order": {
      const textTemplate = cleanString(input.textTemplate);
      const blanks = countBlanks(textTemplate);
      if (blanks < 1) throw new QuizValidationError(`${label}: the template needs at least one ___ blank.`);
      const correctSequence = asArray(input.correctSequence).map(cleanString).filter(Boolean);
      if (correctSequence.length !== blanks) {
        throw new QuizValidationError(`${label}: the correct sequence must have exactly ${blanks} word(s).`);
      }
      const wordBank = uniqueStrings(input.wordBank);
      for (const word of correctSequence) {
        if (!wordBank.includes(word)) wordBank.push(word);
      }
      return { ...base, textTemplate, wordBank, correctSequence };
    }

    case "grouped-choice-list": {
      const items = asArray(input.items).map((item, itemIndex) => {
        const options = uniqueStrings(item.options);
        if (options.length < 2) {
          throw new QuizValidationError(`${label}, item ${itemIndex + 1}: add at least two options.`);
        }
        const correctAnswer = cleanString(item.correctAnswer);
        if (base.graded && !options.includes(correctAnswer)) {
          throw new QuizValidationError(`${label}, item ${itemIndex + 1}: mark the correct option.`);
        }
        return { number: itemIndex + 1, prompt: cleanString(item.prompt), options, correctAnswer };
      });
      if (!items.length) throw new QuizValidationError(`${label}: add at least one item.`);
      return {
        ...base,
        items,
        passage: cleanString(input.passage),
        hidePassageForStudents: input.hidePassageForStudents === true
      };
    }

    case "simple-matching": {
      const choices = asArray(input.choices)
        .map((choice) => ({ label: cleanString(choice.label), text: cleanString(choice.text) }))
        .filter((choice) => choice.label);
      if (choices.length < 2) throw new QuizValidationError(`${label}: add at least two choices (A, B, …).`);
      const labels = new Set(choices.map((choice) => choice.label));
      const items = asArray(input.items).map((item, itemIndex) => {
        const correctAnswer = cleanString(item.correctAnswer);
        if (base.graded && !labels.has(correctAnswer)) {
          throw new QuizValidationError(`${label}, item ${itemIndex + 1}: pick the matching letter.`);
        }
        return { number: itemIndex + 1, prompt: cleanString(item.prompt), correctAnswer };
      });
      if (!items.length) throw new QuizValidationError(`${label}: add at least one item.`);
      return { ...base, items, choices };
    }

    case "banked-text-input-group": {
      const textTemplate = cleanString(input.textTemplate);
      const wordBank = uniqueStrings(input.wordBank);
      if (wordBank.length < 1) throw new QuizValidationError(`${label}: add at least one word-bank phrase.`);
      const items = asArray(input.items).map((item, itemIndex) => {
        const correctAnswer = cleanString(item.correctAnswer);
        if (base.graded && !wordBank.includes(correctAnswer)) {
          throw new QuizValidationError(`${label}, item ${itemIndex + 1}: the answer must be one of the word-bank phrases.`);
        }
        return { number: itemIndex + 1, correctAnswer };
      });
      if (!items.length) throw new QuizValidationError(`${label}: add at least one blank.`);
      const blanks = countBlanks(textTemplate);
      if (blanks && blanks !== items.length) {
        throw new QuizValidationError(`${label}: the template has ${blanks} blank(s) but ${items.length} item(s).`);
      }
      return { ...base, textTemplate, wordBank, items };
    }

    case "listening-text-input-group": {
      const items = asArray(input.items).map((item, itemIndex) => {
        const correctAnswer = cleanString(item.correctAnswer);
        if (base.graded && !correctAnswer) {
          throw new QuizValidationError(`${label}, item ${itemIndex + 1}: add the correct word.`);
        }
        const accepted = uniqueStrings(item.acceptedAnswers);
        return {
          number: itemIndex + 1,
          prompt: cleanString(item.prompt),
          correctAnswer,
          acceptedAnswers: accepted.length ? accepted : correctAnswer ? [correctAnswer] : []
        };
      });
      if (!items.length) throw new QuizValidationError(`${label}: add at least one blank.`);
      return {
        ...base,
        audioSrc: cleanString(input.audioSrc),
        revealMode: cleanString(input.revealMode) || "manual-audio",
        items
      };
    }

    case "cefr-listening-group": {
      const items = asArray(input.items).map((item, itemIndex) => {
        const options = asArray(item.options)
          .map((option) => ({ label: cleanString(option.label), text: cleanString(option.text) }))
          .filter((option) => option.label);
        if (options.length < 2) {
          throw new QuizValidationError(`${label}, item ${itemIndex + 1}: add at least two options.`);
        }
        const labels = new Set(options.map((option) => option.label));
        const correctAnswer = cleanString(item.correctAnswer);
        if (base.graded && !labels.has(correctAnswer)) {
          throw new QuizValidationError(`${label}, item ${itemIndex + 1}: mark the correct option.`);
        }
        return { number: itemIndex + 1, correctAnswer, options };
      });
      if (!items.length) throw new QuizValidationError(`${label}: add at least one item.`);
      return {
        ...base,
        audioSrc: cleanString(input.audioSrc),
        revealMode: cleanString(input.revealMode) || "manual-audio",
        items
      };
    }

    case "cefr-reading-matching": {
      const choices = asArray(input.choices)
        .map((choice) => ({
          label: cleanString(choice.label),
          title: cleanString(choice.title),
          text: cleanString(choice.text)
        }))
        .filter((choice) => choice.label);
      if (choices.length < 2) throw new QuizValidationError(`${label}: add at least two choices.`);
      const labels = new Set(choices.map((choice) => choice.label));
      const people = asArray(input.people).map((person, personIndex) => {
        const correctAnswer = cleanString(person.correctAnswer);
        if (base.graded && !labels.has(correctAnswer)) {
          throw new QuizValidationError(`${label}, person ${personIndex + 1}: pick the matching letter.`);
        }
        return { number: personIndex + 1, text: cleanString(person.text), correctAnswer };
      });
      if (!people.length) throw new QuizValidationError(`${label}: add at least one person.`);
      return { ...base, people, choices };
    }

    case "sentence-builder-group": {
      const items = asArray(input.items).map((item, itemIndex) => {
        const correctSequence = asArray(item.correctSequence).map(cleanString).filter(Boolean);
        if (!correctSequence.length) {
          throw new QuizValidationError(`${label}, item ${itemIndex + 1}: build the correct word order.`);
        }
        const wordBank = uniqueStrings(item.wordBank);
        for (const word of correctSequence) {
          if (!wordBank.includes(word)) wordBank.push(word);
        }
        const correctTextAnswer = cleanString(item.correctTextAnswer);
        const accepted = uniqueStrings(item.acceptedTextAnswers);
        return {
          number: itemIndex + 1,
          prompt: cleanString(item.prompt),
          fixedStart: cleanString(item.fixedStart),
          textPlaceholder: cleanString(item.textPlaceholder),
          correctTextAnswer,
          acceptedTextAnswers: accepted.length ? accepted : correctTextAnswer ? [correctTextAnswer] : [],
          wordBank,
          correctSequence
        };
      });
      if (!items.length) throw new QuizValidationError(`${label}: add at least one item.`);
      return { ...base, items };
    }

    case "writing": {
      const responseFields = asArray(input.responseFields)
        .map((field, fieldIndex) => ({
          id: cleanString(field.id) || `${base.id}-f${fieldIndex + 1}`,
          prompt: cleanString(field.prompt),
          placeholder: cleanString(field.placeholder),
          multiline: field.multiline === true
        }))
        .filter((field) => field.prompt);
      return {
        ...base,
        graded: false,
        points: 0,
        instructions: asArray(input.instructions).map(cleanString).filter(Boolean),
        placeholder: cleanString(input.placeholder),
        passage: cleanString(input.passage),
        responseFields
      };
    }

    default:
      throw new QuizValidationError(`${label}: unsupported type.`);
  }
}

// Validate and normalize teacher-submitted quiz data into the canonical quiz shape
// used everywhere else. Pass { existingId } when editing so the id is preserved.
export function normalizeQuiz(input, { existingId } = {}) {
  if (!input || typeof input !== "object") {
    throw new QuizValidationError("Quiz data is required.");
  }

  const title = cleanString(input.title);
  if (!title) throw new QuizValidationError("Test title is required.");

  const questionsInput = asArray(input.questions);
  if (!questionsInput.length) throw new QuizValidationError("Add at least one question.");

  const quizId = cleanString(existingId) || `${slugify(title)}-${nanoid(6)}`;
  const questions = questionsInput.map((question, index) => normalizeQuestion(question, quizId, index));

  return {
    id: quizId,
    title,
    description: cleanString(input.description),
    difficulty: cleanString(input.difficulty) || "Custom",
    estimatedTime: cleanString(input.estimatedTime) || `${questions.length} questions`,
    custom: true,
    flow: input.flow === "free-navigation" ? "free-navigation" : "",
    fixedUnitScoring: input.fixedUnitScoring !== false,
    disableAnswerTimer: true,
    hideTimerControl: true,
    showLiveRankingDuringTest: input.showLiveRankingDuringTest !== false,
    shuffleQuestions: input.shuffleQuestions === true,
    shuffleOptions: input.shuffleOptions === true,
    scoringDescription:
      cleanString(input.scoringDescription) || "No timer. Each correct answer is worth its points.",
    questions
  };
}
