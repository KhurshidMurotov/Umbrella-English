function normalizeChoiceMap(value) {
  return value && typeof value === "object" ? value : {};
}

function ListeningOptionButton({ option, selected, disabled, onSelect }) {
  return (
    <button
      type="button"
      onClick={() => onSelect(option.label)}
      disabled={disabled}
      className={`rounded-[18px] border px-3 py-3 text-left text-sm transition ${
        selected
          ? "border-amber-300 bg-amber-50 text-neutral-950"
          : "border-neutral-200 bg-white text-neutral-700"
      } disabled:cursor-not-allowed disabled:opacity-60`}
    >
      <span className="block text-xs font-black uppercase tracking-[0.18em] text-neutral-500">
        {option.label}
      </span>
      <span className="mt-2 block font-semibold leading-6">{option.text}</span>
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
          <div key={item.number} className="rounded-[24px] border border-neutral-200 bg-white p-4">
            <div className="flex items-center gap-3">
              <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-amber-300 text-sm font-black text-neutral-950">
                {item.number}
              </span>
              <p className="text-sm font-bold uppercase tracking-[0.18em] text-neutral-500">
                Choose The Best Reply
              </p>
            </div>
            <div className="mt-4 space-y-3">
              {item.options.map((option) => (
                <div key={`${item.number}-${option.label}`} className="rounded-[18px] border border-neutral-200 bg-neutral-50 px-4 py-3 text-sm leading-6 text-neutral-800">
                  <span className="font-black text-neutral-950">{option.label}) </span>
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
        <div key={item.number} className="rounded-[24px] border border-neutral-200 bg-white p-4">
          <div className="flex items-center gap-3">
            <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-neutral-950 text-sm font-black text-white">
              {item.number}
            </span>
            <p className="text-sm font-bold uppercase tracking-[0.18em] text-neutral-500">
              Select A, B Or C
            </p>
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

                  onChange({
                    ...answers,
                    [item.number]: nextLabel
                  });
                }}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
