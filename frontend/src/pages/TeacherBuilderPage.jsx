import { useEffect, useState } from "react";
import { ArrowLeft, Copy, Eye, EyeOff, Pencil, Plus, Save, Trash2 } from "lucide-react";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";
import ErrorAlert from "../components/ErrorAlert";
import ShellLayout from "../components/ShellLayout";
import QuestionEditor from "../components/builder/QuestionEditor";
import QuestionPreview from "../components/builder/QuestionPreview";
import QuizSettingsPanel from "../components/builder/QuizSettingsPanel";
import { createEmptyQuestion, nextKey, QUESTION_TYPE_OPTIONS, stripKeys } from "../components/builder/questionFactories";
import { API_URL } from "../lib/api";
import { fetchQuizById, fetchQuizCatalog } from "../lib/quizCatalog";
import { getTeacherSession } from "../lib/teacherAuth";

function AccessGate() {
  return (
    <ShellLayout showLinks={false}>
      <div className="card mx-auto max-w-md p-8 text-center">
        <h1 className="text-xl font-black text-neutral-900">Teacher access required</h1>
        <p className="mt-2 text-sm text-neutral-500">Log in to the teacher area to build tests.</p>
        <Link to="/teacher" className="btn-dark mt-5 inline-flex justify-center px-5 py-3 text-sm">
          Go to teacher login
        </Link>
      </div>
    </ShellLayout>
  );
}

function emptyDraft() {
  return {
    title: "",
    description: "",
    difficulty: "",
    estimatedTime: "",
    flow: "",
    fixedUnitScoring: true,
    showLiveRankingDuringTest: true,
    shuffleQuestions: false,
    shuffleOptions: false,
    questions: []
  };
}

function withKeys(question, stripIds) {
  const next = { ...question, _key: nextKey("q") };
  if (stripIds) delete next.id;
  ["items", "choices", "people", "responseFields"].forEach((listKey) => {
    if (Array.isArray(next[listKey])) {
      next[listKey] = next[listKey].map((entry) => {
        const copy = { ...entry, _key: nextKey(listKey) };
        if (stripIds && listKey === "responseFields") delete copy.id;
        return copy;
      });
    }
  });
  return next;
}

function hydrate(quiz, { stripIds = false } = {}) {
  return {
    title: stripIds ? `Copy of ${quiz.title ?? ""}`.trim() : quiz.title ?? "",
    description: quiz.description ?? "",
    difficulty: quiz.difficulty ?? "",
    estimatedTime: quiz.estimatedTime ?? "",
    flow: quiz.flow === "free-navigation" ? "free-navigation" : "",
    fixedUnitScoring: quiz.fixedUnitScoring !== false,
    showLiveRankingDuringTest: quiz.showLiveRankingDuringTest !== false,
    shuffleQuestions: quiz.shuffleQuestions === true,
    shuffleOptions: quiz.shuffleOptions === true,
    questions: (quiz.questions ?? []).map((question) => withKeys(question, stripIds))
  };
}

