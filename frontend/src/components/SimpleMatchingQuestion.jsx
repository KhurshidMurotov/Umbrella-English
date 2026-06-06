function normalizeAnswerMap(value) {
  return value && typeof value === "object" ? value : {};
}

export default function SimpleMatchingQuestion({
  items = [],
  choices = [],
  value = {},
  onChange,
  disabled = false,
  boardMode = false
}) {
  const answers = normalizeAnswerMap(value);

  if (boardMode) {
    return (
      <div className="grid gap-5 lg:grid-cols-2">
        <div className="card">
          <p className="eyebrow">Words</p>
          <div className="mt-4 space-y-3">
            {items.map((item, index) => (
              <div key={item.number ?? index} className="qitem flex items-center gap-3">
                <span className="qnum alt">{item.displayNumber ?? item.number ?? index + 1}</span>
                <span style={{ fontWeight: 700 }}>{item.prompt}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="card">
          <p className="eyebrow">Letters</p>
          <div className="mt-4 space-y-3">
            {choices.map((choice) => (
              <div key={choice.label} className="qitem" style={{ fontWeight: 600 }}>
                <strong>{choice.label})</strong> {choice.text}
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {items.map((item, index) => (
        <div key={item.number ?? index} className="qitem flex items-center gap-3">
          <span className="qnum">{item.displayNumber ?? item.number ?? index + 1}</span>
          <div className="min-w-0 flex-1">
            <p style={{ fontWeight: 700 }}>{item.prompt}</p>
          </div>
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
          >
            <option value="">-</option>
            {choices.map((choice) => (
              <option key={choice.label} value={choice.label}>
                {choice.label}
              </option>
            ))}
          </select>
        </div>
      ))}
    </div>
  );
}
