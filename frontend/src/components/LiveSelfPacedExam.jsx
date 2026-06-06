import { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { AlertTriangle, ArrowLeft, ArrowRight, CheckCircle2, CircleDot, Hourglass, Play, Shield, Sparkles, Trophy } from "lucide-react";
import ProgressBar from "./ProgressBar";
import SelfPacedAnswerArea, { buildWritingString, isQuestionAnswered, renderQuestionPrompt } from "./SelfPacedAnswerArea";

function isScoredQuestion(question) {
  return Boolean(question) && question.graded !== false;
}

// Student view of a free-navigation live exam: answer in any order, then submit once.
export default function LiveSelfPacedExam({ room, roomCode, name, socket, warning = "", violations = 0 }) {
  const questions = useMemo(() => room?.questions ?? [], [room?.questions]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [showConfirm, setShowConfirm] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [result, setResult] = useState(null);
  const audioRef = useRef(null);

  const selfPlayer = room?.players?.find((player) => player.name === name) ?? null;
  const completed = submitted || Boolean(selfPlayer?.completed);

  useEffect(() => {
    function handleResult(payload) {
      setResult(payload);
      setSubmitted(true);
    }
    socket.on("submitResult", handleResult);
    return () => {
      socket.off("submitResult", handleResult);
    };
  }, [socket]);

  const answeredCount = useMemo(
    () => questions.filter((question) => isQuestionAnswered(question, answers[question.id])).length,
    [questions, answers]
  );
  const unansweredCount = questions.length - answeredCount;
  const currentQuestion = questions[currentIndex];

  const partGroups = useMemo(() => {
    const groups = [];
    questions.forEach((question, index) => {
      const label = question.part ?? "Questions";
      const last = groups[groups.length - 1];
      if (last && last.label === label) {
        last.items.push({ question, index });
      } else {
        groups.push({ label, items: [{ question, index }] });
      }
    });
    return groups;
  }, [questions]);

  function setAnswer(id, value) {
    setAnswers((current) => ({ ...current, [id]: value }));
  }

  function goToIndex(index) {
    if (index < 0 || index >= questions.length) {
      return;
    }
    if (audioRef.current) {
      audioRef.current.pause();
    }
    setCurrentIndex(index);
  }

  function submitAll() {
    if (completed) {
      return;
    }
    const payload = {};
    questions.forEach((question) => {
      const value = answers[question.id];
      payload[question.id] = question.type === "writing" ? buildWritingString(question, value) : value ?? "";
    });
    socket.emit("submitAll", { roomCode, name, answers: payload });
    setSubmitted(true);
  }

  function handleSubmit() {
    if (unansweredCount > 0) {
      setShowConfirm(true);
      return;
    }
    submitAll();
  }

  function playAudio() {
    if (!audioRef.current) {
      return;
    }
    audioRef.current.currentTime = 0;
    audioRef.current.play().catch(() => {});
  }

  // Waiting room — exam not started yet.
  if (!room?.started && !completed) {
    return (
      <div className="mx-auto max-w-2xl">
        <div className="glass-card p-8 text-center">
          <Hourglass className="mx-auto" style={{ color: "var(--yellow-600)" }} size={36} />
          <h1 className="h2" style={{ marginTop: 16 }}>{room?.quizTitle ?? "Test"}</h1>
          <p className="muted" style={{ marginTop: 12, lineHeight: 1.7 }}>
            You're in! Waiting for the teacher to start the test. When it begins you can answer the questions in any order and submit when you're done.
          </p>
          <p className="eyebrow" style={{ marginTop: 16 }}>Room {roomCode?.toUpperCase()}</p>
        </div>
      </div>
    );
  }

  // Submitted — show the student's score.
  if (completed) {
    const score = result?.score ?? selfPlayer?.score ?? 0;
    const correct = result?.correctAnswers ?? selfPlayer?.correctAnswers ?? 0;
    const total = result?.totalUnits ?? selfPlayer?.answeredQuestions ?? 0;
    return (
      <div className="mx-auto max-w-2xl">
        <div className="glass-card overflow-hidden" style={{ padding: 0 }}>
          <div className="card-dark" style={{ borderRadius: 0, border: "none", boxShadow: "none", padding: "40px 32px", textAlign: "center" }}>
            <Trophy className="mx-auto" style={{ color: "var(--yellow-400)" }} size={40} />
            <p className="eyebrow" style={{ color: "var(--yellow-400)", marginTop: 16 }}>Submitted</p>
            <div style={{ marginTop: 8, fontFamily: "var(--font-mono)", fontWeight: 700, fontSize: 60, color: "var(--yellow-400)", lineHeight: 1 }}>{score}</div>
            <p style={{ marginTop: 8, fontSize: 14, color: "var(--ink-300)" }}>points</p>
          </div>
          <div style={{ padding: 32, textAlign: "center" }}>
            <p className="muted" style={{ lineHeight: 1.7 }}>
              You answered <span style={{ fontWeight: 800, color: "var(--ink)" }}>{correct}</span> of{" "}
              <span style={{ fontWeight: 800, color: "var(--ink)" }}>{total}</span> correctly. Your teacher can see your result on the live ranking.
            </p>
          </div>
        </div>
      </div>
    );
  }

  const answer = answers[currentQuestion?.id];
  const scored = isScoredQuestion(currentQuestion);
  const isLast = currentIndex === questions.length - 1;

  return (
    <div className="mx-auto max-w-4xl">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2 sm:mb-5">
        <div className="min-w-0">
          <div className="eyebrow">Live test · self-paced</div>
          <h1 className="h2 truncate" style={{ marginTop: 4 }}>{room?.quizTitle}</h1>
        </div>
        <div className="chip chip-ink" style={{ flexShrink: 0 }}>
          <CheckCircle2 size={14} />
          {answeredCount}/{questions.length} answered
        </div>
      </div>

      <ProgressBar value={answeredCount} max={questions.length} />

      {warning ? (
        <div className="mt-3 flex items-center gap-2 rounded-2xl border-l-4 border-orange-500 bg-orange-50 px-4 py-3 text-sm font-bold text-orange-900">
          <AlertTriangle size={16} className="shrink-0 text-orange-500" />
          <span>{warning}</span>
        </div>
      ) : null}

      <div className="card" style={{ marginTop: 16 }}>
        {currentQuestion?.audioSrc ? <audio ref={audioRef} src={currentQuestion.audioSrc} preload="auto" className="hidden" /> : null}

        <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
          <span className="meta"><Shield size={14} />Anti-cheat active{violations ? ` · ${violations} warning${violations > 1 ? "s" : ""}` : ""}</span>
          {scored ? (
            <span className="chip chip-yellow"><Sparkles size={13} />{`${Number(currentQuestion.points) || 2} pts`}</span>
          ) : (
            <span className="chip"><Sparkles size={13} />Not scored</span>
          )}
        </div>

        <AnimatePresence mode="wait">
          <motion.div key={currentQuestion?.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }} transition={{ duration: 0.2 }}>
            <div className="mb-5 flex flex-wrap items-center gap-3">
              {currentQuestion?.part ? <span className="chip chip-yellow">{currentQuestion.part}</span> : null}
              {currentQuestion?.partTitle ? <span className="eyebrow">{currentQuestion.partTitle}</span> : null}
              {isQuestionAnswered(currentQuestion, answer) ? (
                <span className="chip chip-grass"><CheckCircle2 size={12} /> Answered</span>
              ) : null}
            </div>

            {currentQuestion ? renderQuestionPrompt(currentQuestion.prompt) : null}

            {currentQuestion?.audioSrc ? (
              <button type="button" onClick={playAudio} className="btn-dark btn-sm" style={{ marginTop: 16 }}>
                <Play size={15} /> Play audio
              </button>
            ) : null}

            <div style={{ marginTop: 24 }}>
              {currentQuestion ? (
                <SelfPacedAnswerArea question={currentQuestion} value={answer} onChange={(value) => setAnswer(currentQuestion.id, value)} />
              ) : null}
            </div>
          </motion.div>
        </AnimatePresence>

        <div className="mt-6 flex items-center justify-between gap-3">
          <button type="button" onClick={() => goToIndex(currentIndex - 1)} disabled={currentIndex === 0} className="btn-ghost">
            <ArrowLeft size={16} />
            Back
          </button>
          {isLast ? (
            <button type="button" onClick={handleSubmit} className="btn-primary">
              Submit test
            </button>
          ) : (
            <button type="button" onClick={() => goToIndex(currentIndex + 1)} className="btn-dark">
              Next
              <ArrowRight size={16} />
            </button>
          )}
        </div>
      </div>

      {/* Question overview grid */}
      <div className="card" style={{ marginTop: 16 }}>
        <p className="eyebrow" style={{ marginBottom: 12 }}>Jump to a question</p>
        <div className="space-y-4">
          {partGroups.map((group) => (
            <div key={group.label}>
              <p className="mb-2 text-[10px] font-black uppercase tracking-widest text-neutral-400">{group.label}</p>
              <div className="flex flex-wrap gap-2">
                {group.items.map(({ question, index }) => {
                  const answered = isQuestionAnswered(question, answers[question.id]);
                  const isCurrent = index === currentIndex;
                  return (
                    <button
                      key={question.id}
                      type="button"
                      onClick={() => goToIndex(index)}
                      aria-current={isCurrent ? "true" : undefined}
                      className={`relative flex h-10 w-10 items-center justify-center rounded-xl text-sm font-black transition ${
                        isCurrent
                          ? "bg-neutral-900 text-yellow-400 ring-2 ring-yellow-400"
                          : answered
                            ? "bg-yellow-400 text-neutral-900 hover:bg-yellow-300"
                            : "bg-neutral-100 text-neutral-500 hover:bg-neutral-200"
                      }`}
                    >
                      {index + 1}
                      {answered && !isCurrent ? (
                        <CheckCircle2 size={12} className="absolute -right-1 -top-1 rounded-full bg-white text-emerald-500" />
                      ) : null}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-neutral-100 pt-4">
          <div className="flex items-center gap-2 text-sm font-bold text-neutral-500">
            <CircleDot size={15} className="text-yellow-500" />
            {unansweredCount > 0 ? `${unansweredCount} question${unansweredCount > 1 ? "s" : ""} left` : "All questions answered"}
          </div>
          <button type="button" onClick={handleSubmit} className="btn-primary px-6 py-3">
            Submit test
          </button>
        </div>
      </div>

      <AnimatePresence>
        {showConfirm ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4"
            onClick={() => setShowConfirm(false)}
          >
            <motion.div
              initial={{ scale: 0.95, y: 10 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 10 }}
              onClick={(event) => event.stopPropagation()}
              className="card w-full max-w-sm"
            >
              <h3 className="h3">Submit the test?</h3>
              <p className="muted" style={{ marginTop: 8, lineHeight: 1.6 }}>
                You still have <span style={{ fontWeight: 800, color: "var(--ink)" }}>{unansweredCount}</span> unanswered question
                {unansweredCount > 1 ? "s" : ""}. They will be marked as incorrect.
              </p>
              <div className="mt-5 flex gap-3">
                <button type="button" onClick={() => setShowConfirm(false)} className="btn-ghost flex-1">
                  Keep answering
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowConfirm(false);
                    submitAll();
                  }}
                  className="btn-primary flex-1"
                >
                  Submit anyway
                </button>
              </div>
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
