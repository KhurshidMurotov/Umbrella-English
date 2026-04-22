import { useEffect, useMemo, useRef, useState } from "react";
import { io } from "socket.io-client";
import { AlertTriangle, CheckCircle2, Clock3, MonitorPlay, PlayCircle, Presentation } from "lucide-react";
import { useLocation, useParams } from "react-router-dom";
import AnswerButton from "../components/AnswerButton";
import CefrListeningQuestion from "../components/CefrListeningQuestion";
import CefrReadingMatchingQuestion from "../components/CefrReadingMatchingQuestion";
import CheatingDetectedOverlay from "../components/CheatingDetectedOverlay";
import DragOrderQuestion from "../components/DragOrderQuestion";
import GroupedChoiceQuestion from "../components/GroupedChoiceQuestion";
import LiveLeaderboard from "../components/LiveLeaderboard";
import ProgressBar from "../components/ProgressBar";
import QRCodePanel from "../components/QRCodePanel";
import ShellLayout from "../components/ShellLayout";
import { useAntiCheat } from "../hooks/useAntiCheat";
import { useFeedbackSounds } from "../hooks/useFeedbackSounds";
import { API_URL } from "../lib/api";
import { quizCatalog } from "../lib/quizzes";

const BOARD_REVEAL_DELAY_MS = 3000;

function isScoredQuestion(question) {
  return Boolean(question) && question.graded !== false;
}

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

