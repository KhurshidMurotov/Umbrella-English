import { useEffect, useMemo, useRef, useState } from "react";
import { io } from "socket.io-client";
import { AlertTriangle, CheckCircle2, Clock3, MonitorPlay, PlayCircle, Presentation } from "lucide-react";
import { useLocation, useParams } from "react-router-dom";
import AnswerButton from "../components/AnswerButton";
import CheatingDetectedOverlay from "../components/CheatingDetectedOverlay";
import LiveLeaderboard from "../components/LiveLeaderboard";
import ProgressBar from "../components/ProgressBar";
import ShellLayout from "../components/ShellLayout";
import { useAntiCheat } from "../hooks/useAntiCheat";
import { useFeedbackSounds } from "../hooks/useFeedbackSounds";
import { API_URL } from "../lib/api";

const BOARD_REVEAL_DELAY_MS = 3000;

function splitQuestionPrompt(prompt) {
  const separators = [":", "?", "!"];
  const matches = separators
    .map((separator) => ({ separator, index: prompt.indexOf(separator) }))
    .filter((item) => item.index !== -1)
    .sort((first, second) => first.index - second.index);

  if (!matches.length) {
    return null;
  }

  const separatorIndex = matches[0].index;
  const separator = matches[0].separator;
  const title = prompt.slice(0, separatorIndex + separator.length).trim();
  const detail = prompt.slice(separatorIndex + separator.length).trim();

  if (!title || !detail) {
    return null;
  }

  return { title, detail };
}

function renderQuestionPrompt(prompt, className, detailClassName, options = {}) {
  const { showTitle = true, titleClassName } = options;
  const splitPrompt = splitQuestionPrompt(prompt);

  if (!splitPrompt) {
    return <h2 className={className}>{prompt}</h2>;
  }

  return (
    <div className="space-y-3">
      {showTitle ? (
        <h2 className={titleClassName ?? className}>{splitPrompt.title}</h2>
      ) : null}
      <p className={showTitle ? detailClassName : className}>{splitPrompt.detail}</p>
    </div>
  );
}

