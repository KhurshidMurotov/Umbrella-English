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
        <div className="rounded-[24px] border border-neutral-200 bg-white p-5">
          <p className="text-sm font-black uppercase tracking-[0.18em] text-neutral-500">Words</p>
          <div className="mt-4 space-y-3">
            {items.map((item, index) => (
              <div key={item.number ?? index} className="flex items-center gap-3 rounded-[18px] border border-neutral-200 bg-neutral-50 px-4 py-3">
                <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-amber-300 text-sm font-black text-neutral-950">
                  {item.displayNumber ?? item.number ?? index + 1}
                </span>
                <span className="text-sm font-semibold text-neutral-900">{item.prompt}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-[24px] border border-neutral-200 bg-white p-5">
          <p className="text-sm font-black uppercase tracking-[0.18em] text-neutral-500">Letters</p>
          <div className="mt-4 space-y-3">
            {choices.map((choice) => (
              <div key={choice.label} className="rounded-[18px] border border-neutral-200 bg-neutral-50 px-4 py-3 text-sm font-semibold text-neutral-900">
                {choice.label}) {choice.text}
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-[24px] border border-neutral-200 bg-white p-5">
      <div className="space-y-3">
        {items.map((item, index) => (
          <div key={item.number ?? index} className="flex items-center gap-3 rounded-[18px] border border-neutral-200 bg-neutral-50 px-4 py-3">
            <span className="inline-flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-neutral-950 text-sm font-black text-white">
              {item.displayNumber ?? item.number ?? index + 1}
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-neutral-900">{item.prompt}</p>
            </div>
            <select
              value={answers[item.number] ?? ""}
              onChange={(event) => {
                if (disabled || !onChange) {
                  return;
                }

                onChange({
                  ...answers,
                  [item.number]: event.target.value
                });
              }}
              disabled={disabled}
              className="rounded-[14px] border border-neutral-200 bg-white px-3 py-2 text-sm font-bold text-neutral-900 outline-none focus:border-neutral-950 disabled:bg-neutral-100"
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
