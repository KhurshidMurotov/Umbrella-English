import { useState, useEffect } from "react";
import QRCode from "react-qr-code";

export default function QRCodePanel({ value, title = "QR access", caption = "Scan to join the live exam instantly." }) {
  const [error, setError] = useState(null);

  // Validate QR code value length (max 2953 chars for QR)
  useEffect(() => {
    if (value && value.length > 2953) {
      setError("QR code value is too long. Please use a shorter room code or URL.");
    } else {
      setError(null);
    }
  }, [value]);

  const frame = { borderRadius: "var(--r-lg)", background: "#fff", border: "var(--border)", padding: 16, marginTop: 12 };

  if (!value) {
    return (
      <div className="glass-card p-5 text-center">
        <p className="eyebrow">{title}</p>
        <div style={{ ...frame, height: 192, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <p className="muted">Loading QR code…</p>
        </div>
        <p className="muted" style={{ marginTop: 14, fontSize: 14 }}>{caption}</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="glass-card p-5 text-center">
        <p className="eyebrow">{title}</p>
        <div style={{ borderRadius: "var(--r-lg)", background: "var(--tomato-soft)", border: "1.5px solid var(--tomato)", padding: 16, marginTop: 12, height: 192, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <p style={{ color: "var(--tomato)" }}>{error}</p>
        </div>
        <p className="muted" style={{ marginTop: 14, fontSize: 14 }}>{caption}</p>
      </div>
    );
  }

  return (
    <div className="glass-card p-6 text-center">
      <p className="eyebrow">{title}</p>
      <div style={{ ...frame, display: "inline-block" }}>
        <QRCode value={value} size={200} level="H" includeMargin role="img" aria-label="QR code for joining exam room" />
      </div>
      <p className="muted" style={{ marginTop: 14, fontSize: 14 }}>{caption}</p>
    </div>
  );
}
