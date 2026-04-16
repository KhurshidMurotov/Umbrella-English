import { Trophy } from "lucide-react";
import { Link } from "react-router-dom";
import QuizCard from "../components/QuizCard";
import ShellLayout from "../components/ShellLayout";
import { quizCatalog } from "../lib/quizzes";

export default function HomePage() {

  return (
    <ShellLayout>
      <section className="space-y-6">
        <div className="glass-card rounded-[36px] p-4 sm:p-6 lg:p-8">
          <h1 className="mt-4 max-w-3xl text-2xl font-extrabold leading-tight text-neutral-950 sm:text-3xl md:text-5xl lg:text-6xl">
            Sample quizzes, live join and a clean leaderboard in one place.
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-neutral-600 sm:text-base sm:leading-7">
            Choose a sample English quiz, join a live room by code and track top scores in a clean public view.
          </p>
          <div className="mt-6 flex flex-wrap gap-2 sm:gap-3">
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