function BuilderList({ session }) {
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  async function load() {
    setLoading(true);
    setQuizzes(await fetchQuizCatalog());
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  const custom = quizzes.filter((quiz) => quiz.custom === true);
  const builtIn = quizzes.filter((quiz) => quiz.custom !== true);

  async function handleDelete(quiz) {
    if (!window.confirm(`Delete "${quiz.title}"? This cannot be undone.`)) {
      return;
    }
    try {
      const response = await fetch(`${API_URL}/api/quizzes/${encodeURIComponent(quiz.id)}?accessCode=${encodeURIComponent(session.accessCode)}`, {
        method: "DELETE"
      });
      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        setError(data.error ?? "Could not delete the test.");
        return;
      }
      setError("");
      load();
    } catch {
      setError("Server is unavailable.");
    }
  }

  return (
    <ShellLayout showLinks={false}>
      <div className="mx-auto max-w-4xl">
        <div className="card card-dark mb-5 flex flex-wrap items-center justify-between gap-3 px-5 py-4">
          <div className="flex items-center gap-3">
            <Link to="/teacher" className="rounded-xl border border-neutral-700 bg-neutral-800 p-2 text-neutral-300 transition hover:bg-neutral-700">
              <ArrowLeft size={16} />
            </Link>
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-neutral-500">Teacher panel</p>
              <h1 className="mt-0.5 text-xl font-black text-white sm:text-2xl">Test builder</h1>
            </div>
          </div>
          <Link to="/teacher/builder/new" className="inline-flex items-center gap-2 rounded-xl bg-yellow-400 px-4 py-2.5 text-sm font-black text-neutral-900 transition hover:bg-yellow-300">
            <Plus size={16} />
            New test
          </Link>
        </div>

        {error ? <div className="mb-4"><ErrorAlert message={error} onDismiss={() => setError("")} /></div> : null}

        {loading ? (
          <p className="text-sm text-neutral-500">Loading tests…</p>
        ) : (
          <div className="space-y-6">
            <section>
              <p className="eyebrow" style={{ marginBottom: 12 }}>Your tests</p>
              {custom.length ? (
                <div className="space-y-2">
                  {custom.map((quiz) => (
                    <div key={quiz.id} className="card flex flex-wrap items-center justify-between gap-3 p-4">
                      <div className="min-w-0">
                        <p className="truncate text-sm font-extrabold text-neutral-900">{quiz.title}</p>
                        <p className="eyebrow" style={{ marginTop: 2 }}>
                          {(quiz.questions?.length ?? 0)} questions · {quiz.flow === "free-navigation" ? "Self-paced" : "Instructor-paced"}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Link to={`/teacher/builder/${encodeURIComponent(quiz.id)}`} className="btn-ghost btn-sm">
                          <Pencil size={14} /> Edit
                        </Link>
                        <button type="button" onClick={() => navigate("/teacher/builder/new", { state: { duplicateFrom: quiz.id } })} className="btn-ghost btn-sm">
                          <Copy size={14} /> Duplicate
                        </button>
                        <button type="button" onClick={() => handleDelete(quiz)} className="btn-ghost btn-sm" style={{ color: "var(--ink-400)" }}>
                          <Trash2 size={14} /> Delete
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p style={{ borderRadius: "var(--r-lg)", border: "2px dashed var(--ink-300)", background: "var(--card)", padding: 24, textAlign: "center", fontSize: 14, color: "var(--ink-400)" }}>
                  No custom tests yet. Click “New test” to build one.
                </p>
              )}
            </section>

            <section>
              <p className="eyebrow" style={{ marginBottom: 12 }}>Sample tests (duplicate to edit)</p>
              <div className="space-y-2">
                {builtIn.map((quiz) => (
                  <div key={quiz.id} className="card flex flex-wrap items-center justify-between gap-3 p-4">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-extrabold text-neutral-900">{quiz.title}</p>
                      <p className="eyebrow" style={{ marginTop: 2 }}>{(quiz.questions?.length ?? 0)} questions</p>
                    </div>
                    <button type="button" onClick={() => navigate("/teacher/builder/new", { state: { duplicateFrom: quiz.id } })} className="btn-ghost btn-sm">
                      <Copy size={14} /> Duplicate to edit
                    </button>
                  </div>
                ))}
              </div>
            </section>
          </div>
        )}
      </div>
    </ShellLayout>
  );
}

function BuilderEditor({ session, quizId }) {
  const isNew = quizId === "new";
  const location = useLocation();
  const navigate = useNavigate();
  const duplicateFrom = location.state?.duplicateFrom;

  const [draft, setDraft] = useState(isNew && !duplicateFrom ? emptyDraft() : null);
  const [loading, setLoading] = useState(!(isNew && !duplicateFrom));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [showTypePicker, setShowTypePicker] = useState(false);
  const [openPreviews, setOpenPreviews] = useState(() => new Set());

  useEffect(() => {
    let active = true;
    const sourceId = isNew ? duplicateFrom : quizId;
    if (!sourceId) {
      return undefined;
    }
    setLoading(true);
    fetchQuizById(sourceId).then((quiz) => {
      if (!active) return;
      setDraft(quiz ? hydrate(quiz, { stripIds: isNew }) : emptyDraft());
      setLoading(false);
    });
    return () => {
      active = false;
    };
  }, [quizId, isNew, duplicateFrom]);

  function updateQuestion(index, updated) {
    setDraft((current) => ({
      ...current,
      questions: current.questions.map((question, questionIndex) => (questionIndex === index ? updated : question))
    }));
  }

  function addQuestion(type) {
    setShowTypePicker(false);
    setDraft((current) => ({ ...current, questions: [...current.questions, createEmptyQuestion(type)] }));
  }

  function removeQuestion(index) {
    setDraft((current) => ({ ...current, questions: current.questions.filter((_, questionIndex) => questionIndex !== index) }));
  }

  function moveQuestion(index, direction) {
    setDraft((current) => {
      const target = index + direction;
      if (target < 0 || target >= current.questions.length) return current;
      const questions = [...current.questions];
      [questions[index], questions[target]] = [questions[target], questions[index]];
      return { ...current, questions };
    });
  }

  function duplicateQuestion(index) {
    setDraft((current) => {
      const source = current.questions[index];
      const clone = withKeys({ ...stripKeys(source) }, true);
      const questions = [...current.questions];
      questions.splice(index + 1, 0, clone);
      return { ...current, questions };
    });
  }

  function togglePreview(key) {
    setOpenPreviews((current) => {
      const next = new Set(current);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  }

  async function save() {
    setError("");
    if (!draft.title.trim()) {
      setError("Add a test title.");
      return;
    }
    if (!draft.questions.length) {
      setError("Add at least one question.");
      return;
    }

    setSaving(true);
    const payload = stripKeys(draft);
    const isEdit = !isNew;
    const url = isEdit ? `${API_URL}/api/quizzes/${encodeURIComponent(quizId)}` : `${API_URL}/api/quizzes`;

    try {
      const response = await fetch(url, {
        method: isEdit ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ accessCode: session.accessCode, quiz: payload })
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        setError(data.error ?? "Could not save the test.");
        setSaving(false);
        return;
      }
      navigate("/teacher/builder");
    } catch {
      setError("Server is unavailable. Start the backend and try again.");
      setSaving(false);
    }
  }

  if (loading || !draft) {
    return (
      <ShellLayout showLinks={false}>
        <p className="mx-auto max-w-3xl text-sm text-neutral-500">Loading…</p>
      </ShellLayout>
    );
  }

  return (
    <ShellLayout showLinks={false}>
      <div className="mx-auto max-w-3xl">
        <div className="card card-dark mb-5 flex flex-wrap items-center justify-between gap-3 px-5 py-4">
          <div className="flex items-center gap-3">
            <Link to="/teacher/builder" className="rounded-xl border border-neutral-700 bg-neutral-800 p-2 text-neutral-300 transition hover:bg-neutral-700">
              <ArrowLeft size={16} />
            </Link>
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-neutral-500">Test builder</p>
              <h1 className="mt-0.5 text-xl font-black text-white sm:text-2xl">{isNew ? "New test" : "Edit test"}</h1>
            </div>
          </div>
          <button type="button" onClick={save} disabled={saving} className="btn-primary inline-flex items-center gap-2 px-5 py-3 text-sm">
            <Save size={16} />
            {saving ? "Saving…" : "Save test"}
          </button>
        </div>

        {error ? <div className="mb-4"><ErrorAlert message={error} onDismiss={() => setError("")} /></div> : null}

        <div className="space-y-4">
          <QuizSettingsPanel draft={draft} onChange={setDraft} />

          {draft.questions.map((question, index) => (
            <div key={question._key} className="space-y-2">
              <QuestionEditor
                question={question}
                index={index}
                total={draft.questions.length}
                onChange={(updated) => updateQuestion(index, updated)}
                onRemove={() => removeQuestion(index)}
                onMoveUp={() => moveQuestion(index, -1)}
                onMoveDown={() => moveQuestion(index, 1)}
                onDuplicate={() => duplicateQuestion(index)}
              />
              <div className="flex justify-end">
                <button type="button" onClick={() => togglePreview(question._key)} className="inline-flex items-center gap-1.5 text-xs font-bold text-neutral-500 transition hover:text-neutral-900">
                  {openPreviews.has(question._key) ? <EyeOff size={14} /> : <Eye size={14} />}
                  {openPreviews.has(question._key) ? "Hide preview" : "Preview"}
                </button>
              </div>
              {openPreviews.has(question._key) ? <QuestionPreview question={question} /> : null}
            </div>
          ))}

          {showTypePicker ? (
            <div className="card">
              <p className="eyebrow" style={{ marginBottom: 12 }}>Choose a question type</p>
              <div className="grid gap-2 sm:grid-cols-2">
                {QUESTION_TYPE_OPTIONS.map((option) => (
                  <button
                    key={option.type}
                    type="button"
                    onClick={() => addQuestion(option.type)}
                    className="text-left"
                    style={{ borderRadius: "var(--r-md)", border: "var(--border-thin)", background: "var(--card)", padding: "12px 16px", cursor: "pointer", fontFamily: "inherit" }}
                  >
                    <p style={{ fontWeight: 800 }}>{option.label}</p>
                    <p className="muted" style={{ marginTop: 2, fontSize: 13 }}>{option.hint}</p>
                  </button>
                ))}
              </div>
              <button
                type="button"
                onClick={() => setShowTypePicker(false)}
                style={{ marginTop: 12, fontSize: 13, fontWeight: 700, color: "var(--ink-400)", background: "none", border: "none", cursor: "pointer" }}
              >
                Cancel
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setShowTypePicker(true)}
              className="flex w-full items-center justify-center gap-2"
              style={{ borderRadius: "var(--r-lg)", border: "2px dashed var(--ink-300)", background: "var(--card)", padding: "16px 0", fontWeight: 800, fontSize: 14, color: "var(--ink-500)", cursor: "pointer", fontFamily: "inherit" }}
            >
              <Plus size={16} />
              Add question
            </button>
          )}

          <button type="button" onClick={save} disabled={saving} className="btn-primary w-full justify-center py-4 text-base">
            <Save size={18} />
            {saving ? "Saving…" : "Save test"}
          </button>
        </div>
      </div>
    </ShellLayout>
  );
}

export default function TeacherBuilderPage() {
  const { id } = useParams();
  const session = getTeacherSession();

  if (!session) {
    return <AccessGate />;
  }

  return id ? <BuilderEditor session={session} quizId={id} /> : <BuilderList session={session} />;
}
