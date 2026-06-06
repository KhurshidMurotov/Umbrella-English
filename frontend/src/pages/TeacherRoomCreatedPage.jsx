import { useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { MonitorPlay } from "lucide-react";
import QRCodePanel from "../components/QRCodePanel";
import ShellLayout from "../components/ShellLayout";

export default function TeacherRoomCreatedPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const roomData = location.state?.room;
  const hostToken = location.state?.hostToken;
  const hostName = location.state?.hostName;

  useEffect(() => {
    if (!roomData || !hostToken || !hostName) {
      navigate("/teacher", { replace: true });
    }
  }, [roomData, hostToken, hostName, navigate]);

  if (!roomData || !hostToken || !hostName) {
    return null;
  }

  const playerUrl = `${window.location.origin}/live/${roomData.code}?role=player`;
  const hostUrl = `/live/${roomData.code}?role=host&name=${encodeURIComponent(hostName)}&hostToken=${encodeURIComponent(hostToken)}`;

  return (
    <ShellLayout showLinks={false}>
      <div className="fade-in space-y-6" style={{ maxWidth: 980, margin: "0 auto" }}>
        <div className="card">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="eyebrow">Room created</p>
              <h1 className="h1" style={{ marginTop: 6 }}>Your live exam is ready</h1>
            </div>
            <Link to="/teacher" className="btn-ghost">Back to teacher panel</Link>
          </div>
          <p className="muted" style={{ marginTop: 14, lineHeight: 1.6 }}>
            Share this room code with students or open the host view to start the live session.
          </p>
        </div>

        <div className="card">
          <div className="card-tight" style={{ background: "var(--paper)", border: "var(--border-thin)" }}>
            <p className="eyebrow">Room code</p>
            <div style={{ marginTop: 8, fontFamily: "var(--font-mono)", fontWeight: 700, fontSize: 48, letterSpacing: ".1em" }}>{roomData.code}</div>
            <p className="muted" style={{ marginTop: 6, fontSize: 14 }}>{roomData.mode} · {roomData.questionTime}s per question</p>
            <Link to={hostUrl} className="btn-dark" style={{ marginTop: 18 }}>
              <MonitorPlay size={16} />
              Open host room
            </Link>
          </div>

          <div style={{ marginTop: 18 }}>
            <QRCodePanel
              value={playerUrl}
              title="Student QR"
              caption="Students can scan this QR or use the room code to join the live exam."
            />
          </div>
        </div>
      </div>
    </ShellLayout>
  );
}
