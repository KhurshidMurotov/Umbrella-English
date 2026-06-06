import { useMemo } from "react";

function parseTemplate(template) {
  // Remove redundant "(1)" "(2)" markers that sit right before each blank —
  // the slot itself already shows the number.
  return String(template ?? "")
    .replace(/\(\d+\)\s*(?=___)/g, "")
    .split("___");
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
        <div className="card sm:hidden">
          <p className="eyebrow">Slots</p>
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
                className="flex items-center gap-3"
                style={{
                  borderRadius: "var(--r-sm)", padding: "10px 12px",
                  border: value[index] ? "var(--border)" : "2px dashed var(--ink-300)",
                  background: value[index] ? "var(--yellow-100)" : "var(--card)"
                }}
                title={disabled ? "" : "Drop a word here"}
              >
                <span className="qnum alt" style={{ width: 30, height: 30, fontSize: 13 }}>{index + 1}</span>
                <span className="min-w-0 flex-1" style={{ fontWeight: 700 }}>{value[index] || "Empty"}</span>
                {!disabled && value[index] ? (
                  <button type="button" onClick={() => clearSlot(index)} style={{ fontWeight: 800, color: "var(--ink-400)", background: "none", border: "none", cursor: "pointer" }}>
                    ✕
                  </button>
                ) : null}
              </div>
            ))}
          </div>
        </div>
      ) : null}

      <div className={`card ${compactOnMobile ? "hidden sm:block" : ""}`} style={{ lineHeight: 2.2 }}>
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
                className={`qslot${value[index] ? " filled" : ""}`}
                style={{ minWidth: 140 }}
                title={disabled ? "" : "Drop a word here"}
              >
                {value[index] || `(${index + 1})`}
                {!disabled && value[index] ? (
                  <button type="button" onClick={() => clearSlot(index)} style={{ marginLeft: 8, fontSize: 12, color: "var(--ink-400)", background: "none", border: "none", cursor: "pointer" }}>
                    ✕
                  </button>
                ) : null}
              </span>
            ) : null}
          </span>
        ))}
      </div>

      {showWordBank ? (
        <div className="card">
          <p className="eyebrow">Word bank</p>
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
                className="qchip"
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
