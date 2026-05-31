import { motion } from "framer-motion";
import { CheckCircle2, XCircle } from "lucide-react";

const ANSWER_STYLES = [
  { base: "bg-red-500 border-red-700 text-white hover:bg-red-600", letter: "A", badge: "bg-black/20 text-white" },
  { base: "bg-blue-500 border-blue-700 text-white hover:bg-blue-600", letter: "B", badge: "bg-black/20 text-white" },
  { base: "bg-yellow-400 border-yellow-600 text-neutral-900 hover:bg-yellow-500", letter: "C", badge: "bg-black/15 text-neutral-900" },
  { base: "bg-green-500 border-green-700 text-white hover:bg-green-600", letter: "D", badge: "bg-black/20 text-white" },
];

export default function AnswerButton({ label, state = "default", onClick, disabled, index = 0 }) {
  const style = ANSWER_STYLES[index % 4];

  let containerClass = "";
  let badgeClass = style.badge;

  if (state === "selected") {
    containerClass = `${style.base} ring-4 ring-neutral-900 ring-offset-2`;
  } else if (state === "correct") {
    containerClass = "bg-emerald-500 border-emerald-700 text-white";
    badgeClass = "bg-black/20 text-white";
  } else if (state === "wrong") {
    containerClass = "bg-neutral-600 border-neutral-800 text-white opacity-70";
    badgeClass = "bg-black/20 text-white";
  } else if (disabled) {
    containerClass = "bg-neutral-200 border-neutral-300 text-neutral-500 cursor-not-allowed opacity-60";
    badgeClass = "bg-black/10 text-neutral-500";
  } else {
    containerClass = style.base;
  }

  return (
    <motion.button
      type="button"
      whileTap={{ scale: disabled ? 1 : 0.97 }}
      whileHover={!disabled && state === "default" ? { scale: 1.01 } : undefined}
      onClick={onClick}
      disabled={disabled}
      aria-disabled={disabled}
      aria-label={`Answer ${style.letter}: ${label}`}
      className={`flex w-full items-center gap-3 rounded-2xl border-b-4 p-4 text-left font-bold transition-colors outline-none focus-visible:ring-2 focus-visible:ring-yellow-400 focus-visible:ring-offset-2 ${containerClass}`}
    >
      <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-sm font-black ${badgeClass}`}>
        {style.letter}
      </span>
      <span className="text-sm leading-snug sm:text-base">{label}</span>
      {state === "correct" || state === "selected" ? <CheckCircle2 size={20} className="ml-auto shrink-0" aria-hidden="true" /> : null}
      {state === "wrong" ? <XCircle size={20} className="ml-auto shrink-0" aria-hidden="true" /> : null}
    </motion.button>
  );
}
