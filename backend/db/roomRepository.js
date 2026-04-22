import { roomStore } from "../models/roomStore.js";
import { hasDatabase, query, withTransaction } from "./client.js";

const PASS_THRESHOLD = 6;

function toNullableBigInt(value) {
  return value ?? null;
}

function createSessionId(room) {
  return room.sessionId ?? `${room.code}-${room.createdAt}`;
}

function createQuizResultId(room, player) {
  return `${createSessionId(room)}-${player.name}`;
}

function calculateQuizAccuracy(player) {
  if (!player.answeredQuestions) {
    return 0;
  }

  return Math.round((player.correctAnswers / player.answeredQuestions) * 100);
}

function countScoredQuestions(questions) {
  return (questions ?? []).filter((question) => question?.graded !== false).length;
}

function mapRoomRow(roomRow, playerRows) {
  return {
    code: roomRow.code,
    sessionId: roomRow.session_id ?? `${roomRow.code}-${roomRow.created_at}`,
    hostName: roomRow.host_name,
    hostToken: roomRow.host_token,
    hostSocketId: roomRow.host_socket_id,
    mode: roomRow.mode,
    quizId: roomRow.quiz_id,
    quizTitle: roomRow.quiz_title,
    questionTime: roomRow.question_time,
    questions: roomRow.questions_json,
    currentQuestionIndex: roomRow.current_question_index,
    questionPhase: roomRow.question_phase,
    questionStartedAt: roomRow.question_started_at ? Number(roomRow.question_started_at) : null,
    questionDeadlineAt: roomRow.question_deadline_at ? Number(roomRow.question_deadline_at) : null,
    started: roomRow.started,
    createdAt: Number(roomRow.created_at),
    players: playerRows
      .sort((first, second) => first.name.localeCompare(second.name))
      .map((player) => ({
        socketId: player.socket_id,
        name: player.name,
        connected: player.connected,
        disqualified: player.disqualified,
        joinedAt: player.joined_at ? Number(player.joined_at) : null,
        disconnectedAt: player.disconnected_at ? Number(player.disconnected_at) : null,
        score: player.score,
        correctAnswers: player.correct_answers,
        answeredQuestions: player.answered_questions,
        totalResponseTimeMs: player.total_response_time_ms,
        answeredCurrent: player.answered_current,
        violations: player.violations,
        currentQuestionIndex: player.current_question_index,
        questionStartedAt: player.question_started_at ? Number(player.question_started_at) : null,
        completed: player.completed
      }))
  };
}

async function saveQuizResults(client, room) {
  if (!room?.questions?.length || room.currentQuestionIndex < room.questions.length || !room.started) {
    return;
  }

  const totalQuestions = countScoredQuestions(room.questions);
  for (const player of room.players) {
    const correctAnswers = player.correctAnswers ?? 0;
    const answeredQuestions = player.answeredQuestions ?? 0;
    const wrongAnswers = Math.max(0, answeredQuestions - correctAnswers);
    const resultId = createQuizResultId(room, player);
    const accuracy = calculateQuizAccuracy(player);

    await client.query(
      `
        INSERT INTO quiz_results (
          id, room_code, quiz_id, quiz_title, player_name, score, accuracy,
          correct_answers, wrong_answers, total_questions, streak,
          violations, ended_by, created_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
        ON CONFLICT (id) DO UPDATE SET
          room_code = EXCLUDED.room_code,
          quiz_id = EXCLUDED.quiz_id,
          quiz_title = EXCLUDED.quiz_title,
          score = EXCLUDED.score,
          accuracy = EXCLUDED.accuracy,
          correct_answers = EXCLUDED.correct_answers,
          wrong_answers = EXCLUDED.wrong_answers,
          total_questions = EXCLUDED.total_questions,
          streak = EXCLUDED.streak,
          violations = EXCLUDED.violations,
          ended_by = EXCLUDED.ended_by,
          created_at = EXCLUDED.created_at;
      `,
      [
        resultId,
        room.code,
        room.quizId,
        room.quizTitle,
        player.name,
        player.score ?? 0,
        accuracy,
        correctAnswers,
        wrongAnswers,
        totalQuestions,
        0,
        player.violations ?? 0,
        player.disqualified ? "anti-cheat" : "completed",
        Date.now()
      ]
    );
  }
}

