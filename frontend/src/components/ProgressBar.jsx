export default function ProgressBar({ value, max = 100, tone = "dark" }) {
  const width = Math.max(0, Math.min(100, (value / max) * 100));
  const percentage = Math.round(width);

  return (
    <div
      className="h-3 w-full overflow-hidden rounded-full bg-neutral-200"
      role="progressbar"
      aria-valuenow={Math.round((value / max) * 100)}
      aria-valuemin="0"
      aria-valuemax="100"
      aria-label={`Progress: ${percentage}%`}
    >
      <div
        className={`h-full rounded-full transition-all duration-500 min-w-[2px] ${
          tone === "amber" ? "bg-amber-400" : "bg-neutral-950"
        }`}
        style={{ width: `${width}%` }}
      />
    </div>
  );
}
