import { Plus, Trash2 } from "lucide-react";

export function Labeled({ label, hint, children }) {
  return (
    <div className="field">
      {label ? <label>{label}</label> : null}
      {children}
      {hint ? <span style={{ fontSize: 12, color: "var(--ink-400)" }}>{hint}</span> : null}
    </div>
  );
}

export function TextInput({ value, onChange, placeholder, className = "", ...rest }) {
  return (
    <input
      type="text"
      value={value ?? ""}
      onChange={(event) => onChange(event.target.value)}
      placeholder={placeholder}
      className={`inp ${className}`}
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
      className={`inp ${className}`}
      style={{ lineHeight: 1.7 }}
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
      className={`inp ${className}`}
    />
  );
}

export function Toggle({ checked, onChange, label }) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      style={{
        display: "inline-flex", alignItems: "center", gap: 8,
        borderRadius: "var(--r-md)", padding: "9px 13px", fontWeight: 800, fontSize: 14,
        cursor: "pointer", fontFamily: "inherit", color: "var(--ink)",
        border: checked ? "var(--border)" : "var(--border-thin)",
        background: checked ? "var(--yellow-100)" : "var(--card)",
        boxShadow: checked ? "var(--pop-sm)" : "none"
      }}
    >
      <span
        style={{
          display: "inline-flex", alignItems: "center", justifyContent: "center",
          width: 16, height: 16, borderRadius: 5, border: "var(--border-thin)", fontSize: 11,
          background: checked ? "var(--ink)" : "var(--card)", color: "var(--yellow-400)"
        }}
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
      style={{
        display: "inline-flex", alignItems: "center", justifyContent: "center",
        width: 38, height: 38, flex: "0 0 auto", borderRadius: "var(--r-sm)",
        border: "var(--border-thin)", background: "var(--card)", color: "var(--ink-400)", cursor: "pointer"
      }}
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
      style={{
        display: "inline-flex", alignItems: "center", gap: 6, borderRadius: "var(--r-md)",
        border: "2px dashed var(--ink-300)", background: "var(--card)", padding: "9px 14px",
        fontWeight: 800, fontSize: 14, color: "var(--ink-500)", cursor: "pointer", fontFamily: "inherit"
      }}
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
