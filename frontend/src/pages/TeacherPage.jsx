import { useEffect, useState } from "react";
import { Hammer, LockKeyhole, LogOut, UserRound } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import ErrorAlert from "../components/ErrorAlert";
import ShellLayout from "../components/ShellLayout";
import { API_URL } from "../lib/api";
import { useQuizCatalog } from "../lib/quizCatalog";
import { getTeacherSession, loginTeacher, logoutTeacher } from "../lib/teacherAuth";

const TIMER_OPTIONS = [10, 15, 20, 30];

function TeacherLogin({ onLogin }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  function handleSubmit(event) {
    event.preventDefault();
    const session = loginTeacher({ username, password });

    if (!session) {
      setError("Wrong credentials.");
      return;
    }

    setError("");
    onLogin(session);
  }

  return (
    <ShellLayout showLinks={false}>
      <div className="mx-auto max-w-sm">
        <div className="overflow-hidden rounded-3xl bg-white shadow-lg border border-neutral-100">
          <div className="h-2 w-full bg-gradient-to-r from-yellow-400 to-amber-300" />
          <div className="p-6 sm:p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-neutral-900 text-white">
                <LockKeyhole size={18} />
              </div>
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-neutral-400">Teacher login</p>
                <h1 className="text-xl font-black text-neutral-900">Protected area</h1>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="mb-1.5 flex items-center gap-2 text-sm font-bold text-neutral-700">
                  <UserRound size={14} />
                  Username
                </label>
                <input
                  value={username}
                  onChange={(event) => setUsername(event.target.value)}
                  className="w-full rounded-xl border border-neutral-200 bg-neutral-50 px-4 py-3 text-sm outline-none transition focus:border-yellow-400 focus:bg-white focus:ring-2 focus:ring-yellow-200"
                />
              </div>

              <div>
                <label className="mb-1.5 flex items-center gap-2 text-sm font-bold text-neutral-700">
                  <LockKeyhole size={14} />
                  Password
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  className="w-full rounded-xl border border-neutral-200 bg-neutral-50 px-4 py-3 text-sm outline-none transition focus:border-yellow-400 focus:bg-white focus:ring-2 focus:ring-yellow-200"
                />
              </div>

              {error ? (
                <ErrorAlert message={error} onDismiss={() => setError("")} />
              ) : null}

              <button type="submit" className="btn-dark w-full justify-center py-3 text-sm">
                Enter teacher area
              </button>
            </form>
          </div>
        </div>
      </div>
    </ShellLayout>
  );
}

