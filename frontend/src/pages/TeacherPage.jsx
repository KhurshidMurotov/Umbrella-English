import { useEffect, useState } from "react";
import { LockKeyhole, LogOut, UserRound } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import ErrorAlert from "../components/ErrorAlert";
import ShellLayout from "../components/ShellLayout";
import { API_URL } from "../lib/api";
import { quizCatalog } from "../lib/quizzes";
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
      setError("Wrong credentials. Use admin / teacher.");
      return;
    }

    setError("");
    onLogin(session);
  }

  return (
    <ShellLayout showNav={false}>
      <div className="mx-auto max-w-xl">
        <div className="glass-card rounded-[36px] p-8 sm:p-10">
          <div className="flex items-center gap-3">
            <div className="rounded-[18px] bg-neutral-950 p-3 text-white">
              <LockKeyhole size={18} />
            </div>
            <div>
              <p className="text-xs font-black uppercase tracking-[0.3em] text-neutral-500">Teacher login</p>
              <h1 className="mt-1 text-3xl font-extrabold text-neutral-950">Protected host area</h1>
            </div>
          </div>

          <p className="mt-5 text-sm leading-7 text-neutral-600">
            Teacher tools are hidden from the public site. Sign in to access live hosting controls.
          </p>

          <form onSubmit={handleSubmit} className="mt-8 space-y-5">
            <div>
              <label className="flex items-center gap-2 text-sm font-bold text-neutral-950">
                <UserRound size={16} />
                Username
              </label>
              <input
                value={username}
                onChange={(event) => setUsername(event.target.value)}
                className="mt-2 w-full rounded-[18px] border border-neutral-200 bg-white px-4 py-3 outline-none focus:border-neutral-950"
              />
            </div>

            <div>
              <label className="flex items-center gap-2 text-sm font-bold text-neutral-950">
                <LockKeyhole size={16} />
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                className="mt-2 w-full rounded-[18px] border border-neutral-200 bg-white px-4 py-3 outline-none focus:border-neutral-950"
              />
            </div>

            {error ? (
              <ErrorAlert message={error} onDismiss={() => setError("")} />
            ) : null}

            <button
              type="submit"
              className="w-full rounded-full bg-neutral-950 px-6 py-4 text-sm font-extrabold text-white"
            >
              Enter teacher area
            </button>
          </form>
        </div>
      </div>
    </ShellLayout>
  );
}

