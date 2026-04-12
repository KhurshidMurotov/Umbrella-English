import { useEffect, useMemo, useState } from "react";
import { io } from "socket.io-client";
import { AlertTriangle, CheckCircle2, Clock3, MonitorPlay, PlayCircle } from "lucide-react";
import { useLocation, useParams } from "react-router-dom";
import AnswerButton from "../components/AnswerButton";
import FallingLettersOverlay from "../components/FallingLettersOverlay";
import LiveLeaderboard from "../components/LiveLeaderboard";
import ProgressBar from "../components/ProgressBar";
import ShellLayout from "../components/ShellLayout";
import { useAntiCheat } from "../hooks/useAntiCheat";
import { useFeedbackSounds } from "../hooks/useFeedbackSounds";
import { API_URL } from "../lib/api";

export default function LiveRoomPage() {
  const { roomCode } = useParams();
  const { search } = useLocation();
  const query = new URLSearchParams(search);
  const role = query.get("role") ?? "player";
  const name = query.get("name") ?? (role === "host" ? "Host" : "Student");
  const hostToken = query.get("hostToken") ?? "";
  const socket = useMemo(() => io(API_URL, { transports: ["websocket"] }), []);

  const [room, setRoom] = useState(null);
  const [selectedOption, setSelectedOption] = useState("");
  const [feedbackState, setFeedbackState] = useState(null);
  const [roomError, setRoomError] = useState("");
  const [now, setNow] = useState(Date.now());
  const [timeoutKey, setTimeoutKey] = useState("");
  const [roomVerified, setRoomVerified] = useState(role === "host");
  const { playCorrect, playWrong } = useFeedbackSounds();

  const { violations, warning, disqualified } = useAntiCheat({
    enabled: role === "player",
    onAutoSubmit: (reason, count) => {
      socket.emit("antiCheatFlag", { roomCode, reason, count, name });
    }
  });

  useEffect(() => {
    const tick = window.setInterval(() => {
      setNow(Date.now());
    }, 500);

    return () => window.clearInterval(tick);
  }, []);

  useEffect(() => {
    return () => {
      socket.disconnect();
    };
  }, [socket]);

  useEffect(() => {
    if (role === "host") {
      return;
    }

    let active = true;

    async function verifyRoom() {
      try {
        const response = await fetch(`${API_URL}/api/live/${roomCode}`);
        if (!response.ok) {
          if (active) {
            setRoomError("Wrong room code. Return to Join and try again.");
            setRoomVerified(false);
          }
          return;
        }

        if (active) {
          setRoomVerified(true);
          setRoomError("");
        }
      } catch {
        if (active) {
          setRoomError("Unable to verify the room right now.");
          setRoomVerified(false);
        }
      }
    }

    verifyRoom();

    return () => {
      active = false;
    };
  }, [role, roomCode]);

  useEffect(() => {
    if (role !== "host" && !roomVerified) {
      return undefined;
    }

    socket.emit("joinRoom", { roomCode, name, role, hostToken });

    socket.on("roomState", (nextRoom) => {
      setRoom(nextRoom);
      setRoomError("");
    });

    socket.on("answerFeedback", ({ correct, awardedScore, timedOut }) => {
      if (correct) {
        setFeedbackState({
          type: "correct",
          text: `Correct answer. +${awardedScore} points`
        });
        playCorrect();
        return;
      }

      setFeedbackState({
        type: timedOut ? "timeout" : "wrong",
        text: timedOut ? "Time is over for this question." : "Incorrect answer. +0 points"
      });
      playWrong();
    });

    socket.on("roomError", ({ message }) => {
      setRoomError(message);
    });

    return () => {
      socket.off("roomState");
      socket.off("answerFeedback");
      socket.off("roomError");
    };
  }, [hostToken, name, role, roomCode, roomVerified, socket]);

  const players = room?.players ?? [];
  const selfPlayer = players.find((player) => player.socketId === socket.id) ?? players.find((player) => player.name === name);
  const totalQuestions = room?.questions?.length ?? 10;
  const studentCount = players.length;
  const participantCount = room?.participantCount ?? (players.length + (role === "host" ? 1 : 0));

  const questionIndex =
    room?.mode === "student-paced" && role !== "host"
      ? (selfPlayer?.currentQuestionIndex ?? 0)
      : (room?.currentQuestionIndex ?? 0);
  const currentQuestion = room?.questions?.[questionIndex];
  const questionKey = `${roomCode}-${role}-${questionIndex}-${room?.started ? "started" : "waiting"}`;

  const deadlineAt =
    room?.mode === "student-paced" && role !== "host"
      ? ((selfPlayer?.questionStartedAt ?? null) ? selfPlayer.questionStartedAt + room.questionTime * 1000 : null)
      : (room?.questionDeadlineAt ?? null);

  const remainingSeconds = deadlineAt ? Math.max(0, Math.ceil((deadlineAt - now) / 1000)) : room?.questionTime ?? 0;

  const progressValue =
    room?.mode === "student-paced"
      ? role === "host"
        ? players.length
          ? players.reduce((total, player) => total + Math.min(player.currentQuestionIndex, totalQuestions), 0) / players.length
          : 0
        : currentQuestion
          ? Math.min((selfPlayer?.currentQuestionIndex ?? 0) + 1, totalQuestions)
          : totalQuestions
      : currentQuestion
        ? Math.min((room?.currentQuestionIndex ?? 0) + 1, totalQuestions)
        : totalQuestions;

  useEffect(() => {
    setSelectedOption("");
    setFeedbackState(null);
    setTimeoutKey("");
  }, [questionKey]);

  useEffect(() => {
    if (role !== "player" || !room?.started || !currentQuestion || selectedOption || remainingSeconds > 0) {
      return;
    }

    if (timeoutKey === questionKey) {
      return;
    }

    socket.emit("questionTimeout", { roomCode, name });
    setTimeoutKey(questionKey);
  }, [currentQuestion, name, questionKey, remainingSeconds, role, room?.started, roomCode, selectedOption, socket, timeoutKey]);

  function submitAnswer(option) {
    setSelectedOption(option);
    socket.emit("submitAnswer", { roomCode, answer: option, name });
  }

  const playerFeedbackClass =
    feedbackState?.type === "correct"
      ? "bg-emerald-50 text-emerald-900"
      : feedbackState?.type === "timeout"
        ? "bg-amber-50 text-amber-900"
        : "bg-rose-50 text-rose-900";

  const showModeBadge = Boolean(room?.started && room?.mode);
  const showTimerBadge = Boolean(room?.started && (currentQuestion || (role === "host" && room?.mode === "student-paced")));

  return (
    <ShellLayout>
      {role === "player" && disqualified ? (
        <FallingLettersOverlay
          title="Cheating detected"
          subtitle="This session was locked because anti-cheat detected repeated app or tab switching."
        />
      ) : null}
      <div className="mx-auto grid max-w-6xl gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="glass-card rounded-[40px] p-8">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="text-sm uppercase tracking-[0.3em] text-neutral-500">Room {roomCode}</p>
              <h1 className="mt-3 text-3xl font-extrabold">{room?.quizTitle ?? "Loading room..."}</h1>
              <p className="mt-2 text-sm text-neutral-500">
                {role === "host" ? "Host controls this room." : `Joined as ${name}`}
              </p>
            </div>
            {showModeBadge || showTimerBadge ? (
              <div className="space-y-2 text-right">
                {showModeBadge ? (
                  <div className="rounded-full bg-amber-300 px-4 py-3 text-sm font-extrabold uppercase text-neutral-950">
                    {room.mode}
                  </div>
                ) : null}
                {showTimerBadge ? (
                  <div className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-3 text-sm font-bold text-neutral-900 shadow-sm">
                    <Clock3 size={16} />
                    <span>
                      {role === "host" && room?.mode === "student-paced"
                        ? `${room?.questionTime ?? 15}s / question`
                        : `${remainingSeconds}s left`}
                    </span>
                  </div>
                ) : null}
              </div>
            ) : null}
          </div>

          <div className="mt-6">
            <ProgressBar value={progressValue} max={totalQuestions} tone="amber" />
          </div>

          {warning ? (
            <div className="mt-5 flex items-center gap-3 rounded-[24px] border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-950">
              <AlertTriangle size={18} />
              <span>{warning}</span>
            </div>
          ) : null}

          {roomError ? (
            <div className="mt-5 flex items-center gap-3 rounded-[24px] border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
              <AlertTriangle size={18} />
              <span>{roomError}</span>
            </div>
          ) : null}

          {!room?.started ? (
            <div className="mt-8 rounded-[28px] bg-neutral-950 p-6 text-white">
              <h2 className="text-2xl font-extrabold">Waiting room</h2>
              <p className="mt-3 text-sm text-neutral-300">
                Players can join now with the room code or the room QR.
              </p>
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <div className="rounded-[20px] bg-white/8 px-4 py-3 text-sm text-neutral-200">
                  Students joined: <span className="font-bold text-white">{studentCount}</span>
                </div>
                <div className="rounded-[20px] bg-white/8 px-4 py-3 text-sm text-neutral-200">
                  Total connected: <span className="font-bold text-white">{participantCount}</span>
                </div>
              </div>
              {role === "host" ? (
                <button onClick={() => socket.emit("startExam", { roomCode })} className="mt-5 inline-flex items-center gap-2 rounded-full bg-amber-300 px-5 py-3 font-bold text-neutral-950">
                  <PlayCircle size={18} />
                  Start exam
                </button>
              ) : null}
            </div>
          ) : role === "host" && room?.mode === "student-paced" ? (
            <div className="mt-8 rounded-[28px] border border-neutral-200 bg-white p-6">
              <div className="flex items-center gap-3">
                <MonitorPlay size={18} className="text-neutral-950" />
                <h2 className="text-2xl font-extrabold text-neutral-950">Student-paced monitoring</h2>
              </div>
              <p className="mt-3 text-sm leading-7 text-neutral-600">
                Students advance independently. Each question uses the configured timer, and correct answers earn up to 100 points depending on speed.
              </p>
            </div>
          ) : currentQuestion ? (
            <div className="mt-8">
              <h2 className="text-3xl font-extrabold text-neutral-950">{currentQuestion.prompt}</h2>
              <p className="mt-3 text-sm text-neutral-500">
                {role === "host" ? "Watch the room and move to the next question when ready." : "Answer before the timer reaches zero."}
              </p>
              <div className="mt-6 space-y-4">
                {currentQuestion.options.map((option) => {
                  let state = "default";
                  if (selectedOption === option && feedbackState?.type === "correct") {
                    state = "correct";
                  } else if (selectedOption === option && feedbackState && feedbackState.type !== "correct") {
                    state = "wrong";
                  }

                  return (
                    <AnswerButton
                      key={option}
                      label={option}
                      onClick={() => submitAnswer(option)}
                      disabled={role === "host" || selectedOption !== "" || remainingSeconds <= 0}
                      state={state}
                    />
                  );
                })}
              </div>
              {feedbackState ? (
                <div className={`mt-5 flex items-center gap-3 rounded-[24px] px-4 py-3 text-sm ${playerFeedbackClass}`}>
                  <CheckCircle2 size={18} />
                  <span>{feedbackState.text}</span>
                </div>
              ) : null}
              {role === "host" ? (
                <button
                  onClick={() => socket.emit("nextQuestion", { roomCode })}
                  className="mt-6 rounded-full bg-neutral-950 px-5 py-3 font-bold text-white"
                >
                  Next question
                </button>
              ) : (
                <p className="mt-6 text-sm text-neutral-500">
                  Violations tracked: {violations} / Score: {selfPlayer?.score ?? 0} pts
                </p>
              )}
            </div>
          ) : (
            <div className="mt-8 rounded-[28px] bg-amber-50 p-6">
              <h2 className="text-2xl font-extrabold text-neutral-950">Exam complete</h2>
              <p className="mt-3 text-sm text-neutral-600">Check the leaderboard for the final ranking.</p>
            </div>
          )}
        </div>

        <LiveLeaderboard players={players} />
      </div>
    </ShellLayout>
  );
}
