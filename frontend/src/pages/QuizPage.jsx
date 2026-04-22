import { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { AlertTriangle, Clock3, Shield, Sparkles } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import AnswerButton from "../components/AnswerButton";
import CefrListeningQuestion from "../components/CefrListeningQuestion";
import CefrReadingMatchingQuestion from "../components/CefrReadingMatchingQuestion";
import DragOrderQuestion from "../components/DragOrderQuestion";
import ProgressBar from "../components/ProgressBar";
import ShellLayout from "../components/ShellLayout";
import StatPill from "../components/StatPill";
import { useAntiCheat } from "../hooks/useAntiCheat";
import { useFeedbackSounds } from "../hooks/useFeedbackSounds";
import { useQuizTimer } from "../hooks/useQuizTimer";
import { buildPlayableQuiz, calculateQuestionScore, computeScore, countScoredQuestions, evaluateAnswer, isScoredQuestion } from "../lib/quizEngine";
import { quizCatalog } from "../lib/quizzes";
import { saveResult } from "../lib/storage";

const QUESTION_TIME = 15;
const FEEDBACK_DELAY_MS = 1200;

function splitQuestionPrompt(prompt) {
  const separators = [":", "?", "!"];
  const matches = separators
    .map((separator) => ({ separator, index: prompt.indexOf(separator) }))
    .filter((item) => item.index !== -1)
    .sort((first, second) => first.index - second.index);

  if (!matches.length) {
    return null;
  }

  const separatorIndex = matches[0].index;
  const separator = matches[0].separator;
  const title = prompt.slice(0, separatorIndex + separator.length).trim();
  const detail = prompt.slice(separatorIndex + separator.length).trim();

  if (!title || !detail) {
    return null;
  }

  return { title, detail };
}

function renderQuestionPrompt(prompt) {
  const splitPrompt = splitQuestionPrompt(prompt);

  if (!splitPrompt) {
    return <h2 className="text-3xl font-extrabold leading-[1.18] text-neutral-950">{prompt}</h2>;
  }

  return (
    <div className="space-y-3">
      <h2 className="text-3xl font-extrabold leading-[1.18] text-neutral-950">{splitPrompt.title}</h2>
      <p className="text-3xl font-extrabold leading-[1.18] text-neutral-950">{splitPrompt.detail}</p>
    </div>
  );
}

export default function QuizPage() {
  const { quizId } = useParams();
  const navigate = useNavigate();
  const selectedQuiz = quizCatalog.find((quiz) => quiz.id === quizId) ?? quizCatalog[0];
  const playableQuiz = useMemo(() => buildPlayableQuiz(selectedQuiz), [selectedQuiz]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState("");
  const [correctAnswers, setCorrectAnswers] = useState(0);
  const [questionScores, setQuestionScores] = useState([]);
  const [streak, setStreak] = useState(0);
  const [streakPeak, setStreakPeak] = useState(0);
  const [locked, setLocked] = useState(false);
  const [feedbackState, setFeedbackState] = useState(null);
  const [writtenResponse, setWrittenResponse] = useState("");
  const [writingResponses, setWritingResponses] = useState([]);
  const [typedResponse, setTypedResponse] = useState("");
  const [dragResponse, setDragResponse] = useState([]);
  const [cefrListeningResponse, setCefrListeningResponse] = useState({});
  const [cefrReadingResponse, setCefrReadingResponse] = useState({});
  const [listeningReady, setListeningReady] = useState(false);
  const { playCorrect, playWrong } = useFeedbackSounds();
  const transitionTimeoutRef = useRef(null);
  const audioRef = useRef(null);

  const currentQuestion = playableQuiz.questions[currentIndex];
  const scoredQuestionCount = useMemo(() => countScoredQuestions(playableQuiz), [playableQuiz]);
  const isWritingQuestion = currentQuestion?.type === "writing" || !isScoredQuestion(currentQuestion);
  const isDragOrderQuestion = currentQuestion?.type === "part1-drag-order";
  const isTextInputQuestion = currentQuestion?.type === "part2-text-input";
  const isCefrListeningQuestion = currentQuestion?.type === "cefr-listening-group";
  const isCefrReadingQuestion = currentQuestion?.type === "cefr-reading-matching";
  const writingFields = currentQuestion?.responseFields ?? [];
  const hasStructuredWritingFields = isWritingQuestion && writingFields.length > 0;
  const isBookScoringQuiz = playableQuiz.id === "a1-unit-4-busy-week";
  const currentScore = computeScore(questionScores);
  const questionDuration = playableQuiz.defaultQuestionTime ?? QUESTION_TIME;

  useEffect(() => {
    return () => {
      if (transitionTimeoutRef.current) {
        window.clearTimeout(transitionTimeoutRef.current);
      }
    };
  }, []);

  useEffect(() => {
    setCefrListeningResponse({});
    setCefrReadingResponse({});
    setListeningReady(false);

    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
  }, [currentQuestion?.id]);

  function finishQuiz(reason = "completed", summary = {}) {
    const finalCorrectAnswers = summary.correctAnswers ?? correctAnswers;
    const finalQuestionScores = summary.questionScores ?? questionScores;
    const totalScoredQuestions = summary.totalScoredQuestions ?? scoredQuestionCount;
    const result = {
      id: `${Date.now()}`,
      title: playableQuiz.title,
      score: computeScore(finalQuestionScores),
      accuracy: totalScoredQuestions > 0 ? Math.round((finalCorrectAnswers / totalScoredQuestions) * 100) : 0,
      correctAnswers: finalCorrectAnswers,
      wrongAnswers: Math.max(0, totalScoredQuestions - finalCorrectAnswers),
      streak: streakPeak,
      totalQuestions: totalScoredQuestions,
      violations,
      endedBy: reason
    };

    saveResult(result);
    navigate("/results", { state: result });
  }

  function goNext() {
    setSelectedOption("");
    setWrittenResponse("");
    setWritingResponses([]);
    setTypedResponse("");
    setDragResponse([]);
    setCefrListeningResponse({});
    setCefrReadingResponse({});
    setListeningReady(false);
    setLocked(false);
    setFeedbackState(null);
    if (currentIndex === playableQuiz.questions.length - 1) {
      finishQuiz();
      return;
    }
    setCurrentIndex((current) => current + 1);
  }

  const timeLeft = useQuizTimer({
    duration: questionDuration,
    questionKey: `${currentQuestion.id}-${currentIndex}`,
    isActive: !locked && !isWritingQuestion && (!isCefrListeningQuestion || listeningReady),
    onExpire: () => {
      if (locked) {
        return;
      }

      setLocked(true);
      setStreak(0);
      const nextQuestionScores = [...questionScores, 0];
      setQuestionScores(nextQuestionScores);
      setFeedbackState({
        type: "timeout",
        text: "Time is up. +0 points"
      });
      playWrong();

      if (currentIndex === playableQuiz.questions.length - 1) {
        transitionTimeoutRef.current = window.setTimeout(() => {
          finishQuiz("completed", {
            questionScores: nextQuestionScores
          });
        }, FEEDBACK_DELAY_MS);
        return;
      }

      transitionTimeoutRef.current = window.setTimeout(() => {
        goNext();
      }, FEEDBACK_DELAY_MS);
    }
  });

  const { violations, warning } = useAntiCheat({
    enabled: true,
    violationLimit: 2,
    onAutoSubmit: () => finishQuiz("anti-cheat")
  });

  function getAwardedScore(question, outcome) {
    if (!outcome.correctCount || !isScoredQuestion(question)) {
      return 0;
    }

    if (isBookScoringQuiz) {
      const basePoints = Number(question.points) || 2;
      return outcome.totalCount > 1
        ? Math.round(basePoints * (outcome.correctCount / outcome.totalCount))
        : basePoints;
    }

    const baseScore = Number(question.points) || calculateQuestionScore(timeLeft, questionDuration);
    return outcome.totalCount > 1
      ? Math.round(baseScore * (outcome.correctCount / outcome.totalCount))
      : baseScore;
  }

  function submitObjectiveAnswer(answer) {
    if (locked) {
      return;
    }

    if (typeof answer === "string") {
      setSelectedOption(answer);
    }
    setLocked(true);

    const outcome = evaluateAnswer(currentQuestion, answer);
    const awardedScore = getAwardedScore(currentQuestion, outcome);
    const nextCorrectAnswers = correctAnswers + outcome.correctCount;
    const nextQuestionScores = [...questionScores, awardedScore];

    if (outcome.correct) {
      setCorrectAnswers(nextCorrectAnswers);
      setQuestionScores(nextQuestionScores);
      setStreak((current) => {
        const next = current + 1;
        setStreakPeak((peak) => Math.max(peak, next));
        return next;
      });
      setFeedbackState({
        type: "correct",
        text:
          outcome.totalCount > 1
            ? `${outcome.correctCount} / ${outcome.totalCount} correct. +${awardedScore} points`
            : `Correct answer. +${awardedScore} points`
      });
      playCorrect();
    } else {
      setCorrectAnswers(nextCorrectAnswers);
      setQuestionScores(nextQuestionScores);
      setStreak(0);
      const hasPartialScore = outcome.totalCount > 1 && outcome.correctCount > 0;
      const feedbackText = hasPartialScore
        ? `${outcome.correctCount} / ${outcome.totalCount} correct. +${awardedScore} points`
        : isTextInputQuestion && currentQuestion.hint
          ? `Hint: ${currentQuestion.hint}`
          : "Incorrect answer. +0 points";
      setFeedbackState({
        type: hasPartialScore ? "partial" : isTextInputQuestion && currentQuestion.hint ? "hint" : "wrong",
        text: feedbackText
      });
      playWrong();
    }

    const isLastQuestion = currentIndex === playableQuiz.questions.length - 1;
    if (isLastQuestion) {
      transitionTimeoutRef.current = window.setTimeout(() => {
        finishQuiz("completed", {
          correctAnswers: nextCorrectAnswers,
          questionScores: nextQuestionScores
        });
      }, FEEDBACK_DELAY_MS);
      return;
    }

    transitionTimeoutRef.current = window.setTimeout(() => {
      goNext();
    }, FEEDBACK_DELAY_MS);
  }

  function handleAnswer(option) {
    submitObjectiveAnswer(option);
  }

  function handleTypedSubmit() {
    if (locked || !typedResponse.trim()) {
      return;
    }
    submitObjectiveAnswer(typedResponse.trim());
  }

  function handleDragSubmit() {
    const requiredSlots = currentQuestion?.correctSequence?.length ?? 0;
    if (locked || !requiredSlots || dragResponse.length < requiredSlots || dragResponse.some((item) => !item)) {
      return;
    }
    submitObjectiveAnswer(dragResponse);
  }

  function handleCefrListeningSubmit() {
    if (locked || currentQuestion.items.some((item) => !cefrListeningResponse[item.number])) {
      return;
    }

    submitObjectiveAnswer(cefrListeningResponse);
  }

  function handleCefrReadingSubmit() {
    if (locked || currentQuestion.people.some((person) => !cefrReadingResponse[person.number])) {
      return;
    }

    submitObjectiveAnswer(cefrReadingResponse);
  }

  function handleListeningStart() {
    setListeningReady(true);

    if (!audioRef.current) {
      return;
    }

    audioRef.current.currentTime = 0;
    audioRef.current.play().catch(() => {});
  }

  function handleWritingContinue() {
    const combinedWritingResponse = hasStructuredWritingFields
      ? writingResponses.map((value) => value?.trim() ?? "").filter(Boolean).join("\n")
      : writtenResponse.trim();

    if (locked || !combinedWritingResponse) {
      return;
    }

    setLocked(true);
    setFeedbackState({
      type: "neutral",
      text: "Part 4 is included in the book version and is not scored."
    });

    transitionTimeoutRef.current = window.setTimeout(() => {
      if (currentIndex === playableQuiz.questions.length - 1) {
        finishQuiz("completed");
        return;
      }

      goNext();
    }, FEEDBACK_DELAY_MS);
  }

  const feedbackToneClass =
    feedbackState?.type === "correct"
      ? "bg-emerald-50 text-emerald-900"
      : feedbackState?.type === "timeout"
        ? "bg-amber-50 text-amber-900"
        : feedbackState?.type === "neutral" || feedbackState?.type === "hint" || feedbackState?.type === "partial"
          ? "bg-amber-50 text-amber-950"
        : "bg-rose-50 text-rose-900";

  return (
    <ShellLayout>
      <div className="mx-auto max-w-4xl px-0">
        <div className="mb-4 sm:mb-6 flex flex-wrap items-center justify-between gap-2 sm:gap-4">
          <div className="min-w-0">
            <p className="text-xs sm:text-sm uppercase tracking-[0.2em] sm:tracking-[0.28em] text-neutral-500">Solo quiz</p>
            <h1 className="text-xl sm:text-3xl font-extrabold mt-1 truncate">{playableQuiz.title}</h1>
          </div>
          {!isWritingQuestion ? (
            <div className="flex items-center gap-2 rounded-full bg-white px-3 py-2 sm:px-4 sm:py-3 shadow-sm flex-shrink-0">
              <Clock3 size={16} className="sm:w-[18px] sm:h-[18px]" />
              <span className="font-bold text-sm sm:text-base">{timeLeft}s</span>
            </div>
          ) : null}
        </div>

        <div className="grid gap-2 grid-cols-2 sm:gap-4 sm:grid-cols-4">
          <StatPill label="Question" value={`${currentIndex + 1}/${playableQuiz.questions.length}`} />
          <StatPill label="Score" value={currentScore} />
          <StatPill label="Streak" value={streak} />
          <StatPill label="Violations" value={violations} />
        </div>

        <div className="mt-4 sm:mt-5">
          <ProgressBar value={currentIndex + 1} max={playableQuiz.questions.length} />
        </div>

        {warning ? (
          <div className="mt-4 sm:mt-5 flex items-center gap-2 sm:gap-3 rounded-[20px] sm:rounded-[24px] border border-amber-300 bg-amber-50 px-3 py-2 sm:px-4 sm:py-3 text-xs sm:text-sm text-amber-950">
            <AlertTriangle size={16} className="flex-shrink-0 sm:w-[18px] sm:h-[18px]" />
            <span>{warning}</span>
          </div>
        ) : null}

        <div className="mt-5 sm:mt-6 glass-card rounded-[28px] sm:rounded-[36px] p-4 sm:p-6 lg:p-8">
          {currentQuestion?.audioSrc ? <audio ref={audioRef} src={currentQuestion.audioSrc} preload="auto" className="hidden" /> : null}

          <div className="mb-4 sm:mb-5 flex items-center justify-between gap-3 sm:gap-4">
            <div className="flex items-center gap-3 text-sm text-neutral-500">
              <Shield size={18} />
              <span>Anti-cheat is active during the quiz.</span>
            </div>
            {isScoredQuestion(currentQuestion) ? (
              <div className="inline-flex items-center gap-2 rounded-full bg-amber-100 px-4 py-2 text-sm font-bold text-neutral-900">
                <Sparkles size={16} />
                {isBookScoringQuiz
                  ? `${Number(currentQuestion.points) || 2} points for correct answer`
                  : currentQuestion.points
                    ? `Up to ${currentQuestion.points} points`
                    : "60 base + speed bonus"}
              </div>
            ) : (
              <div className="inline-flex items-center gap-2 rounded-full bg-amber-100 px-4 py-2 text-sm font-bold text-neutral-900">
                <Sparkles size={16} />
                Included, not scored
              </div>
            )}
          </div>

          <AnimatePresence mode="wait">
            <motion.div key={currentQuestion.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }} transition={{ duration: 0.25 }}>
              <div className="mb-5 flex flex-wrap items-center gap-3">
                {currentQuestion.part ? (
                  <span className="rounded-full bg-amber-300 px-3 py-1 text-xs font-black uppercase tracking-[0.22em] text-neutral-900">
                    {currentQuestion.part}
                  </span>
                ) : null}
                {currentQuestion.partTitle ? (
                  <span className="text-sm font-bold uppercase tracking-[0.18em] text-neutral-500">
                    {currentQuestion.partTitle}
                  </span>
                ) : null}
              </div>
              {renderQuestionPrompt(currentQuestion.prompt)}
              <p className="mt-3 text-sm text-neutral-500">
                {isScoredQuestion(currentQuestion)
                  ? isBookScoringQuiz
                    ? `This question gives ${Number(currentQuestion.points) || 2} points when correct.`
                    : currentQuestion.points
                      ? `This part gives up to ${currentQuestion.points} points.`
                      : "Each correct answer gives 60 base points plus a speed bonus."
                  : "This final writing task is shown as in the book and does not change the score."}
              </p>
              {isWritingQuestion ? (
                <div className="mt-8">
                  <div className="rounded-[28px] border border-neutral-200 bg-white p-5">
                    <p className="text-sm font-bold uppercase tracking-[0.18em] text-neutral-500">What to include</p>
                    {hasStructuredWritingFields ? (
                      <div className="mt-4 space-y-4">
                        {writingFields.map((field, index) => (
                          <div key={field.id ?? field.prompt ?? index} className="rounded-[24px] border border-neutral-200 bg-neutral-50 p-4">
                            <div className="rounded-[18px] bg-amber-50 px-4 py-3 text-sm font-semibold text-neutral-800">
                              {field.prompt}
                            </div>
                            {field.multiline ? (
                              <textarea
                                value={writingResponses[index] ?? ""}
                                onChange={(event) =>
                                  setWritingResponses((current) => {
                                    const next = [...current];
                                    next[index] = event.target.value;
                                    return next;
                                  })
                                }
                                placeholder={field.placeholder ?? currentQuestion.placeholder}
                                disabled={locked}
                                className="mt-4 min-h-[112px] w-full rounded-[20px] border border-neutral-200 bg-white px-4 py-3 text-base leading-7 text-neutral-900 outline-none transition focus:border-neutral-950 disabled:bg-neutral-100"
                              />
                            ) : (
                              <input
                                type="text"
                                value={writingResponses[index] ?? ""}
                                onChange={(event) =>
                                  setWritingResponses((current) => {
                                    const next = [...current];
                                    next[index] = event.target.value;
                                    return next;
                                  })
                                }
                                placeholder={field.placeholder ?? currentQuestion.placeholder}
                                disabled={locked}
                                className="mt-4 w-full rounded-[20px] border border-neutral-200 bg-white px-4 py-3 text-base text-neutral-900 outline-none transition focus:border-neutral-950 disabled:bg-neutral-100"
                              />
                            )}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <>
                        <div className="mt-4 space-y-3">
                          {(currentQuestion.instructions ?? []).map((instruction) => (
                            <div key={instruction} className="rounded-[20px] bg-amber-50 px-4 py-3 text-sm font-semibold text-neutral-800">
                              {instruction}
                            </div>
                          ))}
                        </div>
                        <textarea
                          value={writtenResponse}
                          onChange={(event) => setWrittenResponse(event.target.value)}
                          placeholder={currentQuestion.placeholder}
                          disabled={locked}
                          className="mt-5 min-h-[200px] w-full rounded-[24px] border border-neutral-200 bg-white px-4 py-4 text-base leading-7 text-neutral-900 outline-none transition focus:border-neutral-950 disabled:bg-neutral-100"
                        />
                      </>
                    )}
                    <button
                      type="button"
                      onClick={handleWritingContinue}
                      disabled={
                        locked ||
                        (hasStructuredWritingFields
                          ? writingFields.some((_, index) => !(writingResponses[index] ?? "").trim())
                          : !writtenResponse.trim())
                      }
                      className="mt-5 rounded-full bg-neutral-950 px-5 py-3 font-bold text-white disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {currentIndex === playableQuiz.questions.length - 1 ? "Finish test" : "Continue"}
                    </button>
                  </div>
                </div>
              ) : isCefrListeningQuestion ? (
                <div className="mt-8 rounded-[28px] border border-neutral-200 bg-white p-5">
                  <div className="rounded-[22px] bg-amber-50 px-4 py-4 text-sm leading-7 text-neutral-800">
                    Audio does not start automatically. Press the button below to begin this listening part.
                  </div>
                  <button
                    type="button"
                    onClick={handleListeningStart}
                    disabled={locked}
                    className="mt-5 rounded-full bg-neutral-950 px-5 py-3 font-bold text-white disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {listeningReady ? "Play audio again" : "Start audio"}
                  </button>
                  <div className="mt-5">
                    <CefrListeningQuestion
                      items={currentQuestion.items}
                      value={cefrListeningResponse}
                      onChange={setCefrListeningResponse}
                      disabled={locked || !listeningReady}
                    />
                  </div>
                  <button
                    type="button"
                    onClick={handleCefrListeningSubmit}
                    disabled={locked || !listeningReady || currentQuestion.items.some((item) => !cefrListeningResponse[item.number])}
                    className="mt-5 rounded-full bg-neutral-950 px-5 py-3 font-bold text-white disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    Submit answers
                  </button>
                </div>
              ) : isCefrReadingQuestion ? (
                <div className="mt-8 rounded-[28px] border border-neutral-200 bg-white p-5">
                  <CefrReadingMatchingQuestion
                    people={currentQuestion.people}
                    choices={currentQuestion.choices}
                    value={cefrReadingResponse}
                    onChange={setCefrReadingResponse}
                    disabled={locked}
                  />
                  <button
                    type="button"
                    onClick={handleCefrReadingSubmit}
                    disabled={locked || currentQuestion.people.some((person) => !cefrReadingResponse[person.number])}
                    className="mt-5 rounded-full bg-neutral-950 px-5 py-3 font-bold text-white disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    Submit answers
                  </button>
                </div>
              ) : isDragOrderQuestion ? (
                <div className="mt-8 rounded-[28px] border border-neutral-200 bg-white p-5">
                  <DragOrderQuestion
                    template={currentQuestion.textTemplate}
                    wordBank={currentQuestion.wordBank}
                    value={dragResponse}
                    onChange={setDragResponse}
                    disabled={locked}
                    showWordBank={true}
                  />
                  <button
                    type="button"
                    onClick={handleDragSubmit}
                    disabled={locked || dragResponse.length < (currentQuestion.correctSequence?.length ?? 0) || dragResponse.some((item) => !item)}
                    className="mt-5 rounded-full bg-neutral-950 px-5 py-3 font-bold text-white disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    Submit answers
                  </button>
                </div>
              ) : isTextInputQuestion ? (
                <div className="mt-8 rounded-[28px] border border-neutral-200 bg-white p-5">
                  <input
                    type="text"
                    value={typedResponse}
                    onChange={(event) => setTypedResponse(event.target.value)}
                    disabled={locked}
                    placeholder="Type your answer"
                    className="w-full rounded-[18px] border border-neutral-200 bg-white px-4 py-3 text-base outline-none focus:border-neutral-950 disabled:bg-neutral-100"
                  />
                  <button
                    type="button"
                    onClick={handleTypedSubmit}
                    disabled={locked || !typedResponse.trim()}
                    className="mt-5 rounded-full bg-neutral-950 px-5 py-3 font-bold text-white disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    Submit answer
                  </button>
                </div>
              ) : (
                <div className="mt-8 space-y-4">
                  {currentQuestion.options.map((option) => {
                    let state = "default";
                    if (locked && option === currentQuestion.correctAnswer) {
                      state = "correct";
                    } else if (locked && option === selectedOption && option !== currentQuestion.correctAnswer) {
                      state = "wrong";
                    }

                    return <AnswerButton key={option} label={option} state={state} onClick={() => handleAnswer(option)} disabled={locked} />;
                  })}
                </div>
              )}
              {feedbackState ? (
                <div className={`mt-5 rounded-[24px] px-4 py-3 text-sm font-semibold ${feedbackToneClass}`}>
                  {feedbackState.text}
                </div>
              ) : null}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </ShellLayout>
  );
}
