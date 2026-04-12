export default function StatPill({ label, value }) {
  return (
    <div className="rounded-[16px] sm:rounded-[22px] border border-neutral-200 bg-white px-2 py-2 sm:px-4 sm:py-3 shadow-sm">
      <div className="text-xs uppercase tracking-[0.15em] sm:tracking-[0.22em] text-neutral-500">{label}</div>
      <div className="mt-1 text-lg sm:text-xl font-extrabold text-neutral-950">{value}</div>
    </div>
  );
}
