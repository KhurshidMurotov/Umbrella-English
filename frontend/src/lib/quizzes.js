export const defaultQuiz = {
  id: "english-umbrella-basics",
  title: "Umbrella English Sprint",
  description: "10 quick English grammar questions with live pacing and instant scoring.",
  difficulty: "Intermediate",
  estimatedTime: "3 min",
  questions: [
    { id: "q1", prompt: "Choose the correct sentence.", options: ["She go to school every day.", "She goes to school every day.", "She going to school every day.", "She gone to school every day."], correctAnswer: "She goes to school every day." },
    { id: "q2", prompt: "Pick the correct verb form: They ___ dinner now.", options: ["is cooking", "are cooking", "cook", "cooks"], correctAnswer: "are cooking" },
    { id: "q3", prompt: "Which answer is correct? I have lived here ___ 2020.", options: ["for", "since", "from", "at"], correctAnswer: "since" },
    { id: "q4", prompt: "Choose the correct option: If it rains, we ___ at home.", options: ["stay", "stays", "will stay", "stayed"], correctAnswer: "will stay" },
    { id: "q5", prompt: "Select the correct sentence.", options: ["He can sings very well.", "He can singing very well.", "He can sing very well.", "He cans sing very well."], correctAnswer: "He can sing very well." },
    { id: "q6", prompt: "Fill in the blank: There ___ many books on the table.", options: ["is", "are", "was", "be"], correctAnswer: "are" },
    { id: "q7", prompt: "Choose the best answer: My sister is ___ than me.", options: ["tall", "taller", "more tall", "the tallest"], correctAnswer: "taller" },
    { id: "q8", prompt: "Pick the right option: We ___ to the museum last Sunday.", options: ["go", "gone", "went", "going"], correctAnswer: "went" },
    { id: "q9", prompt: "Which is correct? This is ___ umbrella.", options: ["a", "an", "the", "no article"], correctAnswer: "an" },
    { id: "q10", prompt: "Choose the correct verb form: She ___ finished her homework yet.", options: ["has", "have", "is", "did"], correctAnswer: "has" }
  ]
};

function choiceQuestion(part, partTitle, id, prompt, options, correctAnswer) {
  return {
    id,
    part,
    partTitle,
    type: "choice",
    graded: true,
    prompt,
    options,
    correctAnswer
  };
}

function writingQuestion(part, partTitle, id, prompt, instructions, placeholder) {
  return {
    id,
    part,
    partTitle,
    type: "writing",
    graded: false,
    prompt,
    instructions,
    placeholder,
    options: [],
    correctAnswer: ""
  };
}

