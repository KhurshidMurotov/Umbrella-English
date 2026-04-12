import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { AlertTriangle, Clock3, Shield, Sparkles } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import AnswerButton from "../components/AnswerButton";
import ErrorAlert from "../components/ErrorAlert";
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
  const { playCorrect, playWrong } = useFeedbackSounds();

  const currentQuestion = playableQuiz.questions[currentIndex];
  const currentScore = computeScore(questionScores);

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
    if (currentIndex === playableQuiz.questions.length - 1) {
      finishQuiz();
      return;
    }
    setCurrentIndex((current) => current + 1);
  }

  const timeLeft = useQuizTimer({
    duration: QUESTION_TIME,
    questionKey: `${currentQuestion.id}-${currentIndex}`,
    onExpire: () => {
      if (locked) {
        return;
      }

      setLocked(true);
      setStreak(0);
      playWrong();

      if (currentIndex === playableQuiz.questions.length - 1) {
        window.setTimeout(() => finishQuiz(), 700);
        return;
      }

      window.setTimeout(() => {
        goNext();
      }, 700);
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
    const nextQuestionScores = isCorrect ? [...questionScores, awardedScore] : questionScores;

    if (isCorrect) {
      setCorrectAnswers(nextCorrectAnswers);
      setQuestionScores(nextQuestionScores);
      setStreak((current) => {
        const next = current + 1;
        setStreakPeak((peak) => Math.max(peak, next));
        return next;
      });
      playCorrect();
    } else {
      setStreak(0);
      playWrong();
    }

    const isLastQuestion = currentIndex === playableQuiz.questions.length - 1;
    if (isLastQuestion) {
      window.setTimeout(() => {
        finishQuiz("completed", {
          correctAnswers: nextCorrectAnswers,
          questionScores: nextQuestionScores
        });
      }, 900);
      return;
    }

    window.setTimeout(() => {
      goNext();
    }, 900);
  }

  return (
    <ShellLayout>
      <div className="mx-auto max-w-4xl">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-sm uppercase tracking-[0.28em] text-neutral-500">Solo quiz</p>
            <h1 className="text-3xl font-extrabold">{playableQuiz.title}</h1>
          </div>
          <div className="flex items-center gap-3 rounded-full bg-white px-4 py-3 shadow-sm">
            <Clock3 size={18} />
            <span className="font-bold">{timeLeft}s left</span>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-4">
          <StatPill label="Question" value={`${currentIndex + 1}/${playableQuiz.questions.length}`} />
          <StatPill label="Score" value={currentScore} />
          <StatPill label="Streak" value={streak} />
          <StatPill label="Violations" value={violations} />
        </div>

        <div className="mt-5">
          <ProgressBar value={currentIndex + 1} max={playableQuiz.questions.length} />
        </div>

        {warning ? (
          <div className="mt-5 flex items-center gap-3 rounded-[24px] border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-950">
            <AlertTriangle size={18} />
            <span>{warning}</span>
          </div>
        ) : null}

        <div className="mt-6 glass-card rounded-[36px] p-6 sm:p-8">
          <div className="mb-5 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3 text-sm text-neutral-500">
              <Shield size={18} />
              <span>Anti-cheat is active during the quiz.</span>
            </div>
            <div className="inline-flex items-center gap-2 rounded-full bg-amber-100 px-4 py-2 text-sm font-bold text-neutral-900">
              <Sparkles size={16} />
              Up to 100 points
            </div>
          </div>

          <AnimatePresence mode="wait">
            <motion.div key={currentQuestion.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }} transition={{ duration: 0.25 }}>
              <h2 className="text-3xl font-extrabold leading-tight">{currentQuestion.prompt}</h2>
              <p className="mt-3 text-sm text-neutral-500">Answer faster to earn a higher score.</p>
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
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </ShellLayout>
  );
}
