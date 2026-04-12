export default function ProgressBar({ value, max = 100, tone = "dark" }) {
  const width = Math.max(0, Math.min(100, (value / max) * 100));

  return (
    <div className="h-3 w-full overflow-hidden rounded-full bg-neutral-200">
      <div
        className={`h-full rounded-full transition-all duration-500 ${tone === "amber" ? "bg-amber-400" : "bg-neutral-950"}`}
        style={{ width: `${width}%` }}
      />
    </div>
  );
}
