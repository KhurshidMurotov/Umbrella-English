import { useEffect, useState } from "react";
import { ArrowLeft, BarChart3, ClipboardList, ShieldCheck } from "lucide-react";
import { Link } from "react-router-dom";
import ShellLayout from "../components/ShellLayout";
import { API_URL } from "../lib/api";
import { getTeacherSession } from "../lib/teacherAuth";

export default function TeacherStatsPage() {
  const [teacherSession, setTeacherSession] = useState(null);
  const [sessionChecked, setSessionChecked] = useState(false);
  const [stats, setStats] = useState([]);
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
    async function fetchStats() {
      setLoading(true);
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
        if (active) {
          setLoading(false);
        }
      }
    }

    fetchStats();
    return () => {
      active = false;
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

  return (
    <ShellLayout>
      <div className="mx-auto max-w-7xl space-y-6">
        <div className="flex flex-col gap-4 rounded-[36px] border border-neutral-200 bg-white p-6 shadow-sm md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-neutral-500">Teacher analytics</p>
            <h1 className="mt-2 text-3xl font-extrabold text-neutral-950">Student test statistics</h1>
            <p className="mt-2 max-w-2xl text-sm leading-7 text-neutral-600">
              Review completed tests and live room performance for every student.
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

        <div className="grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="glass-card rounded-[36px] p-6">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-neutral-500">Student reports</p>
                <h2 className="mt-2 text-2xl font-extrabold text-neutral-950">Detailed test results</h2>
              </div>
              <div className="rounded-full bg-amber-300 px-4 py-2 text-sm font-bold text-neutral-950">
                {stats.length} records
              </div>
            </div>

            <div className="mt-6 overflow-x-auto">
              <table className="min-w-full border-separate border-spacing-y-3 text-left text-sm">
                <thead>
                  <tr className="text-xs uppercase tracking-[0.2em] text-neutral-500">
                    <th className="px-3 py-3">Student</th>
                    <th className="px-3 py-3">Room</th>
                    <th className="px-3 py-3">Score</th>
                    <th className="px-3 py-3">Accuracy</th>
                    <th className="px-3 py-3">Correct</th>
                    <th className="px-3 py-3">Answered</th>
                    <th className="px-3 py-3">Avg time</th>
                    <th className="px-3 py-3">Violations</th>
                    <th className="px-3 py-3">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {stats.length === 0 ? (
                    <tr>
                      <td colSpan="9" className="px-3 py-8 text-center text-sm text-neutral-500">
                        {loading ? "Loading stats..." : "No student statistics available yet."}
                      </td>
                    </tr>
                  ) : (
                    stats.map((item) => (
                      <tr key={item.id} className="rounded-[24px] border border-neutral-200 bg-white shadow-sm">
                        <td className="px-3 py-4 font-semibold text-neutral-950">{item.name}</td>
                        <td className="px-3 py-4 text-neutral-500">{item.roomCode}</td>
                        <td className="px-3 py-4 font-semibold text-neutral-950">{item.score}</td>
                        <td className="px-3 py-4 text-neutral-500">{item.accuracy}%</td>
                        <td className="px-3 py-4 text-neutral-500">{item.correctAnswers}</td>
                        <td className="px-3 py-4 text-neutral-500">{item.answeredQuestions}</td>
                        <td className="px-3 py-4 text-neutral-500">{item.averageResponseTimeSeconds}s</td>
                        <td className="px-3 py-4 text-neutral-500">{item.violations}</td>
                        <td className="px-3 py-4 text-neutral-500">{item.completed ? "Done" : "In progress"}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          <div className="glass-card rounded-[36px] p-6">
            <div className="flex items-center gap-3">
              <div className="rounded-[18px] bg-amber-300 p-3 text-neutral-950">
                <BarChart3 size={20} />
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-neutral-500">Overview</p>
                <h3 className="mt-2 text-xl font-extrabold text-neutral-950">Current metrics</h3>
              </div>
            </div>

            <div className="mt-6 space-y-4">
              <div className="rounded-[24px] border border-neutral-200 bg-white p-4">
                <p className="text-sm text-neutral-500">Total test records</p>
                <p className="mt-2 text-3xl font-extrabold text-neutral-950">{stats.length}</p>
              </div>
              <div className="rounded-[24px] border border-neutral-200 bg-white p-4">
                <p className="text-sm text-neutral-500">Highest score</p>
                <p className="mt-2 text-3xl font-extrabold text-neutral-950">
                  {stats.length ? Math.max(...stats.map((item) => item.score)) : 0}
                </p>
              </div>
              <div className="rounded-[24px] border border-neutral-200 bg-white p-4">
                <p className="text-sm text-neutral-500">Average accuracy</p>
                <p className="mt-2 text-3xl font-extrabold text-neutral-950">
                  {stats.length
                    ? `${Math.round(stats.reduce((sum, item) => sum + item.accuracy, 0) / stats.length)}%`
                    : "0%"}
                </p>
              </div>
            </div>
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
