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
        <div className="glass-card rounded-[36px] p-8 sm:p-10">
          <span className="inline-flex rounded-full bg-amber-300 px-4 py-2 text-xs font-black uppercase tracking-[0.32em] text-neutral-950">
            Umbrella English
          </span>
          <h1 className="mt-6 max-w-3xl text-5xl font-extrabold leading-tight text-neutral-950 sm:text-6xl">
            Sample quizzes, live join and a clean leaderboard in one place.
          </h1>
          <p className="mt-5 max-w-2xl text-base leading-7 text-neutral-600">
            Choose a sample English quiz, join a live room by code and track top scores in a clean public view.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              to="/live"
              className="rounded-full bg-amber-300 px-6 py-4 text-sm font-bold text-neutral-950 hover:scale-105 transition-transform"
            >
              Join live
            </Link>
            <Link
              to="/teacher"
              className="rounded-full bg-neutral-950 px-6 py-4 text-sm font-bold text-white hover:scale-105 transition-transform"
            >
              🔑 Teacher area
            </Link>
          </div>

          <div className="mt-10 grid gap-4 sm:grid-cols-2">
            <div className="rounded-[24px] border border-neutral-200 bg-white p-5">
              <p className="text-sm font-bold text-neutral-950">Sample tests</p>
              <p className="mt-2 text-sm leading-6 text-neutral-500">
                Ready-made English quizzes with timers, shuffled answers and instant results.
              </p>
            </div>
            <div className="rounded-[24px] border border-neutral-200 bg-white p-5">
              <p className="text-sm font-bold text-neutral-950">Quick join</p>
              <p className="mt-2 text-sm leading-6 text-neutral-500">
                Students join live exams by room code or QR without seeing any host tools.
              </p>
            </div>
          </div>
        </div>

        <div className="glass-card rounded-[36px] p-6">
          <div className="flex items-center gap-3">
            <div className="rounded-[18px] bg-neutral-950 p-3 text-white">
              <Trophy size={18} />
            </div>
            <div>
              <p className="text-xs font-black uppercase tracking-[0.3em] text-neutral-500">Leaderboard</p>
              <h2 className="mt-1 text-3xl font-extrabold text-neutral-950">Top sample scores</h2>
            </div>
          </div>

          <div className="mt-6 space-y-3">
            {sampleLeaderboard.map((player, index) => (
              <div key={player.id} className="flex items-center justify-between rounded-[24px] border border-neutral-200 bg-white px-4 py-4">
                <div className="flex items-center gap-3">
                  <span className="flex h-9 w-9 items-center justify-center rounded-full bg-amber-300 font-extrabold text-neutral-950">
                    {index + 1}
                  </span>
                  <div>
                    <p className="font-bold text-neutral-950">{player.name}</p>
                    <p className="text-sm text-neutral-500">{player.accuracy}% accuracy</p>
                  </div>
                </div>
                <span className="text-sm font-bold text-neutral-500">{player.score} pts</span>
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
