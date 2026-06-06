function normalizeAnswerMap(value) {
  return value && typeof value === "object" ? value : {};
}

function GroupedChoiceButtons({ options = [], selectedValue, disabled, onSelect }) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((option) => {
        const label = typeof option === "string" ? option : option?.label ?? "";
        const buttonText = typeof option === "string" ? option : option?.text ?? option?.label ?? "";

        return (
          <button
            key={label}
            type="button"
            onClick={() => onSelect(label)}
            disabled={disabled}
            className={`qpill${selectedValue === label ? " on" : ""}`}
            style={disabled ? { opacity: 0.6, cursor: "not-allowed" } : undefined}
          >
            {buttonText}
          </button>
        );
      })}
    </div>
  );
}

export default function GroupedChoiceQuestion({
  items = [],
  value = {},
  onChange,
  disabled = false,
  boardMode = false,
  passage = ""
}) {
  const answers = normalizeAnswerMap(value);

  if (boardMode) {
    return (
      <div className="space-y-5">
        {passage ? <div className="qpassage">{passage}</div> : null}
        <div className="grid gap-4">
          {items.map((item, index) => (
            <div key={item.number ?? index} className="card">
              <div className="flex items-start gap-3">
                <span className="qnum alt">{item.displayNumber ?? item.number ?? index + 1}</span>
                <p style={{ lineHeight: 1.7 }}>{item.prompt}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {passage ? <div className="qpassage">{passage}</div> : null}
      {items.map((item, index) => {
        const buttons = (
          <GroupedChoiceButtons
            options={item.options ?? []}
            selectedValue={answers[item.number]}
            disabled={disabled}
            onSelect={(nextLabel) => {
              if (disabled || !onChange) {
                return;
              }
              onChange({ ...answers, [item.number]: nextLabel });
            }}
          />
        );
        const numberBadge = <span className="qnum">{item.displayNumber ?? item.number ?? index + 1}</span>;

        // When the item has its own sentence, stack it above the answer buttons so the
        // student can read what they are answering.
        if (item.prompt) {
          return (
            <div key={item.number ?? index} className="qitem">
              <div className="flex items-start gap-3">
                {numberBadge}
                <p style={{ lineHeight: 1.7 }}>{item.prompt}</p>
              </div>
              <div className="mt-3 sm:pl-12">{buttons}</div>
            </div>
          );
        }

        return (
          <div key={item.number ?? index} className="qitem flex flex-wrap items-center gap-3">
            {numberBadge}
            {buttons}
          </div>
        );
      })}
    </div>
  );
}
