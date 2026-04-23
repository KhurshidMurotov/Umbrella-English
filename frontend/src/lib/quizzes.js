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
  hideTimerControl: true,
  showLiveRankingDuringTest: false,
  showAverageTimeInResults: false,
  timerOptions: [90, 120, 180, 240],
  defaultQuestionTime: 120,
  timerLabel: "Time per part",
  scoringDescription: "Listening opens only after the teacher presses Start audio. No visible timer is shown during the CEFR live test.",
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

export const a2Unit7Quiz = {
  id: "a2-unit-test-7",
  title: "A2 Unit Test 7",
  description: "6-part unit test with compact answer sheets, reading checks and an ungraded final text task.",
  difficulty: "A2",
  estimatedTime: "15 min",
  shuffleQuestions: false,
  shuffleOptions: false,
  hideTimerControl: true,
  disableAnswerTimer: true,
  showLiveRankingDuringTest: false,
  showAverageTimeInResults: false,
  fixedUnitScoring: true,
  defaultQuestionTime: 120,
  scoringDescription: "No timer is used for this test. Each correct answer gives 1 point. Part 6 is included but not scored.",
  questions: [
    {
      id: "a2u7q1",
      part: "Part 1",
      partTitle: "Activity Collocations",
      type: "grouped-choice-list",
      graded: true,
      points: 10,
      prompt: "Complete the sentences with do, go, or play in the correct form.",
      items: [
        { number: 1, prompt: "I usually go jogging, but if the weather is bad, I __________ yoga in my living room instead.", options: ["do", "go", "play"], correctAnswer: "do" },
        { number: 2, prompt: "My brother __________ athletics at the stadium twice a week to prepare for the race.", options: ["does", "goes", "plays"], correctAnswer: "does" },
        { number: 3, prompt: "We decided to __________ fishing on the river, but we forgot the equipment.", options: ["do", "go", "play"], correctAnswer: "go" },
        { number: 4, prompt: "It’s too cold to __________ swimming in the sea, so let’s __________ basketball in the gym.", options: ["go / play", "do / play", "go / do"], correctAnswer: "go / play" },
        { number: 5, prompt: "Most people in this town __________ skiing in the mountains during January.", options: ["do", "go", "play"], correctAnswer: "go" },
        { number: 6, prompt: "I want to __________ some exercise, but I'm too tired to __________ cycling to work today.", options: ["do / go", "go / do", "play / go"], correctAnswer: "do / go" },
        { number: 7, prompt: "Does your sister __________ judo at the sports center?", options: ["do", "go", "play"], correctAnswer: "do" },
        { number: 8, prompt: "My doctor told me to __________ more physical jobs around the house to stay healthy.", options: ["do", "go", "play"], correctAnswer: "do" },
        { number: 9, prompt: "I usually __________ the stairs instead of the lift to get some exercise.", options: ["take", "do", "go", "play"], correctAnswer: "take" },
        { number: 10, prompt: "We __________ football for the university team every Tuesday evening.", options: ["do", "go", "play"], correctAnswer: "play" }
      ]
    },
    { id: "a2u7q2", part: "Part 2", partTitle: "Word Choice", type: "choice", graded: true, points: 1, prompt: "I didn't have enough money, so I had to ___ some from my brother.", options: ["borrow", "lend"], correctAnswer: "borrow" },
    { id: "a2u7q3", part: "Part 2", partTitle: "Word Choice", type: "choice", graded: true, points: 1, prompt: "She ___ me that she was tired after the long journey.", options: ["said", "told"], correctAnswer: "told" },
    { id: "a2u7q4", part: "Part 2", partTitle: "Word Choice", type: "choice", graded: true, points: 1, prompt: "Please ___ this umbrella with you when you leave; it’s raining.", options: ["bring", "take"], correctAnswer: "take" },
    { id: "a2u7q5", part: "Part 2", partTitle: "Word Choice", type: "choice", graded: true, points: 1, prompt: "I ___ the map for ten minutes, but I was still lost.", options: ["watched", "looked at"], correctAnswer: "looked at" },
    { id: "a2u7q6", part: "Part 2", partTitle: "Word Choice", type: "choice", graded: true, points: 1, prompt: "Do you want to ___ to my house for a coffee after the lesson?", options: ["come", "go"], correctAnswer: "come" },
    { id: "a2u7q7", part: "Part 2", partTitle: "Word Choice", type: "choice", graded: true, points: 1, prompt: "The coach ___ that the team played very well today.", options: ["said", "told"], correctAnswer: "said" },
    { id: "a2u7q8", part: "Part 2", partTitle: "Word Choice", type: "choice", graded: true, points: 1, prompt: "He ___ me his bicycle because my car was broken.", options: ["lent", "borrowed"], correctAnswer: "lent" },
    { id: "a2u7q9", part: "Part 2", partTitle: "Word Choice", type: "choice", graded: true, points: 1, prompt: "We ___ a very long film at the cinema last night.", options: ["looked at", "watched"], correctAnswer: "watched" },
    { id: "a2u7q10", part: "Part 2", partTitle: "Word Choice", type: "choice", graded: true, points: 1, prompt: "Can you ___ some snacks to the party on Friday?", options: ["take", "bring"], correctAnswer: "bring" },
    { id: "a2u7q11", part: "Part 2", partTitle: "Word Choice", type: "choice", graded: true, points: 1, prompt: "Let’s ___ for a walk in the park to get some fresh air.", options: ["go", "come"], correctAnswer: "go" },
    { id: "a2u7q12", part: "Part 3", partTitle: "Past Simple", type: "part2-text-input", graded: true, points: 1, prompt: "My parents ____________ (not have) time to cook, so we didn't eat a healthy dinner.", correctAnswer: "didn't have", acceptedAnswers: ["didn't have", "didnt have", "did not have"], hint: "Use didn't + base verb for the past simple negative." },
    { id: "a2u7q13", part: "Part 3", partTitle: "Past Simple", type: "part2-text-input", graded: true, points: 1, prompt: "My parents didn't have time to cook, so we ____________ (not eat) a healthy dinner.", correctAnswer: "didn't eat", acceptedAnswers: ["didn't eat", "didnt eat", "did not eat"], hint: "Use didn't + base verb for the past simple negative." },
    { id: "a2u7q14", part: "Part 3", partTitle: "Past Simple", type: "part2-text-input", graded: true, points: 1, prompt: "My sister ____________ (not do) her homework because she didn't bring her books home.", correctAnswer: "didn't do", acceptedAnswers: ["didn't do", "didnt do", "did not do"], hint: "Use didn't + base verb for the past simple negative." },
    { id: "a2u7q15", part: "Part 3", partTitle: "Past Simple", type: "part2-text-input", graded: true, points: 1, prompt: "My sister didn't do her homework because she ____________ (not bring) her books home.", correctAnswer: "didn't bring", acceptedAnswers: ["didn't bring", "didnt bring", "did not bring"], hint: "Use didn't + base verb for the past simple negative." },
    { id: "a2u7q16", part: "Part 3", partTitle: "Past Simple", type: "part2-text-input", graded: true, points: 1, prompt: "Instead, we ____________ (make) a fire in the living room.", correctAnswer: "made", acceptedAnswers: ["made"], hint: "Past simple of make is made." },
    { id: "a2u7q17", part: "Part 3", partTitle: "Past Simple", type: "part2-text-input", graded: true, points: 1, prompt: "We ____________ (sit) on the sofa for hours.", correctAnswer: "sat", acceptedAnswers: ["sat"], hint: "Past simple of sit is sat." },
    { id: "a2u7q18", part: "Part 3", partTitle: "Past Simple", type: "part2-text-input", graded: true, points: 1, prompt: "It ____________ (be) very relaxing.", correctAnswer: "was", acceptedAnswers: ["was"], hint: "Use was with it in the past simple." },
    { id: "a2u7q19", part: "Part 3", partTitle: "Past Simple", type: "part2-text-input", graded: true, points: 1, prompt: "We ____________ (see) a documentary on TV.", correctAnswer: "saw", acceptedAnswers: ["saw"], hint: "Past simple of see is saw." },
    { id: "a2u7q20", part: "Part 3", partTitle: "Past Simple", type: "part2-text-input", graded: true, points: 1, prompt: "We saw a documentary on TV and ____________ (eat) a large salad for a late snack.", correctAnswer: "ate", acceptedAnswers: ["ate"], hint: "Past simple of eat is ate." },
    { id: "a2u7q21", part: "Part 4", partTitle: "Sequencing & Logic", type: "choice", graded: true, points: 1, prompt: "Recently, I started a new hobby. ___, I bought a new camera.", options: ["First", "Next"], correctAnswer: "First" },
    { id: "a2u7q22", part: "Part 4", partTitle: "Sequencing & Logic", type: "choice", graded: true, points: 1, prompt: "___, I went to the park to take photos.", options: ["Finally", "Then"], correctAnswer: "Then" },
    { id: "a2u7q23", part: "Part 4", partTitle: "Sequencing & Logic", type: "choice", graded: true, points: 1, prompt: "___, I showed the photos to my teacher.", options: ["Lastly", "After that"], correctAnswer: "After that" },
    { id: "a2u7q24", part: "Part 4", partTitle: "Sequencing & Logic", type: "choice", graded: true, points: 1, prompt: "___, she told me they were excellent.", options: ["Finally", "First"], correctAnswer: "Finally" },
    { id: "a2u7q25", part: "Part 4", partTitle: "Sequencing & Logic", type: "choice", graded: true, points: 1, prompt: "I woke up and lastly I went to bed.", options: ["Right", "Wrong"], correctAnswer: "Wrong" },
    { id: "a2u7q26", part: "Part 4", partTitle: "Sequencing & Logic", type: "choice", graded: true, points: 1, prompt: "Firstly, I cut the fruit, and then I added the yogurt.", options: ["Right", "Wrong"], correctAnswer: "Right" },
    { id: "a2u7q27", part: "Part 4", partTitle: "Sequencing & Logic", type: "choice", graded: true, points: 1, prompt: "We played tennis at 6:00 p.m. and then we went for dinner.", options: ["Right", "Wrong"], correctAnswer: "Right" },
    { id: "a2u7q28", part: "Part 4", partTitle: "Sequencing & Logic", type: "choice", graded: true, points: 1, prompt: "The journey was long, but we first arrived home.", options: ["Right", "Wrong"], correctAnswer: "Wrong" },
    { id: "a2u7q29", part: "Part 4", partTitle: "Sequencing & Logic", type: "choice", graded: true, points: 1, prompt: "I arrived at work late; after that, I checked my emails.", options: ["Right", "Wrong"], correctAnswer: "Right" },
    { id: "a2u7q30", part: "Part 4", partTitle: "Sequencing & Logic", type: "choice", graded: true, points: 1, prompt: "I finished the test and first I started it.", options: ["Right", "Wrong"], correctAnswer: "Wrong" },
    {
      id: "a2u7q31",
      part: "Part 5",
      partTitle: "Reading Comprehension",
      type: "grouped-choice-list",
      graded: true,
      points: 5,
      prompt: "Read the text and answer the questions.",
      passage:
        "Many people eat dried fruit as a snack at work. However, half a cup of dried banana has as much energy as nine slices of bread. Cereal is also popular before going to the gym because the sugar gives you energy, but one cup can have over 20 grams of fat. Fruit yogurt is often full of sugar because the fruit is in a sweet sauce. Finally, nuts are good for you, but only eat a little because they have lots of fat.",
      items: [
        { number: 1, prompt: "Dried fruit is a healthy snack to eat in large amounts.", options: ["T", "F", "NG"], correctAnswer: "F" },
        { number: 2, prompt: "Cereal has a lot of fat and sugar.", options: ["T", "F", "NG"], correctAnswer: "T" },
        { number: 3, prompt: "Yogurt with fruit is better for you than plain yogurt.", options: ["T", "F", "NG"], correctAnswer: "NG" },
        { number: 4, prompt: "You should eat yogurt before you exercise.", options: ["T", "F", "NG"], correctAnswer: "F" },
        { number: 5, prompt: "Nuts are low in energy.", options: ["T", "F", "NG"], correctAnswer: "F" }
      ]
    },
    writingQuestion(
      "Part 6",
      "Reading Follow-up",
      "a2u7q32",
      "Complete the sentences with one or two words from the text.",
      [],
      "",
      [
        { id: "a2u7p6-1", prompt: "6. People like to eat dried fruit while they are at __________." },
        { id: "a2u7p6-2", prompt: "7. Half a cup of dried banana has the same energy as nine __________ of bread." },
        { id: "a2u7p6-3", prompt: "8. Sugar in cereal provides __________ for exercise." },
        { id: "a2u7p6-4", prompt: "9. Fruit yogurt is sugary because of the fruit __________." },
        { id: "a2u7p6-5", prompt: "10. It is important not to eat nuts __________ the time." }
      ]
    )
  ]
};

