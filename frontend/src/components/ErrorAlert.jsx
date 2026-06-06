import { AlertTriangle } from "lucide-react";

export default function ErrorAlert({ message, onDismiss }) {
  return (
    <div
      className="row"
      style={{
        gap: 12, flexWrap: "nowrap", borderRadius: "var(--r-md)",
        border: "1.5px solid var(--tomato)", background: "var(--tomato-soft)",
        color: "var(--tomato)", padding: "12px 14px", fontSize: 14, fontWeight: 700
      }}
    >
      <AlertTriangle size={18} style={{ flexShrink: 0 }} />
      <span style={{ flex: 1 }}>{message}</span>
      {onDismiss && (
        <button
          onClick={onDismiss}
          style={{ background: "none", border: "none", color: "inherit", cursor: "pointer", fontWeight: 800, fontSize: 15 }}
          aria-label="Dismiss"
        >
          ✕
        </button>
      )}
    </div>
  );
}
