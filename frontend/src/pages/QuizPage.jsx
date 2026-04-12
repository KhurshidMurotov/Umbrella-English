import { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { AlertTriangle, Clock3, Shield, Sparkles } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import AnswerButton from "../components/AnswerButton";
import ProgressBar from "../components/ProgressBar";
import ShellLayout from "../components/ShellLayout";
import StatPill from "../components/StatPill";
import { useAntiCheat } from "../hooks/useAntiCheat";
import { useFeedbackSounds } from "../hooks/useFeedbackSounds";
import { useQuizTimer } from "../hooks/useQuizTimer";
import { buildPlayableQuiz, calculateQuestionScore, computeScore } from "../lib/quizEngine";
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
  const { playCorrect, playWrong } = useFeedbackSounds();
  const transitionTimeoutRef = useRef(null);

  const currentQuestion = playableQuiz.questions[currentIndex];
  const currentScore = computeScore(questionScores);

  useEffect(() => {
    return () => {
      if (transitionTimeoutRef.current) {
        window.clearTimeout(transitionTimeoutRef.current);
      }
    };
  }, []);

  function finishQuiz(reason = "completed", summary = {}) {
    const finalCorrectAnswers = summary.correctAnswers ?? correctAnswers;
    const finalQuestionScores = summary.questionScores ?? questionScores;
    const result = {
      id: `${Date.now()}`,
      title: playableQuiz.title,
      score: computeScore(finalQuestionScores),
      accuracy: Math.round((finalCorrectAnswers / playableQuiz.questions.length) * 100),
      correctAnswers: finalCorrectAnswers,
      wrongAnswers: playableQuiz.questions.length - finalCorrectAnswers,
      streak: streakPeak,
      totalQuestions: playableQuiz.questions.length,
      violations,
      endedBy: reason
    };

    saveResult(result);
    navigate("/results", { state: result });
  }

  function goNext() {
    setSelectedOption("");
    setLocked(false);
    setFeedbackState(null);
    if (currentIndex === playableQuiz.questions.length - 1) {
      finishQuiz();
      return;
    }
    setCurrentIndex((current) => current + 1);
  }

  const timeLeft = useQuizTimer({
    duration: QUESTION_TIME,
    questionKey: `${currentQuestion.id}-${currentIndex}`,
    isActive: !locked,
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
    onAutoSubmit: () => finishQuiz("anti-cheat")
  });

  function handleAnswer(option) {
    if (locked) {
      return;
    }

    setSelectedOption(option);
    setLocked(true);

    const isCorrect = option === currentQuestion.correctAnswer;
    const awardedScore = isCorrect ? calculateQuestionScore(timeLeft, QUESTION_TIME) : 0;
    const nextCorrectAnswers = correctAnswers + (isCorrect ? 1 : 0);
    const nextQuestionScores = [...questionScores, awardedScore];

    if (isCorrect) {
      setCorrectAnswers(nextCorrectAnswers);
      setQuestionScores(nextQuestionScores);
      setStreak((current) => {
        const next = current + 1;
        setStreakPeak((peak) => Math.max(peak, next));
        return next;
      });
      setFeedbackState({
        type: "correct",
        text: `Correct answer. +${awardedScore} points`
      });
      playCorrect();
    } else {
      setQuestionScores(nextQuestionScores);
      setStreak(0);
      setFeedbackState({
        type: "wrong",
        text: "Incorrect answer. +0 points"
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

  const feedbackToneClass =
    feedbackState?.type === "correct"
      ? "bg-emerald-50 text-emerald-900"
      : feedbackState?.type === "timeout"
        ? "bg-amber-50 text-amber-900"
        : "bg-rose-50 text-rose-900";

  return (
    <ShellLayout>
      <div className="mx-auto max-w-4xl px-0">
        <div className="mb-4 sm:mb-6 flex flex-wrap items-center justify-between gap-2 sm:gap-4">
          <div className="min-w-0">
            <p className="text-xs sm:text-sm uppercase tracking-[0.2em] sm:tracking-[0.28em] text-neutral-500">Solo quiz</p>
            <h1 className="text-xl sm:text-3xl font-extrabold mt-1 truncate">{playableQuiz.title}</h1>
          </div>
          <div className="flex items-center gap-2 rounded-full bg-white px-3 py-2 sm:px-4 sm:py-3 shadow-sm flex-shrink-0">
            <Clock3 size={16} className="sm:w-[18px] sm:h-[18px]" />
            <span className="font-bold text-sm sm:text-base">{timeLeft}s</span>
          </div>
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
          <div className="mb-4 sm:mb-5 flex items-center justify-between gap-3 sm:gap-4">
            <div className="flex items-center gap-3 text-sm text-neutral-500">
              <Shield size={18} />
              <span>Anti-cheat is active during the quiz.</span>
            </div>
            <div className="inline-flex items-center gap-2 rounded-full bg-amber-100 px-4 py-2 text-sm font-bold text-neutral-900">
              <Sparkles size={16} />
              60 base + speed bonus
            </div>
          </div>

          <AnimatePresence mode="wait">
            <motion.div key={currentQuestion.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }} transition={{ duration: 0.25 }}>
              {renderQuestionPrompt(currentQuestion.prompt)}
              <p className="mt-3 text-sm text-neutral-500">Each correct answer gives 60 base points plus a speed bonus.</p>
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
