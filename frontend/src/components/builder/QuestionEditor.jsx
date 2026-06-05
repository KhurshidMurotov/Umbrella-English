import { ChevronDown, ChevronUp, Copy, Trash2 } from "lucide-react";
import { AddButton, Labeled, NumberInput, RemoveButton, StringListEditor, TextArea, TextInput, Toggle } from "./inputs";
import { nextKey, QUESTION_TYPE_LABELS } from "./questionFactories";

function letter(index) {
  return String.fromCharCode(65 + index);
}

function countBlanks(template) {
  return String(template ?? "").split("___").length - 1;
}

// String options with a "correct" radio. Tracks the correct answer by index so renaming
// the correct option keeps it marked.
function CorrectableOptions({ options = [], correctAnswer = "", onChange }) {
  const correctIndex = options.indexOf(correctAnswer);

  function emit(nextOptions, nextCorrect) {
    onChange(nextOptions, nextCorrect);
  }

  function updateText(index, text) {
    const next = [...options];
    next[index] = text;
    emit(next, index === correctIndex ? text : correctAnswer);
  }

  function pickCorrect(index) {
    emit(options, options[index]);
  }

  function add() {
    emit([...options, ""], correctAnswer);
  }

  function remove(index) {
    const next = options.filter((_, itemIndex) => itemIndex !== index);
    emit(next, index === correctIndex ? "" : correctAnswer);
  }

  return (
    <div className="space-y-2">
      {options.map((option, index) => (
        <div key={index} className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => pickCorrect(index)}
            title="Mark as correct"
            className={`flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg border text-xs font-black transition ${
              option && option === correctAnswer
                ? "border-emerald-400 bg-emerald-100 text-emerald-700"
                : "border-neutral-200 bg-white text-neutral-300 hover:border-emerald-300"
            }`}
          >
            ✓
          </button>
          <TextInput value={option} onChange={(text) => updateText(index, text)} placeholder={`Option ${index + 1}`} />
          <RemoveButton onClick={() => remove(index)} />
        </div>
      ))}
      <AddButton onClick={add} label="Add option" />
    </div>
  );
}

function AudioSourceInput({ audioSrc, revealMode, onChange }) {
  return (
    <div className="grid gap-3 sm:grid-cols-[1fr_200px]">
      <Labeled label="Audio URL" hint="Link to a hosted audio file, or a /public path.">
        <TextInput value={audioSrc} onChange={(value) => onChange({ audioSrc: value })} placeholder="https://… or /audio.mp3" />
      </Labeled>
      <Labeled label="Audio start">
        <select
          value={revealMode || "manual-audio"}
          onChange={(event) => onChange({ revealMode: event.target.value })}
          className="w-full rounded-xl border border-neutral-200 bg-neutral-50 px-3 py-3 text-sm outline-none focus:border-yellow-400 focus:bg-white focus:ring-2 focus:ring-yellow-200"
        >
          <option value="manual-audio">Teacher presses play</option>
          <option value="">Plays automatically</option>
        </select>
      </Labeled>
    </div>
  );
}

function LabelSelect({ value, labels, onChange }) {
  return (
    <select
      value={value ?? ""}
      onChange={(event) => onChange(event.target.value)}
      className="w-24 flex-shrink-0 rounded-xl border border-neutral-200 bg-neutral-50 px-3 py-3 text-sm font-bold outline-none focus:border-yellow-400 focus:bg-white focus:ring-2 focus:ring-yellow-200"
    >
      <option value="">—</option>
      {labels.map((label) => (
        <option key={label} value={label}>
          {label}
        </option>
      ))}
    </select>
  );
}

const ITEM_CARD = "rounded-2xl bg-neutral-50 p-4 space-y-3";
const ITEM_HEAD = "flex items-center gap-2";
const ITEM_BADGE =
  "inline-flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-neutral-900 text-xs font-black text-white";

