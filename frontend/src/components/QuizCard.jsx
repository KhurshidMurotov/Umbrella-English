import { motion } from "framer-motion";
import { Clock3, Play } from "lucide-react";
import { Link } from "react-router-dom";

const CARD_TOPS = [
  "from-yellow-400 to-amber-300",
  "from-orange-400 to-red-300",
  "from-blue-500 to-cyan-400",
  "from-green-500 to-emerald-400",
];

export default function QuizCard({ quiz, index = 0 }) {
  const accent = CARD_TOPS[index % CARD_TOPS.length];

  return (
    <motion.div
      whileHover={{ y: -4, scale: 1.01 }}
      transition={{ type: "spring", stiffness: 300, damping: 22 }}
      className="overflow-hidden rounded-2xl bg-white shadow-md border border-neutral-100 sm:rounded-3xl"
    >
      <div className={`h-2 w-full bg-gradient-to-r ${accent}`} />
      <div className="p-4 sm:p-5">
        <div className="mb-3 flex items-center justify-between gap-2">
          <span className="inline-flex rounded-full bg-yellow-100 px-3 py-1 text-xs font-black uppercase tracking-widest text-yellow-800">
            {quiz.difficulty}
          </span>
          <div className="flex items-center gap-1 text-xs text-neutral-400">
            <Clock3 size={12} />
            <span>{quiz.estimatedTime}</span>
          </div>
        </div>

        <h3 className="text-lg font-extrabold leading-tight text-neutral-900 sm:text-xl">{quiz.title}</h3>
        <p className="mt-1.5 text-sm leading-relaxed text-neutral-500 line-clamp-2">{quiz.description}</p>

        <div className="mt-4">
          <Link
            to={`/quiz/${quiz.id}`}
            className="inline-flex items-center gap-2 rounded-xl bg-neutral-900 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-neutral-800 active:scale-95"
          >
            <Play size={13} fill="white" />
            Start quiz
          </Link>
        </div>
      </div>
    </motion.div>
  );
}
