import { Link } from "react-router-dom";
import QuizCard from "../components/QuizCard";
import ShellLayout from "../components/ShellLayout";
import { useQuizCatalog } from "../lib/quizCatalog";

export default function HomePage() {
  const { quizzes: quizCatalog } = useQuizCatalog();

  return (
    <ShellLayout>
      {/* Hero */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-yellow-400 via-amber-300 to-orange-300 p-6 sm:rounded-[32px] sm:p-8 lg:p-10">
        <div className="relative z-10">
          <span className="inline-flex rounded-full bg-black/10 px-3 py-1 text-xs font-black uppercase tracking-widest text-neutral-900">
            🎓 English platform
          </span>
          <h1 className="mt-4 max-w-2xl text-3xl font-black leading-tight text-neutral-900 sm:text-4xl lg:text-5xl">
            Learn English.<br />Play. Win.
          </h1>
          <p className="mt-3 max-w-xl text-sm leading-relaxed text-neutral-800 sm:text-base">
            Solo quizzes with timer and anti-cheat, plus live rooms where your class competes in real time.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              to="/live"
              className="rounded-2xl bg-neutral-900 px-5 py-3 text-sm font-black text-white shadow-lg transition hover:bg-neutral-800 active:scale-95"
            >
              🎯 Join Live Room
            </Link>
            <Link
              to="/teacher"
              className="rounded-2xl bg-white/70 px-5 py-3 text-sm font-black text-neutral-900 shadow transition hover:bg-white active:scale-95"
            >
              🔑 Teacher area
            </Link>
          </div>
        </div>
        <div className="pointer-events-none absolute -right-10 -top-10 h-44 w-44 rounded-full bg-white/20 sm:h-60 sm:w-60" />
        <div className="pointer-events-none absolute -bottom-8 right-20 h-28 w-28 rounded-full bg-black/5 sm:h-36 sm:w-36" />
      </section>

      {/* Feature pills */}
      <section className="mt-4 grid gap-3 sm:mt-5 sm:grid-cols-2">
        <div className="rounded-2xl bg-white p-4 shadow-sm border border-neutral-100 sm:p-5">
          <div className="text-2xl">📝</div>
          <p className="mt-2 font-extrabold text-neutral-900">Solo quizzes</p>
          <p className="mt-1 text-sm leading-relaxed text-neutral-500">
            Shuffled answers, timer, instant score — test yourself anytime.
          </p>
        </div>
        <div className="rounded-2xl bg-white p-4 shadow-sm border border-neutral-100 sm:p-5">
          <div className="text-2xl">⚡</div>
          <p className="mt-2 font-extrabold text-neutral-900">Live rooms</p>
          <p className="mt-1 text-sm leading-relaxed text-neutral-500">
            Join by code or QR, compete in real time, see the leaderboard.
          </p>
        </div>
      </section>

      {/* Quiz catalog */}
      <section className="mt-6 sm:mt-8">
        <div className="mb-4">
          <p className="text-xs font-black uppercase tracking-widest text-neutral-400">Sample tests</p>
          <h2 className="mt-1 text-2xl font-black text-neutral-900 sm:text-3xl">Choose a quiz</h2>
        </div>
        <div className="grid gap-3 sm:gap-4 md:grid-cols-2">
          {quizCatalog.map((quiz, index) => (
            <QuizCard key={quiz.id} quiz={quiz} index={index} />
          ))}
        </div>
      </section>
    </ShellLayout>
  );
}
