import { useEffect, useState } from "react";
import { ArrowLeft, ChevronDown, ChevronUp, ShieldCheck } from "lucide-react";
import { Link } from "react-router-dom";
import ShellLayout from "../components/ShellLayout";
import { API_URL } from "../lib/api";
import { quizCatalog } from "../lib/quizzes";
import { getTeacherSession } from "../lib/teacherAuth";

const STATS_POLL_INTERVAL_MS = 4000;

function formatDate(timestamp) {
  return new Date(timestamp).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric"
  });
}

function normalizeAnswer(value) {
  return String(value ?? "").trim().toUpperCase();
}

function findQuizById(quizId) {
  return quizCatalog.find((quiz) => quiz.id === quizId) ?? null;
}

function buildQuestionLabel(question) {
  if (question?.part && question?.partTitle) {
    return `${question.part} - ${question.partTitle}`;
  }

  return question?.part || question?.partTitle || "Question";
}

function formatSequence(value) {
  if (!Array.isArray(value) || !value.length) {
    return "No answer";
  }

  return value.join(" -> ");
}

function buildChoiceLabel(question, answer) {
  if (!answer) {
    return "No answer";
  }

  if (!Array.isArray(question?.options) || !question.options.length) {
    return String(answer);
  }

  return String(answer);
}

function buildCefrListeningSection(question, details) {
  return {
    id: question.id,
    title: buildQuestionLabel(question),
    prompt: question.prompt,
    rows: (question.items ?? []).map((item, index) => {
      const selectedLabel = details?.submittedAnswer?.[item.number] ?? "";
      const selectedOption = item.options.find((option) => option.label === selectedLabel);
      const correctOption = item.options.find((option) => option.label === item.correctAnswer);

      return {
        key: `${question.id}-${item.number}`,
        label: `Item ${index + 1}`,
        isCorrect: normalizeAnswer(selectedLabel) === normalizeAnswer(item.correctAnswer),
        studentAnswer: selectedLabel ? `${selectedLabel}. ${selectedOption?.text ?? ""}` : "No answer",
        correctAnswer: `${item.correctAnswer}. ${correctOption?.text ?? ""}`
      };
    })
  };
}

function buildCefrReadingSection(question, details) {
  const choiceMap = new Map((question.choices ?? []).map((choice) => [choice.label, choice]));

  return {
    id: question.id,
    title: buildQuestionLabel(question),
    prompt: question.prompt,
    rows: (question.people ?? []).map((person, index) => {
      const selectedLabel = details?.submittedAnswer?.[person.number] ?? "";
      const selectedChoice = choiceMap.get(selectedLabel);
      const correctChoice = choiceMap.get(person.correctAnswer);

      return {
        key: `${question.id}-${person.number}`,
        label: `Item ${index + 1}`,
        isCorrect: normalizeAnswer(selectedLabel) === normalizeAnswer(person.correctAnswer),
        studentAnswer: selectedLabel ? `${selectedLabel}. ${selectedChoice?.title ?? ""}` : "No answer",
        correctAnswer: `${person.correctAnswer}. ${correctChoice?.title ?? ""}`
      };
    })
  };
}

function buildGroupedChoiceSection(question, details) {
  return {
    id: question.id,
    title: buildQuestionLabel(question),
    prompt: question.prompt,
    rows: (question.items ?? []).map((item, index) => ({
      key: `${question.id}-${item.number}`,
      label: `Item ${item.displayNumber ?? index + 1}`,
      isCorrect: normalizeAnswer(details?.submittedAnswer?.[item.number]) === normalizeAnswer(item.correctAnswer),
      studentAnswer: details?.submittedAnswer?.[item.number] || "No answer",
      correctAnswer: item.correctAnswer || "-"
    }))
  };
}

function buildStandardSection(question, details, student) {
  if (question.type === "part1-drag-order") {
    return {
      id: question.id,
      title: buildQuestionLabel(question),
      prompt: question.prompt,
      rows: [
        {
          key: `${question.id}-drag`,
          label: "Answer",
          isCorrect: Boolean(details?.correct),
          studentAnswer: formatSequence(details?.submittedAnswer),
          correctAnswer: formatSequence(question.correctSequence)
        }
      ]
    };
  }

  if (question.type === "part2-text-input") {
    return {
      id: question.id,
      title: buildQuestionLabel(question),
      prompt: question.prompt,
      rows: [
        {
          key: `${question.id}-text`,
          label: "Answer",
          isCorrect: Boolean(details?.correct),
          studentAnswer: details?.submittedAnswer ? String(details.submittedAnswer) : "No answer",
          correctAnswer: question.correctAnswer || "-"
        }
      ]
    };
  }

  if (question.type === "writing" || question.graded === false) {
    const submittedWriting = details?.submittedAnswer || student?.writingResponseText || "";

    return {
      id: question.id,
      title: buildQuestionLabel(question),
      prompt: question.prompt,
      rows: [
        {
          key: `${question.id}-writing`,
          label: "Student response",
          isCorrect: null,
          studentAnswer: submittedWriting || "No response",
          correctAnswer: "Teacher review only",
          ungraded: true
        }
      ]
    };
  }

  return {
    id: question.id,
    title: buildQuestionLabel(question),
    prompt: question.prompt,
    rows: [
      {
        key: `${question.id}-choice`,
        label: "Answer",
        isCorrect: Boolean(details?.correct),
        studentAnswer: buildChoiceLabel(question, details?.submittedAnswer),
        correctAnswer: buildChoiceLabel(question, question.correctAnswer)
      }
    ]
  };
}

