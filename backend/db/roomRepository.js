import { roomStore } from "../models/roomStore.js";
import { hasDatabase, query, withTransaction } from "./client.js";

function toNullableBigInt(value) {
  return value ?? null;
}

function mapRoomRow(roomRow, playerRows) {
  return {
    code: roomRow.code,
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

const PASS_THRESHOLD = 6;

function createQuizResultId(room, player) {
  return `${room.code}-${player.name}-${room.createdAt}`;
}

function calculateQuizAccuracy(player) {
  if (!player.answeredQuestions) {
    return 0;
  }

  return Math.round((player.correctAnswers / player.answeredQuestions) * 100);
}

async function saveQuizResults(client, room) {
  if (!room?.questions?.length || room.currentQuestionIndex < room.questions.length || !room.started) {
    return;
  }

  const totalQuestions = room.questions.length;
  for (const player of room.players) {
    const correctAnswers = player.correctAnswers ?? 0;
    const answeredQuestions = player.answeredQuestions ?? 0;
    const wrongAnswers = Math.max(0, answeredQuestions - correctAnswers);
    const resultId = createQuizResultId(room, player);
    const accuracy = calculateQuizAccuracy(player);

    await client.query(
      `
        INSERT INTO quiz_results (
          id, room_code, quiz_id, player_name, score, accuracy,
          correct_answers, wrong_answers, total_questions, streak,
          violations, ended_by, created_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
        ON CONFLICT (id) DO UPDATE SET
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
        player.name,
        player.score ?? 0,
        accuracy,
        correctAnswers,
        wrongAnswers,
        totalQuestions,
        0,
        player.violations ?? 0,
        "completed",
        Date.now()
      ]
    );
  }
}

export async function saveRoom(room) {
  const normalizedCode = String(room.code ?? "").toUpperCase();
  room.code = normalizedCode;
  roomStore.set(normalizedCode, room);

  if (!hasDatabase()) {
    return;
  }

  await withTransaction(async (client) => {
    await client.query(
      `
        INSERT INTO live_rooms (
          code, host_name, host_token, host_socket_id, mode, quiz_id, quiz_title,
          question_time, questions_json, current_question_index, question_phase,
          question_started_at, question_deadline_at, started, created_at
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9::jsonb, $10, $11, $12, $13, $14, $15)
        ON CONFLICT (code) DO UPDATE SET
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
            room_code, name, socket_id, score, correct_answers, answered_questions,
            total_response_time_ms, answered_current, violations, current_question_index,
            question_started_at, completed
          )
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12);
        `,
        [
          room.code,
          player.name,
          player.socketId,
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

export async function getTopLivePlayers(limit = 4) {
  if (!hasDatabase()) {
    return [];
  }

  const liveResult = await query(
    `SELECT room_code, name, score, correct_answers, answered_questions
     FROM live_room_players
     ORDER BY score DESC, correct_answers DESC, total_response_time_ms ASC
     LIMIT $1`,
    [limit]
  );

  if (liveResult.rows.length) {
    return liveResult.rows.map((player) => ({
      id: `${player.room_code}-${player.name}`,
      roomCode: player.room_code,
      name: player.name,
      score: player.score,
      accuracy:
        player.answered_questions > 0
          ? Math.round((player.correct_answers / player.answered_questions) * 100)
          : 0
    }));
  }

  const result = await query(
    `SELECT player_name, score, correct_answers, total_questions, created_at
     FROM quiz_results
     ORDER BY score DESC, correct_answers DESC, total_questions DESC
     LIMIT $1`,
    [limit]
  );

  return result.rows.map((player, index) => ({
    id: `result-${player.player_name}-${player.created_at}-${index}`,
    name: player.player_name,
    score: player.score,
    accuracy:
      player.total_questions > 0
        ? Math.round((player.correct_answers / player.total_questions) * 100)
        : 0
  }));
}

export async function getRoomSessionStats() {
  if (!hasDatabase()) {
    return [];
  }

  const activeResult = await query(
    `SELECT p.room_code, r.quiz_title, r.mode, r.created_at,
            p.name, p.score, p.correct_answers, p.answered_questions,
            p.total_response_time_ms, p.violations, p.current_question_index,
            p.completed
     FROM live_room_players p
     JOIN live_rooms r ON r.code = p.room_code
     ORDER BY r.created_at DESC, p.score DESC, p.name ASC`);

  const sessions = new Map();

  for (const row of activeResult.rows) {
    const sessionKey = `${row.room_code}-${row.created_at}`;
    if (!sessions.has(sessionKey)) {
      sessions.set(sessionKey, {
        id: sessionKey,
        roomCode: row.room_code,
        quizTitle: row.quiz_title,
        mode: row.mode,
        createdAt: Number(row.created_at),
        totalStudents: 0,
        passedStudents: 0,
        details: []
      });
    }

    const session = sessions.get(sessionKey);
    const passed = (row.correct_answers ?? 0) >= PASS_THRESHOLD;
    session.totalStudents += 1;
    if (passed) {
      session.passedStudents += 1;
    }

    session.details.push({
      id: `${sessionKey}-${row.name}`,
      name: row.name,
      score: row.score,
      correctAnswers: row.correct_answers,
      answeredQuestions: row.answered_questions,
      averageResponseTimeSeconds:
        row.answered_questions > 0
          ? Number((row.total_response_time_ms / row.answered_questions / 1000).toFixed(2))
          : 0,
      violations: row.violations,
      currentQuestionIndex: row.current_question_index,
      completed: row.completed,
      passed
    });
  }

  const historyResult = await query(
    `SELECT qr.room_code,
            COALESCE(q.title, qr.quiz_id) AS quiz_title,
            qr.player_name,
            qr.score,
            qr.correct_answers,
            qr.wrong_answers,
            qr.total_questions,
            qr.accuracy,
            qr.violations,
            qr.created_at
     FROM quiz_results qr
     LEFT JOIN quizzes q ON q.id = qr.quiz_id
     ORDER BY qr.created_at DESC, qr.room_code ASC, qr.player_name ASC`);

  for (const row of historyResult.rows) {
    const sessionKey = `${row.room_code}-${row.created_at}`;
    if (!sessions.has(sessionKey)) {
      sessions.set(sessionKey, {
        id: sessionKey,
        roomCode: row.room_code,
        quizTitle: row.quiz_title,
        mode: null,
        createdAt: Number(row.created_at),
        totalStudents: 0,
        passedStudents: 0,
        details: []
      });
    }

    const session = sessions.get(sessionKey);
    const passed = (row.correct_answers ?? 0) >= PASS_THRESHOLD;
    session.totalStudents += 1;
    if (passed) {
      session.passedStudents += 1;
    }

    session.details.push({
      id: `${sessionKey}-${row.player_name}`,
      name: row.player_name,
      score: row.score,
      correctAnswers: row.correct_answers,
      answeredQuestions: row.total_questions,
      averageResponseTimeSeconds: 0,
      violations: row.violations,
      currentQuestionIndex: null,
      completed: true,
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
