import { useEffect, useState } from "react";
import { Trophy } from "lucide-react";
import { Link } from "react-router-dom";
import QuizCard from "../components/QuizCard";
import ShellLayout from "../components/ShellLayout";
import { API_URL } from "../lib/api";
import { quizCatalog } from "../lib/quizzes";

export default function HomePage() {
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
        if (active && Array.isArray(data.players) && data.players.length) {
          setLeaderboard(data.players);
        }
      } catch {
        // keep sample leaderboard on failure
      }
    }

    fetchLeaderboard();
    return () => {
      active = false;
    };
  }, []);

  return (
    <ShellLayout>
      <section className="grid gap-6 md:grid-cols-[1.1fr_0.9fr] lg:grid-cols-[1.15fr_0.85fr]">
        <div className="glass-card rounded-[36px] p-4 sm:p-6 lg:p-8">
          <span className="inline-flex rounded-full bg-amber-300 px-3 py-1 text-xs font-black uppercase tracking-[0.2em] text-neutral-950">
            Umbrella English
          </span>
          <h1 className="mt-4 max-w-3xl text-2xl font-extrabold leading-tight text-neutral-950 sm:text-3xl md:text-5xl lg:text-6xl">
            Sample quizzes, live join and a clean leaderboard in one place.
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-neutral-600 sm:text-base sm:leading-7">
            Choose a sample English quiz, join a live room by code and track top scores in a clean public view.
          </p>
          <div className="mt-6 flex flex-wrap gap-2 sm:gap-3">
            <Link
              to="/live"
              className="rounded-full bg-amber-300 px-4 py-2 sm:px-6 sm:py-4 text-xs sm:text-sm font-bold text-neutral-950 hover:scale-105 transition-transform"
            >
              Join live
            </Link>
            <Link
              to="/teacher"
              className="rounded-full bg-neutral-950 px-4 py-2 sm:px-6 sm:py-4 text-xs sm:text-sm font-bold text-white hover:scale-105 transition-transform"
            >
              🔑 Teacher area
            </Link>
          </div>

          <div className="mt-8 grid gap-3 sm:grid-cols-2 sm:gap-4">
            <div className="rounded-[20px] border border-neutral-200 bg-white p-3 sm:p-4">
              <p className="text-xs font-bold text-neutral-950 sm:text-sm">Sample tests</p>
              <p className="mt-1 text-xs leading-5 text-neutral-500 sm:text-sm sm:leading-6">
                Ready-made English quizzes with timers, shuffled answers and instant results.
              </p>
            </div>
            <div className="rounded-[20px] border border-neutral-200 bg-white p-3 sm:p-4">
              <p className="text-xs font-bold text-neutral-950 sm:text-sm">Quick join</p>
              <p className="mt-1 text-xs leading-5 text-neutral-500 sm:text-sm sm:leading-6">
                Students join live exams by room code or QR without seeing any host tools.
              </p>
            </div>
          </div>
        </div>

        <div className="glass-card rounded-[28px] sm:rounded-[36px] p-4 sm:p-6">
          <div className="flex items-center gap-3">
            <div className="rounded-[14px] sm:rounded-[18px] bg-neutral-950 p-2 sm:p-3 text-white">
              <Trophy size={14} className="sm:w-[18px] sm:h-[18px]" />
            </div>
            <h2 className="text-lg font-extrabold tracking-tight text-neutral-950 sm:text-3xl">
              Leaderboard
            </h2>
          </div>

          <div className="mt-8 rounded-[28px] border border-neutral-200 bg-white p-8 text-center">
            <p className="text-sm text-neutral-500">
              Live leaderboard scores will appear here once students start playing.
            </p>
          </div>
        </div>
      </section>

      <section className="mt-6 sm:mt-8">
        <div className="mb-3 sm:mb-4">
          <p className="text-xs font-black uppercase tracking-[0.2em] sm:tracking-[0.3em] text-neutral-500">Sample tests</p>
          <h2 className="mt-2 text-2xl sm:text-3xl font-extrabold text-neutral-950">Choose a quiz</h2>
        </div>
        <div className="grid gap-3 sm:gap-4 md:gap-6 grid-cols-1 md:grid-cols-2">
          {quizCatalog.map((quiz) => (
            <QuizCard key={quiz.id} quiz={quiz} />
          ))}
        </div>
      </section>
    </ShellLayout>
  );
}
