import { Plus, Trash2 } from "lucide-react";

const baseInputClass =
  "w-full rounded-xl border border-neutral-200 bg-neutral-50 px-4 py-3 text-sm outline-none transition focus:border-yellow-400 focus:bg-white focus:ring-2 focus:ring-yellow-200";

export function Labeled({ label, hint, children }) {
  return (
    <label className="block">
      {label ? <span className="mb-1.5 block text-sm font-black text-neutral-700">{label}</span> : null}
      {children}
      {hint ? <span className="mt-1 block text-xs text-neutral-400">{hint}</span> : null}
    </label>
  );
}

export function TextInput({ value, onChange, placeholder, className = "", ...rest }) {
  return (
    <input
      type="text"
      value={value ?? ""}
      onChange={(event) => onChange(event.target.value)}
      placeholder={placeholder}
      className={`${baseInputClass} ${className}`}
      {...rest}
    />
  );
}

export function TextArea({ value, onChange, placeholder, rows = 3, className = "" }) {
  return (
    <textarea
      value={value ?? ""}
      onChange={(event) => onChange(event.target.value)}
      placeholder={placeholder}
      rows={rows}
      className={`${baseInputClass} leading-7 ${className}`}
    />
  );
}

export function NumberInput({ value, onChange, min = 0, className = "" }) {
  return (
    <input
      type="number"
      min={min}
      value={value ?? 0}
      onChange={(event) => onChange(Number(event.target.value))}
      className={`${baseInputClass} ${className}`}
    />
  );
}

export function Toggle({ checked, onChange, label }) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className={`inline-flex items-center gap-2 rounded-xl border px-3 py-2 text-sm font-bold transition ${
        checked
          ? "border-yellow-400 bg-yellow-50 text-yellow-900 ring-2 ring-yellow-200"
          : "border-neutral-200 bg-neutral-50 text-neutral-600 hover:bg-white"
      }`}
    >
      <span
        className={`inline-flex h-4 w-4 items-center justify-center rounded-[5px] border ${
          checked ? "border-yellow-500 bg-yellow-400 text-neutral-900" : "border-neutral-300 bg-white"
        }`}
      >
        {checked ? "✓" : ""}
      </span>
      {label}
    </button>
  );
}

export function RemoveButton({ onClick, title = "Remove" }) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={title}
      className="inline-flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg border border-neutral-200 bg-white text-neutral-400 transition hover:border-rose-300 hover:text-rose-600"
    >
      <Trash2 size={15} />
    </button>
  );
}

export function AddButton({ onClick, label }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex items-center gap-1.5 rounded-xl border border-dashed border-neutral-300 bg-white px-3 py-2 text-sm font-bold text-neutral-600 transition hover:border-yellow-400 hover:text-neutral-900"
    >
      <Plus size={15} />
      {label}
    </button>
  );
}

// Editor for a flat list of strings (word bank, accepted answers, instructions, …).
export function StringListEditor({ values = [], onChange, placeholder = "Value", addLabel = "Add", minRows = 0 }) {
  const rows = values.length ? values : minRows > 0 ? Array.from({ length: minRows }, () => "") : [];

  function update(index, next) {
    const copy = [...rows];
    copy[index] = next;
    onChange(copy);
  }

  function remove(index) {
    onChange(rows.filter((_, itemIndex) => itemIndex !== index));
  }

  return (
    <div className="space-y-2">
      {rows.map((value, index) => (
        <div key={index} className="flex items-center gap-2">
          <TextInput value={value} onChange={(next) => update(index, next)} placeholder={`${placeholder} ${index + 1}`} />
          <RemoveButton onClick={() => remove(index)} />
        </div>
      ))}
      <AddButton onClick={() => onChange([...rows, ""])} label={addLabel} />
    </div>
  );
}