async function saveSessionArchive(client, room) {
  if (!room?.started) {
    return;
  }

  const sessionId = createSessionId(room);
  const completed = room.currentQuestionIndex >= room.questions.length;

  await client.query(
    `
      INSERT INTO game_sessions (
        id, room_code, quiz_id, quiz_title, mode, question_time,
        total_questions, started, completed, created_at, completed_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
      ON CONFLICT (id) DO UPDATE SET
        room_code = EXCLUDED.room_code,
        quiz_id = EXCLUDED.quiz_id,
        quiz_title = EXCLUDED.quiz_title,
        mode = EXCLUDED.mode,
        question_time = EXCLUDED.question_time,
        total_questions = EXCLUDED.total_questions,
        started = EXCLUDED.started,
        completed = EXCLUDED.completed,
        completed_at = EXCLUDED.completed_at;
    `,
    [
      sessionId,
      room.code,
      room.quizId,
      room.quizTitle,
      room.mode,
      room.questionTime,
      room.questions.length,
      room.started,
      completed,
      room.createdAt,
      completed ? Date.now() : null
    ]
  );

  for (const player of room.players) {
    await client.query(
      `
        INSERT INTO game_session_players (
          session_id, name, connected, disqualified, joined_at, disconnected_at, score,
          correct_answers, answered_questions, total_response_time_ms,
          violations, current_question_index, completed
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
        ON CONFLICT (session_id, name) DO UPDATE SET
          connected = EXCLUDED.connected,
          disqualified = EXCLUDED.disqualified,
          joined_at = COALESCE(game_session_players.joined_at, EXCLUDED.joined_at),
          disconnected_at = EXCLUDED.disconnected_at,
          score = EXCLUDED.score,
          correct_answers = EXCLUDED.correct_answers,
          answered_questions = EXCLUDED.answered_questions,
          total_response_time_ms = EXCLUDED.total_response_time_ms,
          violations = EXCLUDED.violations,
          current_question_index = EXCLUDED.current_question_index,
          completed = EXCLUDED.completed;
      `,
      [
        sessionId,
        player.name,
        player.connected ?? false,
        player.disqualified ?? false,
        toNullableBigInt(player.joinedAt),
        toNullableBigInt(player.disconnectedAt),
        player.score ?? 0,
        player.correctAnswers ?? 0,
        player.answeredQuestions ?? 0,
        player.totalResponseTimeMs ?? 0,
        player.violations ?? 0,
        player.currentQuestionIndex ?? 0,
        player.completed ?? false
      ]
    );
  }
}

export async function saveRoom(room) {
  const normalizedCode = String(room.code ?? "").toUpperCase();
  room.code = normalizedCode;
  room.sessionId = createSessionId(room);
  roomStore.set(normalizedCode, room);

  if (!hasDatabase()) {
    return;
  }

  await withTransaction(async (client) => {
    await client.query(
      `
        INSERT INTO live_rooms (
          code, session_id, host_name, host_token, host_socket_id, mode, quiz_id, quiz_title,
          question_time, questions_json, current_question_index, question_phase,
          question_started_at, question_deadline_at, started, created_at
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10::jsonb, $11, $12, $13, $14, $15, $16)
        ON CONFLICT (code) DO UPDATE SET
          session_id = EXCLUDED.session_id,
          host_name = EXCLUDED.host_name,
          host_token = EXCLUDED.host_token,
          host_socket_id = EXCLUDED.host_socket_id,
          mode = EXCLUDED.mode,
          quiz_id = EXCLUDED.quiz_id,
          quiz_title = EXCLUDED.quiz_title,
          question_time = EXCLUDED.question_time,
          questions_json = EXCLUDED.questions_json,
          current_question_index = EXCLUDED.current_question_index,
          question_phase = EXCLUDED.question_phase,
          question_started_at = EXCLUDED.question_started_at,
          question_deadline_at = EXCLUDED.question_deadline_at,
          started = EXCLUDED.started;
      `,
      [
        room.code,
        room.sessionId,
        room.hostName,
        room.hostToken,
        room.hostSocketId,
        room.mode,
        room.quizId,
        room.quizTitle,
        room.questionTime,
        JSON.stringify(room.questions),
        room.currentQuestionIndex,
        room.questionPhase,
        toNullableBigInt(room.questionStartedAt),
        toNullableBigInt(room.questionDeadlineAt),
        room.started,
        room.createdAt
      ]
    );

    await client.query("DELETE FROM live_room_players WHERE room_code = $1", [room.code]);

    for (const player of room.players) {
      await client.query(
        `
          INSERT INTO live_room_players (
            room_code, name, socket_id, connected, disqualified, joined_at, disconnected_at,
            score, correct_answers, answered_questions, total_response_time_ms,
            answered_current, violations, current_question_index, question_started_at, completed
          ) 
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16);
        `,
        [
          room.code,
          player.name,
          player.socketId,
          player.connected ?? Boolean(player.socketId),
          player.disqualified ?? false,
          toNullableBigInt(player.joinedAt ?? room.createdAt),
          toNullableBigInt(player.disconnectedAt),
          player.score ?? 0,
          player.correctAnswers ?? 0,
          player.answeredQuestions ?? 0,
          player.totalResponseTimeMs ?? 0,
          player.answeredCurrent ?? false,
          player.violations ?? 0,
          player.currentQuestionIndex ?? 0,
          toNullableBigInt(player.questionStartedAt),
          player.completed ?? false
        ]
      );
    }

    await saveSessionArchive(client, room);
    await saveQuizResults(client, room);
  });
}

