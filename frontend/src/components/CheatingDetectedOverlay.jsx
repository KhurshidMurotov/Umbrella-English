import { AlertTriangle } from "lucide-react";

export default function CheatingDetectedOverlay({
  title = "Cheating detected",
  subtitle = "This session was locked because anti-cheat detected repeated app or tab switching."
}) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center overflow-hidden px-6 text-center"
      style={{ background: "rgba(20,20,20,0.96)", color: "#fff" }}
    >
      <div style={{ maxWidth: 640 }}>
        <div className="mb-6 flex justify-center">
          <span className="chip" style={{ background: "var(--tomato)", color: "#fff", border: "var(--border)", borderColor: "#fff" }}>
            <AlertTriangle size={14} />
            Cheating alert
          </span>
        </div>

        <h1 className="h-hero" style={{ color: "#fff" }}>{title}</h1>

        <p style={{ marginTop: 20, fontSize: 18, lineHeight: 1.6, color: "var(--ink-300)" }}>{subtitle}</p>

        <p style={{ marginTop: 24, fontSize: 14, color: "var(--ink-400)" }}>
          Your exam has been automatically locked. Contact your instructor for assistance.
        </p>
      </div>
    </div>
  );
}
