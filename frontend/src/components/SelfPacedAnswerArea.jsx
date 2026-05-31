import AnswerButton from "./AnswerButton";
import BankedTextQuestion from "./BankedTextQuestion";
import CefrListeningQuestion from "./CefrListeningQuestion";
import CefrReadingMatchingQuestion from "./CefrReadingMatchingQuestion";
import DragOrderQuestion from "./DragOrderQuestion";
import GroupedChoiceQuestion from "./GroupedChoiceQuestion";
import ListeningWordInputQuestion from "./ListeningWordInputQuestion";
import SentenceBuilderQuestion from "./SentenceBuilderQuestion";
import SimpleMatchingQuestion from "./SimpleMatchingQuestion";

function splitQuestionPrompt(prompt) {
  const separators = [":", "?", "!"];
  const matches = separators
    .map((separator) => ({ separator, index: prompt.indexOf(separator) }))
    .filter((item) => item.index !== -1)
    .sort((first, second) => first.index - second.index);

  if (!matches.length) {
    return null;
  }

  const separatorIndex = matches[0].index;
  const separator = matches[0].separator;
  const title = prompt.slice(0, separatorIndex + separator.length).trim();
  const detail = prompt.slice(separatorIndex + separator.length).trim();

  if (!title || !detail) {
    return null;
  }

  return { title, detail };
}

// Shared prompt renderer for the self-paced flows (solo V2 and live free-navigation).
export function renderQuestionPrompt(prompt) {
  const splitPrompt = splitQuestionPrompt(prompt);

  if (!splitPrompt) {
    return <h2 className="text-xl font-black leading-tight text-neutral-900 sm:text-2xl">{prompt}</h2>;
  }

  return (
    <div className="space-y-3">
      <h2 className="text-xl font-black leading-tight text-neutral-900 sm:text-2xl">{splitPrompt.title}</h2>
      <p className="text-xl font-black leading-tight text-neutral-900 sm:text-2xl">{splitPrompt.detail}</p>
    </div>
  );
}

// Has this question been given a usable answer? Used for the grid, progress and the submit check.
export function isQuestionAnswered(question, answer) {
  if (answer == null) {
    return false;
  }

  switch (question.type) {
    case "part1-drag-order": {
      const required = question.correctSequence?.length ?? 0;
      return Array.isArray(answer) && answer.length >= required && answer.slice(0, required).every(Boolean);
    }
    case "part2-text-input":
      return String(answer).trim().length > 0;
    case "writing":
      return Array.isArray(answer)
        ? answer.some((value) => String(value ?? "").trim())
        : String(answer).trim().length > 0;
    case "grouped-choice-list":
    case "listening-text-input-group":
    case "banked-text-input-group":
    case "cefr-listening-group":
    case "simple-matching":
      return (question.items ?? []).every((item) => {
        const value = answer[item.number];
        return value != null && String(value).trim() !== "";
      });
    case "cefr-reading-matching":
      return (question.people ?? []).every((person) => answer[person.number]);
    case "sentence-builder-group":
      return (question.items ?? []).every((item) => {
        const response = answer[item.number] ?? {};
        const sequence = Array.isArray(response.sequence) ? response.sequence : [];
        return String(response.text ?? "").trim() && sequence.length >= (item.correctSequence?.length ?? 0) && sequence.every(Boolean);
      });
    default:
      return Boolean(answer);
  }
}

// Combine writing fields into the single string the server expects for ungraded tasks.
export function buildWritingString(question, answer) {
  if (Array.isArray(answer)) {
    return answer
      .map((value) => String(value ?? "").trim())
      .filter(Boolean)
      .join("\n");
  }
  return String(answer ?? "").trim();
}

