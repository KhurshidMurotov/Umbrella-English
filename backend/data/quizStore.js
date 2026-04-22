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

function writingQuestion(part, partTitle, id, prompt, instructions, placeholder, responseFields = []) {
  return {
    id,
    part,
    partTitle,
    type: "writing",
    graded: false,
    prompt,
    instructions,
    placeholder,
    responseFields,
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
      correctSequence: ["Monday", "get up", "bus", "studies", "Friday", "go out", "Saturday", "guitar", "watch"],
      options: [],
      correctAnswer: ""
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
      hint: "Use Present Simple, third person singular.",
      options: []
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
      hint: "Negative form with he/she/it uses does not + verb.",
      options: []
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
      hint: "Remember y -> ies for study in third person singular.",
      options: []
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
      hint: "Use negative Present Simple with she.",
      options: []
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
      hint: "Add -s for she/he/it.",
      options: []
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
      hint: "Use negative statement in context: No, he prefers his guitar.",
      options: []
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
      hint: "Negative with she uses doesn't.",
      options: []
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
      hint: "Positive third person singular.",
      options: []
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
      hint: "Negative with they uses don't.",
      options: []
    },
    choiceQuestion("Part 3", "Transportation and Routine Logic", "u4q11", "Kenta ___ to the university because he hasn't got a car.", ["doesn't drives", "doesn't drive"], "doesn't drive"),
    choiceQuestion("Part 3", "Transportation and Routine Logic", "u4q12", "___ on his bicycle when it is sunny?", ["cycles", "Does he cycle"], "Does he cycle"),
    choiceQuestion("Part 3", "Transportation and Routine Logic", "u4q13", "His house is ___ the bus stop, so he often takes the ___", ["near / bus", "far / train"], "near / bus"),
    choiceQuestion("Part 3", "Transportation and Routine Logic", "u4q14", "When they travel to the island, they go by ___ because they are on water.", ["ferry", "motorbike"], "ferry"),
    choiceQuestion("Part 3", "Transportation and Routine Logic", "u4q15", "___ Lucia walk to work? Yes, she ___.", ["Do / do", "Does / does"], "Does / does"),
    choiceQuestion("Part 3", "Transportation and Routine Logic", "u4q16", "My grandparents ___ in a small house.", ["lives", "live"], "live"),
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
        "Include one question for a friend about their routine."
      ],
      "",
      [
        {
          id: "days-of-week",
          prompt: "Include two different days of the week.",
          multiline: true
        },
        {
          id: "positive-hobby",
          prompt: "Include one positive sentence about a hobby or study."
        },
        {
          id: "negative-transport",
          prompt: "Include one negative sentence about transport."
        },
        {
          id: "friend-question",
          prompt: "Include one question for a friend about their routine."
        }
      ]
    )
  ]
};

