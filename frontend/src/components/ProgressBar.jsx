export default function ProgressBar({ value, max = 100 }) {
  const width = Math.max(0, Math.min(100, (value / max) * 100));
  const percentage = Math.round(width);

  return (
    <div
      className="progress"
      role="progressbar"
      aria-valuenow={percentage}
      aria-valuemin="0"
      aria-valuemax="100"
      aria-label={`Progress: ${percentage}%`}
    >
      <span style={{ width: `${width}%` }} />
    </div>
  );
}