export default function QuestionEditor({ question, index, total, onChange, onRemove, onMoveUp, onMoveDown, onDuplicate }) {
  const { type } = question;
  const typeLabel = QUESTION_TYPE_LABELS[type] ?? type;

  function patch(changes) {
    onChange({ ...question, ...changes });
  }

  function patchList(listKey, mapper) {
    patch({ [listKey]: mapper(question[listKey] ?? []) });
  }

  function updateListItem(listKey, key, changes) {
    patchList(listKey, (list) => list.map((item) => (item._key === key ? { ...item, ...changes } : item)));
  }

  function removeListItem(listKey, key) {
    patchList(listKey, (list) => list.filter((item) => item._key !== key));
  }

  function addListItem(listKey, factory) {
    patchList(listKey, (list) => [...list, factory(list.length)]);
  }

  const choiceLabels = (question.choices ?? []).map((choice) => choice.label).filter(Boolean);

  return (
    <div className="rounded-2xl border border-neutral-200 bg-white p-4 shadow-sm sm:p-5">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-yellow-400 text-sm font-black text-neutral-900">
            {index + 1}
          </span>
          <span className="rounded-full bg-neutral-100 px-3 py-1 text-xs font-black uppercase tracking-wide text-neutral-600">
            {typeLabel}
          </span>
        </div>
        <div className="flex items-center gap-1">
          <button type="button" onClick={onMoveUp} disabled={index === 0} title="Move up" className="rounded-lg border border-neutral-200 bg-white p-2 text-neutral-500 transition hover:bg-neutral-50 disabled:opacity-30">
            <ChevronUp size={15} />
          </button>
          <button type="button" onClick={onMoveDown} disabled={index === total - 1} title="Move down" className="rounded-lg border border-neutral-200 bg-white p-2 text-neutral-500 transition hover:bg-neutral-50 disabled:opacity-30">
            <ChevronDown size={15} />
          </button>
          <button type="button" onClick={onDuplicate} title="Duplicate" className="rounded-lg border border-neutral-200 bg-white p-2 text-neutral-500 transition hover:bg-neutral-50">
            <Copy size={15} />
          </button>
          <button type="button" onClick={onRemove} title="Delete question" className="rounded-lg border border-neutral-200 bg-white p-2 text-neutral-400 transition hover:border-rose-300 hover:text-rose-600">
            <Trash2 size={15} />
          </button>
        </div>
      </div>

      {/* Shared meta */}
      <div className="mt-4 grid gap-3 sm:grid-cols-[1fr_1fr_auto]">
        <Labeled label="Part (optional)">
          <TextInput value={question.part} onChange={(value) => patch({ part: value })} placeholder="Part 1" />
        </Labeled>
        <Labeled label="Section title (optional)">
          <TextInput value={question.partTitle} onChange={(value) => patch({ partTitle: value })} placeholder="Reading" />
        </Labeled>
        {type !== "writing" ? (
          <Labeled label="Points">
            <NumberInput value={question.points} min={1} onChange={(value) => patch({ points: value })} className="w-24" />
          </Labeled>
        ) : null}
      </div>

      <div className="mt-3">
        <Labeled label={type === "writing" ? "Task description" : "Question / instruction"}>
          <TextArea value={question.prompt} onChange={(value) => patch({ prompt: value })} placeholder="What should the student do?" rows={2} />
        </Labeled>
      </div>

      {/* Type-specific body */}
      <div className="mt-4 border-t border-neutral-100 pt-4">{renderBody()}</div>
    </div>
  );

  function renderBody() {
    switch (type) {
      case "choice":
        return (
          <CorrectableOptions
            options={question.options ?? []}
            correctAnswer={question.correctAnswer ?? ""}
            onChange={(options, correctAnswer) => patch({ options, correctAnswer })}
          />
        );

      case "part2-text-input":
        return (
          <div className="space-y-3">
            <Labeled label="Correct answer">
              <TextInput value={question.correctAnswer} onChange={(value) => patch({ correctAnswer: value })} placeholder="drives" />
            </Labeled>
            <Labeled label="Other accepted answers (optional)" hint="Alternative spellings/forms that also count as correct.">
              <StringListEditor values={question.acceptedAnswers ?? []} onChange={(values) => patch({ acceptedAnswers: values })} placeholder="Accepted" addLabel="Add accepted answer" />
            </Labeled>
            <Labeled label="Hint (optional)">
              <TextInput value={question.hint} onChange={(value) => patch({ hint: value })} placeholder="Use the present simple." />
            </Labeled>
          </div>
        );

      case "part1-drag-order": {
        const blanks = countBlanks(question.textTemplate);
        const sequence = question.correctSequence ?? [];
        return (
          <div className="space-y-3">
            <Labeled label="Sentence template" hint="Write ___ (three underscores) for each blank.">
              <TextArea value={question.textTemplate} onChange={(value) => patch({ textTemplate: value })} placeholder="On ___ he ___ at 6 a.m." rows={2} />
            </Labeled>
            <Labeled label="Word bank" hint="All draggable words, including extra distractors.">
              <StringListEditor values={question.wordBank ?? []} onChange={(values) => patch({ wordBank: values })} placeholder="Word" addLabel="Add word" minRows={2} />
            </Labeled>
            <Labeled label={`Correct order (${blanks} blank${blanks === 1 ? "" : "s"})`}>
              <div className="space-y-2">
                {Array.from({ length: Math.max(blanks, 1) }, (_, blankIndex) => (
                  <div key={blankIndex} className="flex items-center gap-2">
                    <span className={ITEM_BADGE}>{blankIndex + 1}</span>
                    <TextInput
                      value={sequence[blankIndex] ?? ""}
                      onChange={(value) => {
                        const next = [...sequence];
                        next[blankIndex] = value;
                        patch({ correctSequence: next.slice(0, Math.max(blanks, 1)) });
                      }}
                      placeholder={`Word for blank ${blankIndex + 1}`}
                    />
                  </div>
                ))}
              </div>
            </Labeled>
          </div>
        );
      }

      case "grouped-choice-list":
        return (
          <div className="space-y-3">
            <Labeled label="Passage (optional)">
              <TextArea value={question.passage} onChange={(value) => patch({ passage: value })} placeholder="Reading text shown above the items." rows={2} />
            </Labeled>
            {question.passage ? (
              <Toggle checked={question.hidePassageForStudents === true} onChange={(checked) => patch({ hidePassageForStudents: checked })} label="Hide passage from students (board only)" />
            ) : null}
            <div className="space-y-3">
              {(question.items ?? []).map((item, itemIndex) => (
                <div key={item._key} className={ITEM_CARD}>
                  <div className={ITEM_HEAD}>
                    <span className={ITEM_BADGE}>{itemIndex + 1}</span>
                    <div className="flex-1">
                      <TextInput value={item.prompt} onChange={(value) => updateListItem("items", item._key, { prompt: value })} placeholder="Sentence with the blank" />
                    </div>
                    <RemoveButton onClick={() => removeListItem("items", item._key)} />
                  </div>
                  <CorrectableOptions
                    options={item.options ?? []}
                    correctAnswer={item.correctAnswer ?? ""}
                    onChange={(options, correctAnswer) => updateListItem("items", item._key, { options, correctAnswer })}
                  />
                </div>
              ))}
              <AddButton onClick={() => addListItem("items", () => ({ _key: nextKey("it"), prompt: "", options: ["", ""], correctAnswer: "" }))} label="Add item" />
            </div>
          </div>
        );

      case "simple-matching":
        return (
          <div className="space-y-4">
            <div>
              <p className="mb-2 text-sm font-black text-neutral-700">Choices (letters)</p>
              <div className="space-y-2">
                {(question.choices ?? []).map((choice) => (
                  <div key={choice._key} className="flex items-center gap-2">
                    <TextInput value={choice.label} onChange={(value) => updateListItem("choices", choice._key, { label: value })} placeholder="A" className="w-20 flex-shrink-0 text-center" />
                    <TextInput value={choice.text} onChange={(value) => updateListItem("choices", choice._key, { text: value })} placeholder="Choice text" />
                    <RemoveButton onClick={() => removeListItem("choices", choice._key)} />
                  </div>
                ))}
                <AddButton onClick={() => addListItem("choices", (count) => ({ _key: nextKey("ch"), label: letter(count), text: "" }))} label="Add choice" />
              </div>
            </div>
            <div>
              <p className="mb-2 text-sm font-black text-neutral-700">Items (pick the matching letter)</p>
              <div className="space-y-2">
                {(question.items ?? []).map((item, itemIndex) => (
                  <div key={item._key} className="flex items-center gap-2">
                    <span className={ITEM_BADGE}>{itemIndex + 1}</span>
                    <TextInput value={item.prompt} onChange={(value) => updateListItem("items", item._key, { prompt: value })} placeholder="Word / phrase" />
                    <LabelSelect value={item.correctAnswer} labels={choiceLabels} onChange={(value) => updateListItem("items", item._key, { correctAnswer: value })} />
                    <RemoveButton onClick={() => removeListItem("items", item._key)} />
                  </div>
                ))}
                <AddButton onClick={() => addListItem("items", () => ({ _key: nextKey("it"), prompt: "", correctAnswer: "" }))} label="Add item" />
              </div>
            </div>
          </div>
        );

      case "banked-text-input-group": {
        const wordBank = (question.wordBank ?? []).filter(Boolean);
        const blanks = countBlanks(question.textTemplate);
        return (
          <div className="space-y-3">
            <Labeled label="Text template" hint="Write ___ for each blank, in order.">
              <TextArea value={question.textTemplate} onChange={(value) => patch({ textTemplate: value })} placeholder="I like it ___ and ___." rows={2} />
            </Labeled>
            <Labeled label="Word bank (phrases to choose from)">
              <StringListEditor values={question.wordBank ?? []} onChange={(values) => patch({ wordBank: values })} placeholder="Phrase" addLabel="Add phrase" minRows={2} />
            </Labeled>
            <Labeled label={`Correct phrase per blank${blanks ? ` (${blanks} blanks)` : ""}`}>
              <div className="space-y-2">
                {(question.items ?? []).map((item, itemIndex) => (
                  <div key={item._key} className="flex items-center gap-2">
                    <span className={ITEM_BADGE}>{itemIndex + 1}</span>
                    <select
                      value={item.correctAnswer ?? ""}
                      onChange={(event) => updateListItem("items", item._key, { correctAnswer: event.target.value })}
                      className="flex-1 rounded-xl border border-neutral-200 bg-neutral-50 px-3 py-3 text-sm outline-none focus:border-yellow-400 focus:bg-white focus:ring-2 focus:ring-yellow-200"
                    >
                      <option value="">Choose the correct phrase…</option>
                      {wordBank.map((phrase) => (
                        <option key={phrase} value={phrase}>
                          {phrase}
                        </option>
                      ))}
                    </select>
                    <RemoveButton onClick={() => removeListItem("items", item._key)} />
                  </div>
                ))}
                <AddButton onClick={() => addListItem("items", () => ({ _key: nextKey("it"), correctAnswer: "" }))} label="Add blank" />
              </div>
            </Labeled>
          </div>
        );
      }

      case "listening-text-input-group":
        return (
          <div className="space-y-3">
            <AudioSourceInput audioSrc={question.audioSrc} revealMode={question.revealMode} onChange={patch} />
            <div className="space-y-2">
              {(question.items ?? []).map((item, itemIndex) => (
                <div key={item._key} className={ITEM_CARD}>
                  <div className={ITEM_HEAD}>
                    <span className={ITEM_BADGE}>{itemIndex + 1}</span>
                    <div className="flex-1">
                      <TextInput value={item.prompt} onChange={(value) => updateListItem("items", item._key, { prompt: value })} placeholder="Sentence with the gap" />
                    </div>
                    <RemoveButton onClick={() => removeListItem("items", item._key)} />
                  </div>
                  <div className="grid gap-2 sm:grid-cols-2">
                    <TextInput value={item.correctAnswer} onChange={(value) => updateListItem("items", item._key, { correctAnswer: value })} placeholder="Correct word" />
                    <StringListEditor values={item.acceptedAnswers ?? []} onChange={(values) => updateListItem("items", item._key, { acceptedAnswers: values })} placeholder="Also accept" addLabel="Add accepted" />
                  </div>
                </div>
              ))}
              <AddButton onClick={() => addListItem("items", () => ({ _key: nextKey("it"), prompt: "", correctAnswer: "", acceptedAnswers: [] }))} label="Add gap" />
            </div>
          </div>
        );

      case "cefr-listening-group":
        return (
          <div className="space-y-3">
            <AudioSourceInput audioSrc={question.audioSrc} revealMode={question.revealMode} onChange={patch} />
            <div className="space-y-3">
              {(question.items ?? []).map((item, itemIndex) => {
                const optionLabels = (item.options ?? []).map((option) => option.label).filter(Boolean);
                return (
                  <div key={item._key} className={ITEM_CARD}>
                    <div className={ITEM_HEAD}>
                      <span className={ITEM_BADGE}>{itemIndex + 1}</span>
                      <p className="text-sm font-bold text-neutral-600">Options</p>
                      <div className="ml-auto">
                        <RemoveButton onClick={() => removeListItem("items", item._key)} />
                      </div>
                    </div>
                    <div className="space-y-2">
                      {(item.options ?? []).map((option, optionIndex) => (
                        <div key={optionIndex} className="flex items-center gap-2">
                          <span className="w-8 flex-shrink-0 text-center text-sm font-black text-neutral-500">{option.label}</span>
                          <TextInput
                            value={option.text}
                            onChange={(value) => {
                              const nextOptions = item.options.map((opt, optIndex) => (optIndex === optionIndex ? { ...opt, text: value } : opt));
                              updateListItem("items", item._key, { options: nextOptions });
                            }}
                            placeholder={`Option ${option.label}`}
                          />
                        </div>
                      ))}
                    </div>
                    <Labeled label="Correct option">
                      <LabelSelect value={item.correctAnswer} labels={optionLabels} onChange={(value) => updateListItem("items", item._key, { correctAnswer: value })} />
                    </Labeled>
                  </div>
                );
              })}
              <AddButton
                onClick={() =>
                  addListItem("items", () => ({
                    _key: nextKey("it"),
                    correctAnswer: "",
                    options: [
                      { label: "A", text: "" },
                      { label: "B", text: "" },
                      { label: "C", text: "" }
                    ]
                  }))
                }
                label="Add item"
              />
            </div>
          </div>
        );

      case "cefr-reading-matching":
        return (
          <div className="space-y-4">
            <div>
              <p className="mb-2 text-sm font-black text-neutral-700">Texts (lettered)</p>
              <div className="space-y-2">
                {(question.choices ?? []).map((choice) => (
                  <div key={choice._key} className="flex items-start gap-2">
                    <TextInput value={choice.label} onChange={(value) => updateListItem("choices", choice._key, { label: value })} placeholder="A" className="w-16 flex-shrink-0 text-center" />
                    <div className="flex-1 space-y-2">
                      <TextInput value={choice.title} onChange={(value) => updateListItem("choices", choice._key, { title: value })} placeholder="Title (optional)" />
                      <TextArea value={choice.text} onChange={(value) => updateListItem("choices", choice._key, { text: value })} placeholder="Text" rows={2} />
                    </div>
                    <RemoveButton onClick={() => removeListItem("choices", choice._key)} />
                  </div>
                ))}
                <AddButton onClick={() => addListItem("choices", (count) => ({ _key: nextKey("ch"), label: letter(count), title: "", text: "" }))} label="Add text" />
              </div>
            </div>
            <div>
              <p className="mb-2 text-sm font-black text-neutral-700">People (pick the matching letter)</p>
              <div className="space-y-2">
                {(question.people ?? []).map((person, personIndex) => (
                  <div key={person._key} className="flex items-start gap-2">
                    <span className={`${ITEM_BADGE} mt-1`}>{personIndex + 1}</span>
                    <div className="flex-1">
                      <TextArea value={person.text} onChange={(value) => updateListItem("people", person._key, { text: value })} placeholder="Person description" rows={2} />
                    </div>
                    <LabelSelect value={person.correctAnswer} labels={choiceLabels} onChange={(value) => updateListItem("people", person._key, { correctAnswer: value })} />
                    <RemoveButton onClick={() => removeListItem("people", person._key)} />
                  </div>
                ))}
                <AddButton onClick={() => addListItem("people", () => ({ _key: nextKey("pe"), text: "", correctAnswer: "" }))} label="Add person" />
              </div>
            </div>
          </div>
        );

      case "sentence-builder-group":
        return (
          <div className="space-y-3">
            {(question.items ?? []).map((item, itemIndex) => (
              <div key={item._key} className={ITEM_CARD}>
                <div className={ITEM_HEAD}>
                  <span className={ITEM_BADGE}>{itemIndex + 1}</span>
                  <p className="text-sm font-bold text-neutral-600">Sentence {itemIndex + 1}</p>
                  <div className="ml-auto">
                    <RemoveButton onClick={() => removeListItem("items", item._key)} />
                  </div>
                </div>
                <TextInput value={item.prompt} onChange={(value) => updateListItem("items", item._key, { prompt: value })} placeholder="Context / hint (optional)" />
                <div className="grid gap-2 sm:grid-cols-2">
                  <Labeled label="Fixed start word (optional)">
                    <TextInput value={item.fixedStart} onChange={(value) => updateListItem("items", item._key, { fixedStart: value })} placeholder="I" />
                  </Labeled>
                  <Labeled label="Typed-word placeholder">
                    <TextInput value={item.textPlaceholder} onChange={(value) => updateListItem("items", item._key, { textPlaceholder: value })} placeholder="100% = …" />
                  </Labeled>
                </div>
                <Labeled label="Correct typed word">
                  <TextInput value={item.correctTextAnswer} onChange={(value) => updateListItem("items", item._key, { correctTextAnswer: value })} placeholder="always" />
                </Labeled>
                <Labeled label="Word bank (draggable phrases)">
                  <StringListEditor values={item.wordBank ?? []} onChange={(values) => updateListItem("items", item._key, { wordBank: values })} placeholder="Phrase" addLabel="Add phrase" minRows={2} />
                </Labeled>
                <Labeled label="Correct word order">
                  <StringListEditor values={item.correctSequence ?? []} onChange={(values) => updateListItem("items", item._key, { correctSequence: values })} placeholder="Word" addLabel="Add word in order" minRows={1} />
                </Labeled>
              </div>
            ))}
            <AddButton
              onClick={() =>
                addListItem("items", () => ({
                  _key: nextKey("it"),
                  prompt: "",
                  fixedStart: "",
                  textPlaceholder: "",
                  correctTextAnswer: "",
                  acceptedTextAnswers: [],
                  wordBank: ["", ""],
                  correctSequence: [""]
                }))
              }
              label="Add sentence"
            />
          </div>
        );

      case "writing":
        return (
          <div className="space-y-3">
            <Labeled label="Instructions (optional)">
              <StringListEditor values={question.instructions ?? []} onChange={(values) => patch({ instructions: values })} placeholder="Instruction" addLabel="Add instruction" />
            </Labeled>
            <Labeled label="Placeholder (optional)">
              <TextInput value={question.placeholder} onChange={(value) => patch({ placeholder: value })} placeholder="Write your answer here…" />
            </Labeled>
            <Labeled label="Passage (optional)">
              <TextArea value={question.passage} onChange={(value) => patch({ passage: value })} placeholder="Context shown above the writing area." rows={2} />
            </Labeled>
            <div>
              <p className="mb-2 text-sm font-black text-neutral-700">Structured fields (optional)</p>
              <p className="mb-2 text-xs text-neutral-400">Leave empty for a single free-text box.</p>
              <div className="space-y-2">
                {(question.responseFields ?? []).map((field) => (
                  <div key={field._key} className={ITEM_CARD}>
                    <TextInput value={field.prompt} onChange={(value) => updateListItem("responseFields", field._key, { prompt: value })} placeholder="Field prompt" />
                    <div className="flex items-center gap-2">
                      <TextInput value={field.placeholder} onChange={(value) => updateListItem("responseFields", field._key, { placeholder: value })} placeholder="Placeholder" />
                      <Toggle checked={field.multiline === true} onChange={(checked) => updateListItem("responseFields", field._key, { multiline: checked })} label="Multi-line" />
                      <RemoveButton onClick={() => removeListItem("responseFields", field._key)} />
                    </div>
                  </div>
                ))}
                <AddButton onClick={() => addListItem("responseFields", () => ({ _key: nextKey("rf"), prompt: "", placeholder: "", multiline: false }))} label="Add field" />
              </div>
            </div>
          </div>
        );

      default:
        return <p className="text-sm text-neutral-500">This question type has no editor.</p>;
    }
  }
}
