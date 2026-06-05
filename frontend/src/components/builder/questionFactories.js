let keySeed = 0;

// Local-only React key (never sent to the server; stripped on save).
export function nextKey(prefix = "k") {
  keySeed += 1;
  return `${prefix}-${Date.now().toString(36)}-${keySeed}`;
}

// Type picker metadata, ordered roughly by how common/simple each type is.
export const QUESTION_TYPE_OPTIONS = [
  { type: "choice", label: "Multiple choice", hint: "One question, pick one option" },
  { type: "part2-text-input", label: "Fill the blank (typed)", hint: "Student types the answer" },
  { type: "grouped-choice-list", label: "Choice list", hint: "Several sentences, each with options" },
  { type: "simple-matching", label: "Matching", hint: "Match numbers to letters" },
  { type: "banked-text-input-group", label: "Word-bank gap fill", hint: "Pick a phrase for each blank" },
  { type: "part1-drag-order", label: "Drag to order", hint: "Drag words into one sentence" },
  { type: "sentence-builder-group", label: "Sentence builder", hint: "Order words + type a word" },
  { type: "listening-text-input-group", label: "Listening — type words", hint: "Audio + typed gaps" },
  { type: "cefr-listening-group", label: "Listening — A/B/C", hint: "Audio + multiple choice" },
  { type: "cefr-reading-matching", label: "Reading matching", hint: "Match people to texts" },
  { type: "writing", label: "Writing (not scored)", hint: "Free response, not graded" }
];

export const QUESTION_TYPE_LABELS = Object.fromEntries(
  QUESTION_TYPE_OPTIONS.map((option) => [option.type, option.label])
);

function letter(index) {
  return String.fromCharCode(65 + index);
}

export function createEmptyQuestion(type) {
  const base = {
    _key: nextKey("q"),
    type,
    part: "",
    partTitle: "",
    prompt: "",
    graded: type !== "writing",
    points: 1
  };

  switch (type) {
    case "choice":
      return { ...base, options: ["", ""], correctAnswer: "" };
    case "part2-text-input":
      return { ...base, correctAnswer: "", acceptedAnswers: [], hint: "" };
    case "part1-drag-order":
      return { ...base, textTemplate: "", wordBank: ["", ""], correctSequence: [""] };
    case "grouped-choice-list":
      return {
        ...base,
        passage: "",
        hidePassageForStudents: false,
        items: [{ _key: nextKey("it"), prompt: "", options: ["", ""], correctAnswer: "" }]
      };
    case "simple-matching":
      return {
        ...base,
        choices: [
          { _key: nextKey("ch"), label: "A", text: "" },
          { _key: nextKey("ch"), label: "B", text: "" }
        ],
        items: [{ _key: nextKey("it"), prompt: "", correctAnswer: "" }]
      };
    case "banked-text-input-group":
      return {
        ...base,
        textTemplate: "",
        wordBank: ["", ""],
        items: [{ _key: nextKey("it"), correctAnswer: "" }]
      };
    case "listening-text-input-group":
      return {
        ...base,
        audioSrc: "",
        revealMode: "manual-audio",
        items: [{ _key: nextKey("it"), prompt: "", correctAnswer: "", acceptedAnswers: [] }]
      };
    case "cefr-listening-group":
      return {
        ...base,
        audioSrc: "",
        revealMode: "manual-audio",
        items: [
          {
            _key: nextKey("it"),
            correctAnswer: "",
            options: [
              { label: "A", text: "" },
              { label: "B", text: "" },
              { label: "C", text: "" }
            ]
          }
        ]
      };
    case "cefr-reading-matching":
      return {
        ...base,
        choices: [
          { _key: nextKey("ch"), label: "A", title: "", text: "" },
          { _key: nextKey("ch"), label: "B", title: "", text: "" }
        ],
        people: [{ _key: nextKey("pe"), text: "", correctAnswer: "" }]
      };
    case "sentence-builder-group":
      return {
        ...base,
        items: [
          {
            _key: nextKey("it"),
            prompt: "",
            fixedStart: "",
            textPlaceholder: "",
            correctTextAnswer: "",
            acceptedTextAnswers: [],
            wordBank: ["", ""],
            correctSequence: [""]
          }
        ]
      };
    case "writing":
      return {
        ...base,
        graded: false,
        points: 0,
        instructions: [],
        placeholder: "",
        passage: "",
        responseFields: []
      };
    default:
      return { ...base, options: ["", ""], correctAnswer: "" };
  }
}

export function newChoice(existingCount) {
  return { _key: nextKey("ch"), label: letter(existingCount), title: "", text: "" };
}

// Deep-strip local _key fields before sending a draft to the server.
export function stripKeys(value) {
  if (Array.isArray(value)) {
    return value.map(stripKeys);
  }
  if (value && typeof value === "object") {
    const result = {};
    for (const [key, val] of Object.entries(value)) {
      if (key === "_key") continue;
      result[key] = stripKeys(val);
    }
    return result;
  }
  return value;
}