export async function getRoomByCode(code) {
  const normalizedCode = String(code ?? "").toUpperCase();
  if (!normalizedCode) {
    return null;
  }

  const cachedRoom = roomStore.get(normalizedCode);
  if (cachedRoom) {
    return cachedRoom;
  }

  if (!hasDatabase()) {
    return null;
  }

  const roomResult = await query("SELECT * FROM live_rooms WHERE code = $1", [normalizedCode]);
  if (!roomResult.rows.length) {
    return null;
  }

  const playerResult = await query("SELECT * FROM live_room_players WHERE room_code = $1", [normalizedCode]);
  const room = mapRoomRow(roomResult.rows[0], playerResult.rows);
  roomStore.set(normalizedCode, room);
  return room;
}

export async function getTopLivePlayers(limit = null) {
  const resolveLimit = Number(limit);
  const safeLimit = Number.isFinite(resolveLimit) && resolveLimit > 0 ? Math.floor(resolveLimit) : null;

  if (!hasDatabase()) {
    const activePlayers = Array.from(roomStore.values())
      .flatMap((room) => room.players ?? [])
      .filter((player) => (player.connected ?? Boolean(player.socketId)) && !player.disqualified)
      .sort((first, second) =>
        (second.score ?? 0) - (first.score ?? 0) ||
        (second.correctAnswers ?? 0) - (first.correctAnswers ?? 0) ||
        (first.totalResponseTimeMs ?? 0) - (second.totalResponseTimeMs ?? 0)
      );

    const limitedPlayers = safeLimit ? activePlayers.slice(0, safeLimit) : activePlayers;
    return limitedPlayers.map((player, index) => ({
      id: `memory-${player.name}-${index}`,
      name: player.name,
      score: player.score ?? 0,
      correctAnswers: player.correctAnswers ?? 0,
      averageResponseTimeSeconds:
        (player.answeredQuestions ?? 0) > 0
          ? Number(((player.totalResponseTimeMs ?? 0) / player.answeredQuestions / 1000).toFixed(2))
          : 0,
      violations: player.violations ?? 0,
      accuracy:
        (player.answeredQuestions ?? 0) > 0
          ? Math.round(((player.correctAnswers ?? 0) / player.answeredQuestions) * 100)
          : 0
    }));
  }

  const archiveQuery = `SELECT session_id, name, score, correct_answers, answered_questions,
            total_response_time_ms, violations
     FROM game_session_players
     ORDER BY score DESC, correct_answers DESC, total_response_time_ms ASC
     ${safeLimit ? "LIMIT $1" : ""}`;
  const archiveResult = await query(archiveQuery, safeLimit ? [safeLimit] : []);

  if (archiveResult.rows.length) {
    return archiveResult.rows.map((player) => ({
      id: `${player.session_id}-${player.name}`,
      name: player.name,
      score: player.score,
      correctAnswers: player.correct_answers ?? 0,
      averageResponseTimeSeconds:
        player.answered_questions > 0
          ? Number((player.total_response_time_ms / player.answered_questions / 1000).toFixed(2))
          : 0,
      violations: player.violations ?? 0,
      accuracy:
        player.answered_questions > 0
          ? Math.round((player.correct_answers / player.answered_questions) * 100)
          : 0
    }));
  }

  const resultQuery = `SELECT player_name, score, correct_answers, total_questions, violations, created_at
     FROM quiz_results
     ORDER BY score DESC, correct_answers DESC, total_questions DESC
     ${safeLimit ? "LIMIT $1" : ""}`;
  const result = await query(resultQuery, safeLimit ? [safeLimit] : []);

  if (result.rows.length) {
    return result.rows.map((player, index) => ({
      id: `result-${player.player_name}-${player.created_at}-${index}`,
      name: player.player_name,
      score: player.score,
      correctAnswers: player.correct_answers ?? 0,
      averageResponseTimeSeconds: 0,
      violations: player.violations ?? 0,
      accuracy:
        player.total_questions > 0
          ? Math.round((player.correct_answers / player.total_questions) * 100)
          : 0
    }));
  }

  const livePlayersQuery = `SELECT room_code, name, score, correct_answers, answered_questions, total_response_time_ms, violations
     FROM live_room_players
     ORDER BY score DESC, correct_answers DESC, total_response_time_ms ASC
     ${safeLimit ? "LIMIT $1" : ""}`;
  const livePlayersResult = await query(livePlayersQuery, safeLimit ? [safeLimit] : []);

  return livePlayersResult.rows.map((player, index) => ({
    id: `live-${player.room_code}-${player.name}-${index}`,
    name: player.name,
    score: player.score ?? 0,
    correctAnswers: player.correct_answers ?? 0,
    averageResponseTimeSeconds:
      player.answered_questions > 0
        ? Number((player.total_response_time_ms / player.answered_questions / 1000).toFixed(2))
        : 0,
    violations: player.violations ?? 0,
    accuracy:
      player.answered_questions > 0
        ? Math.round((player.correct_answers / player.answered_questions) * 100)
        : 0
  }));
}

