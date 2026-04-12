import { motion } from "framer-motion";
import { CheckCircle2, XCircle } from "lucide-react";

const styles = {
  default: "border-neutral-200 bg-white hover:border-neutral-900 hover:bg-amber-50",
  correct: "border-emerald-500 bg-emerald-50 text-emerald-900",
  wrong: "border-rose-500 bg-rose-50 text-rose-900"
};

export default function AnswerButton({ label, state = "default", onClick, disabled }) {
  return (
    <motion.button
      type="button"
      whileTap={{ scale: 0.98 }}
      whileHover={!disabled ? { scale: 1.01 } : undefined}
      onClick={onClick}
      disabled={disabled}
      className={`flex w-full items-center justify-between rounded-[24px] border p-4 text-left text-sm font-semibold transition ${styles[state]}`}
    >
      <span>{label}</span>
      {state === "correct" ? <CheckCircle2 size={18} /> : null}
      {state === "wrong" ? <XCircle size={18} /> : null}
    </motion.button>
  );
}
