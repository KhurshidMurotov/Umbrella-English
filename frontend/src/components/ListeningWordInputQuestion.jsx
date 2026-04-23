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
          <div key={item.number ?? index} className="rounded-[24px] border border-neutral-200 bg-white p-4">
            <div className="flex items-start gap-3">
              <span className="inline-flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-amber-300 text-sm font-black text-neutral-950">
                {item.displayNumber ?? item.number ?? index + 1}
              </span>
              <p className="text-sm leading-7 text-neutral-800">{item.prompt}</p>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {items.map((item, index) => (
        <div key={item.number ?? index} className="rounded-[24px] border border-neutral-200 bg-white p-4">
          <div className="flex items-start gap-3">
            <span className="inline-flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-neutral-950 text-sm font-black text-white">
              {item.displayNumber ?? item.number ?? index + 1}
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-sm leading-7 text-neutral-800">{item.prompt}</p>
              <input
                type="text"
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
                placeholder="Type the missing word"
                className="mt-4 w-full rounded-[18px] border border-neutral-200 bg-white px-4 py-3 text-base text-neutral-900 outline-none transition focus:border-neutral-950 disabled:bg-neutral-100"
              />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