export const a1Unit4Quiz = {
  id: "a1-unit-4-busy-week",
  title: "A1 Unit 4 Test",
  description: "Book-aligned 4-part unit test (drag and drop, text input, choice, writing).",
  difficulty: "A1",
  estimatedTime: "12 min",
  shuffleQuestions: false,
  shuffleOptions: false,
  questions: [
    {
      id: "u4q1",
      part: "Part 1",
      partTitle: "Kenta's Busy Week",
      type: "part1-drag-order",
      graded: true,
      points: 18,
      prompt: "Fill in the blanks using the words in the bank. There are 3 extra words.",
      textTemplate:
        "Kenta is a very busy person. On (1) ___, he (2) ___ at 6:00 a.m. He doesn't have a car, so he goes to work by (3) ___. In the evening, he (4) ___ German at a language school. On (5) ___ night, he likes to (6) ___ with his friends after work. On (7) ___, he stays home. He doesn't play sports, but he plays the (8) ___ and likes to (9) ___ films on TV.",
      wordBank: ["bus", "cycle", "drive", "Friday", "get up", "go out", "guitar", "Monday", "motorbike", "Saturday", "studies", "watch"],
      correctSequence: ["Monday", "get up", "bus", "studies", "Friday", "go out", "Saturday", "guitar", "watch"]
    },
    {
      id: "u4q2",
      part: "Part 2",
      partTitle: "An Email from Lucia",
      type: "part2-text-input",
      graded: true,
      points: 2,
      prompt: "Hi there! My brother Kenta is very busy. He (get up +) very early on Monday.",
      correctAnswer: "gets up",
      acceptedAnswers: ["gets up"],
      hint: "Use Present Simple, third person singular."
    },
    {
      id: "u4q3",
      part: "Part 2",
      partTitle: "An Email from Lucia",
      type: "part2-text-input",
      graded: true,
      points: 2,
      prompt: "He (drive -) to work because he doesn't have a car.",
      correctAnswer: "doesn't drive",
      acceptedAnswers: ["doesn't drive", "does not drive", "dont drive"],
      hint: "Negative form with he/she/it uses does not + verb."
    },
    {
      id: "u4q4",
      part: "Part 2",
      partTitle: "An Email from Lucia",
      type: "part2-text-input",
      graded: true,
      points: 2,
      prompt: "He (study +) German in the evenings.",
      correctAnswer: "studies",
      acceptedAnswers: ["studies"],
      hint: "Remember y -> ies for study in third person singular."
    },
    {
      id: "u4q5",
      part: "Part 2",
      partTitle: "An Email from Lucia",
      type: "part2-text-input",
      graded: true,
      points: 2,
      prompt: "My grandmother (play -) sports because she is eighty-four.",
      correctAnswer: "doesn't play",
      acceptedAnswers: ["doesn't play", "does not play", "doesnt play"],
      hint: "Use negative Present Simple with she."
    },
    {
      id: "u4q6",
      part: "Part 2",
      partTitle: "An Email from Lucia",
      type: "part2-text-input",
      graded: true,
      points: 2,
      prompt: "She (read +) the newspaper every day.",
      correctAnswer: "reads",
      acceptedAnswers: ["reads"],
      hint: "Add -s for she/he/it."
    },
    {
      id: "u4q7",
      part: "Part 2",
      partTitle: "An Email from Lucia",
      type: "part2-text-input",
      graded: true,
      points: 2,
      prompt: "My grandfather (watch -) TV? No, he prefers his guitar.",
      correctAnswer: "doesn't watch",
      acceptedAnswers: ["doesn't watch", "does not watch", "doesnt watch"],
      hint: "Use negative statement in context: No, he prefers his guitar."
    },
    {
      id: "u4q8",
      part: "Part 2",
      partTitle: "An Email from Lucia",
      type: "part2-text-input",
      graded: true,
      points: 2,
      prompt: "My grandmother (drive -) it.",
      correctAnswer: "doesn't drive",
      acceptedAnswers: ["doesn't drive", "does not drive", "doesnt drive"],
      hint: "Negative with she uses doesn't."
    },
    {
      id: "u4q9",
      part: "Part 2",
      partTitle: "An Email from Lucia",
      type: "part2-text-input",
      graded: true,
      points: 2,
      prompt: "My grandfather (like +) old cars, so he is the driver.",
      correctAnswer: "likes",
      acceptedAnswers: ["likes"],
      hint: "Positive third person singular."
    },
    {
      id: "u4q10",
      part: "Part 2",
      partTitle: "An Email from Lucia",
      type: "part2-text-input",
      graded: true,
      points: 2,
      prompt: "They (live -) in a big house; they have a small house in Santiago.",
      correctAnswer: "don't live",
      acceptedAnswers: ["don't live", "do not live", "dont live"],
      hint: "Negative with they uses don't."
    },
    choiceQuestion("Part 3", "Transportation and Routine Logic", "u4q11", "Kenta ___ to the university because he hasn't got a car.", ["doesn't drive", "doesn't drives"], "doesn't drive"),
    choiceQuestion("Part 3", "Transportation and Routine Logic", "u4q12", "___ on his bicycle when it is sunny?", ["Does he cycle", "cycles"], "Does he cycle"),
    choiceQuestion("Part 3", "Transportation and Routine Logic", "u4q13", "His house is ___ the bus stop, so he often takes the ___", ["near / bus", "far / train"], "near / bus"),
    choiceQuestion("Part 3", "Transportation and Routine Logic", "u4q14", "When they travel to the island, they go by ___ because they are on water.", ["ferry", "motorbike"], "ferry"),
    choiceQuestion("Part 3", "Transportation and Routine Logic", "u4q15", "___ Lucia walk to work? Yes, she ___.", ["Does / does", "Do / do"], "Does / does"),
    choiceQuestion("Part 3", "Transportation and Routine Logic", "u4q16", "My grandparents ___ in a small house.", ["live", "lives"], "live"),
    choiceQuestion("Part 3", "Transportation and Routine Logic", "u4q17", "Diego ___ the guitar in his free time.", ["plays", "play"], "plays"),
    choiceQuestion("Part 3", "Transportation and Routine Logic", "u4q18", "___ they go out in their old car?", ["Do", "Does"], "Do"),
    choiceQuestion("Part 3", "Transportation and Routine Logic", "u4q19", "I haven't got a car, but I ___ got.", ["have", "'ve"], "'ve"),
    choiceQuestion("Part 3", "Transportation and Routine Logic", "u4q20", "She ___ German on Sundays.", ["doesn't study", "isn't study"], "doesn't study"),
    writingQuestion(
      "Part 4",
      "Your Routine",
      "u4q21",
      "Write five sentences about your daily life.",
      [
        "Include two different days of the week.",
        "Include one positive sentence about a hobby or study.",
        "Include one negative sentence about transport.",
        "Include one question for a friend about their routine.",
        "Write five complete sentences in total."
      ],
      "On Monday I get up at 7:00. On Friday I study English. I do not go by bus. Do you walk to school? On Sunday I play the guitar."
    )
  ]
};

export const quizCatalog = [
  defaultQuiz,
  {
    id: "verbs-rainy-day",
    title: "Rainy Day Verbs",
    description: "Warm-up drill for tenses, auxiliaries and sentence flow.",
    difficulty: "Beginner",
    estimatedTime: "4 min",
    questions: defaultQuiz.questions
  },
  a1Unit4Quiz
];
