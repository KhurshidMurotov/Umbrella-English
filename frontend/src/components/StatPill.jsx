export default function StatPill({ label, value }) {
  return (
    <div className="rounded-[22px] border border-neutral-200 bg-white px-4 py-3 shadow-sm">
      <div className="text-xs uppercase tracking-[0.22em] text-neutral-500">{label}</div>
      <div className="mt-1 text-xl font-extrabold text-neutral-950">{value}</div>
    </div>
  );
}
