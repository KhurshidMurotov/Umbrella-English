import { Trophy } from "lucide-react";
import { Link } from "react-router-dom";
import QuizCard from "../components/QuizCard";
import ShellLayout from "../components/ShellLayout";
import { quizCatalog } from "../lib/quizzes";

const sampleLeaderboard = [
  { id: "1", name: "Amina", score: 920, accuracy: 100 },
  { id: "2", name: "Leo", score: 880, accuracy: 90 },
  { id: "3", name: "Nika", score: 850, accuracy: 90 },
  { id: "4", name: "Sam", score: 790, accuracy: 80 }
];

export default function HomePage() {
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
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="rounded-[14px] sm:rounded-[18px] bg-neutral-950 p-2 sm:p-3 text-white">
              <Trophy size={14} className="sm:w-[18px] sm:h-[18px]" />
            </div>
            <div>
              <p className="text-xs font-black uppercase tracking-[0.2em] sm:tracking-[0.3em] text-neutral-500">Leaderboard</p>
              <h2 className="mt-0.5 text-lg font-extrabold text-neutral-950 sm:text-3xl sm:mt-1">Top sample scores</h2>
            </div>
          </div>

          <div className="mt-4 sm:mt-6 space-y-2 sm:space-y-3">
            {sampleLeaderboard.map((player, index) => (
              <div key={player.id} className="flex items-center justify-between rounded-[18px] sm:rounded-[24px] border border-neutral-200 bg-white px-3 py-2 sm:px-4 sm:py-4">
                <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                  <span className="flex h-7 w-7 sm:h-9 sm:w-9 flex-shrink-0 items-center justify-center rounded-full bg-amber-300 font-extrabold text-neutral-950 text-xs sm:text-base">
                    {index + 1}
                  </span>
                  <div className="min-w-0">
                    <p className="font-bold text-neutral-950 text-xs sm:text-base truncate">{player.name}</p>
                    <p className="text-xs text-neutral-500">{player.accuracy}% accuracy</p>
                  </div>
                </div>
                <span className="text-xs font-bold text-neutral-500 ml-2 whitespace-nowrap sm:text-sm">{player.score} pts</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mt-8">
        <div className="mb-4">
          <p className="text-xs font-black uppercase tracking-[0.3em] text-neutral-500">Sample tests</p>
          <h2 className="mt-2 text-3xl font-extrabold text-neutral-950">Choose a quiz</h2>
        </div>
        <div className="grid gap-6 md:grid-cols-2">
          {quizCatalog.map((quiz) => (
            <QuizCard key={quiz.id} quiz={quiz} />
          ))}
        </div>
      </section>
    </ShellLayout>
  );
}
