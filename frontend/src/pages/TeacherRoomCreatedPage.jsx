import { useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { MonitorPlay } from "lucide-react";
import QRCodePanel from "../components/QRCodePanel";
import ShellLayout from "../components/ShellLayout";
import { API_URL } from "../lib/api";

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
    <ShellLayout showNav={false}>
      <div className="mx-auto max-w-5xl space-y-6">
        <div className="glass-card rounded-[36px] p-8">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.3em] text-neutral-500">Room created</p>
              <h1 className="mt-2 text-4xl font-extrabold text-neutral-950">Your live exam is ready</h1>
            </div>
            <Link
              to="/teacher"
              className="rounded-full bg-neutral-950 px-5 py-3 text-sm font-bold text-white"
            >
              Back to teacher panel
            </Link>
          </div>

          <p className="mt-4 text-sm leading-7 text-neutral-600">
            Share this room code with students or open the host view to start the live session.
          </p>
        </div>

        <div className="glass-card rounded-[36px] p-8">
          <div className="rounded-[26px] border border-neutral-200 bg-white p-6">
            <p className="text-xs uppercase tracking-[0.24em] text-neutral-500">Room code</p>
            <div className="mt-3 text-5xl font-extrabold text-neutral-950">{roomData.code}</div>
            <p className="mt-2 text-sm text-neutral-500">
              {roomData.mode} / {roomData.questionTime}s per question
            </p>
            <Link
              to={hostUrl}
              className="mt-6 inline-flex items-center gap-2 rounded-full bg-neutral-950 px-5 py-3 text-sm font-bold text-white"
            >
              <MonitorPlay size={16} />
              Open host room
            </Link>
          </div>

          <div className="mt-6">
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