a2Unit7Quiz.questions[a2Unit7Quiz.questions.length - 1].passage =
  "Many people eat dried fruit as a snack at work. However, half a cup of dried banana has as much energy as nine slices of bread. Cereal is also popular before going to the gym because the sugar gives you energy, but one cup can have over 20 grams of fat. Fruit yogurt is often full of sugar because the fruit is in a sweet sauce. Finally, nuts are good for you, but only eat a little because they have lots of fat.";

export const a1Unit5AQuiz = {
  id: "a1-unit-test-5a",
  title: "A1 Unit Test 5A",
  description: "5-part unit test with manual-audio listening, board matching and sentence building.",
  difficulty: "A1",
  estimatedTime: "12 min",
  shuffleQuestions: false,
  shuffleOptions: false,
  hideTimerControl: true,
  disableAnswerTimer: true,
  showLiveRankingDuringTest: false,
  showAverageTimeInResults: false,
  hideResponseTimeFeedback: true,
  fixedUnitScoring: true,
  defaultQuestionTime: 120,
  scoringDescription: "No timer is used for this test. Each correct answer gives 1 point.",
  questions: [
    {
      id: "a1u5aq1",
      part: "Exercise 1",
      partTitle: "Listening",
      type: "listening-text-input-group",
      graded: true,
      points: 7,
      prompt: "Listen and write the missing words.",
      audioSrc: "/a1-unit-5a-ex1.mp3",
      revealMode: "manual-audio",
      items: [
        { number: 1, prompt: "Pedro has got a big ____________.", correctAnswer: "head", acceptedAnswers: ["head"] },
        { number: 2, prompt: "Has she got a friendly ____________?", correctAnswer: "face", acceptedAnswers: ["face"] },
        { number: 3, prompt: "Her hands are ____________ small.", correctAnswer: "very", acceptedAnswers: ["very"] },
        { number: 4, prompt: "We haven't got brown ____________.", correctAnswer: "hair", acceptedAnswers: ["hair"] },
        { number: 5, prompt: "My legs are ____________ long.", correctAnswer: "really", acceptedAnswers: ["really"] },
        { number: 6, prompt: "He's got short ____________.", correctAnswer: "arms", acceptedAnswers: ["arms"] },
        { number: 7, prompt: "I've got tired ____________ after that long walk.", correctAnswer: "feet", acceptedAnswers: ["feet"] }
      ]
    },
    {
      id: "a1u5aq2",
      part: "Exercise 2",
      partTitle: "Phrases In Context",
      type: "banked-text-input-group",
      graded: true,
      points: 4,
      prompt: "Choose the correct phrase for each gap.",
      wordBank: [
        "because it has a beautiful garden",
        "but they are very expensive",
        "because he doesn't like suits",
        "but it is very old"
      ],
      textTemplate:
        "I love that house (2) ___.\nThese shoes are beautiful (3) ___.\nMy brother often wears casual clothes (4) ___.\nWe live in a modern flat (5) ___.",
      items: [
        { number: 2, displayNumber: 2, correctAnswer: "because it has a beautiful garden" },
        { number: 3, displayNumber: 3, correctAnswer: "but they are very expensive" },
        { number: 4, displayNumber: 4, correctAnswer: "because he doesn't like suits" },
        { number: 5, displayNumber: 5, correctAnswer: "but it is very old" }
      ]
    },
    {
      id: "a1u5aq3",
      part: "Exercise 3A",
      partTitle: "Match The Opposites",
      type: "simple-matching",
      graded: true,
      points: 3,
      prompt: "Match the numbers with the correct letters.",
      items: [
        { number: 1, prompt: "Modern", correctAnswer: "B" },
        { number: 2, prompt: "Beautiful", correctAnswer: "C" },
        { number: 3, prompt: "Exciting", correctAnswer: "A" }
      ],
      choices: [
        { label: "A", text: "Boring" },
        { label: "B", text: "Traditional / Old" },
        { label: "C", text: "Ugly" }
      ]
    },
    {
      id: "a1u5aq4",
      part: "Exercise 3B",
      partTitle: "Adjectives",
      type: "banked-text-input-group",
      graded: true,
      points: 4,
      prompt: "Use the adjectives from the board to complete the text.",
      wordBank: ["unusual", "expensive", "modern", "crowded", "dirty"],
      textTemplate:
        "London is a very (4) ___ city with many new offices. Some buildings, like \"The Gherkin,\" have an (5) ___ shape that looks like a vegetable! It is often (6) ___ with too many people on the trains, and it can be (7) ___ because a coffee costs GBP5.",
      items: [
        { number: 4, displayNumber: 4, correctAnswer: "modern" },
        { number: 5, displayNumber: 5, correctAnswer: "unusual" },
        { number: 6, displayNumber: 6, correctAnswer: "crowded" },
        { number: 7, displayNumber: 7, correctAnswer: "expensive" }
      ]
    },
    {
      id: "a1u5aq5",
      part: "Exercise 4",
      partTitle: "Word Order",
      type: "sentence-builder-group",
      graded: true,
      points: 5,
      prompt: "Build each sentence and type the correct frequency word.",
      items: [
        {
          number: 1,
          prompt: "(I / 100% / wear / a white shirt / at work)",
          fixedStart: "I",
          textPlaceholder: "100% = ...",
          correctTextAnswer: "always",
          acceptedTextAnswers: ["always"],
          wordBank: ["wear", "a white shirt", "at work"],
          correctSequence: ["wear", "a white shirt", "at work"]
        },
        {
          number: 2,
          prompt: "(He / 0% / wear / brown boots / in the summer)",
          fixedStart: "He",
          textPlaceholder: "0% = ...",
          correctTextAnswer: "never",
          acceptedTextAnswers: ["never"],
          wordBank: ["wears", "brown boots", "in the summer"],
          correctSequence: ["wears", "brown boots", "in the summer"]
        },
        {
          number: 3,
          prompt: "(They / 70% / buy / expensive clothes / in Tokyo)",
          fixedStart: "They",
          textPlaceholder: "70% = ...",
          correctTextAnswer: "often",
          acceptedTextAnswers: ["often"],
          wordBank: ["buy", "expensive clothes", "in Tokyo"],
          correctSequence: ["buy", "expensive clothes", "in Tokyo"]
        },
        {
          number: 4,
          prompt: "(We / 30% / go / to the stadium / on Sundays)",
          fixedStart: "We",
          textPlaceholder: "30% = ...",
          correctTextAnswer: "sometimes",
          acceptedTextAnswers: ["sometimes"],
          wordBank: ["go", "to the stadium", "on Sundays"],
          correctSequence: ["go", "to the stadium", "on Sundays"]
        },
        {
          number: 5,
          prompt: "(She / 90% / carry / a black bag / to university)",
          fixedStart: "She",
          textPlaceholder: "90% = ...",
          correctTextAnswer: "usually",
          acceptedTextAnswers: ["usually"],
          wordBank: ["carries", "a black bag", "to university"],
          correctSequence: ["carries", "a black bag", "to university"]
        }
      ]
    },
    {
      id: "a1u5aq6",
      part: "Exercise 5",
      partTitle: "Reading",
      type: "grouped-choice-list",
      graded: true,
      points: 5,
      prompt: "Read the text and decide if the sentences are true or false.",
      passage:
        "A Day in the Life of Marco Rossi\nMarco Rossi is a famous fashion photographer. He lives in a modern apartment in Milan, but he travels a lot for his work. Today, he is in Tokyo because he loves Harajuku fashion.\n\n\"I love this city because the clothes are very unusual and colourful,\" Marco says. \"Young people here wear strange hats and bright yellow T-shirts. My job is exciting, but it is also difficult.\"\n\nMarco usually wakes up at 6:00 a.m. He always has a big breakfast because he works all day. He never wears a suit or a tie to work; he wears blue jeans and a grey jacket.",
      items: [
        { number: 1, prompt: "Marco lives in an old house in Japan.", options: ["T", "F"], correctAnswer: "F" },
        { number: 2, prompt: "He is in Tokyo because he likes the fashion there.", options: ["T", "F"], correctAnswer: "T" },
        { number: 3, prompt: "Marco thinks his job is easy.", options: ["T", "F"], correctAnswer: "F" },
        { number: 4, prompt: "He wears a suit when he works.", options: ["T", "F"], correctAnswer: "F" },
        { number: 5, prompt: "He always has a big breakfast.", options: ["T", "F"], correctAnswer: "T" }
      ]
    }
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
  a1Unit4Quiz,
  cefrQuiz,
  a2Unit7Quiz,
  a1Unit5AQuiz
];