function buildReviewSections(student, quiz) {
  if (!quiz?.questions?.length) {
    return [];
  }

  return quiz.questions.map((question) => {
    const details = student?.answerDetails?.[question.id] ?? null;

    if (question.type === "cefr-listening-group") {
      return buildCefrListeningSection(question, details);
    }

    if (question.type === "cefr-reading-matching") {
      return buildCefrReadingSection(question, details);
    }

    if (question.type === "grouped-choice-list") {
      return buildGroupedChoiceSection(question, details);
    }

    return buildStandardSection(question, details, student);
  });
}

function reviewAvailable(student, quiz) {
  if (!quiz) {
    return false;
  }

  if (student?.writingResponseText) {
    return true;
  }

  return Boolean(student?.answerDetails && Object.keys(student.answerDetails).length);
}

function StatusBadge({ row }) {
  if (row.ungraded) {
    return <span className="chip">Not scored</span>;
  }
  return <span className={`chip ${row.isCorrect ? "chip-grass" : "chip-tomato"}`}>{row.isCorrect ? "Correct" : "Wrong"}</span>;
}

export default function TeacherStatsPage() {
  const [teacherSession, setTeacherSession] = useState(null);
  const [sessionChecked, setSessionChecked] = useState(false);
  const [stats, setStats] = useState([]);
  const [expandedRoom, setExpandedRoom] = useState(null);
  const [expandedStudentReview, setExpandedStudentReview] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const session = getTeacherSession();
    setTeacherSession(session);
    setSessionChecked(true);
  }, []);

  useEffect(() => {
    if (!teacherSession) {
      setLoading(false);
      return;
    }

    let active = true;
    let intervalId;

    async function fetchStats(showLoader = false) {
      if (showLoader) {
        setLoading(true);
      }
      setError("");

      try {
        const response = await fetch(`${API_URL}/api/live/stats?accessCode=${encodeURIComponent(teacherSession.accessCode)}`);
        if (!response.ok) {
          const data = await response.json().catch(() => ({}));
          throw new Error(data.error || "Failed to load stats.");
        }

        const data = await response.json();
        if (active) {
          setStats(Array.isArray(data.stats) ? data.stats : []);
        }
      } catch (err) {
        if (active) {
          setError(err.message || "Unable to load student statistics.");
        }
      } finally {
        if (active && showLoader) {
          setLoading(false);
        }
      }
    }

    fetchStats(true);
    intervalId = window.setInterval(() => {
      fetchStats(false);
    }, STATS_POLL_INTERVAL_MS);

    return () => {
      active = false;
      if (intervalId) {
        window.clearInterval(intervalId);
      }
    };
  }, [teacherSession]);

  if (!sessionChecked) {
    return null;
  }

  if (!teacherSession) {
    return (
      <ShellLayout showLinks={false}>
        <div className="mx-auto max-w-xl">
          <div className="glass-card p-8 sm:p-10">
            <div className="flex flex-col gap-4 text-center">
              <ShieldCheck size={40} className="mx-auto" style={{ color: "var(--yellow-600)" }} />
              <h1 className="h2">Teacher access required</h1>
              <p className="muted" style={{ lineHeight: 1.7 }}>
                This page is available only for signed-in teachers. Please log in first.
              </p>
              <Link to="/teacher" className="btn-dark" style={{ margin: "0 auto" }}>Go to teacher login</Link>
            </div>
          </div>
        </div>
      </ShellLayout>
    );
  }

  function toggleExpanded(sessionId) {
    setExpandedRoom(expandedRoom === sessionId ? null : sessionId);
  }

  function toggleStudentReview(studentId) {
    setExpandedStudentReview((current) => (current === studentId ? null : studentId));
  }

  return (
    <ShellLayout showLinks={false}>
      <div className="space-y-6" style={{ maxWidth: 1120, margin: "0 auto" }}>
        <div className="card flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="eyebrow">Teacher analytics</p>
            <h1 className="h1" style={{ marginTop: 6 }}>Student session summary</h1>
            <p className="muted" style={{ marginTop: 8, maxWidth: 560, lineHeight: 1.7 }}>
              Open a session to see each student in one clean row with status, score, correct answers, speed and flags.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link to="/teacher" className="btn-ghost">
              <ArrowLeft size={16} />
              Back to teacher panel
            </Link>
          </div>
        </div>

        <div className="glass-card p-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="eyebrow">Session summary</p>
              <h2 className="h2" style={{ marginTop: 4 }}>Test sessions</h2>
            </div>
            <span className="chip chip-yellow">{stats.length} sessions</span>
          </div>

          <div className="mt-6 space-y-4">
            {loading ? (
              <div className="qitem plain muted" style={{ fontSize: 14 }}>Loading session summary…</div>
            ) : stats.length === 0 ? (
              <div className="qitem plain muted" style={{ fontSize: 14 }}>No sessions available yet.</div>
            ) : (
              stats.map((session) => {
                const passedStudents = Number(session.passedStudents ?? 0);
                const totalStudents = Number(session.totalStudents ?? session.details?.length ?? 0);
                const sessionQuiz = findQuizById(session.quizId);

                return (
                  <div key={session.id} className="card" style={{ padding: 0, overflow: "hidden" }}>
                    <button
                      type="button"
                      className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left"
                      onClick={() => toggleExpanded(session.id)}
                    >
                      <div>
                        <div className="eyebrow">Test date</div>
                        <p style={{ marginTop: 4, fontSize: 18, fontWeight: 800 }}>{formatDate(session.createdAt)}</p>
                        <p className="muted" style={{ marginTop: 4, fontSize: 14 }}>{session.quizTitle} · {session.roomCode}</p>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className="chip chip-yellow">{passedStudents}/{totalStudents} passed</span>
                        {expandedRoom === session.id ? (
                          <ChevronUp className="text-neutral-500" />
                        ) : (
                          <ChevronDown className="text-neutral-500" />
                        )}
                      </div>
                    </button>

                    {expandedRoom === session.id ? (
                      <div style={{ borderTop: "var(--border-thin)", background: "var(--paper-2)", padding: "16px 20px" }}>
                        <div className="grid gap-3">
                          {session.details.map((student) => {
                            const studentReviewSections = buildReviewSections(student, sessionQuiz);
                            const canReviewAnswers = reviewAvailable(student, sessionQuiz);

                            return (
                              <div key={student.id} className="qitem plain">
                                <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
                                  <div className="min-w-0">
                                    <p className="truncate" style={{ fontSize: 18, fontWeight: 800 }}>{student.name}</p>
                                  </div>

                                  <div className="flex flex-wrap items-center justify-end gap-2">
                                    <span className="chip">Score {student.score}</span>
                                    <span className="chip">Correct {student.correctAnswers}</span>
                                    <span className="chip">Violations {student.violations ?? 0}</span>
                                    <button
                                      type="button"
                                      onClick={() => toggleStudentReview(student.id)}
                                      disabled={!canReviewAnswers}
                                      className="btn-primary btn-sm"
                                    >
                                      {expandedStudentReview === student.id ? "Hide review" : "Review answers"}
                                    </button>
                                  </div>
                                </div>

                                {expandedStudentReview === student.id ? (
                                  <div className="mt-4 space-y-4" style={{ borderRadius: "var(--r-lg)", border: "var(--border-thin)", background: "var(--paper-2)", padding: 16 }}>
                                    {studentReviewSections.length ? (
                                      studentReviewSections.map((section) => (
                                        <div key={section.id} className="qitem plain">
                                          <p className="eyebrow">{section.title}</p>
                                          <p style={{ marginTop: 8, fontWeight: 700 }}>{section.prompt}</p>
                                          <div className="mt-4 grid gap-3">
                                            {section.rows.map((row) => (
                                              <div
                                                key={row.key}
                                                style={{
                                                  borderRadius: "var(--r-md)", padding: "12px 14px",
                                                  border: row.ungraded ? "var(--border-thin)" : `1.5px solid ${row.isCorrect ? "var(--grass)" : "var(--tomato)"}`,
                                                  background: row.ungraded ? "var(--paper)" : (row.isCorrect ? "var(--grass-soft)" : "var(--tomato-soft)")
                                                }}
                                              >
                                                <div className="flex flex-wrap items-center justify-between gap-3">
                                                  <p style={{ fontWeight: 800, fontSize: 14 }}>{row.label}</p>
                                                  <StatusBadge row={row} />
                                                </div>
                                                <p style={{ marginTop: 12, fontSize: 14, whiteSpace: "pre-wrap", wordBreak: "break-word" }}>
                                                  <span style={{ fontWeight: 800 }}>Student:</span> {row.studentAnswer}
                                                </p>
                                                <p style={{ marginTop: 8, fontSize: 14, whiteSpace: "pre-wrap", wordBreak: "break-word" }}>
                                                  <span style={{ fontWeight: 800 }}>Correct:</span> {row.correctAnswer}
                                                </p>
                                              </div>
                                            ))}
                                          </div>
                                        </div>
                                      ))
                                    ) : (
                                      <div className="qitem plain muted" style={{ fontSize: 14 }}>
                                        No saved answer details for this student yet.
                                      </div>
                                    )}
                                  </div>
                                ) : null}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    ) : null}
                  </div>
                );
              })
            )}
          </div>
        </div>

        {error ? (
          <div style={{ borderRadius: "var(--r-lg)", border: "1.5px solid var(--tomato)", background: "var(--tomato-soft)", color: "var(--tomato)", padding: 16, fontSize: 14 }}>
            <p style={{ fontWeight: 800 }}>Unable to load statistics</p>
            <p>{error}</p>
          </div>
        ) : null}
      </div>
    </ShellLayout>
  );
}
