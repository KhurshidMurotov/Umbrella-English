import { BarChart3, RotateCcw, Search } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import ShellLayout from "../components/ShellLayout";
import StatPill from "../components/StatPill";
import { getResults } from "../lib/storage";

export default function ResultsPage() {
  const { state } = useLocation();
  const latestStoredResult = getResults()[0];
  const result = state ?? latestStoredResult ?? {
    title: "Umbrella English Sprint",
    score: 760,
    accuracy: 80,
    correctAnswers: 8,
    wrongAnswers: 2,
    streak: 4,
    totalQuestions: 10,
    violations: 0,
    endedBy: "completed"
  };

  return (
    <ShellLayout>
      <div className="fade-in" style={{ maxWidth: 720, margin: "0 auto" }}>
        <div className="card" style={{ padding: 0, overflow: "hidden" }}>
          {/* Dark header */}
          <div className="card-dark" style={{ borderRadius: 0, boxShadow: "none", border: "none", padding: "34px 28px" }}>
            <div className="eyebrow" style={{ color: "var(--yellow-400)" }}>Results</div>
            <h1 className="h1" style={{ color: "#fff", marginTop: 8 }}>{result.title}</h1>
            <div className="row" style={{ marginTop: 22, alignItems: "flex-end", gap: 20 }}>
              <div>
                <div className="eyebrow" style={{ color: "var(--ink-300)" }}>Score</div>
                <div style={{ fontFamily: "var(--font-mono)", fontWeight: 700, fontSize: 60, color: "var(--yellow-400)", lineHeight: 1 }}>
                  {result.score}
                </div>
              </div>
              <div className="chip" style={{ background: "rgba(255,255,255,.1)", color: "#fff", border: "none" }}>
                Finished · {result.endedBy}
              </div>
            </div>
          </div>

          {/* Body */}
          <div style={{ padding: 24 }}>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              <StatPill label="Accuracy" value={`${result.accuracy}%`} />
              <StatPill label="Correct" value={result.correctAnswers} tone="grass" />
              <StatPill label="Wrong" value={result.wrongAnswers} tone="tomato" />
              <StatPill label="Streak" value={result.streak} tone="yellow" />
            </div>

            <div
              className="card-tight"
              style={{ marginTop: 18, background: "var(--yellow-50)", border: "1.5px solid var(--yellow-600)" }}
            >
              <div className="row" style={{ gap: 8, fontWeight: 800, flexWrap: "nowrap" }}>
                <BarChart3 size={18} />
                <span style={{ whiteSpace: "nowrap" }}>Stats snapshot</span>
              </div>
              <p className="muted" style={{ marginTop: 8, fontSize: 14, lineHeight: 1.6 }}>
                You answered {result.correctAnswers} of {result.totalQuestions} questions correctly with {result.violations} anti-cheat violations recorded.
                The scoring model gives up to 100 points per question based on correctness and speed.
              </p>
            </div>

            <div className="row" style={{ marginTop: 20 }}>
              <Link to="/" className="btn-dark"><RotateCcw size={18} />Play again</Link>
              <Link to="/" className="btn-ghost"><Search size={18} />Find new quiz</Link>
            </div>
          </div>
        </div>
      </div>
    </ShellLayout>
  );
}
