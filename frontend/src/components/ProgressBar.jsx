export default function ProgressBar({ value, max = 100, tone = "amber" }) {
  const width = Math.max(0, Math.min(100, (value / max) * 100));
  const percentage = Math.round(width);

  return (
    <div
      className="h-3 w-full overflow-hidden rounded-full bg-neutral-200"
      role="progressbar"
      aria-valuenow={percentage}
      aria-valuemin="0"
      aria-valuemax="100"
      aria-label={`Progress: ${percentage}%`}
    >
      <div
        className="h-full rounded-full bg-yellow-400 transition-all duration-500 min-w-[3px]"
        style={{ width: `${width}%` }}
      />
    </div>
  );
}
