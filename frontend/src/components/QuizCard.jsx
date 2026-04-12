import { motion } from "framer-motion";
import { Clock3, Play, Radio, ShieldCheck } from "lucide-react";
import { Link } from "react-router-dom";

export default function QuizCard({ quiz }) {
  return (
    <motion.div whileHover={{ y: -6, rotate: -0.4 }} className="glass-card rounded-[28px] p-6">
      <div className="mb-5 flex items-start justify-between gap-4">
        <div>
          <span className="inline-flex rounded-full bg-amber-300 px-3 py-1 text-xs font-bold uppercase tracking-[0.24em] text-neutral-900">
            {quiz.difficulty}
          </span>
          <h3 className="mt-4 text-2xl font-extrabold">{quiz.title}</h3>
          <p className="mt-2 text-sm leading-6 text-neutral-600">{quiz.description}</p>
        </div>
        <div className="rounded-[24px] bg-neutral-950 p-4 text-white shadow-lg">
          <ShieldCheck size={28} />
        </div>
      </div>

      <div className="mb-6 flex items-center gap-3 text-sm text-neutral-600">
        <Clock3 size={16} />
        <span>{quiz.estimatedTime}</span>
      </div>

      <div className="flex flex-wrap gap-3">
        <Link to={`/quiz/${quiz.id}`} className="inline-flex items-center gap-2 rounded-full bg-neutral-950 px-5 py-3 text-sm font-bold text-white transition hover:bg-neutral-800">
          <Play size={16} />
          Start quiz
        </Link>
        <Link to="/live" className="inline-flex items-center gap-2 rounded-full border border-neutral-900 px-5 py-3 text-sm font-bold text-neutral-900 transition hover:bg-amber-200">
          <Radio size={16} />
          Join live
        </Link>
      </div>
    </motion.div>
  );
}
