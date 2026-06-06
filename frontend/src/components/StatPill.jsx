export default function StatPill({ label, value, tone }) {
  const color =
    tone === "grass" ? "var(--grass)" :
    tone === "tomato" ? "var(--tomato)" :
    tone === "yellow" ? "var(--yellow-700)" : "var(--ink)";
  return (
    <div className="stat">
      <div className="eyebrow">{label}</div>
      <div className="num" style={{ color }}>{value}</div>
    </div>
  );
}
