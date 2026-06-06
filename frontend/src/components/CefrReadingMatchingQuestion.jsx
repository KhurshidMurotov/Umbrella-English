function normalizeMatchMap(value) {
  return value && typeof value === "object" ? value : {};
}

export default function CefrReadingMatchingQuestion({
  people = [],
  choices = [],
  value = {},
  onChange,
  disabled = false,
  boardMode = false
}) {
  const answers = normalizeMatchMap(value);

  if (boardMode) {
    return (
      <div className="space-y-6">
        <div className="card">
          <p className="eyebrow">People</p>
          <div className="mt-4 grid gap-4 xl:grid-cols-2">
            {people.map((person, index) => (
              <div key={person.number} className="qitem">
                <div className="flex items-start gap-3">
                  <span className="qnum alt">{index + 1}</span>
                  <p style={{ lineHeight: 1.7 }}>{person.text}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="card">
          <p className="eyebrow">Places</p>
          <div className="mt-4 grid gap-4 xl:grid-cols-2">
            {choices.map((choice) => (
              <div key={choice.label} className="qitem">
                <p className="eyebrow" style={{ color: "var(--ink)" }}>{choice.label}. {choice.title}</p>
                <p style={{ marginTop: 8, lineHeight: 1.7 }}>{choice.text}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <p className="eyebrow">Match letters to numbers</p>
      <div className="mt-4 space-y-3">
        {people.map((person, index) => (
          <div key={person.number} className="qitem flex items-center gap-3">
            <span className="qnum">{index + 1}</span>
            <div className="min-w-0 flex-1">
              <p className="eyebrow">Choose a letter</p>
            </div>
            <select
              value={answers[person.number] ?? ""}
              onChange={(event) => {
                if (disabled || !onChange) {
                  return;
                }
                onChange({ ...answers, [person.number]: event.target.value });
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
    </div>
  );
}
