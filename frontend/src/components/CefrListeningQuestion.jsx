function normalizeChoiceMap(value) {
  return value && typeof value === "object" ? value : {};
}

function ListeningOptionButton({ option, selected, disabled, onSelect }) {
  return (
    <button
      type="button"
      onClick={() => onSelect(option.label)}
      disabled={disabled}
      className={`qopt${selected ? " on" : ""}`}
      style={disabled ? { opacity: 0.6, cursor: "not-allowed" } : undefined}
    >
      <span className="ql">{option.label}</span>
      <span style={{ fontWeight: 600, lineHeight: 1.5 }}>{option.text}</span>
    </button>
  );
}

export default function CefrListeningQuestion({
  items = [],
  value = {},
  onChange,
  disabled = false,
  boardMode = false
}) {
  const answers = normalizeChoiceMap(value);

  if (boardMode) {
    return (
      <div className="grid gap-4 lg:grid-cols-2">
        {items.map((item) => (
          <div key={item.number} className="card">
            <div className="flex items-center gap-3">
              <span className="qnum alt">{item.number}</span>
              <p className="eyebrow">Choose the best reply</p>
            </div>
            <div className="mt-4 space-y-3">
              {item.options.map((option) => (
                <div key={`${item.number}-${option.label}`} className="qitem">
                  <span style={{ fontWeight: 800 }}>{option.label}) </span>
                  <span>{option.text}</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {items.map((item) => (
        <div key={item.number} className="qitem">
          <div className="flex items-center gap-3">
            <span className="qnum">{item.number}</span>
            <p className="eyebrow">Select A, B or C</p>
          </div>
          <div className="mt-4 grid gap-3">
            {item.options.map((option) => (
              <ListeningOptionButton
                key={`${item.number}-${option.label}`}
                option={option}
                selected={answers[item.number] === option.label}
                disabled={disabled}
                onSelect={(nextLabel) => {
                  if (disabled || !onChange) {
                    return;
                  }
                  onChange({ ...answers, [item.number]: nextLabel });
                }}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
