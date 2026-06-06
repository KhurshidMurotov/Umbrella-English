import { useEffect, useState } from "react";
import LiveLeaderboard from "../components/LiveLeaderboard";
import ShellLayout from "../components/ShellLayout";
import { API_URL } from "../lib/api";

const LEADERBOARD_POLL_INTERVAL_MS = 4000;

export default function LeaderboardPage() {
  const [leaderboard, setLeaderboard] = useState([]);

  useEffect(() => {
    let active = true;

    async function fetchLeaderboard() {
      try {
        const response = await fetch(`${API_URL}/api/live/leaderboard`);
        if (!response.ok) {
          return;
        }

        const data = await response.json();
        if (active && Array.isArray(data.players)) {
          setLeaderboard(data.players);
        }
      } catch {
        // ignore fetch failures for now
      }
    }

    fetchLeaderboard();
    const intervalId = window.setInterval(fetchLeaderboard, LEADERBOARD_POLL_INTERVAL_MS);
    return () => {
      active = false;
      window.clearInterval(intervalId);
    };
  }, []);

  return (
    <ShellLayout>
      <div className="fade-in" style={{ maxWidth: 760, margin: "0 auto" }}>
        <div style={{ marginBottom: 18 }}>
          <div className="eyebrow">Leaderboard</div>
          <h1 className="h1" style={{ marginTop: 6 }}>Live ranking</h1>
        </div>
        <LiveLeaderboard players={leaderboard} showTitle={false} />
      </div>
    </ShellLayout>
  );
}
