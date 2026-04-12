import { AlertTriangle, Keyboard, QrCode, ShieldCheck } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import ErrorAlert from "../components/ErrorAlert";
import ShellLayout from "../components/ShellLayout";
import { API_URL } from "../lib/api";

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
      <div className="mx-auto grid max-w-5xl gap-6 lg:grid-cols-[1fr_0.9fr]">
        <div className="glass-card rounded-[36px] p-8">
          <p className="text-xs font-black uppercase tracking-[0.3em] text-neutral-500">Join live exam</p>
          <h1 className="mt-3 text-4xl font-extrabold text-neutral-950">Enter a room code and start.</h1>
          <p className="mt-4 max-w-xl text-sm leading-7 text-neutral-600">
            This page is for joining live rooms. Hosting is handled separately in the protected host area.
          </p>

          <div className="mt-8 rounded-[28px] border border-neutral-200 bg-white p-6">
            <label className="text-sm font-bold text-neutral-950">Room code</label>
            <input
              value={joinCode}
              onChange={(event) => {
                setJoinCode(event.target.value.toUpperCase());
                setError("");
              }}
              className="mt-2 w-full rounded-[18px] border border-neutral-200 px-4 py-3 text-lg font-extrabold uppercase tracking-[0.3em] outline-none focus:border-neutral-950"
            />

            <label className="mt-4 block text-sm font-bold text-neutral-950">Student name</label>
            <input
              value={playerName}
              onChange={(event) => setPlayerName(event.target.value)}
              className="mt-2 w-full rounded-[18px] border border-neutral-200 px-4 py-3 outline-none focus:border-neutral-950"
            />

            {error ? (
              <div className="mt-4">
                <ErrorAlert message={error} onDismiss={() => setError("")} />
              </div>
            ) : null}

            <button
              onClick={joinRoom}
              disabled={loading}
              className="mt-5 w-full rounded-full bg-neutral-950 px-5 py-4 text-sm font-extrabold text-white disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? "Checking code..." : "Join live room"}
            </button>
          </div>
        </div>

        <div className="space-y-4">
          <div className="glass-card rounded-[32px] p-6">
            <div className="flex items-start gap-4">
              <div className="rounded-[18px] bg-amber-300 p-3 text-neutral-950">
                <Keyboard size={18} />
              </div>
              <div>
                <h2 className="text-lg font-extrabold text-neutral-950">Join by code</h2>
                <p className="mt-2 text-sm leading-6 text-neutral-500">Ask the room host for the code and enter it above.</p>
              </div>
            </div>
          </div>

          <div className="glass-card rounded-[32px] p-6">
            <div className="flex items-start gap-4">
              <div className="rounded-[18px] bg-neutral-950 p-3 text-white">
                <QrCode size={18} />
              </div>
              <div>
                <h2 className="text-lg font-extrabold text-neutral-950">Join by QR</h2>
                <p className="mt-2 text-sm leading-6 text-neutral-500">If you scanned a room QR code, you can enter the live room directly from the link.</p>
              </div>
            </div>
          </div>

          <div className="glass-card rounded-[32px] p-6">
            <div className="flex items-start gap-4">
              <div className="rounded-[18px] bg-white p-3 ring-1 ring-neutral-200">
                <ShieldCheck size={18} />
              </div>
              <div>
                <h2 className="text-lg font-extrabold text-neutral-950">Stay focused</h2>
                <p className="mt-2 text-sm leading-6 text-neutral-500">Live exams can track tab switches, app switches, minimization and focus loss on desktop and mobile.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </ShellLayout>
  );
}
