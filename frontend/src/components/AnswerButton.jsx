import { motion } from "framer-motion";
import { CheckCircle2, XCircle } from "lucide-react";

const styles = {
  default: "border-neutral-200 bg-white hover:border-neutral-900 hover:bg-amber-50",
  correct: "border-emerald-500 bg-emerald-50 text-emerald-900",
  wrong: "border-rose-500 bg-rose-50 text-rose-900",
  disabled: "opacity-60 cursor-not-allowed bg-neutral-100 border-neutral-200"
};

export default function AnswerButton({ label, state = "default", onClick, disabled }) {
  const buttonState = disabled ? "disabled" : state;

  return (
    <motion.button
      type="button"
      whileTap={{ scale: disabled ? 1 : 0.98 }}
      whileHover={!disabled ? { scale: 1.01 } : undefined}
      onClick={onClick}
      disabled={disabled}
      aria-disabled={disabled}
      aria-label={`Answer: ${label}`}
      className={`flex w-full items-center justify-between rounded-[24px] border p-4 text-left text-sm font-semibold transition focus-visible:ring-2 focus-visible:ring-amber-400 focus-visible:ring-offset-2 outline-none ${styles[buttonState]}`}
    >
      <span>{label}</span>
      {state === "correct" ? <CheckCircle2 size={18} aria-hidden="true" /> : null}
      {state === "wrong" ? <XCircle size={18} aria-hidden="true" /> : null}
    </motion.button>
  );
}
