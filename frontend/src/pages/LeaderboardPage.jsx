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
      <section className="mx-auto max-w-5xl">
        <div className="glass-card rounded-[36px] p-6 sm:p-8">
          <LiveLeaderboard players={leaderboard} showTitle={false} />
        </div>
      </section>
    </ShellLayout>
  );
}
