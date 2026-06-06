import { CheckCircle2, XCircle } from "lucide-react";

const LETTERS = ["A", "B", "C", "D", "E", "F"];

// Ink-outlined answer card (the design system drops the old Kahoot rainbow grid):
// A/B/C/D in a yellow chip, turns green on correct / red on wrong at reveal.
export default function AnswerButton({ label, state = "default", onClick, disabled, index = 0 }) {
  const letter = LETTERS[index] ?? index + 1;
  const cls = ["answer"];
  if (state === "selected") cls.push("selected");
  else if (state === "correct") cls.push("correct");
  else if (state === "wrong") cls.push("wrong");
  else if (disabled) cls.push("dim");

  return (
    <button
      type="button"
      className={cls.join(" ")}
      onClick={onClick}
      disabled={disabled}
      aria-disabled={disabled}
      aria-label={`Answer ${letter}: ${label}`}
    >
      <span className="let">{letter}</span>
      <span>{label}</span>
      {state === "correct" || state === "selected" ? <span className="ico"><CheckCircle2 size={20} aria-hidden="true" /></span> : null}
      {state === "wrong" ? <span className="ico"><XCircle size={20} aria-hidden="true" /></span> : null}
    </button>
  );
}