export default function TeacherPage() {
  const { quizzes: quizCatalog } = useQuizCatalog();
  const [teacherSession, setTeacherSession] = useState(null);
  const [hostName, setHostName] = useState("Teacher");
  const [mode, setMode] = useState("instructor-paced");
  const [questionTime, setQuestionTime] = useState(15);
  const [selectedQuizId, setSelectedQuizId] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const selectedQuiz = quizCatalog.find((quiz) => quiz.id === selectedQuizId) ?? quizCatalog[0];
  const timerOptions = selectedQuiz?.timerOptions ?? TIMER_OPTIONS;
  const timerLabel = selectedQuiz?.timerLabel ?? "Time per question";
  const hideTimerControl = selectedQuiz?.hideTimerControl === true;

  // Keep a valid selection as the catalog loads / changes.
  useEffect(() => {
    if (quizCatalog.length && !quizCatalog.some((quiz) => quiz.id === selectedQuizId)) {
      setSelectedQuizId(quizCatalog[0].id);
    }
  }, [quizCatalog, selectedQuizId]);

  useEffect(() => {
    setQuestionTime(selectedQuiz?.defaultQuestionTime ?? timerOptions[0] ?? TIMER_OPTIONS[0]);
  }, [selectedQuizId]);

  useEffect(() => {
    const session = getTeacherSession();
    if (session) {
      setTeacherSession(session);
    }
  }, []);

  if (!teacherSession) {
    return <TeacherLogin onLogin={setTeacherSession} />;
  }

  async function createRoom() {
    setLoading(true);
    setError("");

    try {
      const response = await fetch(`${API_URL}/api/live/create`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          hostName,
          accessCode: teacherSession.accessCode,
          mode,
          questionTime,
          quizId: selectedQuiz.id
        })
      });

      const data = await response.json();
      if (!response.ok) {
        setError(data.error ?? "Unable to create room.");
        setLoading(false);
        return;
      }

      const hostUrl = `/live/${data.room.code}?role=host&name=${encodeURIComponent(hostName)}&hostToken=${encodeURIComponent(data.hostToken)}`;
      navigate(hostUrl);
    } catch {
      setError("Server is unavailable. Start the backend and try again.");
    }

    setLoading(false);
  }

  function handleLogout() {
    logoutTeacher();
    setTeacherSession(null);
    setError("");
  }

  return (
    <ShellLayout showLinks={false}>
      <div className="mx-auto max-w-5xl">
        {/* Header */}
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3 rounded-3xl bg-neutral-900 px-5 py-4 shadow-lg">
          <div>
            <p className="text-[10px] font-black uppercase tracking-widest text-neutral-500">Teacher panel</p>
            <h1 className="mt-0.5 text-xl font-black text-white sm:text-2xl">Create live exam</h1>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Link
              to="/teacher/builder"
              className="inline-flex items-center gap-2 rounded-xl bg-yellow-400 px-4 py-2.5 text-xs font-black text-neutral-900 transition hover:bg-yellow-300 sm:text-sm"
            >
              <Hammer size={14} />
              Build tests
            </Link>
            <Link
              to="/teacher/stats"
              className="inline-flex items-center gap-2 rounded-xl bg-yellow-400 px-4 py-2.5 text-xs font-black text-neutral-900 transition hover:bg-yellow-300 sm:text-sm"
            >
              📊 Student stats
            </Link>
            <button
              type="button"
              onClick={handleLogout}
              className="inline-flex items-center gap-2 rounded-xl border border-neutral-700 bg-neutral-800 px-4 py-2.5 text-xs font-bold text-neutral-300 transition hover:bg-neutral-700 sm:text-sm"
            >
              <LogOut size={14} />
              Logout
            </button>
          </div>
        </div>

        <div className="grid gap-4 lg:grid-cols-[1fr_320px]">
          {/* Left: quiz selection + teacher name */}
          <div className="space-y-4">
            {/* Teacher name */}
            <div className="rounded-2xl bg-white border border-neutral-100 p-4 shadow-sm sm:p-5">
              <label className="text-sm font-black text-neutral-700">Your name</label>
              <input
                value={hostName}
                onChange={(event) => setHostName(event.target.value)}
                className="mt-2 w-full rounded-xl border border-neutral-200 bg-neutral-50 px-4 py-3 text-sm outline-none transition focus:border-yellow-400 focus:bg-white focus:ring-2 focus:ring-yellow-200"
              />
            </div>

            {/* Quiz selection */}
            <div className="rounded-2xl bg-white border border-neutral-100 p-4 shadow-sm sm:p-5">
              <p className="mb-3 text-sm font-black text-neutral-700">Choose test</p>
              <div className="space-y-2">
                {quizCatalog.map((quiz) => (
                  <button
                    key={quiz.id}
                    type="button"
                    onClick={() => setSelectedQuizId(quiz.id)}
                    className={`w-full rounded-xl border px-4 py-3 text-left transition ${
                      selectedQuizId === quiz.id
                        ? "border-yellow-400 bg-yellow-50 ring-2 ring-yellow-200"
                        : "border-neutral-200 bg-neutral-50 hover:border-neutral-300 hover:bg-white"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="truncate text-sm font-extrabold text-neutral-900">{quiz.title}</p>
                        <p className="mt-0.5 truncate text-xs text-neutral-500">{quiz.description}</p>
                      </div>
                      <span className="shrink-0 rounded-full bg-neutral-100 px-2.5 py-1 text-[10px] font-black uppercase tracking-widest text-neutral-600">
                        {quiz.difficulty}
                      </span>
                    </div>
                    <p className="mt-2 text-[10px] font-bold uppercase tracking-widest text-neutral-400">
                      {quiz.questions.length} questions · {quiz.estimatedTime}
                    </p>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Right: mode, timer, launch */}
          <div className="space-y-4">
            {/* Exam mode */}
            <div className="rounded-2xl bg-white border border-neutral-100 p-4 shadow-sm sm:p-5">
              <p className="mb-3 text-sm font-black text-neutral-700">Exam mode</p>
              <div className="grid gap-2 grid-cols-1">
                {["instructor-paced", "student-paced"].map((item) => (
                  <button
                    key={item}
                    type="button"
                    onClick={() => setMode(item)}
                    className={`rounded-xl border px-4 py-3 text-sm font-bold transition text-left ${
                      mode === item
                        ? "border-yellow-400 bg-yellow-50 text-yellow-900 ring-2 ring-yellow-200"
                        : "border-neutral-200 bg-neutral-50 text-neutral-700 hover:bg-white"
                    }`}
                  >
                    {item === "instructor-paced" ? "🎙 Instructor-paced" : "🏃 Student-paced"}
                  </button>
                ))}
              </div>
            </div>

            {/* Timer */}
            {!hideTimerControl ? (
              <div className="rounded-2xl bg-white border border-neutral-100 p-4 shadow-sm sm:p-5">
                <p className="mb-3 text-sm font-black text-neutral-700">{timerLabel}</p>
                <div className="grid grid-cols-4 gap-2">
                  {timerOptions.map((value) => (
                    <button
                      key={value}
                      type="button"
                      onClick={() => setQuestionTime(value)}
                      className={`rounded-xl border py-2.5 text-sm font-black transition ${
                        questionTime === value
                          ? "border-yellow-400 bg-yellow-400 text-neutral-900"
                          : "border-neutral-200 bg-neutral-50 text-neutral-700 hover:bg-white"
                      }`}
                    >
                      {value}s
                    </button>
                  ))}
                </div>
              </div>
            ) : null}

            {/* Scoring info */}
            <div className="rounded-2xl bg-neutral-50 border border-neutral-100 p-4 sm:p-5">
              <p className="text-xs font-black uppercase tracking-widest text-neutral-400">Scoring</p>
              <p className="mt-2 text-sm leading-relaxed text-neutral-600">
                {selectedQuiz?.scoringDescription ?? "Correct answers earn up to 100 points. Faster answers score higher."}
              </p>
            </div>

            {error ? (
              <ErrorAlert message={error} onDismiss={() => setError("")} />
            ) : null}

            <button
              type="button"
              onClick={createRoom}
              disabled={loading}
              className="btn-primary w-full justify-center py-4 text-base"
            >
              {loading ? "Creating room…" : "🚀 Create live room"}
            </button>
          </div>
        </div>
      </div>
    </ShellLayout>
  );
}
