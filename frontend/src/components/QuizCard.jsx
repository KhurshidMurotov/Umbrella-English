import { motion } from "framer-motion";
import { Clock3, Play, ShieldCheck } from "lucide-react";
import { Link } from "react-router-dom";

export default function QuizCard({ quiz }) {
  return (
    <motion.div whileHover={{ y: -4, rotate: -0.2 }} className="glass-card rounded-[20px] sm:rounded-[28px] p-3 sm:p-5 lg:p-6">
      <div className="mb-3 sm:mb-5 flex items-start justify-between gap-3 sm:gap-4">
        <div className="min-w-0">
          <span className="inline-flex rounded-full bg-amber-300 px-2 py-0.5 text-xs font-bold uppercase tracking-[0.15em] sm:tracking-[0.24em] text-neutral-900">
            {quiz.difficulty}
          </span>
          <h3 className="mt-2 sm:mt-4 text-lg sm:text-2xl font-extrabold leading-tight">{quiz.title}</h3>
          <p className="mt-1 sm:mt-2 text-xs sm:text-sm leading-5 sm:leading-6 text-neutral-600 line-clamp-2">{quiz.description}</p>
        </div>
        <div className="rounded-[16px] sm:rounded-[24px] bg-neutral-950 p-2 sm:p-3 lg:p-4 text-white shadow-lg flex-shrink-0">
          <ShieldCheck size={20} className="sm:w-[28px] sm:h-[28px]" />
        </div>
      </div>

      <div className="mb-3 sm:mb-6 flex items-center gap-2 sm:gap-3 text-xs sm:text-sm text-neutral-600">
        <Clock3 size={14} className="sm:w-[16px] sm:h-[16px]" />
        <span>{quiz.estimatedTime}</span>
      </div>

      <div className="flex flex-wrap gap-2 sm:gap-3">
        <Link to={`/quiz/${quiz.id}`} className="inline-flex items-center gap-1 sm:gap-2 rounded-full bg-neutral-950 px-3 sm:px-5 py-2 sm:py-3 text-xs sm:text-sm font-bold text-white transition hover:bg-neutral-800">
          <Play size={14} className="sm:w-[16px] sm:h-[16px]" />
          Start quiz
        </Link>
      </div>
    </motion.div>
  );
}
