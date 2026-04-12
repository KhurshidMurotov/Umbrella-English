import { AlertTriangle } from "lucide-react";

export default function CheatingDetectedOverlay({
  title = "Cheating detected",
  subtitle = "This session was locked because anti-cheat detected repeated app or tab switching."
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-hidden bg-neutral-950/96 px-6 text-center text-white">
      <div className="max-w-2xl">
        <div className="mb-6 flex justify-center">
          <div className="flex items-center gap-2 rounded-full bg-rose-500 px-4 py-2">
            <AlertTriangle size={16} className="font-bold" />
            <span className="text-xs font-black uppercase tracking-[0.3em]">Cheating Alert</span>
          </div>
        </div>

        <h1 className="text-4xl font-extrabold sm:text-5xl">{title}</h1>

        <p className="mt-6 text-base text-neutral-300 sm:text-lg">
          {subtitle}
        </p>

        <div className="mt-8 text-sm text-neutral-400">
          <p>Your exam has been automatically locked. Contact your instructor for assistance.</p>
        </div>
      </div>
    </div>
  );
}
