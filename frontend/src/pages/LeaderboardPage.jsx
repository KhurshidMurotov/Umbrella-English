import { useEffect, useState } from "react";
import { Trophy } from "lucide-react";
import LiveLeaderboard from "../components/LiveLeaderboard";
import ShellLayout from "../components/ShellLayout";
import { API_URL } from "../lib/api";

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
    return () => {
      active = false;
    };
  }, []);

  return (
    <ShellLayout>
      <section className="mx-auto max-w-5xl space-y-6">
        <div className="glass-card rounded-[36px] p-6 sm:p-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.3em] text-neutral-500">Leaderboard</p>
              <h1 className="mt-3 text-4xl font-extrabold text-neutral-950">Top 10 live players</h1>
              <p className="mt-4 max-w-2xl text-sm leading-7 text-neutral-600">
                Browse the current leaderboard with the top 10 players, special highlighting for the first three places, and smooth scrolling when the room is full.
              </p>
            </div>
            <div className="rounded-[20px] bg-amber-100 px-4 py-3 text-sm font-bold text-neutral-950">
              🏆 Top 10 with medals
            </div>
          </div>
        </div>

        <div className="glass-card rounded-[36px] p-6 sm:p-8">
          <LiveLeaderboard players={leaderboard} />
        </div>
      </section>
    </ShellLayout>
  );
}
