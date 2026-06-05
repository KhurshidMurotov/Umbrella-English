import SelfPacedAnswerArea, { renderQuestionPrompt } from "../SelfPacedAnswerArea";
import { stripKeys } from "./questionFactories";

// Build a render-safe copy of the draft question: strip local _key fields and make sure
// list items carry the `number` the student-facing components key/score on.
function toPreviewQuestion(question) {
  const clone = stripKeys(question);
  ["items", "people"].forEach((listKey) => {
    if (Array.isArray(clone[listKey])) {
      clone[listKey] = clone[listKey].map((entry, index) => ({ ...entry, number: entry.number ?? index + 1 }));
    }
  });
  return clone;
}

export default function QuestionPreview({ question }) {
  const preview = toPreviewQuestion(question);

  return (
    <div className="rounded-2xl border border-neutral-100 bg-white p-4 shadow-sm sm:p-5">
      <p className="mb-3 text-[10px] font-black uppercase tracking-widest text-neutral-400">Student preview</p>
      <div className="rounded-[20px] bg-neutral-50 p-4">
        {preview.prompt ? <div className="mb-4">{renderQuestionPrompt(preview.prompt)}</div> : null}
        <SelfPacedAnswerArea question={preview} value={null} onChange={() => {}} disabled />
      </div>
    </div>
  );
}
