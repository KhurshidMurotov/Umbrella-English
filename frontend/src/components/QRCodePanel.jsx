import { useState, useEffect } from "react";
import QRCode from "react-qr-code";

export default function QRCodePanel({ value, title = "QR access", caption = "Scan to join the live exam instantly." }) {
  const [error, setError] = useState(null);

  // Validate QR code value length (max 2953 chars for QR)
  useEffect(() => {
    if (value && value.length > 2953) {
      setError("QR code value is too long. Please use a shorter room code or URL.");
    } else {
      setError(null);
    }
  }, [value]);

  if (!value) {
    return (
      <div className="glass-card rounded-[28px] p-5 text-center">
        <p className="text-xs font-black uppercase tracking-[0.3em] text-neutral-500">{title}</p>
        <div className="rounded-[24px] bg-white p-4 h-48 flex items-center justify-center">
          <p className="text-neutral-400">Loading QR code...</p>
        </div>
        <p className="mt-4 text-sm text-neutral-500">{caption}</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="glass-card rounded-[28px] p-5 text-center">
        <p className="text-xs font-black uppercase tracking-[0.3em] text-neutral-500">{title}</p>
        <div className="rounded-[24px] bg-rose-50 border border-rose-200 p-4 h-48 flex items-center justify-center">
          <p className="text-rose-700">{error}</p>
        </div>
        <p className="mt-4 text-sm text-neutral-500">{caption}</p>
      </div>
    );
  }

  return (
    <div className="glass-card rounded-[28px] p-6 text-center">
      <p className="text-xs font-black uppercase tracking-[0.3em] text-neutral-500">{title}</p>
      <div className="rounded-[24px] bg-white p-4 inline-block">
        <QRCode
          value={value}
          size={200}
          level="H"
          includeMargin={true}
          role="img"
          aria-label={`QR code for joining exam room`}
        />
      </div>
      <p className="mt-4 text-sm text-neutral-600">{caption}</p>
    </div>
  );
}
