import { motion } from "framer-motion";
import { BarChart3, RotateCcw, Search } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import ShellLayout from "../components/ShellLayout";
import StatPill from "../components/StatPill";
import { getResults } from "../lib/storage";

export default function ResultsPage() {
  const { state } = useLocation();
  const latestStoredResult = getResults()[0];
  const result = state ?? latestStoredResult ?? {
    title: "Umbrella English Sprint",
    score: 760,
    accuracy: 80,
    correctAnswers: 8,
    wrongAnswers: 2,
    streak: 4,
    totalQuestions: 10,
    violations: 0,
    endedBy: "completed"
  };

  return (
    <ShellLayout>
      <div className="mx-auto max-w-4xl">
        <div className="glass-card overflow-hidden rounded-[40px]">
          <div className="bg-neutral-950 px-8 py-10 text-white">
            <p className="text-sm uppercase tracking-[0.3em] text-amber-300">Results</p>
            <h1 className="mt-3 text-4xl font-extrabold">{result.title}</h1>
            <div className="mt-8 flex flex-wrap items-end gap-4">
              <div>
                <div className="text-sm uppercase tracking-[0.24em] text-neutral-400">Score</div>
                <div className="text-6xl font-extrabold text-amber-300">{result.score}</div>
              </div>
              <div className="rounded-[24px] bg-white/10 px-4 py-3 text-sm text-neutral-200">
                Finished by: <span className="font-bold capitalize text-white">{result.endedBy}</span>
              </div>
            </div>
          </div>

          <div className="p-8">
            <div className="grid gap-4 md:grid-cols-4">
              <StatPill label="Accuracy" value={`${result.accuracy}%`} />
              <StatPill label="Correct" value={result.correctAnswers} />
              <StatPill label="Wrong" value={result.wrongAnswers} />
              <StatPill label="Streak" value={result.streak} />
            </div>

            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="mt-8 rounded-[32px] bg-amber-50 p-6">
              <div className="flex items-center gap-3 text-neutral-700">
                <BarChart3 size={20} />
                <span className="font-bold">Stats snapshot</span>
              </div>
              <p className="mt-3 text-sm leading-7 text-neutral-600">
                You answered {result.correctAnswers} out of {result.totalQuestions} questions correctly with {result.violations} anti-cheat violations recorded.
              </p>
              <p className="mt-2 text-sm leading-7 text-neutral-600">
                The scoring model now gives up to 100 points per question based on both correctness and speed.
              </p>
            </motion.div>

            <div className="mt-8 flex flex-wrap gap-3">
              <Link to="/" className="inline-flex items-center gap-2 rounded-full bg-neutral-950 px-5 py-3 font-bold text-white">
                <RotateCcw size={18} />
                Play again
              </Link>
              <Link to="/" className="inline-flex items-center gap-2 rounded-full border border-neutral-900 px-5 py-3 font-bold text-neutral-950">
                <Search size={18} />
                Find new quiz
              </Link>
            </div>
          </div>
        </div>
      </div>
    </ShellLayout>
  );
}
