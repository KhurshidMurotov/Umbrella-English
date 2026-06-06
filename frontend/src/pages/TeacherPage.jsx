import { useEffect, useState } from "react";
import { BarChart3, Footprints, Hammer, LockKeyhole, LogOut, Mic, Rocket } from "lucide-react";
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
      <div className="fade-in card" style={{ maxWidth: 400, margin: "0 auto", padding: 0, overflow: "hidden" }}>
        <div style={{ height: 10, background: "var(--yellow-400)", borderBottom: "var(--border)" }} />
        <div style={{ padding: 28 }}>
          <div className="row" style={{ gap: 12, marginBottom: 20, flexWrap: "nowrap" }}>
            <span style={{ background: "var(--ink)", color: "#fff", borderRadius: "var(--r-md)", padding: 11, display: "flex" }}>
              <LockKeyhole size={18} />
            </span>
            <div>
              <div className="eyebrow">Teacher login</div>
              <div className="h3">Protected area</div>
            </div>
          </div>

          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <div className="field">
              <label>Username</label>
              <input className="inp" value={username} onChange={(event) => setUsername(event.target.value)} />
            </div>
            <div className="field">
              <label>Password</label>
              <input className="inp" type="password" value={password} onChange={(event) => setPassword(event.target.value)} />
            </div>
            {error ? <ErrorAlert message={error} onDismiss={() => setError("")} /> : null}
            <button type="submit" className="btn-dark btn-block"><LockKeyhole size={16} />Enter teacher area</button>
          </form>
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

  const selectableStyle = (active) => ({
    width: "100%",
    textAlign: "left",
    borderRadius: "var(--r-lg)",
    padding: "14px 16px",
    border: active ? "var(--border)" : "var(--border-thin)",
    background: active ? "var(--yellow-100)" : "var(--card)",
    boxShadow: active ? "var(--pop-sm)" : "none",
    cursor: "pointer",
    fontFamily: "inherit"
  });

  return (
    <ShellLayout showLinks={false}>
      <div className="fade-in">
        {/* Header */}
        <div className="card-dark" style={{ borderRadius: "var(--r-xl)", padding: "20px 22px", marginBottom: 18, display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
          <div>
            <div className="eyebrow" style={{ color: "var(--yellow-400)" }}>Teacher panel</div>
            <div className="h2" style={{ color: "#fff", marginTop: 2 }}>Create live exam</div>
          </div>
          <div className="row" style={{ gap: 8 }}>
            <Link to="/teacher/builder" className="btn-primary btn-sm"><Hammer size={15} />Build tests</Link>
            <Link to="/teacher/stats" className="btn-ghost btn-sm"><BarChart3 size={15} />Student stats</Link>
            <button type="button" onClick={handleLogout} className="btn-ghost btn-sm"><LogOut size={15} />Logout</button>
          </div>
        </div>

        <div className="grid gap-4 lg:grid-cols-[1fr_340px]">
          {/* Left: teacher name + quiz selection */}
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div className="card">
              <div className="field">
                <label>Your name</label>
                <input className="inp" value={hostName} onChange={(event) => setHostName(event.target.value)} />
              </div>
            </div>

            <div className="card">
              <p className="eyebrow" style={{ marginBottom: 12 }}>Choose test</p>
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {quizCatalog.map((quiz) => (
                  <button key={quiz.id} type="button" onClick={() => setSelectedQuizId(quiz.id)} style={selectableStyle(selectedQuizId === quiz.id)}>
                    <div className="spread" style={{ gap: 12, alignItems: "flex-start" }}>
                      <div style={{ minWidth: 0 }}>
                        <p style={{ fontWeight: 800, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{quiz.title}</p>
                        {quiz.description ? <p className="muted" style={{ marginTop: 2, fontSize: 13, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{quiz.description}</p> : null}
                      </div>
                      <span className="chip chip-yellow">{quiz.difficulty || "Quiz"}</span>
                    </div>
                    <p className="eyebrow" style={{ marginTop: 8 }}>
                      {quiz.questions.length} questions{quiz.estimatedTime ? ` · ${quiz.estimatedTime}` : ""}
                    </p>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Right: mode, timer, scoring, launch */}
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div className="card">
              <p className="eyebrow" style={{ marginBottom: 12 }}>Exam mode</p>
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {[
                  { id: "instructor-paced", label: "Instructor-paced", Icon: Mic },
                  { id: "student-paced", label: "Student-paced", Icon: Footprints }
                ].map((item) => (
                  <button key={item.id} type="button" onClick={() => setMode(item.id)} style={{ ...selectableStyle(mode === item.id), display: "flex", alignItems: "center", gap: 10, fontWeight: 800 }}>
                    <item.Icon size={18} />
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            {!hideTimerControl ? (
              <div className="card">
                <p className="eyebrow" style={{ marginBottom: 12 }}>{timerLabel}</p>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 8 }}>
                  {timerOptions.map((value) => (
                    <button key={value} type="button" onClick={() => setQuestionTime(value)} className={`qpill${questionTime === value ? " on" : ""}`} style={{ textAlign: "center", fontFamily: "var(--font-mono)" }}>
                      {value}s
                    </button>
                  ))}
                </div>
              </div>
            ) : null}

            <div className="card-tight" style={{ background: "var(--yellow-50)", border: "1.5px solid var(--yellow-600)" }}>
              <p className="eyebrow">Scoring</p>
              <p className="muted" style={{ marginTop: 8, fontSize: 14, lineHeight: 1.55 }}>
                {selectedQuiz?.scoringDescription ?? "Correct answers earn up to 100 points. Faster answers score higher."}
              </p>
            </div>

            {error ? <ErrorAlert message={error} onDismiss={() => setError("")} /> : null}

            <button type="button" onClick={createRoom} disabled={loading} className="btn-primary btn-lg btn-block">
              <Rocket size={18} />
              {loading ? "Creating room…" : "Create live room"}
            </button>
          </div>
        </div>
      </div>
    </ShellLayout>
  );
}