export const cefrQuiz = {
  id: "cefr-part-1-and-2",
  title: "CEFR Test",
  description: "Teacher-led listening with manual audio start plus compact reading matching.",
  difficulty: "CEFR",
  estimatedTime: "8 min",
  shuffleQuestions: false,
  shuffleOptions: false,
  timerOptions: [90, 120, 180, 240],
  defaultQuestionTime: 120,
  timerLabel: "Time per part",
  scoringDescription: "Listening opens only after the teacher presses Start audio. Reading uses extended part timing.",
  questions: [
    {
      id: "cefrq1",
      part: "Part 1",
      partTitle: "Listening",
      type: "cefr-listening-group",
      graded: true,
      points: 16,
      prompt: "Listen and choose the best answer for questions 1-8.",
      audioSrc: "/cefr-part1-listening.mp3",
      revealMode: "manual-audio",
      items: [
        {
          number: 1,
          correctAnswer: "A",
          options: [
            { label: "A", text: "No, go ahead." },
            { label: "B", text: "No, it's not." },
            { label: "C", text: "They're nice clothes." }
          ]
        },
        {
          number: 2,
          correctAnswer: "B",
          options: [
            { label: "A", text: "No, she isn't." },
            { label: "B", text: "I think she's upstairs." },
            { label: "C", text: "It's worn out." }
          ]
        },
        {
          number: 3,
          correctAnswer: "A",
          options: [
            { label: "A", text: "Yes, that's fine." },
            { label: "B", text: "Yes, it's true." },
            { label: "C", text: "I'll take some." }
          ]
        },
        {
          number: 4,
          correctAnswer: "C",
          options: [
            { label: "A", text: "Formal dress only." },
            { label: "B", text: "It's expensive." },
            { label: "C", text: "Angie checked for me." }
          ]
        },
        {
          number: 5,
          correctAnswer: "B",
          options: [
            { label: "A", text: "Yes, I'll be brief." },
            { label: "B", text: "No, mine is in the office." },
            { label: "C", text: "Just in case." }
          ]
        },
        {
          number: 6,
          correctAnswer: "C",
          options: [
            { label: "A", text: "He said to meet him there." },
            { label: "B", text: "I haven't seen our waiter." },
            { label: "C", text: "Yes, I'm going to weigh it." }
          ]
        },
        {
          number: 7,
          correctAnswer: "C",
          options: [
            { label: "A", text: "Yes, it is." },
            { label: "B", text: "No, he doesn't mind." },
            { label: "C", text: "I'd like to speak to the manager." }
          ]
        },
        {
          number: 8,
          correctAnswer: "A",
          options: [
            { label: "A", text: "No, I'm going to go after work." },
            { label: "B", text: "I enjoyed the banquet." },
            { label: "C", text: "No, she didn't." }
          ]
        }
      ]
    },
    {
      id: "cefrq2",
      part: "Part 2",
      partTitle: "Reading",
      type: "cefr-reading-matching",
      graded: true,
      points: 16,
      prompt: "Match people 1-8 with places A-J.",
      people: [
        {
          number: 7,
          correctAnswer: "C",
          text:
            "David enjoys walking but he has injured his knee and cannot climb up hills. He would like to spend a couple of hours on a quiet walk with well-marked paths."
        },
        {
          number: 8,
          correctAnswer: "E",
          text:
            "Luigi likes to get as much exercise as possible and particularly likes climbing steep hills to get a good view. He wants to do a walk that is difficult and offers a range of scenery."
        },
        {
          number: 9,
          correctAnswer: "D",
          text:
            "Yannis has two sons of 8 and 10. He would like to take them to see some animals in the countryside. He wants to be able to buy some refreshments."
        },
        {
          number: 10,
          correctAnswer: "H",
          text:
            "Amada has had an operation and needs plenty of fresh air to help her recover. She wants to find a short, quiet walk with a beautiful place to visit on the route."
        },
        {
          number: 11,
          correctAnswer: "B",
          text:
            "Claudia's grandparents are staying with her. They are very fit and enjoy walking. They would like to visit some of the local villages and need a clearly-marked route so they don't lose their way."
        },
        {
          number: 12,
          correctAnswer: "G",
          text:
            "Mike, Kathy and their three children don't have much money, but they want a special day out this Saturday. They must be back home by 9 p.m."
        },
        {
          number: 13,
          correctAnswer: "J",
          text:
            "Kirsten is a Dutch student who is studying in Scotland. She doesn't drive, but wants a day trip to see some beautiful scenery and spend a little time by the sea."
        },
        {
          number: 14,
          correctAnswer: "A",
          text:
            "Clare and Robert want to enjoy some good food, but would also like to give their two young children a day to remember. They don't mind if they spend a lot of money."
        }
      ],
      choices: [
        {
          label: "A",
          title: "MARIE LIFE, FRANCE",
          text:
            "The chance to experience the oceans of the world. Children will love the observatory, with water all around them and enormous fish swimming above their heads. Afterwards you eat at a world-famous local restaurant before boarding the ferry at 9 p.m. Not cheap, but a great day out."
        },
        {
          label: "B",
          title: "SEA PATH",
          text:
            "This walk starts at the village of Nye Flats and the excellent signposts lead you through local streets, fields and pretty neighbouring villages. Although it will take you half a day, there are no hills at all. You can breathe the sea air and enjoy watching traditional life in busy villages."
        },
        {
          label: "C",
          title: "CUTTERS WAY",
          text:
            "This walk can take anything from 30 minutes to two hours. It's not a good walk for hill-lovers as the ground is completely flat, but it has good signposts and simple facilities for the hungry or thirsty walker. A few places or things to see would improve this walk, which can be a little dull."
        },
        {
          label: "D",
          title: "PADDOCK WAY",
          text:
            "This is really a short track across a working farm. There are plenty of chickens and sheep to see, and the farmer has turned some of the old buildings into a cafe where visitors can eat and drink. Not much for those who like peace and quiet, but good fun."
        },
        {
          label: "E",
          title: "HURDLES",
          text:
            "This is a route for the experienced walker. It crosses two rivers and includes hills of up to 500 metres, from which you can see the sea. There are several rocky paths that are unsuitable for children or older people and there are no shops, so take plenty of water."
        },
        {
          label: "F",
          title: "NEVERLAND",
          text:
            "This is a walk to take if you have a whole day to spare and want to escape from other people. It follows a narrow track which is clearly marked and has different routes for different types of walker. There are hills to climb but views are limited because of thick forest."
        },
        {
          label: "G",
          title: "FRENCH HYPERMARKET DAY TRIP",
          text:
            "Whether you want to buy or just look, you'll love this tour. The enormous Darney shopping centre is a shopper's dream. You will find a great number of local goods on sale, and clothes and kitchen goods are excellent value. Free children's entertainment all day. Leaves 10:00, back at 19:00."
        },
        {
          label: "H",
          title: "GOLD-DIGGERS END",
          text:
            "You won't find any gold on this peaceful walk, but you will find plenty of other things to see including a lovely garden which is open to the public. It's a half-hour walk on a good path with very few hills, and the old house at the end of the walk has been turned into a tea room."
        },
        {
          label: "I",
          title: "A TASTE OF THE GOOD LIFE IN FRANCE",
          text:
            "After a relaxing voyage, you visit a beautiful area which is famous for its good things to eat. There you can enjoy some sightseeing and choose from a number of wonderful restaurants. Sail back on the night crossing. Sorry, adults only."
        },
        {
          label: "J",
          title: "SEA AND MOUNTAINS IN NORTHERN IRELAND",
          text:
            "Explore the Northern Ireland countryside, including the amazing Mountains of Mourne and the small seaside holiday town of Newcastle. The ferry leaves the port in Scotland at 7:30 and arrives back at 22:20. Transport in Northern Ireland is by air-conditioned coach."
        }
      ]
    }
  ]
};

export const quizzes = [
  defaultQuiz,
  {
    id: "verbs-rainy-day",
    title: "Rainy Day Verbs",
    questions: defaultQuiz.questions
  },
  a1Unit4Quiz,
  cefrQuiz
];
