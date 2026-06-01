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
            className={`min-h-[44px] rounded-full border px-5 py-2.5 text-sm font-bold transition active:scale-[0.97] ${
              selectedValue === label
                ? "border-amber-300 bg-amber-300 text-neutral-950 shadow-sm"
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
        <div className="rounded-[24px] bg-neutral-50 px-5 py-4 text-sm leading-7 text-neutral-800 whitespace-pre-line">
          {passage}
        </div>
      ) : null}
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

              onChange({
                ...answers,
                [item.number]: nextLabel
              });
            }}
          />
        );
        const numberBadge = (
          <span className="inline-flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-neutral-950 text-sm font-black text-white">
            {item.displayNumber ?? item.number ?? index + 1}
          </span>
        );

        // When the item has its own sentence, stack it above the answer buttons so the
        // student can read what they are answering. On mobile the buttons go full width;
        // on larger screens they align under the sentence.
        if (item.prompt) {
          return (
            <div key={item.number ?? index} className="rounded-[20px] bg-neutral-50 px-4 py-4">
              <div className="flex items-start gap-3">
                {numberBadge}
                <p className="text-[15px] leading-7 text-neutral-800 sm:text-base">{item.prompt}</p>
              </div>
              <div className="mt-3 sm:pl-11">{buttons}</div>
            </div>
          );
        }

        return (
          <div key={item.number ?? index} className="flex flex-wrap items-center gap-3 rounded-[20px] bg-neutral-50 px-4 py-4">
            {numberBadge}
            {buttons}
          </div>
        );
      })}
    </div>
  );
}
