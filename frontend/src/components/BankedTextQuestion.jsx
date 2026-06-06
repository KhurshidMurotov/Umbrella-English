function normalizeAnswerMap(value) {
  return value && typeof value === "object" ? value : {};
}

function renderTemplateWithSlots(template, items) {
  // Strip redundant "(1)" "(2)" markers before each blank — the slot already numbers it.
  const segments = String(template ?? "")
    .replace(/\(\d+\)\s*(?=___)/g, "")
    .split("___");

  if (segments.length <= 1) {
    return <div className="whitespace-pre-line">{template}</div>;
  }

  return (
    <div className="whitespace-pre-line" style={{ lineHeight: 2 }}>
      {segments.map((segment, index) => (
        <span key={`segment-${index}`}>
          {segment}
          {index < items.length ? (
            <span className="qslot" style={{ minWidth: 56 }}>
              ({items[index]?.displayNumber ?? items[index]?.number ?? index + 1})
            </span>
          ) : null}
        </span>
      ))}
    </div>
  );
}

export default function BankedTextQuestion({
  items = [],
  value = {},
  onChange,
  disabled = false,
  boardMode = false,
  wordBank = [],
  textTemplate = ""
}) {
  const answers = normalizeAnswerMap(value);

  if (boardMode) {
    return (
      <div className="space-y-5">
        <div className="card">
          <p className="eyebrow">Options</p>
          <div className="mt-4 flex flex-wrap gap-2">
            {wordBank.map((word) => (
              <span
                key={word}
                style={{ border: "var(--border-thin)", borderRadius: "var(--r-pill)", padding: "6px 14px", fontWeight: 700, fontSize: 14, background: "var(--card)" }}
              >
                {word}
              </span>
            ))}
          </div>
        </div>

        <div className="card">{renderTemplateWithSlots(textTemplate, items)}</div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {items.map((item, index) => (
        <div key={item.number ?? index} className="qitem flex flex-wrap items-center gap-3">
          <span className="qnum">{item.displayNumber ?? item.number ?? index + 1}</span>
          <select
            value={answers[item.number] ?? ""}
            onChange={(event) => {
              if (disabled || !onChange) {
                return;
              }
              onChange({ ...answers, [item.number]: event.target.value });
            }}
            disabled={disabled}
            className="qselect"
            style={{ flex: 1, minWidth: 240 }}
          >
            <option value="">Choose the correct option</option>
            {wordBank.map((word) => (
              <option key={word} value={word}>
                {word}
              </option>
            ))}
          </select>
        </div>
      ))}
    </div>
  );
}