export async function getRoomSessionStats() {
  if (!hasDatabase()) {
    return [];
  }

  const sessionResult = await query(
    `SELECT gs.id AS session_id, gs.room_code, gs.quiz_title, gs.mode, gs.created_at,
            gsp.name, gsp.score, gsp.correct_answers, gsp.answered_questions,
            gsp.total_response_time_ms, gsp.violations, gsp.current_question_index,
            gsp.completed, gsp.connected, gsp.disqualified
     FROM game_sessions gs
     JOIN game_session_players gsp ON gsp.session_id = gs.id
     ORDER BY gs.created_at DESC, gsp.score DESC, gsp.name ASC`
  );

  const sessions = new Map();

  for (const row of sessionResult.rows) {
    if (!sessions.has(row.session_id)) {
      sessions.set(row.session_id, {
        id: row.session_id,
        roomCode: row.room_code,
        quizTitle: row.quiz_title,
        mode: row.mode,
        createdAt: Number(row.created_at),
        totalStudents: 0,
        passedStudents: 0,
        details: []
      });
    }

    const session = sessions.get(row.session_id);
    const passed = (row.correct_answers ?? 0) >= PASS_THRESHOLD;
    session.totalStudents += 1;
    if (passed) {
      session.passedStudents += 1;
    }

    session.details.push({
      id: `${row.session_id}-${row.name}`,
      name: row.name,
      score: row.score,
      correctAnswers: row.correct_answers,
      answeredQuestions: row.answered_questions,
      averageResponseTimeSeconds:
        row.answered_questions > 0
          ? Number((row.total_response_time_ms / row.answered_questions / 1000).toFixed(2))
          : 0,
      violations: row.violations,
      disqualified: row.disqualified,
      currentQuestionIndex: row.current_question_index,
      completed: row.completed,
      connected: row.connected,
      passed
    });
  }

  return Array.from(sessions.values());
}

export async function removeRoom(code) {
  const normalizedCode = String(code ?? "").toUpperCase();
  roomStore.delete(normalizedCode);

  if (!hasDatabase()) {
    return;
  }

  await query("DELETE FROM live_rooms WHERE code = $1", [normalizedCode]);
}
