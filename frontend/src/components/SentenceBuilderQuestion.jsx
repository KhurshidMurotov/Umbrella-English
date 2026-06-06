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
    onChange({ ...answers, [itemNumber]: nextItemValue });
  }

  if (boardMode) {
    return (
      <div className="space-y-4">
        {items.map((item, index) => (
          <div key={item.number ?? index} className="card">
            <div className="flex items-start gap-3">
              <span className="qnum alt">{item.displayNumber ?? item.number ?? index + 1}</span>
              <p style={{ lineHeight: 1.7 }}>{item.prompt}</p>
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
          updateItem(item.number, { text: itemState.text, sequence: nextSequence });
        }

        function clearSlot(slotIndex) {
          const nextSequence = [...itemState.sequence];
          nextSequence[slotIndex] = "";
          updateItem(item.number, { text: itemState.text, sequence: nextSequence });
        }

        function fillFirstEmpty(word) {
          const firstEmpty = itemState.sequence.findIndex((entry) => !entry);
          if (firstEmpty === -1) {
            return;
          }
          placeWord(firstEmpty, word);
        }

        return (
          <div key={item.number ?? index} className="qitem">
            <div className="flex items-start gap-3">
              <span className="qnum">{item.displayNumber ?? item.number ?? index + 1}</span>
              <div className="min-w-0 flex-1">
                <p style={{ lineHeight: 1.7 }}>{item.prompt}</p>

                <div style={{ marginTop: 14, background: "var(--card)", border: "var(--border-thin)", borderRadius: "var(--r-md)", padding: 12 }}>
                  <p className="eyebrow">Build sentence</p>
                  <div className="mt-3 flex flex-wrap items-center gap-2">
                    {item.fixedStart ? (
                      <span style={{ borderRadius: "var(--r-pill)", border: "var(--border-thin)", padding: "8px 14px", fontWeight: 800, fontSize: 14 }}>{item.fixedStart}</span>
                    ) : null}
                    <input
                      type="text"
                      value={itemState.text}
                      onChange={(event) => updateItem(item.number, { text: event.target.value, sequence: itemState.sequence })}
                      disabled={disabled}
                      placeholder={item.textPlaceholder ?? "Type the missing word"}
                      className="inp"
                      style={{ flex: 1, width: "auto", minWidth: 140, borderRadius: "var(--r-pill)" }}
                    />
                    {itemState.sequence.map((word, slotIndex) => (
                      <button
                        key={`slot-${item.number}-${slotIndex}`}
                        type="button"
                        onClick={() => clearSlot(slotIndex)}
                        disabled={disabled || !word}
                        className={`qslot${word ? " filled" : ""}`}
                        style={{ minWidth: 96, cursor: word ? "pointer" : "default" }}
                      >
                        {word || `Slot ${slotIndex + 1}`}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="mt-4">
                  <p className="eyebrow">Choose phrases</p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {availableWords.map((word) => (
                      <button key={`${item.number}-${word}`} type="button" onClick={() => fillFirstEmpty(word)} disabled={disabled} className="qchip">
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
