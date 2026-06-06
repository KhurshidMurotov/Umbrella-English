import { GraduationCap, Key, Target } from "lucide-react";
import { Link } from "react-router-dom";
import QuizCard from "../components/QuizCard";
import ShellLayout from "../components/ShellLayout";
import { useQuizCatalog } from "../lib/quizCatalog";

export default function HomePage() {
  const { quizzes: quizCatalog } = useQuizCatalog();

  return (
    <ShellLayout fullBleed>
      {/* Hero — flat yellow flood with ink outline band + umbrella watermark */}
      <div
        className="band fade-in"
        style={{ background: "var(--yellow-400)", borderBottom: "var(--border)", position: "relative", overflow: "hidden" }}
      >
        <div
          aria-hidden="true"
          style={{ position: "absolute", right: -90, top: -90, width: 300, height: 300, borderRadius: "50%", border: "var(--border)", opacity: 0.25 }}
        />
        <img
          aria-hidden="true"
          src="/umbrella-mark-ink.svg"
          alt=""
          style={{ position: "absolute", right: 40, bottom: -50, width: 230, opacity: 0.12, transform: "rotate(-8deg)" }}
        />
        <div className="container" style={{ position: "relative", padding: "64px 24px 76px" }}>
          <span className="chip chip-ink"><GraduationCap size={13} />English platform</span>
          <h1 className="h-hero" style={{ marginTop: 18 }}>
            Learn English.<br />Play. Win.
          </h1>
          <p className="lead" style={{ marginTop: 16, maxWidth: 520, color: "var(--ink)" }}>
            Solo quizzes with a timer and anti-cheat, plus live rooms where your class competes in real time.
          </p>
          <div className="row" style={{ marginTop: 28 }}>
            <Link to="/live" className="btn-dark btn-lg btn-pill"><Target size={18} />Join live room</Link>
            <Link to="/teacher" className="btn-ghost btn-lg btn-pill"><Key size={18} />Teacher area</Link>
          </div>
        </div>
      </div>

      {/* Catalog — tinted band for rhythm */}
      <div className="band band-paper2">
        <div className="container" style={{ padding: "56px 24px 72px" }}>
          <div className="eyebrow">Sample tests</div>
          <h2 className="h1" style={{ marginTop: 6 }}>Choose a quiz</h2>
          <div
            style={{ display: "grid", gap: 22, gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", marginTop: 28 }}
          >
            {quizCatalog.map((quiz, index) => (
              <QuizCard key={quiz.id} quiz={quiz} index={index} />
            ))}
          </div>
        </div>
      </div>
    </ShellLayout>
  );
}
