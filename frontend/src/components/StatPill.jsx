export default function StatPill({ label, value }) {
  return (
    <div className="rounded-2xl bg-white border border-neutral-200 px-3 py-3 text-center shadow-sm">
      <div className="text-[10px] font-black uppercase tracking-widest text-neutral-400 sm:text-xs">{label}</div>
      <div className="mt-1 text-xl font-black text-neutral-900 sm:text-2xl">{value}</div>
    </div>
  );
}
