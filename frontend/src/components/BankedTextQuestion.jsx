function normalizeAnswerMap(value) {
  return value && typeof value === "object" ? value : {};
}

function renderTemplateWithSlots(template, items) {
  const segments = String(template ?? "").split("___");

  if (segments.length <= 1) {
    return <div className="whitespace-pre-line">{template}</div>;
  }

  return (
    <div className="whitespace-pre-line leading-8 text-neutral-800">
      {segments.map((segment, index) => (
        <span key={`segment-${index}`}>
          {segment}
          {index < items.length ? (
            <span className="mx-1 inline-flex min-w-[72px] items-center justify-center rounded-[12px] border border-dashed border-neutral-300 bg-neutral-50 px-3 py-1 text-sm font-bold text-neutral-500">
              ({items[index]?.displayNumber ?? items[index]?.number ?? index + 1})
            </span>
          ) : null}
        </span>
      ))}
    </div>
  );
}

export default function BankedTextQuestion({
  items = [],
  value = {},
  onChange,
  disabled = false,
  boardMode = false,
  wordBank = [],
  textTemplate = ""
}) {
  const answers = normalizeAnswerMap(value);

  if (boardMode) {
    return (
      <div className="space-y-5">
        <div className="rounded-[24px] border border-neutral-200 bg-white p-5">
          <p className="text-sm font-black uppercase tracking-[0.18em] text-neutral-500">Options</p>
          <div className="mt-4 flex flex-wrap gap-2">
            {wordBank.map((word) => (
              <span
                key={word}
                className="rounded-full border border-neutral-200 bg-neutral-50 px-4 py-2 text-sm font-semibold text-neutral-800"
              >
                {word}
              </span>
            ))}
          </div>
        </div>

        <div className="rounded-[24px] border border-neutral-200 bg-white p-5">
          {renderTemplateWithSlots(textTemplate, items)}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {items.map((item, index) => (
        <div key={item.number ?? index} className="flex flex-wrap items-center gap-3 rounded-[20px] border border-neutral-200 bg-white px-4 py-4">
          <span className="inline-flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-neutral-950 text-sm font-black text-white">
            {item.displayNumber ?? item.number ?? index + 1}
          </span>
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
            className="min-w-[240px] flex-1 rounded-[16px] border border-neutral-200 bg-white px-4 py-3 text-sm font-semibold text-neutral-900 outline-none focus:border-neutral-950 disabled:bg-neutral-100"
          >
            <option value="">Choose the correct option</option>
            {wordBank.map((word) => (
              <option key={word} value={word}>
                {word}
              </option>
            ))}
          </select>
        </div>
      ))}
    </div>
  );
}
