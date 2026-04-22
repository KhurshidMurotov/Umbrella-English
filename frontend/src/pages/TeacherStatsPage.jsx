import { useEffect, useState } from "react";
import { ArrowLeft, ChevronDown, ChevronUp, ShieldCheck } from "lucide-react";
import { Link } from "react-router-dom";
import ShellLayout from "../components/ShellLayout";
import { API_URL } from "../lib/api";
import { getTeacherSession } from "../lib/teacherAuth";

const STATS_POLL_INTERVAL_MS = 4000;

function formatDate(timestamp) {
  return new Date(timestamp).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric"
  });
}

function formatAverageTime(value) {
  const seconds = Number(value ?? 0);
  return `${seconds >= 10 ? seconds.toFixed(1) : seconds.toFixed(2)}s`;
}

export default function TeacherStatsPage() {
  const [teacherSession, setTeacherSession] = useState(null);
  const [sessionChecked, setSessionChecked] = useState(false);
  const [stats, setStats] = useState([]);
  const [expandedRoom, setExpandedRoom] = useState(null);
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
      <ShellLayout showNav={false}>
        <div className="mx-auto max-w-xl">
          <div className="glass-card rounded-[36px] p-8 sm:p-10">
            <div className="flex flex-col gap-4 text-center">
              <ShieldCheck size={40} className="mx-auto text-amber-300" />
              <h1 className="text-3xl font-extrabold text-neutral-950">Teacher access required</h1>
              <p className="text-sm leading-7 text-neutral-600">
                This page is available only for signed-in teachers. Please log in first.
              </p>
              <Link
                to="/teacher"
                className="mx-auto rounded-full bg-neutral-950 px-6 py-3 text-sm font-extrabold text-white"
              >
                Go to teacher login
              </Link>
            </div>
          </div>
        </div>
      </ShellLayout>
    );
  }

  function toggleExpanded(sessionId) {
    setExpandedRoom(expandedRoom === sessionId ? null : sessionId);
  }

  return (
    <ShellLayout showNav={false}>
      <div className="mx-auto max-w-7xl space-y-6">
        <div className="flex flex-col gap-4 rounded-[36px] border border-neutral-200 bg-white p-6 shadow-sm md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-neutral-500">Teacher analytics</p>
            <h1 className="mt-2 text-3xl font-extrabold text-neutral-950">Student session summary</h1>
            <p className="mt-2 max-w-2xl text-sm leading-7 text-neutral-600">
              Open a session to see each student in one clean row with status, score, correct answers, speed and flags.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link
              to="/teacher"
              className="inline-flex items-center gap-2 rounded-full bg-neutral-950 px-4 py-3 text-sm font-bold text-white"
            >
              <ArrowLeft size={16} />
              Back to teacher panel
            </Link>
          </div>
        </div>

        <div className="glass-card rounded-[36px] p-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-neutral-500">Session summary</p>
              <h2 className="mt-2 text-2xl font-extrabold text-neutral-950">Test sessions</h2>
            </div>
            <div className="rounded-full bg-amber-300 px-4 py-2 text-sm font-bold text-neutral-950">
              {stats.length} sessions
            </div>
          </div>

          <div className="mt-6 space-y-4">
            {loading ? (
              <div className="rounded-[24px] border border-neutral-200 bg-white p-6 text-sm text-neutral-500">
                Loading session summary...
              </div>
            ) : stats.length === 0 ? (
              <div className="rounded-[24px] border border-neutral-200 bg-white p-6 text-sm text-neutral-500">
                No sessions available yet.
              </div>
            ) : (
              stats.map((session) => {
                const passedStudents = Number(session.passedStudents ?? 0);
                const totalStudents = Number(session.totalStudents ?? session.details?.length ?? 0);

                return (
                  <div key={session.id} className="rounded-[24px] border border-neutral-200 bg-white shadow-sm">
                    <button
                      type="button"
                      className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left"
                      onClick={() => toggleExpanded(session.id)}
                    >
                      <div>
                        <div className="text-xs uppercase tracking-[0.3em] text-neutral-500">Test date</div>
                        <p className="mt-1 text-lg font-semibold text-neutral-950">{formatDate(session.createdAt)}</p>
                        <p className="mt-1 text-sm text-neutral-500">{session.quizTitle} / {session.roomCode}</p>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="rounded-full bg-amber-100 px-4 py-2 text-sm font-bold text-amber-950">
                          {passedStudents}/{totalStudents} passed
                        </div>
                        {expandedRoom === session.id ? (
                          <ChevronUp className="text-neutral-500" />
                        ) : (
                          <ChevronDown className="text-neutral-500" />
                        )}
                      </div>
                    </button>

                    {expandedRoom === session.id ? (
                      <div className="border-t border-neutral-200 bg-neutral-50 px-5 py-4">
                        <div className="grid gap-3">
                          {session.details.map((student) => (
                            <div key={student.id} className="rounded-[20px] border border-neutral-200 bg-white p-4">
                              <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
                                <div className="min-w-0">
                                  <p className="truncate text-lg font-semibold text-neutral-950">{student.name}</p>
                                </div>

                                <div className="flex flex-wrap items-center gap-2 text-sm">
                                  <span className="rounded-full bg-neutral-100 px-3 py-2 font-semibold text-neutral-700">
                                    Score {student.score}
                                  </span>
                                  <span className="rounded-full bg-neutral-100 px-3 py-2 font-semibold text-neutral-700">
                                    Correct {student.correctAnswers}
                                  </span>
                                  <span className="rounded-full bg-neutral-100 px-3 py-2 font-semibold text-neutral-700">
                                    Avg {formatAverageTime(student.averageResponseTimeSeconds)}
                                  </span>
                                  <span className="rounded-full bg-neutral-100 px-3 py-2 font-semibold text-neutral-700">
                                    Violations {student.violations ?? 0}
                                  </span>
                                </div>
                              </div>

                              {session.quizId === "a1-unit-4-busy-week" ? (
                                <div className="mt-4 rounded-[18px] border border-neutral-200 bg-neutral-50 p-4">
                                  <div className="flex flex-wrap items-center justify-between gap-3">
                                    <p className="text-sm font-bold text-neutral-950">Part 4 writing</p>
                                    <span
                                      className={`rounded-full px-3 py-1 text-xs font-bold uppercase tracking-[0.14em] ${
                                        student.writingResponseText
                                          ? "bg-emerald-100 text-emerald-900"
                                          : "bg-neutral-200 text-neutral-700"
                                      }`}
                                    >
                                      {student.writingResponseText ? "Submitted" : "No response"}
                                    </span>
                                  </div>
                                  <div className="mt-3 rounded-[16px] bg-white px-4 py-3 text-sm leading-7 text-neutral-700 whitespace-pre-wrap break-words">
                                    {student.writingResponseText || "No Part 4 response submitted."}
                                  </div>
                                </div>
                              ) : null}
                            </div>
                          ))}
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
          <div className="rounded-[24px] border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">
            <p className="font-bold">Unable to load statistics</p>
            <p>{error}</p>
          </div>
        ) : null}
      </div>
    </ShellLayout>
  );
}
