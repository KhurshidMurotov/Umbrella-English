import { Clock3, ListChecks, Play } from "lucide-react";
import { Link } from "react-router-dom";

export default function QuizCard({ quiz }) {
  const count = quiz.questions?.length ?? 0;

  return (
    <div className="card" style={{ padding: 0, overflow: "hidden", display: "flex", flexDirection: "column" }}>
      <div style={{ height: 10, background: "var(--yellow-400)", borderBottom: "var(--border)" }} />
      <div style={{ padding: 20, display: "flex", flexDirection: "column", flex: 1 }}>
        <div className="spread">
          <span className="chip chip-yellow">{quiz.difficulty || "Quiz"}</span>
          {quiz.estimatedTime ? <span className="meta"><Clock3 size={13} />{quiz.estimatedTime}</span> : null}
        </div>
        <h3 className="h3" style={{ marginTop: 14 }}>{quiz.title}</h3>
        {quiz.description ? (
          <p className="muted" style={{ marginTop: 6, fontSize: 14, lineHeight: 1.5, flex: 1 }}>{quiz.description}</p>
        ) : (
          <div style={{ flex: 1 }} />
        )}
        <div className="spread" style={{ marginTop: 18 }}>
          <span className="meta"><ListChecks size={13} />{count} questions</span>
          <Link to={`/quiz/${quiz.id}`} className="btn-dark btn-sm"><Play size={16} />Start quiz</Link>
        </div>
      </div>
    </div>
  );
}