// Controlled answer input for one question, with no correctness feedback (answers are
// reviewed and submitted at the end). Used by the solo V2 page and the live free-nav exam.
export default function SelfPacedAnswerArea({ question, value, onChange, disabled = false }) {
  switch (question.type) {
    case "part1-drag-order":
      return (
        <DragOrderQuestion
          template={question.textTemplate}
          wordBank={question.wordBank}
          value={Array.isArray(value) ? value : []}
          onChange={onChange}
          disabled={disabled}
          showWordBank
          compactOnMobile
        />
      );
    case "part2-text-input":
      return (
        <input
          type="text"
          value={value ?? ""}
          onChange={(event) => onChange(event.target.value)}
          disabled={disabled}
          placeholder="Type your answer"
          className="w-full rounded-[18px] border border-neutral-200 bg-white px-4 py-3 text-base outline-none transition focus:border-neutral-950 disabled:bg-neutral-100"
        />
      );
    case "grouped-choice-list":
      return (
        <GroupedChoiceQuestion items={question.items} value={value ?? {}} onChange={onChange} disabled={disabled} passage={question.passage} />
      );
    case "listening-text-input-group":
      return <ListeningWordInputQuestion items={question.items} value={value ?? {}} onChange={onChange} disabled={disabled} />;
    case "banked-text-input-group":
      return (
        <BankedTextQuestion
          items={question.items}
          value={value ?? {}}
          onChange={onChange}
          disabled={disabled}
          wordBank={question.wordBank}
          textTemplate={question.textTemplate}
        />
      );
    case "cefr-listening-group":
      return <CefrListeningQuestion items={question.items} value={value ?? {}} onChange={onChange} disabled={disabled} />;
    case "simple-matching":
      return <SimpleMatchingQuestion items={question.items} choices={question.choices} value={value ?? {}} onChange={onChange} disabled={disabled} />;
    case "cefr-reading-matching":
      return <CefrReadingMatchingQuestion people={question.people} choices={question.choices} value={value ?? {}} onChange={onChange} disabled={disabled} />;
    case "sentence-builder-group":
      return <SentenceBuilderQuestion items={question.items} value={value ?? {}} onChange={onChange} disabled={disabled} />;
    case "writing": {
      const fields = question.responseFields ?? [];
      const structured = fields.length > 0;
      const writingValues = Array.isArray(value) ? value : [];

      if (structured) {
        return (
          <div className="space-y-4">
            {question.passage ? (
              <div className="rounded-[20px] border border-neutral-200 bg-neutral-50 px-5 py-4 text-sm leading-7 text-neutral-800 whitespace-pre-line">
                {question.passage}
              </div>
            ) : null}
            {fields.map((field, index) => (
              <div key={field.id ?? index} className="rounded-[24px] border border-neutral-200 bg-neutral-50 p-4">
                <div className="rounded-[18px] bg-amber-50 px-4 py-3 text-sm font-semibold text-neutral-800">{field.prompt}</div>
                {field.multiline ? (
                  <textarea
                    value={writingValues[index] ?? ""}
                    onChange={(event) => {
                      const next = [...writingValues];
                      next[index] = event.target.value;
                      onChange(next);
                    }}
                    disabled={disabled}
                    placeholder={field.placeholder ?? question.placeholder}
                    className="mt-4 min-h-[112px] w-full rounded-[20px] border border-neutral-200 bg-white px-4 py-3 text-base leading-7 text-neutral-900 outline-none transition focus:border-neutral-950 disabled:bg-neutral-100"
                  />
                ) : (
                  <input
                    type="text"
                    value={writingValues[index] ?? ""}
                    onChange={(event) => {
                      const next = [...writingValues];
                      next[index] = event.target.value;
                      onChange(next);
                    }}
                    disabled={disabled}
                    placeholder={field.placeholder ?? question.placeholder}
                    className="mt-4 w-full rounded-[20px] border border-neutral-200 bg-white px-4 py-3 text-base text-neutral-900 outline-none transition focus:border-neutral-950 disabled:bg-neutral-100"
                  />
                )}
              </div>
            ))}
          </div>
        );
      }

      return (
        <div className="space-y-3">
          {(question.instructions ?? []).map((instruction) => (
            <div key={instruction} className="rounded-[20px] bg-amber-50 px-4 py-3 text-sm font-semibold text-neutral-800">
              {instruction}
            </div>
          ))}
          <textarea
            value={typeof value === "string" ? value : ""}
            onChange={(event) => onChange(event.target.value)}
            disabled={disabled}
            placeholder={question.placeholder}
            className="mt-2 min-h-[200px] w-full rounded-[24px] border border-neutral-200 bg-white px-4 py-4 text-base leading-7 text-neutral-900 outline-none transition focus:border-neutral-950 disabled:bg-neutral-100"
          />
        </div>
      );
    }
    default:
      return (
        <div className="space-y-4">
          {(question.options ?? []).map((option, optionIndex) => (
            <AnswerButton
              key={option}
              label={option}
              index={optionIndex}
              state={value === option ? "selected" : "default"}
              onClick={() => onChange(option)}
              disabled={disabled}
            />
          ))}
        </div>
      );
  }
}
