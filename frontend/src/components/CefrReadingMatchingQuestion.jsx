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
      <div className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
        <div className="rounded-[24px] border border-neutral-200 bg-white p-5">
          <p className="text-sm font-black uppercase tracking-[0.22em] text-neutral-500">People</p>
          <div className="mt-4 space-y-4">
            {people.map((person) => (
              <div key={person.number} className="rounded-[20px] border border-neutral-200 bg-neutral-50 px-4 py-4">
                <div className="flex items-start gap-3">
                  <span className="inline-flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-amber-300 text-sm font-black text-neutral-950">
                    {person.number}
                  </span>
                  <p className="text-sm leading-7 text-neutral-800">{person.text}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-[24px] border border-neutral-200 bg-white p-5">
          <p className="text-sm font-black uppercase tracking-[0.22em] text-neutral-500">Places</p>
          <div className="mt-4 space-y-4">
            {choices.map((choice) => (
              <div key={choice.label} className="rounded-[20px] border border-neutral-200 bg-neutral-50 px-4 py-4">
                <p className="text-sm font-black uppercase tracking-[0.18em] text-neutral-950">
                  {choice.label}. {choice.title}
                </p>
                <p className="mt-2 text-sm leading-7 text-neutral-800">{choice.text}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-[24px] border border-neutral-200 bg-white p-5">
      <p className="text-sm font-black uppercase tracking-[0.22em] text-neutral-500">Match Letters To Numbers</p>
      <div className="mt-4 space-y-3">
        {people.map((person) => (
          <div key={person.number} className="flex items-center gap-3 rounded-[18px] border border-neutral-200 bg-neutral-50 px-4 py-3">
            <span className="inline-flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-neutral-950 text-sm font-black text-white">
              {person.number}
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-neutral-500">Choose A Letter</p>
            </div>
            <select
              value={answers[person.number] ?? ""}
              onChange={(event) => {
                if (disabled || !onChange) {
                  return;
                }

                onChange({
                  ...answers,
                  [person.number]: event.target.value
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