export default function TeacherPage() {
  const [teacherSession, setTeacherSession] = useState(null);
  const [hostName, setHostName] = useState("Teacher");
  const [mode, setMode] = useState("instructor-paced");
  const [questionTime, setQuestionTime] = useState(15);
  const [selectedQuizId, setSelectedQuizId] = useState(quizCatalog[0]?.id ?? "");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const selectedQuiz = quizCatalog.find((quiz) => quiz.id === selectedQuizId) ?? quizCatalog[0];

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
    <ShellLayout showNav={false}>
      <div className="glass-card rounded-[36px] p-8 mx-auto max-w-4xl">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.3em] text-neutral-500">Teacher panel</p>
              <h1 className="mt-2 text-4xl font-extrabold text-neutral-950">Create and control live exams.</h1>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <Link
                to="/teacher/stats"
                className="inline-flex items-center gap-2 rounded-full bg-amber-300 px-5 py-3 text-sm font-extrabold text-neutral-950"
              >
                View students stats
              </Link>
              <button
                type="button"
                onClick={handleLogout}
                className="inline-flex items-center gap-2 rounded-full border border-neutral-200 bg-white px-4 py-3 text-sm font-bold text-neutral-700"
              >
                <LogOut size={16} />
                Logout
              </button>
            </div>
          </div>

          <p className="mt-4 max-w-2xl text-sm leading-7 text-neutral-600">
            This area is hidden from the public site. Set the room pace, choose the timer and launch the host room.
          </p>

          <div className="mt-8 grid gap-6 lg:grid-cols-[1.5fr_0.95fr]">
            <div className="space-y-5">
              <div>
                <label className="text-sm font-bold text-neutral-950">Teacher name</label>
                <input
                  value={hostName}
                  onChange={(event) => setHostName(event.target.value)}
                  className="mt-2 w-full rounded-[18px] border border-neutral-200 bg-white px-4 py-3 outline-none focus:border-neutral-950"
                />
              </div>

              <div className="rounded-[24px] border border-neutral-200 bg-white p-5">
                <p className="text-sm font-bold text-neutral-950">Test to host</p>
                <div className="mt-4 grid gap-3">
                  {quizCatalog.map((quiz) => (
                    <button
                      key={quiz.id}
                      type="button"
                      onClick={() => setSelectedQuizId(quiz.id)}
                      className={`rounded-[22px] border px-4 py-4 text-left transition ${
                        selectedQuizId === quiz.id
                          ? "border-amber-300 bg-amber-50"
                          : "border-neutral-200 bg-white hover:border-neutral-300"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="text-sm font-extrabold text-neutral-950">{quiz.title}</p>
                          <p className="mt-1 text-sm leading-6 text-neutral-500">{quiz.description}</p>
                        </div>
                        <span className="rounded-full bg-neutral-100 px-3 py-1 text-xs font-bold uppercase tracking-[0.14em] text-neutral-700">
                          {quiz.difficulty}
                        </span>
                      </div>
                      <p className="mt-3 text-xs font-bold uppercase tracking-[0.16em] text-neutral-500">
                        {quiz.questions.length} questions / {quiz.estimatedTime}
                      </p>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="space-y-5 flex flex-col items-center">
              <div className="w-full rounded-[24px] border border-neutral-200 bg-white p-5">
                <p className="text-sm font-bold text-neutral-950">Exam mode</p>
                <div className="mt-4 flex flex-wrap justify-center gap-3">
                  {["instructor-paced", "student-paced"].map((item) => (
                    <button
                      key={item}
                      type="button"
                      onClick={() => setMode(item)}
                      className={`rounded-full px-4 py-3 text-sm font-bold ${
                        mode === item ? "bg-neutral-950 text-white" : "bg-white text-neutral-700 ring-1 ring-neutral-200"
                      }`}
                    >
                      {item}
                    </button>
                  ))}
                </div>
              </div>

              <div className="w-full rounded-[24px] border border-neutral-200 bg-white p-5">
                <p className="text-sm font-bold text-neutral-950">Time per question</p>
                <div className="mt-4 flex flex-wrap justify-center gap-3">
                  {TIMER_OPTIONS.map((value) => (
                    <button
                      key={value}
                      type="button"
                      onClick={() => setQuestionTime(value)}
                      className={`rounded-full px-4 py-3 text-sm font-bold ${
                        questionTime === value ? "bg-amber-300 text-neutral-950" : "bg-white text-neutral-700 ring-1 ring-neutral-200"
                      }`}
                    >
                      {value}s
                    </button>
                  ))}
                </div>
              </div>

              <div className="w-full rounded-[24px] border border-neutral-200 bg-white p-5">
                <p className="text-sm font-bold text-neutral-950">Scoring</p>
                <p className="mt-2 text-sm leading-6 text-neutral-500">
                  Correct answers earn up to 100 points. Faster answers score higher, wrong or late answers score 0.
                </p>
                <p className="mt-3 text-sm font-semibold text-neutral-900">
                  Selected test: {selectedQuiz.title}
                </p>
              </div>

              {error ? (
                <ErrorAlert message={error} onDismiss={() => setError("")} />
              ) : null}

              <div className="w-full space-y-4">
                <button
                  type="button"
                  onClick={createRoom}
                  disabled={loading}
                  className="w-full rounded-full bg-neutral-950 px-6 py-4 text-sm font-extrabold text-white"
                >
                  {loading ? "Creating room..." : "Create live room"}
                </button>
              </div>
            </div>
          </div>
        </div>
    </ShellLayout>
  );
}