function buildWritingSubmission(question, textResponse, writingResponses) {
  const fields = question?.responseFields ?? [];

  if (fields.length) {
    return fields
      .map((field, index) => {
        const value = writingResponses[index]?.trim() ?? "";
        if (!value) {
          return "";
        }

        return `${index + 1}. ${field.prompt}\n${value}`;
      })
      .filter(Boolean)
      .join("\n\n");
  }

  return textResponse.trim();
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
  const [boardRevealDeadline, setBoardRevealDeadline] = useState(null);
  const [textResponse, setTextResponse] = useState("");
  const [writingResponses, setWritingResponses] = useState([]);
  const [hasSubmittedResponse, setHasSubmittedResponse] = useState(false);
  const [dragResponse, setDragResponse] = useState([]);
  const [typedResponse, setTypedResponse] = useState("");
  const [groupedChoiceResponse, setGroupedChoiceResponse] = useState({});
  const [cefrListeningResponse, setCefrListeningResponse] = useState({});
  const [cefrReadingResponse, setCefrReadingResponse] = useState({});
  const { playCorrect, playWrong } = useFeedbackSounds();
  const boardRevealTimeoutRef = useRef(null);
  const boardRevealKeyRef = useRef("");
  const audioRef = useRef(null);

  const name = playerName || (role === "host" ? "Host" : "Student");
  const playerJoinUrl =
    typeof window !== "undefined" ? `${window.location.origin}/live/${roomCode}?role=player` : "";
  const antiCheatStorageKey =
    role === "player" && roomCode && nameSubmitted && name
      ? `umbrella-live-anti-cheat:${roomCode.toUpperCase()}:${name.trim().toLowerCase()}`
      : null;

  const { violations, warning, disqualified, forceDisqualify } = useAntiCheat({
    enabled: role === "player" && Boolean(room?.started),
    storageKey: antiCheatStorageKey,
    violationLimit: 2,
    onAutoSubmit: (reason, count) => {
      socket.emit("antiCheatFlag", { roomCode, reason, count, name, disqualified: true });
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

    socket.on("answerFeedback", ({ correct, awardedScore, timedOut, responseTimeSeconds, ungraded, text, hint, correctCount, totalCount }) => {
      if (ungraded) {
        setFeedbackState({
          type: "neutral",
          text: text ?? "This part is included but not scored."
        });
        return;
      }

      if ((totalCount ?? 1) > 1) {
        const safeCorrectCount = Number(correctCount) || 0;
        const safeTotalCount = Number(totalCount) || 1;
        const feedbackType = correct ? "correct" : safeCorrectCount > 0 ? "partial" : "wrong";

        setFeedbackState({
          type: feedbackType,
          text: `${safeCorrectCount} / ${safeTotalCount} correct in ${responseTimeSeconds}s. +${awardedScore} points`
        });

        if (correct) {
          playCorrect();
        } else {
          playWrong();
        }
        return;
      }

      if (correct) {
        setFeedbackState({
          type: "correct",
          text: `Correct answer in ${responseTimeSeconds}s. +${awardedScore} points`
        });
        playCorrect();
        return;
      }

      setFeedbackState({
        type: timedOut ? "timeout" : hint ? "hint" : "wrong",
        text: timedOut
          ? `Time is over. ${responseTimeSeconds}s used. +0 points`
          : hint
            ? `Hint: ${hint}`
            : `Incorrect answer in ${responseTimeSeconds}s. +0 points`
      });
      playWrong();
    });

    socket.on("roomError", ({ message }) => {
      setRoomError(message);
    });

    socket.on("antiCheatLocked", ({ count }) => {
      forceDisqualify("server anti-cheat lock", count ?? 2);
    });

    return () => {
      socket.off("roomState");
      socket.off("answerFeedback");
      socket.off("roomError");
      socket.off("antiCheatLocked");
    };
  }, [forceDisqualify, hostToken, name, nameSubmitted, role, roomCode, roomVerified, socket]);

  const players = room?.players ?? [];
  const connectedPlayers = players.filter((player) => player.connected !== false);
  const connectedStudentNames = connectedPlayers.map((player) => player.name).filter(Boolean);
  const selfPlayer = players.find((player) => player.socketId === socket.id) ?? players.find((player) => player.name === name);
  const serverDisqualified = Boolean(selfPlayer?.disqualified);
  const isLockedFromAntiCheat = disqualified || serverDisqualified;
  const isCefrQuiz = room?.quizId === "cefr-part-1-and-2";
  const roomQuiz = quizCatalog.find((quiz) => quiz.id === room?.quizId) ?? null;
  const disableAnswerTimer = roomQuiz?.disableAnswerTimer === true;
  const totalQuestions = room?.questions?.length ?? 10;
  const studentCount = connectedPlayers.length;
  const participantCount = room?.participantCount ?? (connectedPlayers.length + (role === "host" ? 1 : 0));

  const questionIndex =
    room?.mode === "student-paced" && role !== "host"
      ? (selfPlayer?.currentQuestionIndex ?? 0)
      : (room?.currentQuestionIndex ?? 0);
  const currentQuestion = room?.questions?.[questionIndex];
  const questionKey = `${roomCode}-${role}-${questionIndex}-${room?.started ? "started" : "waiting"}`;
  const isWritingQuestion = currentQuestion?.type === "writing" || !isScoredQuestion(currentQuestion);
  const isDragOrderQuestion = currentQuestion?.type === "part1-drag-order";
  const isTextInputQuestion = currentQuestion?.type === "part2-text-input";
  const isGroupedChoiceQuestion = currentQuestion?.type === "grouped-choice-list";
  const isCefrListeningQuestion = currentQuestion?.type === "cefr-listening-group";
  const isCefrReadingQuestion = currentQuestion?.type === "cefr-reading-matching";
  const requiresManualReveal = currentQuestion?.revealMode === "manual-audio";
  const writingFields = currentQuestion?.responseFields ?? [];
  const hasStructuredWritingFields = isWritingQuestion && writingFields.length > 0;
  const isInstructorPaced = room?.mode === "instructor-paced";
  const isQuestionBoardPhase = isInstructorPaced && room?.questionPhase === "prompt";
  const canAnswerNow = Boolean(currentQuestion) && (!isInstructorPaced || room?.questionPhase === "answers");
  const boardPhaseKey = `${roomCode}-${questionIndex}-${room?.questionPhase ?? "unknown"}`;
  const displayBoardCountdown = boardRevealDeadline
    ? Math.max(1, Math.ceil((boardRevealDeadline - now) / 1000))
    : Math.ceil(BOARD_REVEAL_DELAY_MS / 1000);

  const deadlineAt =
    isScoredQuestion(currentQuestion) && !disableAnswerTimer
      ? room?.mode === "student-paced" && role !== "host"
        ? ((selfPlayer?.questionStartedAt ?? null) ? selfPlayer.questionStartedAt + room.questionTime * 1000 : null)
        : (room?.questionDeadlineAt ?? null)
      : null;

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
    setTextResponse("");
    setWritingResponses([]);
    setDragResponse([]);
    setTypedResponse("");
    setGroupedChoiceResponse({});
    setCefrListeningResponse({});
    setCefrReadingResponse({});
    setHasSubmittedResponse(false);
    setFeedbackState(null);
    setTimeoutKey("");
  }, [questionKey]);

  useEffect(() => {
    if (!audioRef.current) {
      return;
    }

    audioRef.current.pause();
    audioRef.current.currentTime = 0;
  }, [questionKey]);

  useEffect(() => {
    if (role !== "player" || !nameSubmitted || !roomVerified) {
      return;
    }

    if (violations <= 0 && !disqualified) {
      return;
    }

    socket.emit("antiCheatFlag", {
      roomCode,
      name,
      count: violations,
      reason: disqualified ? "restored anti-cheat lock" : "restored anti-cheat count",
      disqualified
    });
  }, [disqualified, name, nameSubmitted, role, roomCode, roomVerified, socket, violations]);

  useEffect(() => {
    if (serverDisqualified) {
      forceDisqualify("server anti-cheat lock", selfPlayer?.violations ?? 2);
    }
  }, [forceDisqualify, selfPlayer?.violations, serverDisqualified]);

  useEffect(() => {
    if (boardRevealTimeoutRef.current) {
      window.clearTimeout(boardRevealTimeoutRef.current);
      boardRevealTimeoutRef.current = null;
    }

    if (role !== "host" || !isQuestionBoardPhase || !currentQuestion || requiresManualReveal) {
      boardRevealKeyRef.current = "";
      setBoardRevealDeadline(null);
      return undefined;
    }

    if (boardRevealKeyRef.current !== boardPhaseKey) {
      boardRevealKeyRef.current = boardPhaseKey;
      setBoardRevealDeadline(Date.now() + BOARD_REVEAL_DELAY_MS);
    }

    boardRevealTimeoutRef.current = window.setTimeout(() => {
      socket.emit("revealAnswers", { roomCode });
    }, BOARD_REVEAL_DELAY_MS);

    return () => {
      if (boardRevealTimeoutRef.current) {
        window.clearTimeout(boardRevealTimeoutRef.current);
        boardRevealTimeoutRef.current = null;
      }
    };
  }, [boardPhaseKey, currentQuestion, isQuestionBoardPhase, requiresManualReveal, role, roomCode, socket]);

  useEffect(() => {
    if (
      role !== "player" ||
      !room?.started ||
      !currentQuestion ||
      !isScoredQuestion(currentQuestion) ||
      disableAnswerTimer ||
      !canAnswerNow ||
      selectedOption ||
      hasSubmittedResponse ||
      remainingSeconds > 0 ||
      isLockedFromAntiCheat
    ) {
      return;
    }

    if (timeoutKey === questionKey) {
      return;
    }

    socket.emit("questionTimeout", { roomCode, name });
    setTimeoutKey(questionKey);
  }, [canAnswerNow, currentQuestion, hasSubmittedResponse, isLockedFromAntiCheat, name, questionKey, remainingSeconds, role, room?.started, roomCode, selectedOption, socket, timeoutKey]);

  function submitAnswer(option) {
    if (isLockedFromAntiCheat) {
      return;
    }

    setSelectedOption(option);
    socket.emit("submitAnswer", { roomCode, answer: option, name });
  }

  function submitWritingResponse() {
    const combinedWritingResponse = buildWritingSubmission(currentQuestion, textResponse, writingResponses);

    if (isLockedFromAntiCheat || !combinedWritingResponse || hasSubmittedResponse) {
      return;
    }

    setHasSubmittedResponse(true);
    socket.emit("submitAnswer", { roomCode, answer: combinedWritingResponse, name });
  }

  function submitDragOrderResponse() {
    if (isLockedFromAntiCheat || hasSubmittedResponse) {
      return;
    }

    const requiredSlots = currentQuestion?.correctSequence?.length ?? 0;
    if (!requiredSlots || dragResponse.length < requiredSlots || dragResponse.some((item) => !item)) {
      return;
    }

    setHasSubmittedResponse(true);
    socket.emit("submitAnswer", { roomCode, answer: dragResponse, name });
  }

  function submitTypedResponse() {
    if (isLockedFromAntiCheat || !typedResponse.trim() || hasSubmittedResponse) {
      return;
    }

    setHasSubmittedResponse(true);
    socket.emit("submitAnswer", { roomCode, answer: typedResponse.trim(), name });
  }

  function submitGroupedChoiceResponse() {
    const requiredAnswers = currentQuestion?.items?.length ?? 0;
    if (isLockedFromAntiCheat || hasSubmittedResponse || !requiredAnswers) {
      return;
    }

    const answeredCount = currentQuestion.items.filter((item) => groupedChoiceResponse[item.number]).length;
    if (answeredCount < requiredAnswers) {
      return;
    }

    setHasSubmittedResponse(true);
    socket.emit("submitAnswer", { roomCode, answer: groupedChoiceResponse, name });
  }

  function submitCefrListeningResponse() {
    const requiredAnswers = currentQuestion?.items?.length ?? 0;
    if (isLockedFromAntiCheat || hasSubmittedResponse || !requiredAnswers) {
      return;
    }

    const answeredCount = currentQuestion.items.filter((item) => cefrListeningResponse[item.number]).length;
    if (answeredCount < requiredAnswers) {
      return;
    }

    setHasSubmittedResponse(true);
    socket.emit("submitAnswer", { roomCode, answer: cefrListeningResponse, name });
  }

  function submitCefrReadingResponse() {
    const requiredAnswers = currentQuestion?.people?.length ?? 0;
    if (isLockedFromAntiCheat || hasSubmittedResponse || !requiredAnswers) {
      return;
    }

    const answeredCount = currentQuestion.people.filter((person) => cefrReadingResponse[person.number]).length;
    if (answeredCount < requiredAnswers) {
      return;
    }

    setHasSubmittedResponse(true);
    socket.emit("submitAnswer", { roomCode, answer: cefrReadingResponse, name });
  }

  function handleTeacherStartAudio() {
    if (!audioRef.current) {
      socket.emit("revealAnswers", { roomCode });
      return;
    }

    audioRef.current.currentTime = 0;
    const playPromise = audioRef.current.play();
    if (playPromise?.catch) {
      playPromise.catch(() => {
        setRoomError("Audio could not start automatically. Press Start audio again.");
      });
    }

    socket.emit("revealAnswers", { roomCode });
  }

  const playerFeedbackClass =
    feedbackState?.type === "correct"
      ? "bg-emerald-50 text-emerald-900"
      : feedbackState?.type === "timeout"
        ? "bg-amber-50 text-amber-900"
        : feedbackState?.type === "neutral" || feedbackState?.type === "hint" || feedbackState?.type === "partial"
          ? "bg-amber-50 text-amber-950"
        : "bg-rose-50 text-rose-900";

  const showTimerBadge = Boolean(
    !isCefrQuiz &&
      !disableAnswerTimer &&
      room?.started &&
      room?.questionPhase === "answers" &&
      isScoredQuestion(currentQuestion) &&
      (currentQuestion || (role === "host" && room?.mode === "student-paced"))
  );

  const layoutClass =
    role === "host" && !room?.started
      ? "mx-auto max-w-4xl"
      : role === "host" && isCefrQuiz
        ? "mx-auto w-full max-w-[1280px]"
      : role === "host"
        ? "mx-auto grid max-w-6xl gap-6 md:grid-cols-1 lg:grid-cols-[1.1fr_0.9fr]"
      : "mx-auto max-w-4xl";

  return (
    <ShellLayout>
      {role === "player" && isLockedFromAntiCheat ? (
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
          {currentQuestion?.audioSrc ? <audio ref={audioRef} src={currentQuestion.audioSrc} preload="auto" className="hidden" /> : null}

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
              {role === "host" ? (
                <>
                  <div className="mt-5 rounded-[24px] bg-white/10 px-4 py-4">
                    <p className="text-xs font-black uppercase tracking-[0.2em] text-neutral-300">Room code</p>
                    <p className="mt-2 text-4xl font-extrabold tracking-[0.06em] text-white">{roomCode?.toUpperCase()}</p>
                  </div>
                  <button onClick={() => socket.emit("startExam", { roomCode })} className="mt-5 inline-flex items-center gap-2 rounded-full bg-amber-300 px-5 py-3 font-bold text-neutral-950">
                    <PlayCircle size={18} />
                    Start exam
                  </button>
                  <div className="mt-5 rounded-[24px] bg-white p-4">
                    <QRCodePanel
                      value={playerJoinUrl}
                      title="Student QR"
                      caption="Students can scan this QR or use the room code to join."
                    />
                  </div>
                  <div className="mt-5 rounded-[24px] bg-white/10 px-4 py-4">
                    <p className="text-xs font-black uppercase tracking-[0.2em] text-neutral-300">Connected students</p>
                    {connectedStudentNames.length ? (
                      <ul className="mt-3 space-y-2">
                        {connectedStudentNames.map((studentName) => (
                          <li key={studentName} className="rounded-[14px] bg-white/10 px-3 py-2 text-sm text-neutral-100">
                            {studentName}
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="mt-3 text-sm text-neutral-400">No students connected yet.</p>
                    )}
                  </div>
                </>
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
              <div className="flex flex-wrap items-center gap-3">
                {currentQuestion.part ? (
                  <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-black uppercase tracking-[0.22em] text-amber-300">
                    {currentQuestion.part}
                  </span>
                ) : null}
                {currentQuestion.partTitle ? (
                  <span className="text-sm font-bold uppercase tracking-[0.18em] text-neutral-500">
                    {currentQuestion.partTitle}
                  </span>
                ) : null}
              </div>
              <div className="mt-6">
                {isGroupedChoiceQuestion ? (
                  <GroupedChoiceQuestion
                    items={currentQuestion.items}
                    value={{}}
                    disabled={true}
                    boardMode={true}
                    passage={currentQuestion.passage}
                  />
                ) : isCefrListeningQuestion ? (
                  <CefrListeningQuestion items={currentQuestion.items} value={{}} disabled={true} boardMode={true} />
                ) : isCefrReadingQuestion ? (
                  <CefrReadingMatchingQuestion people={currentQuestion.people} choices={currentQuestion.choices} value={{}} disabled={true} boardMode={true} />
                ) : currentQuestion.type === "part1-drag-order" ? (
                  <DragOrderQuestion
                    template={currentQuestion.textTemplate}
                    wordBank={currentQuestion.wordBank}
                    value={[]}
                    disabled={true}
                    showWordBank={false}
                  />
                ) : (
                  renderQuestionPrompt(
                    currentQuestion.prompt,
                    "max-w-4xl text-4xl font-extrabold leading-[1.12] tracking-[-0.02em] break-words text-amber-400",
                    "max-w-4xl text-4xl font-extrabold leading-[1.12] tracking-[-0.02em] break-words text-white",
                    { showTitle: true, titleClassName: "max-w-4xl text-4xl font-extrabold leading-[1.12] tracking-[-0.02em] break-words text-amber-400" }
                  )
                )}
              </div>
              {requiresManualReveal ? (
                <div className="mt-8 flex flex-wrap items-center gap-4 rounded-[24px] border border-white/10 bg-white/5 px-6 py-5">
                  <div className="min-w-[260px] flex-1">
                    <p className="text-xs font-semibold uppercase tracking-[0.22em] text-neutral-400">
                      Teacher control
                    </p>
                    <p className="mt-2 text-sm leading-7 text-neutral-300">
                      Students will not see answer options until you start the audio from this board.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={handleTeacherStartAudio}
                    className="inline-flex items-center gap-2 rounded-full bg-amber-300 px-5 py-3 font-bold text-neutral-950"
                  >
                    <PlayCircle size={18} />
                    Start audio
                  </button>
                </div>
              ) : (
                <div className="mt-8 inline-flex min-w-[320px] flex-col gap-3 rounded-[24px] border border-white/10 bg-white/5 px-6 py-5">
                  <p className="text-xs font-semibold uppercase tracking-[0.22em] text-neutral-400">
                    {isWritingQuestion ? "Response area opens in" : "Answers open in"}
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
              )}
            </div>
          ) : role === "player" && isQuestionBoardPhase && currentQuestion ? (
            <div className="mt-8 rounded-[32px] border border-neutral-200 bg-white p-8 text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-amber-100 text-neutral-950">
                <Presentation size={24} />
              </div>
              <h2 className="mt-5 text-3xl font-extrabold text-neutral-950">
                {requiresManualReveal ? "Waiting for audio" : "Question on the board"}
              </h2>
              <p className="mt-3 text-sm leading-7 text-neutral-600">
                {requiresManualReveal
                  ? "The teacher will start the listening audio from the board. Your answer area will open here immediately after that."
                  : "Read the question on the host screen. The response area will open here as soon as the board countdown finishes."}
              </p>
            </div>
          ) : currentQuestion ? (
            <div className="mt-8">
              <div className="mb-5 flex flex-wrap items-center gap-3">
                {currentQuestion.part ? (
                  <span className="rounded-full bg-amber-300 px-3 py-1 text-xs font-black uppercase tracking-[0.22em] text-neutral-900">
                    {currentQuestion.part}
                  </span>
                ) : null}
                {currentQuestion.partTitle ? (
                  <span className="text-sm font-bold uppercase tracking-[0.18em] text-neutral-500">
                    {currentQuestion.partTitle}
                  </span>
                ) : null}
                {!isScoredQuestion(currentQuestion) ? (
                  <span className="rounded-full bg-amber-50 px-3 py-1 text-xs font-bold uppercase tracking-[0.18em] text-neutral-700">
                    Not scored
                  </span>
                ) : null}
              </div>
              {renderQuestionPrompt(
                currentQuestion.prompt,
                "max-w-4xl text-3xl font-extrabold leading-[1.18] tracking-[-0.02em] break-words text-neutral-950",
                "max-w-4xl text-3xl font-extrabold leading-[1.18] tracking-[-0.02em] break-words text-neutral-950",
                { showTitle: false }
              )}
              {isWritingQuestion ? (
                <div className="mt-6 rounded-[28px] border border-neutral-200 bg-white p-5">
                  {currentQuestion.passage ? (
                    <div className="mb-5 rounded-[24px] border border-neutral-200 bg-neutral-50 px-5 py-4 text-sm leading-7 text-neutral-800 whitespace-pre-line">
                      {currentQuestion.passage}
                    </div>
                  ) : null}
                  {hasStructuredWritingFields ? (
                    <div className="space-y-4">
                      {writingFields.map((field, index) => (
                        <div key={field.id ?? field.prompt ?? index} className="rounded-[24px] border border-neutral-200 bg-neutral-50 p-4">
                          <div className="rounded-[18px] bg-amber-50 px-4 py-3 text-sm font-semibold text-neutral-800">
                            {field.prompt}
                          </div>
                          {role === "host" ? (
                            <p className="mt-4 text-sm leading-7 text-neutral-600">
                              Students answer this prompt in the field below on their own devices.
                            </p>
                          ) : field.multiline ? (
                            <textarea
                              value={writingResponses[index] ?? ""}
                              onChange={(event) =>
                                setWritingResponses((current) => {
                                  const next = [...current];
                                  next[index] = event.target.value;
                                  return next;
                                })
                              }
                              disabled={!canAnswerNow || hasSubmittedResponse || isLockedFromAntiCheat}
                              placeholder={field.placeholder ?? currentQuestion.placeholder}
                              className="mt-4 min-h-[112px] w-full rounded-[20px] border border-neutral-200 bg-white px-4 py-3 text-base leading-7 text-neutral-900 outline-none transition focus:border-neutral-950 disabled:bg-neutral-100"
                            />
                          ) : (
                            <input
                              type="text"
                              value={writingResponses[index] ?? ""}
                              onChange={(event) =>
                                setWritingResponses((current) => {
                                  const next = [...current];
                                  next[index] = event.target.value;
                                  return next;
                                })
                              }
                              disabled={!canAnswerNow || hasSubmittedResponse || isLockedFromAntiCheat}
                              placeholder={field.placeholder ?? currentQuestion.placeholder}
                              className="mt-4 w-full rounded-[20px] border border-neutral-200 bg-white px-4 py-3 text-base text-neutral-900 outline-none transition focus:border-neutral-950 disabled:bg-neutral-100"
                            />
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {(currentQuestion.instructions ?? []).map((instruction) => (
                        <div key={instruction} className="rounded-[20px] bg-amber-50 px-4 py-3 text-sm font-semibold text-neutral-800">
                          {instruction}
                        </div>
                      ))}
                    </div>
                  )}

                  {role === "host" ? (
                    <p className="mt-5 text-sm leading-7 text-neutral-600">
                      Students write this final response on their own devices. This part is visible for the full book flow, but it does not affect the score.
                    </p>
                  ) : (
                    <>
                      {!hasStructuredWritingFields ? (
                        <textarea
                          value={textResponse}
                          onChange={(event) => setTextResponse(event.target.value)}
                          disabled={!canAnswerNow || hasSubmittedResponse || isLockedFromAntiCheat}
                          placeholder={currentQuestion.placeholder}
                          className="mt-5 min-h-[200px] w-full rounded-[24px] border border-neutral-200 bg-white px-4 py-4 text-base leading-7 text-neutral-900 outline-none transition focus:border-neutral-950 disabled:bg-neutral-100"
                        />
                      ) : null}
                      <button
                        type="button"
                        onClick={submitWritingResponse}
                        disabled={
                          !canAnswerNow ||
                          hasSubmittedResponse ||
                          isLockedFromAntiCheat ||
                          (hasStructuredWritingFields
                            ? writingFields.some((_, index) => !(writingResponses[index] ?? "").trim())
                            : !textResponse.trim())
                        }
                        className="mt-5 rounded-full bg-neutral-950 px-5 py-3 font-bold text-white disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        Submit response
                      </button>
                    </>
                  )}
                </div>
              ) : isGroupedChoiceQuestion ? (
                <div className="mt-6 rounded-[28px] border border-neutral-200 bg-white p-5">
                  {role === "host" ? (
                    <GroupedChoiceQuestion
                      items={currentQuestion.items}
                      value={{}}
                      disabled={true}
                      boardMode={true}
                      passage={currentQuestion.passage}
                    />
                  ) : (
                    <>
                      <GroupedChoiceQuestion
                        items={currentQuestion.items}
                        value={groupedChoiceResponse}
                        onChange={setGroupedChoiceResponse}
                        disabled={!canAnswerNow || hasSubmittedResponse || isLockedFromAntiCheat}
                        passage={currentQuestion.passage}
                      />
                      <button
                        type="button"
                        onClick={submitGroupedChoiceResponse}
                        disabled={
                          !canAnswerNow ||
                          hasSubmittedResponse ||
                          isLockedFromAntiCheat ||
                          currentQuestion.items.some((item) => !groupedChoiceResponse[item.number])
                        }
                        className="mt-5 rounded-full bg-neutral-950 px-5 py-3 font-bold text-white disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        Submit answers
                      </button>
                    </>
                  )}
                </div>
              ) : isCefrListeningQuestion ? (
                <div className="mt-6 rounded-[28px] border border-neutral-200 bg-white p-5">
                  {role === "host" ? (
                    <>
                      <CefrListeningQuestion items={currentQuestion.items} value={{}} disabled={true} boardMode={true} />
                      <p className="mt-5 text-sm leading-7 text-neutral-600">
                        The listening audio plays from the teacher board. Students answer all 8 items on their own devices after you press Start audio.
                      </p>
                    </>
                  ) : (
                    <>
                      <CefrListeningQuestion
                        items={currentQuestion.items}
                        value={cefrListeningResponse}
                        onChange={setCefrListeningResponse}
                        disabled={!canAnswerNow || hasSubmittedResponse || isLockedFromAntiCheat}
                      />
                      <button
                        type="button"
                        onClick={submitCefrListeningResponse}
                        disabled={
                          !canAnswerNow ||
                          hasSubmittedResponse ||
                          isLockedFromAntiCheat ||
                          currentQuestion.items.some((item) => !cefrListeningResponse[item.number])
                        }
                        className="mt-5 rounded-full bg-neutral-950 px-5 py-3 font-bold text-white disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        Submit answers
                      </button>
                    </>
                  )}
                </div>
              ) : isCefrReadingQuestion ? (
                <div className="mt-6 rounded-[28px] border border-neutral-200 bg-white p-5">
                  {role === "host" ? (
                    <CefrReadingMatchingQuestion
                      people={currentQuestion.people}
                      choices={currentQuestion.choices}
                      value={{}}
                      disabled={true}
                      boardMode={true}
                    />
                  ) : (
                    <>
                      <CefrReadingMatchingQuestion
                        people={currentQuestion.people}
                        choices={currentQuestion.choices}
                        value={cefrReadingResponse}
                        onChange={setCefrReadingResponse}
                        disabled={!canAnswerNow || hasSubmittedResponse || isLockedFromAntiCheat}
                      />
                      <button
                        type="button"
                        onClick={submitCefrReadingResponse}
                        disabled={
                          !canAnswerNow ||
                          hasSubmittedResponse ||
                          isLockedFromAntiCheat ||
                          currentQuestion.people.some((person) => !cefrReadingResponse[person.number])
                        }
                        className="mt-5 rounded-full bg-neutral-950 px-5 py-3 font-bold text-white disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        Submit answers
                      </button>
                    </>
                  )}
                </div>
              ) : isDragOrderQuestion ? (
                <div className="mt-6 rounded-[28px] border border-neutral-200 bg-white p-5">
                  {role === "host" ? (
                    <DragOrderQuestion
                      template={currentQuestion.textTemplate}
                      wordBank={currentQuestion.wordBank}
                      value={[]}
                      disabled={true}
                      showWordBank={false}
                    />
                  ) : (
                    <>
                      <DragOrderQuestion
                        template={currentQuestion.textTemplate}
                        wordBank={currentQuestion.wordBank}
                        value={dragResponse}
                        onChange={setDragResponse}
                        disabled={!canAnswerNow || hasSubmittedResponse || isLockedFromAntiCheat}
                        showWordBank={true}
                        compactOnMobile={true}
                      />
                      <button
                        type="button"
                        onClick={submitDragOrderResponse}
                        disabled={
                          !canAnswerNow ||
                          hasSubmittedResponse ||
                          isLockedFromAntiCheat ||
                          dragResponse.length < (currentQuestion.correctSequence?.length ?? 0) ||
                          dragResponse.some((item) => !item)
                        }
                        className="mt-5 rounded-full bg-neutral-950 px-5 py-3 font-bold text-white disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        Submit answers
                      </button>
                    </>
                  )}
                </div>
              ) : isTextInputQuestion ? (
                <div className="mt-6 rounded-[28px] border border-neutral-200 bg-white p-5">
                  {role === "host" ? (
                    <p className="text-sm leading-7 text-neutral-600">
                      Students type the answer. If incorrect, they will receive a short hint.
                    </p>
                  ) : (
                    <>
                      <input
                        type="text"
                        value={typedResponse}
                        onChange={(event) => setTypedResponse(event.target.value)}
                        disabled={!canAnswerNow || hasSubmittedResponse || isLockedFromAntiCheat}
                        placeholder="Type your answer"
                        className="w-full rounded-[18px] border border-neutral-200 bg-white px-4 py-3 text-base outline-none focus:border-neutral-950 disabled:bg-neutral-100"
                      />
                      <button
                        type="button"
                        onClick={submitTypedResponse}
                        disabled={!canAnswerNow || hasSubmittedResponse || !typedResponse.trim() || isLockedFromAntiCheat}
                        className="mt-5 rounded-full bg-neutral-950 px-5 py-3 font-bold text-white disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        Submit answer
                      </button>
                    </>
                  )}
                </div>
              ) : (
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
                        disabled={role === "host" || !canAnswerNow || selectedOption !== "" || (!disableAnswerTimer && remainingSeconds <= 0) || isLockedFromAntiCheat}
                        state={state}
                      />
                    );
                  })}
                </div>
              )}
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
              <h2 className="text-2xl font-extrabold text-neutral-950">
                {role === "host" && isCefrQuiz ? "Final results" : "Exam complete"}
              </h2>
              <p className="mt-3 text-sm text-neutral-600">
                {role === "host" && isCefrQuiz
                  ? "The test is finished. Student results are now shown on the board."
                  : "Check the leaderboard for the final ranking."}
              </p>
              {role === "host" && isCefrQuiz ? (
                <div className="mt-6">
                  <LiveLeaderboard players={players} showAverageTime={false} />
                </div>
              ) : null}
            </div>
          )}
        </div>

        {role === "host" && room?.started && !isCefrQuiz ? <LiveLeaderboard players={players} /> : null}
      </div>
    </ShellLayout>
  );
}
