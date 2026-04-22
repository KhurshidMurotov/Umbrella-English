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
            className={`rounded-full border px-4 py-2 text-sm font-bold transition ${
              selectedValue === label
                ? "border-amber-300 bg-amber-50 text-neutral-950"
                : "border-neutral-200 bg-white text-neutral-700"
            } disabled:cursor-not-allowed disabled:opacity-60`}
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
        {passage ? (
          <div className="rounded-[24px] border border-neutral-200 bg-white px-5 py-4 text-sm leading-7 text-neutral-800 whitespace-pre-line">
            {passage}
          </div>
        ) : null}
        <div className="grid gap-4">
          {items.map((item, index) => (
            <div key={item.number ?? index} className="rounded-[20px] border border-neutral-200 bg-white px-5 py-4">
              <div className="flex items-start gap-3">
                <span className="inline-flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-amber-300 text-sm font-black text-neutral-950">
                  {item.displayNumber ?? item.number ?? index + 1}
                </span>
                <p className="text-sm leading-7 text-neutral-800">{item.prompt}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {passage ? (
        <div className="rounded-[24px] border border-neutral-200 bg-white px-5 py-4 text-sm leading-7 text-neutral-800 whitespace-pre-line">
          {passage}
        </div>
      ) : null}
      {items.map((item, index) => (
        <div key={item.number ?? index} className="flex flex-wrap items-center gap-3 rounded-[20px] border border-neutral-200 bg-white px-4 py-4">
          <span className="inline-flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-neutral-950 text-sm font-black text-white">
            {item.displayNumber ?? item.number ?? index + 1}
          </span>
          <GroupedChoiceButtons
            options={item.options ?? []}
            selectedValue={answers[item.number]}
            disabled={disabled}
            onSelect={(nextLabel) => {
              if (disabled || !onChange) {
                return;
              }

              onChange({
                ...answers,
                [item.number]: nextLabel
              });
            }}
          />
        </div>
      ))}
    </div>
  );
}
