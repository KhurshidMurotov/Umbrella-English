function normalizeAnswerMap(value) {
  return value && typeof value === "object" ? value : {};
}

export default function ListeningWordInputQuestion({
  items = [],
  value = {},
  onChange,
  disabled = false,
  boardMode = false
}) {
  const answers = normalizeAnswerMap(value);

  if (boardMode) {
    return (
      <div className="grid gap-4 lg:grid-cols-2">
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
      {items.map((item, index) => (
        <div key={item.number ?? index} className="qitem">
          <div className="flex items-start gap-3">
            <span className="qnum">{item.displayNumber ?? item.number ?? index + 1}</span>
            <div className="min-w-0 flex-1">
              <p style={{ lineHeight: 1.7 }}>{item.prompt}</p>
              <input
                type="text"
                value={answers[item.number] ?? ""}
                onChange={(event) => {
                  if (disabled || !onChange) {
                    return;
                  }
                  onChange({ ...answers, [item.number]: event.target.value });
                }}
                disabled={disabled}
                placeholder="Type the missing word"
                className="inp"
                style={{ marginTop: 14 }}
              />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
