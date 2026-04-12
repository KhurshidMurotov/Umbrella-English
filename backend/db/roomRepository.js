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

export async function saveRoom(room) {
  roomStore.set(room.code, room);

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

export async function removeRoom(code) {
  roomStore.delete(code);

  if (!hasDatabase()) {
    return;
  }

  await query("DELETE FROM live_rooms WHERE code = $1", [code]);
}
