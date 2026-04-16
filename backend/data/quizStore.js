export const defaultQuiz = {
  id: "english-umbrella-basics",
  title: "Umbrella English Sprint",
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
  description: "Book-style unit test with 4 parts, including the final writing section from the workbook.",
  difficulty: "A1",
  estimatedTime: "12 min",
  shuffleQuestions: false,
  shuffleOptions: false,
  questions: [
    choiceQuestion("Part 1", "Kenta's Busy Week", "u4q1", "Kenta is a very busy person. On ___, he gets up at 6:00 a.m.", ["Monday", "Friday", "Saturday", "Sunday"], "Monday"),
    choiceQuestion("Part 1", "Kenta's Busy Week", "u4q2", "He ___ at 6:00 a.m.", ["gets up", "get up", "goes out", "watches"], "gets up"),
    choiceQuestion("Part 1", "Kenta's Busy Week", "u4q3", "He goes to work by ___.", ["bus", "car", "train", "ferry"], "bus"),
    choiceQuestion("Part 1", "Kenta's Busy Week", "u4q4", "In the evening, he ___ German at a language school.", ["studies", "study", "watches", "drives"], "studies"),
    choiceQuestion("Part 1", "Kenta's Busy Week", "u4q5", "On ___ night, he likes to go out with his friends after work.", ["Friday", "Monday", "Saturday", "Tuesday"], "Friday"),
    choiceQuestion("Part 1", "Kenta's Busy Week", "u4q6", "He likes to ___ with his friends after work.", ["go out", "watch", "study", "drive"], "go out"),
    choiceQuestion("Part 1", "Kenta's Busy Week", "u4q7", "On ___, he stays home.", ["Saturday", "Monday", "Friday", "Wednesday"], "Saturday"),
    choiceQuestion("Part 1", "Kenta's Busy Week", "u4q8", "He plays the ___.", ["guitar", "motorbike", "bus", "sport"], "guitar"),
    choiceQuestion("Part 1", "Kenta's Busy Week", "u4q9", "He likes to ___ films on TV.", ["watch", "play", "drive", "cycle"], "watch"),
    choiceQuestion("Part 2", "An Email from Lucia", "u4q10", "He ___ very early on Monday.", ["gets up", "get up", "doesn't get up", "getting up"], "gets up"),
    choiceQuestion("Part 2", "An Email from Lucia", "u4q11", "He ___ to work because he doesn't have a car.", ["doesn't drive", "drives", "drive", "isn't drive"], "doesn't drive"),
    choiceQuestion("Part 2", "An Email from Lucia", "u4q12", "He ___ German in the evenings.", ["studies", "study", "doesn't studies", "studying"], "studies"),
    choiceQuestion("Part 2", "An Email from Lucia", "u4q13", "My grandmother ___ sports because she is eighty-four.", ["doesn't play", "don't play", "isn't play", "plays"], "doesn't play"),
    choiceQuestion("Part 2", "An Email from Lucia", "u4q14", "She ___ the newspaper every day.", ["reads", "read", "doesn't read", "reading"], "reads"),
    choiceQuestion("Part 2", "An Email from Lucia", "u4q15", "Choose the correct question form.", ["Does my grandfather watch TV?", "Do my grandfather watch TV?", "My grandfather watches TV?", "Is my grandfather watch TV?"], "Does my grandfather watch TV?"),
    choiceQuestion("Part 2", "An Email from Lucia", "u4q16", "My grandmother ___ the old car.", ["doesn't drive", "drives", "don't drive", "isn't drive"], "doesn't drive"),
    choiceQuestion("Part 2", "An Email from Lucia", "u4q17", "My grandfather ___ old cars, so he is the driver.", ["likes", "like", "doesn't like", "liking"], "likes"),
    choiceQuestion("Part 2", "An Email from Lucia", "u4q18", "They ___ in a big house; they have a small house in Santiago.", ["don't live", "doesn't live", "aren't live", "live"], "don't live"),
    choiceQuestion("Part 3", "Transport and Routine", "u4q19", "Kenta ___ to the university because he hasn't got a car.", ["doesn't drive", "doesn't drives", "don't drives", "isn't drive"], "doesn't drive"),
    choiceQuestion("Part 3", "Transport and Routine", "u4q20", "___ on his bicycle when it is sunny?", ["Does he cycle", "Does he cycles", "Do he cycle", "He does cycle"], "Does he cycle"),
    choiceQuestion("Part 3", "Transport and Routine", "u4q21", "His house is ___ the bus stop.", ["near", "far", "behind", "under"], "near"),
    choiceQuestion("Part 3", "Transport and Routine", "u4q22", "His house is near the bus stop, so he often takes the ___.", ["bus", "train", "ferry", "taxi"], "bus"),
    choiceQuestion("Part 3", "Transport and Routine", "u4q23", "When they travel to the island, they go by ___.", ["ferry", "motorbike", "bus", "bicycle"], "ferry"),
    choiceQuestion("Part 3", "Transport and Routine", "u4q24", "Choose the correct pair. ___ Lucia walk to work? Yes, she ___.", ["Does / does", "Do / do", "Does / do", "Do / does"], "Does / does"),
    choiceQuestion("Part 3", "Transport and Routine", "u4q25", "My grandparents ___ in a small house.", ["live", "lives", "living", "doesn't live"], "live"),
    choiceQuestion("Part 3", "Transport and Routine", "u4q26", "Diego ___ the guitar in his free time.", ["plays", "play", "doesn't play", "playing"], "plays"),
    choiceQuestion("Part 3", "Transport and Routine", "u4q27", "___ they go out in their old car?", ["Do", "Does", "Is", "Are"], "Do"),
    choiceQuestion("Part 3", "Transport and Routine", "u4q28", "I haven't got a car, but I ___ a bike.", ["have got", "has got", "haven't got", "doesn't have got"], "have got"),
    choiceQuestion("Part 3", "Transport and Routine", "u4q29", "She ___ German on Sundays.", ["doesn't study", "isn't study", "don't study", "studies not"], "doesn't study"),
    writingQuestion(
      "Part 4",
      "Your Routine",
      "u4q30",
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

export const quizzes = [
  defaultQuiz,
  {
    id: "verbs-rainy-day",
    title: "Rainy Day Verbs",
    questions: defaultQuiz.questions
  },
  a1Unit4Quiz
];
