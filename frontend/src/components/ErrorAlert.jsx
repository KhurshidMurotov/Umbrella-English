import { AlertTriangle } from "lucide-react";

export default function ErrorAlert({ message, onDismiss }) {
  return (
    <div className="flex items-center gap-3 rounded-[24px] border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
      <AlertTriangle size={18} className="flex-shrink-0" />
      <span className="flex-1">{message}</span>
      {onDismiss && (
        <button
          onClick={onDismiss}
          className="ml-2 font-semibold hover:text-rose-900"
        >
          ✕
        </button>
      )}
    </div>
  );
}
