import { Keyboard, LogIn, QrCode, ShieldCheck } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import ErrorAlert from "../components/ErrorAlert";
import ShellLayout from "../components/ShellLayout";
import { API_URL } from "../lib/api";

function InfoCard({ icon: Icon, tone, title, body }) {
  const badge =
    tone === "yellow" ? { background: "var(--yellow-400)", color: "var(--ink)" } :
    tone === "ink" ? { background: "var(--ink)", color: "#fff" } :
    { background: "var(--card)", color: "var(--ink)" };
  return (
    <div className="card" style={{ padding: 16, display: "flex", gap: 14, alignItems: "flex-start" }}>
      <span style={{ ...badge, border: "var(--border-thin)", borderRadius: "var(--r-md)", padding: 10, display: "flex" }}>
        <Icon size={18} />
      </span>
      <div>
        <div style={{ fontWeight: 800, fontSize: 16 }}>{title}</div>
        <p className="muted" style={{ marginTop: 4, fontSize: 14, lineHeight: 1.5 }}>{body}</p>
      </div>
    </div>
  );
}

export default function LiveHubPage() {
  const navigate = useNavigate();
  const [playerName, setPlayerName] = useState("");
  const [joinCode, setJoinCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function joinRoom() {
    const code = joinCode.trim().toUpperCase();
    if (!code) {
      setError("Enter a valid room code.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await fetch(`${API_URL}/api/live/${code}`);
      if (!response.ok) {
        setError("Wrong room code. Please check it and try again.");
        setLoading(false);
        return;
      }

      navigate(`/live/${code}?role=player&name=${encodeURIComponent(playerName || "Student")}`);
    } catch {
      setError("Unable to verify room code right now. Try again in a moment.");
    }

    setLoading(false);
  }

  return (
    <ShellLayout>
      <div className="fade-in mx-auto grid gap-5 lg:grid-cols-[1.15fr_0.9fr]" style={{ maxWidth: 980 }}>
        <div className="card">
          <div className="eyebrow">Join live exam</div>
          <h1 className="h1" style={{ marginTop: 8 }}>Enter a room code and start.</h1>
          <p className="muted" style={{ marginTop: 12, maxWidth: 460 }}>
            This page is for joining live rooms. Hosting is handled separately in the protected teacher area.
          </p>

          <div className="card-tight" style={{ marginTop: 22, background: "var(--paper)" }}>
            <div className="field">
              <label>Room code</label>
              <input
                className="inp code"
                maxLength={5}
                value={joinCode}
                placeholder="7QK2P"
                onChange={(event) => {
                  setJoinCode(event.target.value.toUpperCase());
                  setError("");
                }}
              />
            </div>
            <div className="field" style={{ marginTop: 14 }}>
              <label>Student name</label>
              <input
                className="inp"
                value={playerName}
                placeholder="Your name"
                onChange={(event) => setPlayerName(event.target.value)}
              />
            </div>

            {error ? (
              <div style={{ marginTop: 14 }}>
                <ErrorAlert message={error} onDismiss={() => setError("")} />
              </div>
            ) : null}

            <button
              className="btn-dark btn-block"
              style={{ marginTop: 18 }}
              disabled={loading || joinCode.trim().length < 4}
              onClick={joinRoom}
            >
              <LogIn size={18} />
              {loading ? "Checking code…" : "Join live room"}
            </button>
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <InfoCard icon={Keyboard} tone="yellow" title="Join by code" body="Ask the room host for the code and enter it above." />
          <InfoCard icon={QrCode} tone="ink" title="Join by QR" body="Scanned a room QR? You'll enter the live room straight from the link." />
          <InfoCard icon={ShieldCheck} tone="ghost" title="Stay focused" body="Live exams can track tab switches, app switches and focus loss." />
        </div>
      </div>
    </ShellLayout>
  );
}
