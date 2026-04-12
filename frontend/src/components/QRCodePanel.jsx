import QRCode from "react-qr-code";

export default function QRCodePanel({ value, title = "QR access", caption = "Scan to join the live exam instantly." }) {
  return (
    <div className="glass-card rounded-[28px] p-5 text-center">
      <p className="text-xs font-black uppercase tracking-[0.3em] text-neutral-500">{title}</p>
      <div className="rounded-[24px] bg-white p-4">
        <QRCode value={value} className="h-full w-full" />
      </div>
      <p className="mt-4 text-sm text-neutral-500">{caption}</p>
    </div>
  );
}
