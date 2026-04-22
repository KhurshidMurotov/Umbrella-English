import { useMemo } from "react";

function parseTemplate(template) {
  return String(template ?? "").split("___");
}

export default function DragOrderQuestion({
  template,
  wordBank = [],
  value = [],
  onChange,
  disabled = false,
  showWordBank = true,
  compactOnMobile = false
}) {
  const segments = useMemo(() => parseTemplate(template), [template]);
  const slotCount = Math.max(0, segments.length - 1);
  const selectedWords = value.filter(Boolean);
  const availableWords = wordBank.filter((word) => !selectedWords.includes(word));

  function placeWord(slotIndex, word) {
    if (disabled || !onChange) {
      return;
    }

    const next = Array.from({ length: slotCount }, (_, index) => value[index] ?? "");
    const duplicateIndex = next.findIndex((item) => item === word);
    if (duplicateIndex !== -1) {
      next[duplicateIndex] = "";
    }
    next[slotIndex] = word;
    onChange(next);
  }

  function clearSlot(slotIndex) {
    if (disabled || !onChange) {
      return;
    }

    const next = Array.from({ length: slotCount }, (_, index) => value[index] ?? "");
    next[slotIndex] = "";
    onChange(next);
  }

  function fillFirstEmpty(word) {
    if (disabled || !onChange) {
      return;
    }

    const next = Array.from({ length: slotCount }, (_, index) => value[index] ?? "");
    const firstEmpty = next.findIndex((item) => !item);
    if (firstEmpty === -1) {
      return;
    }
    placeWord(firstEmpty, word);
  }

  return (
    <div className="space-y-4">
      {compactOnMobile ? (
        <div className="rounded-[20px] border border-neutral-200 bg-white p-4 sm:hidden">
          <p className="text-xs font-black uppercase tracking-[0.2em] text-neutral-500">Slots</p>
          <div className="mt-3 space-y-2">
            {Array.from({ length: slotCount }, (_, index) => (
              <div
                key={`compact-slot-${index}`}
                onDragOver={(event) => event.preventDefault()}
                onDrop={(event) => {
                  event.preventDefault();
                  const word = event.dataTransfer.getData("text/plain");
                  if (word) {
                    placeWord(index, word);
                  }
                }}
                className={`flex items-center gap-3 rounded-[14px] border px-3 py-3 ${
                  value[index] ? "border-amber-300 bg-amber-50 text-neutral-900" : "border-dashed border-neutral-300 bg-neutral-50 text-neutral-500"
                }`}
                title={disabled ? "" : "Drop a word here"}
              >
                <span className="inline-flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-white text-sm font-black text-neutral-700">
                  {index + 1}
                </span>
                <span className="min-w-0 flex-1 text-sm font-semibold">
                  {value[index] || "Empty"}
                </span>
                {!disabled && value[index] ? (
                  <button type="button" onClick={() => clearSlot(index)} className="text-xs font-bold text-neutral-500">
                    x
                  </button>
                ) : null}
              </div>
            ))}
          </div>
        </div>
      ) : null}

      <div className={`rounded-[20px] border border-neutral-200 bg-white p-4 leading-8 text-neutral-900 ${compactOnMobile ? "hidden sm:block" : ""}`}>
        {segments.map((segment, index) => (
          <span key={`segment-${index}`}>
            {segment}
            {index < slotCount ? (
              <span
                onDragOver={(event) => event.preventDefault()}
                onDrop={(event) => {
                  event.preventDefault();
                  const word = event.dataTransfer.getData("text/plain");
                  if (word) {
                    placeWord(index, word);
                  }
                }}
                className={`mx-1 inline-flex min-w-[140px] items-center justify-center rounded-[12px] border px-2 py-1 text-sm font-semibold ${
                  value[index] ? "border-amber-300 bg-amber-50 text-neutral-900" : "border-dashed border-neutral-300 bg-neutral-50 text-neutral-500"
                }`}
                title={disabled ? "" : "Drop a word here"}
              >
                {value[index] || `(${index + 1})`}
                {!disabled && value[index] ? (
                  <button type="button" onClick={() => clearSlot(index)} className="ml-2 text-xs text-neutral-500">
                    x
                  </button>
                ) : null}
              </span>
            ) : null}
          </span>
        ))}
      </div>

      {showWordBank ? (
        <div className="rounded-[20px] border border-neutral-200 bg-neutral-50 p-4">
          <p className="text-xs font-black uppercase tracking-[0.2em] text-neutral-500">Word bank</p>
          <div className="mt-3 flex flex-wrap gap-2">
            {availableWords.map((word) => (
              <button
                key={word}
                type="button"
                draggable={!disabled}
                onDragStart={(event) => {
                  event.dataTransfer.setData("text/plain", word);
                }}
                onClick={() => fillFirstEmpty(word)}
                disabled={disabled}
                className="rounded-full border border-neutral-200 bg-white px-3 py-2 text-sm font-semibold text-neutral-900 disabled:opacity-60"
              >
                {word}
              </button>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}
