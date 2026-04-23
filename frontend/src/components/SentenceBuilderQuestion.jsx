function normalizeAnswerMap(value) {
  return value && typeof value === "object" ? value : {};
}

function getItemState(answerMap, item) {
  const current = answerMap[item.number] ?? {};
  const slotCount = item.correctSequence?.length ?? 0;

  return {
    text: current.text ?? "",
    sequence: Array.from({ length: slotCount }, (_, index) => current.sequence?.[index] ?? "")
  };
}

export default function SentenceBuilderQuestion({
  items = [],
  value = {},
  onChange,
  disabled = false,
  boardMode = false
}) {
  const answers = normalizeAnswerMap(value);

  function updateItem(itemNumber, nextItemValue) {
    if (disabled || !onChange) {
      return;
    }

    onChange({
      ...answers,
      [itemNumber]: nextItemValue
    });
  }

  if (boardMode) {
    return (
      <div className="space-y-4">
        {items.map((item, index) => (
          <div key={item.number ?? index} className="rounded-[24px] border border-neutral-200 bg-white p-4">
            <div className="flex items-start gap-3">
              <span className="inline-flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-amber-300 text-sm font-black text-neutral-950">
                {item.displayNumber ?? item.number ?? index + 1}
              </span>
              <p className="text-sm leading-7 text-neutral-800">{item.prompt}</p>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {items.map((item, index) => {
        const itemState = getItemState(answers, item);
        const selectedWords = itemState.sequence.filter(Boolean);
        const availableWords = (item.wordBank ?? []).filter((word) => !selectedWords.includes(word));

        function placeWord(slotIndex, word) {
          const nextSequence = [...itemState.sequence];
          const duplicateIndex = nextSequence.findIndex((entry) => entry === word);

          if (duplicateIndex !== -1) {
            nextSequence[duplicateIndex] = "";
          }

          nextSequence[slotIndex] = word;
          updateItem(item.number, {
            text: itemState.text,
            sequence: nextSequence
          });
        }

        function clearSlot(slotIndex) {
          const nextSequence = [...itemState.sequence];
          nextSequence[slotIndex] = "";
          updateItem(item.number, {
            text: itemState.text,
            sequence: nextSequence
          });
        }

        function fillFirstEmpty(word) {
          const firstEmpty = itemState.sequence.findIndex((entry) => !entry);
          if (firstEmpty === -1) {
            return;
          }

          placeWord(firstEmpty, word);
        }

        return (
          <div key={item.number ?? index} className="rounded-[22px] border border-neutral-200 bg-white p-4">
            <div className="flex items-start gap-3">
              <span className="inline-flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-neutral-950 text-sm font-black text-white">
                {item.displayNumber ?? item.number ?? index + 1}
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-sm leading-7 text-neutral-800">{item.prompt}</p>

                <div className="mt-4 rounded-[18px] border border-neutral-200 bg-neutral-50 p-3">
                  <p className="text-[11px] font-black uppercase tracking-[0.2em] text-neutral-500">Build sentence</p>
                  <div className="mt-3 flex flex-wrap items-center gap-2">
                    {item.fixedStart ? (
                      <span className="rounded-full bg-white px-3 py-2 text-sm font-bold text-neutral-900">{item.fixedStart}</span>
                    ) : null}
                    <input
                      type="text"
                      value={itemState.text}
                      onChange={(event) =>
                        updateItem(item.number, {
                          text: event.target.value,
                          sequence: itemState.sequence
                        })
                      }
                      disabled={disabled}
                      placeholder={item.textPlaceholder ?? "Type the missing word"}
                      className="min-w-[140px] flex-1 rounded-full border border-neutral-200 bg-white px-4 py-2.5 text-sm font-semibold text-neutral-900 outline-none transition focus:border-neutral-950 disabled:bg-neutral-100"
                    />
                    {itemState.sequence.map((word, slotIndex) => (
                      <button
                        key={`slot-${item.number}-${slotIndex}`}
                        type="button"
                        onClick={() => clearSlot(slotIndex)}
                        disabled={disabled || !word}
                        className={`rounded-full border px-3 py-2 text-sm font-semibold ${
                          word ? "border-amber-300 bg-amber-50 text-neutral-900" : "border-dashed border-neutral-300 bg-white text-neutral-400"
                        } disabled:cursor-default`}
                      >
                        {word || `Slot ${slotIndex + 1}`}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="mt-4">
                  <p className="text-[11px] font-black uppercase tracking-[0.2em] text-neutral-500">Choose phrases</p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {availableWords.map((word) => (
                      <button
                        key={`${item.number}-${word}`}
                        type="button"
                        onClick={() => fillFirstEmpty(word)}
                        disabled={disabled}
                        className="rounded-full border border-neutral-200 bg-white px-3 py-2 text-sm font-semibold text-neutral-900 disabled:opacity-60"
                      >
                        {word}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