export default function LiveRoomPage() {
  const { roomCode } = useParams();
  const { search } = useLocation();
  const query = new URLSearchParams(search);
  const role = query.get("role") ?? "player";
  const initialName = query.get("name");
  const hostToken = query.get("hostToken") ?? "";
  const socket = useMemo(() => io(API_URL, { transports: ["websocket"] }), [API_URL]);

  const [room, setRoom] = useState(null);
  const [selectedOption, setSelectedOption] = useState("");
  const [feedbackState, setFeedbackState] = useState(null);
  const [roomError, setRoomError] = useState("");
  const [now, setNow] = useState(Date.now());
  const [timeoutKey, setTimeoutKey] = useState("");
  const [roomVerified, setRoomVerified] = useState(role === "host");
  const [playerName, setPlayerName] = useState(initialName || "");
  const [nameSubmitted, setNameSubmitted] = useState(!!initialName || role === "host");
  const [boardCountdown, setBoardCountdown] = useState(BOARD_REVEAL_DELAY_MS / 1000);
  const { playCorrect, playWrong } = useFeedbackSounds();
  const boardRevealTimeoutRef = useRef(null);
  const boardCountdownIntervalRef = useRef(null);

  const name = playerName || (role === "host" ? "Host" : "Student");

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
    if (role !== "host" && (!roomVerified || !nameSubmitted)) {
      return undefined;
    }

    socket.emit("joinRoom", { roomCode, name, role, hostToken });

    socket.on("roomState", (nextRoom) => {
      setRoom(nextRoom);
      setRoomError("");
    });

    socket.on("answerFeedback", ({ correct, awardedScore, timedOut, responseTimeSeconds }) => {
      if (correct) {
        setFeedbackState({
          type: "correct",
          text: `Correct answer in ${responseTimeSeconds}s. +${awardedScore} points`
        });
        playCorrect();
        return;
      }

      setFeedbackState({
        type: timedOut ? "timeout" : "wrong",
        text: timedOut
          ? `Time is over. ${responseTimeSeconds}s used. +0 points`
          : `Incorrect answer in ${responseTimeSeconds}s. +0 points`
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
  }, [hostToken, name, nameSubmitted, role, roomCode, roomVerified, socket]);

  const players = room?.players ?? [];
  const connectedPlayers = players.filter((player) => player.connected !== false);
  const selfPlayer = players.find((player) => player.socketId === socket.id) ?? players.find((player) => player.name === name);
  const totalQuestions = room?.questions?.length ?? 10;
  const studentCount = connectedPlayers.length;
  const participantCount = room?.participantCount ?? (connectedPlayers.length + (role === "host" ? 1 : 0));

  const questionIndex =
    room?.mode === "student-paced" && role !== "host"
      ? (selfPlayer?.currentQuestionIndex ?? 0)
      : (room?.currentQuestionIndex ?? 0);
  const currentQuestion = room?.questions?.[questionIndex];
  const questionKey = `${roomCode}-${role}-${questionIndex}-${room?.started ? "started" : "waiting"}`;
  const isInstructorPaced = room?.mode === "instructor-paced";
  const isQuestionBoardPhase = isInstructorPaced && room?.questionPhase === "prompt";
  const canAnswerNow = Boolean(currentQuestion) && (!isInstructorPaced || room?.questionPhase === "answers");
  const displayBoardCountdown = Math.max(1, Math.ceil(boardCountdown));

  const deadlineAt =
    room?.mode === "student-paced" && role !== "host"
      ? ((selfPlayer?.questionStartedAt ?? null) ? selfPlayer.questionStartedAt + room.questionTime * 1000 : null)
      : (room?.questionDeadlineAt ?? null);

  const remainingSeconds = deadlineAt ? Math.max(0, Math.ceil((deadlineAt - now) / 1000)) : room?.questionTime ?? 0;

  const progressValue =
    room?.mode === "student-paced"
      ? role === "host"
        ? connectedPlayers.length
          ? connectedPlayers.reduce((total, player) => total + Math.min(player.currentQuestionIndex, totalQuestions), 0) / connectedPlayers.length
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
    if (boardRevealTimeoutRef.current) {
      window.clearTimeout(boardRevealTimeoutRef.current);
      boardRevealTimeoutRef.current = null;
    }
    if (boardCountdownIntervalRef.current) {
      window.clearInterval(boardCountdownIntervalRef.current);
      boardCountdownIntervalRef.current = null;
    }

    if (role !== "host" || !isQuestionBoardPhase || !currentQuestion) {
      return undefined;
    }

    setBoardCountdown(BOARD_REVEAL_DELAY_MS / 1000);
    boardCountdownIntervalRef.current = window.setInterval(() => {
      setBoardCountdown((seconds) => Math.max(0, seconds - 1));
    }, 1000);

    boardRevealTimeoutRef.current = window.setTimeout(() => {
      socket.emit("revealAnswers", { roomCode });
    }, BOARD_REVEAL_DELAY_MS);

    return () => {
      if (boardRevealTimeoutRef.current) {
        window.clearTimeout(boardRevealTimeoutRef.current);
        boardRevealTimeoutRef.current = null;
      }
      if (boardCountdownIntervalRef.current) {
        window.clearInterval(boardCountdownIntervalRef.current);
        boardCountdownIntervalRef.current = null;
      }
    };
  }, [currentQuestion, isQuestionBoardPhase, role, roomCode, socket]);

  useEffect(() => {
    if (role !== "player" || !room?.started || !currentQuestion || !canAnswerNow || selectedOption || remainingSeconds > 0) {
      return;
    }

    if (timeoutKey === questionKey) {
      return;
    }

    socket.emit("questionTimeout", { roomCode, name });
    setTimeoutKey(questionKey);
  }, [canAnswerNow, currentQuestion, name, questionKey, remainingSeconds, role, room?.started, roomCode, selectedOption, socket, timeoutKey]);

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

  const showTimerBadge = Boolean(
    room?.started &&
      room?.questionPhase === "answers" &&
      (currentQuestion || (role === "host" && room?.mode === "student-paced"))
  );

  const layoutClass =
    role === "host"
      ? "mx-auto grid max-w-6xl gap-6 md:grid-cols-1 lg:grid-cols-[1.1fr_0.9fr]"
      : "mx-auto max-w-4xl";

  return (
    <ShellLayout>
      {role === "player" && disqualified ? (
        <CheatingDetectedOverlay
          title="Cheating detected"
          subtitle="This session was locked because anti-cheat detected repeated app or tab switching."
        />
      ) : null}

      {role === "player" && !nameSubmitted ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-neutral-950/50 px-4">
          <div className="w-full max-w-sm rounded-[32px] bg-white p-6 sm:p-8">
            <h2 className="text-2xl font-extrabold text-neutral-950">Enter your name</h2>
            <p className="mt-2 text-sm text-neutral-600">Choose a name for this exam</p>
            <input
              type="text"
              value={playerName}
              onChange={(e) => setPlayerName(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === "Enter" && playerName.trim()) {
                  setNameSubmitted(true);
                }
              }}
              placeholder="Your name"
              className="mt-4 w-full rounded-[18px] border border-neutral-200 px-4 py-3 text-base outline-none focus:border-neutral-950"
              autoFocus
            />
            <button
              onClick={() => {
                if (playerName.trim()) {
                  setNameSubmitted(true);
                }
              }}
              disabled={!playerName.trim()}
              className="mt-5 w-full rounded-full bg-neutral-950 px-5 py-3 font-bold text-white disabled:opacity-60 disabled:cursor-not-allowed"
            >
              Continue
            </button>
          </div>
        </div>
      ) : null}

      <div className={layoutClass}>
        <div className="glass-card rounded-[40px] p-8">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <h1 className="text-3xl font-extrabold">{room?.quizTitle ?? "Loading room..."}</h1>
            </div>
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
          ) : role === "host" && isQuestionBoardPhase && currentQuestion ? (
            <div className="mt-8 rounded-[32px] bg-neutral-950 p-8 text-white">
              <div className="mt-6">
                {renderQuestionPrompt(
                  currentQuestion.prompt,
                  "max-w-4xl text-4xl font-extrabold leading-[1.12] tracking-[-0.02em] break-words text-amber-400",
                  "max-w-4xl text-4xl font-extrabold leading-[1.12] tracking-[-0.02em] break-words text-white",
                  { showTitle: true, titleClassName: "max-w-4xl text-4xl font-extrabold leading-[1.12] tracking-[-0.02em] break-words text-amber-400" }
                )}
              </div>
              <div className="mt-8 inline-flex min-w-[320px] flex-col gap-3 rounded-[24px] border border-white/10 bg-white/5 px-6 py-5">
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-neutral-400">
                  Answers open in
                </p>
                <div className="flex items-end gap-4">
                  <div className="text-7xl font-extrabold leading-none text-white tabular-nums">
                    {displayBoardCountdown}
                  </div>
                  <p className="pb-2 text-base font-semibold uppercase tracking-[0.18em] text-neutral-500">
                    seconds
                  </p>
                </div>
              </div>
            </div>
          ) : role === "player" && isQuestionBoardPhase && currentQuestion ? (
            <div className="mt-8 rounded-[32px] border border-neutral-200 bg-white p-8 text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-amber-100 text-neutral-950">
                <Presentation size={24} />
              </div>
              <h2 className="mt-5 text-3xl font-extrabold text-neutral-950">Question on the board</h2>
              <p className="mt-3 text-sm leading-7 text-neutral-600">
                Read the question on the host screen. Answer choices will appear here as soon as the host reveals them.
              </p>
            </div>
          ) : currentQuestion ? (
            <div className="mt-8">
              {renderQuestionPrompt(
                currentQuestion.prompt,
                "max-w-4xl text-3xl font-extrabold leading-[1.18] tracking-[-0.02em] break-words text-neutral-950",
                "max-w-4xl text-3xl font-extrabold leading-[1.18] tracking-[-0.02em] break-words text-neutral-950",
                { showTitle: false }
              )}
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
                      disabled={role === "host" || !canAnswerNow || selectedOption !== "" || remainingSeconds <= 0}
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

        {role === "host" ? <LiveLeaderboard players={players} /> : null}
      </div>
    </ShellLayout>
  );
}
