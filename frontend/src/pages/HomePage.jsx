import { GraduationCap, Key, Target } from "lucide-react";
import { Link } from "react-router-dom";
import QuizCard from "../components/QuizCard";
import ShellLayout from "../components/ShellLayout";
import { useQuizCatalog } from "../lib/quizCatalog";

// Shared inner container: keeps text/cards at a comfortable width and aligned with the nav,
// while each <section> band paints its background edge-to-edge.
const CONTAINER = "mx-auto max-w-7xl px-4 sm:px-6 lg:px-10";

export default function HomePage() {
  const { quizzes: quizCatalog } = useQuizCatalog();

  return (
    <ShellLayout fullBleed>
      {/* Hero — full-bleed gradient band, separate from the transparent nav above it */}
      <section className="relative overflow-hidden bg-gradient-to-br from-yellow-400 via-amber-300 to-orange-300">
        <div className={`${CONTAINER} relative z-10 py-16 sm:py-20 lg:py-28`}>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-black/10 px-3 py-1 text-xs font-black uppercase tracking-widest text-black">
            <GraduationCap size={14} />
            English platform
          </span>
          <h1 className="mt-5 max-w-3xl text-4xl font-black leading-[1.05] text-neutral-900 sm:text-5xl lg:text-7xl">
            Learn English.<br />Play. Win.
          </h1>
          <p className="mt-4 max-w-xl text-base leading-relaxed text-neutral-800 sm:mt-5 sm:text-lg">
            Solo quizzes with timer and anti-cheat, plus live rooms where your class competes in real time.
          </p>
          <div className="mt-7 flex flex-wrap gap-3 sm:mt-9">
            <Link
              to="/live"
              className="inline-flex items-center gap-2 rounded-2xl bg-white px-6 py-3.5 text-sm font-black text-black shadow-lg transition hover:bg-neutral-100 active:scale-95 lg:text-base"
            >
              <Target size={18} />
              Join Live Room
            </Link>
            <Link
              to="/teacher"
              className="inline-flex items-center gap-2 rounded-2xl bg-white/70 px-6 py-3.5 text-sm font-black text-black shadow transition hover:bg-white active:scale-95 lg:text-base"
            >
              <Key size={18} />
              Teacher area
            </Link>
          </div>
        </div>
        <div className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full bg-white/20 sm:h-72 sm:w-72 lg:h-96 lg:w-96" />
        <div className="pointer-events-none absolute -bottom-10 right-32 h-32 w-32 rounded-full bg-black/5 sm:h-44 sm:w-44 lg:h-56 lg:w-56" />
      </section>

      {/* Quiz catalog — tinted band for rhythm */}
      <section className="bg-neutral-50">
        <div className={`${CONTAINER} py-14 sm:py-16 lg:py-24`}>
          <div className="mb-6 sm:mb-8">
            <p className="text-xs font-black uppercase tracking-widest text-neutral-400">Sample tests</p>
            <h2 className="mt-1 text-3xl font-black text-neutral-900 sm:text-4xl lg:text-5xl">Choose a quiz</h2>
          </div>
          <div className="grid gap-5 sm:gap-6 md:grid-cols-2 lg:gap-7 xl:grid-cols-3">
            {quizCatalog.map((quiz, index) => (
              <QuizCard key={quiz.id} quiz={quiz} index={index} />
            ))}
          </div>
        </div>
      </section>
    </ShellLayout>
  );
}
