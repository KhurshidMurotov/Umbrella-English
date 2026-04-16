import { quizzes } from "../data/quizStore.js";
import { hasDatabase, query, withTransaction } from "./client.js";

async function createTables() {
  await query(`
    CREATE TABLE IF NOT EXISTS quizzes (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      description TEXT,
      difficulty TEXT,
      estimated_time TEXT,
      created_at BIGINT NOT NULL
    );
  `);

  await query(`
    CREATE TABLE IF NOT EXISTS quiz_questions (
      id TEXT PRIMARY KEY,
      quiz_id TEXT NOT NULL REFERENCES quizzes(id) ON DELETE CASCADE,
      prompt TEXT NOT NULL,
      options_json JSONB NOT NULL,
      correct_answer TEXT NOT NULL,
      position INTEGER NOT NULL,
      UNIQUE (quiz_id, position)
    );
  `);

  await query(`
    CREATE TABLE IF NOT EXISTS live_rooms (
      code TEXT PRIMARY KEY,
      session_id TEXT UNIQUE,
      host_name TEXT NOT NULL,
      host_token TEXT NOT NULL,
      host_socket_id TEXT,
      mode TEXT NOT NULL,
      quiz_id TEXT NOT NULL,
      quiz_title TEXT NOT NULL,
      question_time INTEGER NOT NULL,
      questions_json JSONB NOT NULL,
      current_question_index INTEGER NOT NULL,
      question_phase TEXT NOT NULL,
      question_started_at BIGINT,
      question_deadline_at BIGINT,
      started BOOLEAN NOT NULL DEFAULT FALSE,
      created_at BIGINT NOT NULL
    );
  `);

  await query(`
    CREATE TABLE IF NOT EXISTS live_room_players (
      room_code TEXT NOT NULL REFERENCES live_rooms(code) ON DELETE CASCADE,
      name TEXT NOT NULL,
      socket_id TEXT,
      connected BOOLEAN NOT NULL DEFAULT TRUE,
      disqualified BOOLEAN NOT NULL DEFAULT FALSE,
      joined_at BIGINT,
      disconnected_at BIGINT,
      score INTEGER NOT NULL DEFAULT 0,
      correct_answers INTEGER NOT NULL DEFAULT 0,
      answered_questions INTEGER NOT NULL DEFAULT 0,
      total_response_time_ms INTEGER NOT NULL DEFAULT 0,
      answered_current BOOLEAN NOT NULL DEFAULT FALSE,
      violations INTEGER NOT NULL DEFAULT 0,
      current_question_index INTEGER NOT NULL DEFAULT 0,
      question_started_at BIGINT,
      completed BOOLEAN NOT NULL DEFAULT FALSE,
      PRIMARY KEY (room_code, name)
    );
  `);

  await query(`
    CREATE TABLE IF NOT EXISTS game_sessions (
      id TEXT PRIMARY KEY,
      room_code TEXT NOT NULL,
      quiz_id TEXT,
      quiz_title TEXT,
      mode TEXT,
      question_time INTEGER NOT NULL,
      total_questions INTEGER NOT NULL DEFAULT 0,
      started BOOLEAN NOT NULL DEFAULT FALSE,
      completed BOOLEAN NOT NULL DEFAULT FALSE,
      created_at BIGINT NOT NULL,
      completed_at BIGINT
    );
  `);

  await query(`
    CREATE TABLE IF NOT EXISTS game_session_players (
      session_id TEXT NOT NULL REFERENCES game_sessions(id) ON DELETE CASCADE,
      name TEXT NOT NULL,
      connected BOOLEAN NOT NULL DEFAULT FALSE,
      disqualified BOOLEAN NOT NULL DEFAULT FALSE,
      joined_at BIGINT,
      disconnected_at BIGINT,
      score INTEGER NOT NULL DEFAULT 0,
      correct_answers INTEGER NOT NULL DEFAULT 0,
      answered_questions INTEGER NOT NULL DEFAULT 0,
      total_response_time_ms INTEGER NOT NULL DEFAULT 0,
      violations INTEGER NOT NULL DEFAULT 0,
      current_question_index INTEGER NOT NULL DEFAULT 0,
      completed BOOLEAN NOT NULL DEFAULT FALSE,
      PRIMARY KEY (session_id, name)
    );
  `);

  await query(`
    CREATE TABLE IF NOT EXISTS quiz_results (
      id TEXT PRIMARY KEY,
      room_code TEXT,
      quiz_id TEXT,
      player_name TEXT,
      score INTEGER NOT NULL,
      accuracy INTEGER NOT NULL,
      correct_answers INTEGER NOT NULL,
      wrong_answers INTEGER NOT NULL,
      total_questions INTEGER NOT NULL,
      streak INTEGER NOT NULL DEFAULT 0,
      violations INTEGER NOT NULL DEFAULT 0,
      ended_by TEXT,
      created_at BIGINT NOT NULL
    );
  `);

  await query(`ALTER TABLE quiz_results ADD COLUMN IF NOT EXISTS room_code TEXT;`);
  await query(`ALTER TABLE quiz_results ADD COLUMN IF NOT EXISTS quiz_id TEXT;`);
  await query(`ALTER TABLE quiz_results ADD COLUMN IF NOT EXISTS quiz_title TEXT;`);
  await query(`ALTER TABLE live_rooms ADD COLUMN IF NOT EXISTS session_id TEXT;`);
  await query(`ALTER TABLE live_room_players ADD COLUMN IF NOT EXISTS connected BOOLEAN NOT NULL DEFAULT TRUE;`);
  await query(`ALTER TABLE live_room_players ADD COLUMN IF NOT EXISTS disqualified BOOLEAN NOT NULL DEFAULT FALSE;`);
  await query(`ALTER TABLE live_room_players ADD COLUMN IF NOT EXISTS joined_at BIGINT;`);
  await query(`ALTER TABLE live_room_players ADD COLUMN IF NOT EXISTS disconnected_at BIGINT;`);
  await query(`ALTER TABLE game_session_players ADD COLUMN IF NOT EXISTS disqualified BOOLEAN NOT NULL DEFAULT FALSE;`);
}

async function seedQuizzes() {
  await withTransaction(async (client) => {
    for (const quiz of quizzes) {
      await client.query(
        `
          INSERT INTO quizzes (id, title, description, difficulty, estimated_time, created_at)
          VALUES ($1, $2, $3, $4, $5, $6)
          ON CONFLICT (id) DO UPDATE SET
            title = EXCLUDED.title,
            description = EXCLUDED.description,
            difficulty = EXCLUDED.difficulty,
            estimated_time = EXCLUDED.estimated_time;
        `,
        [
          quiz.id,
          quiz.title,
          quiz.description ?? "",
          quiz.difficulty ?? "",
          quiz.estimatedTime ?? "",
          Date.now()
        ]
      );

      await client.query("DELETE FROM quiz_questions WHERE quiz_id = $1", [quiz.id]);

      for (const [index, question] of quiz.questions.entries()) {
        await client.query(
          `
            INSERT INTO quiz_questions (id, quiz_id, prompt, options_json, correct_answer, position)
            VALUES ($1, $2, $3, $4::jsonb, $5, $6)
            ON CONFLICT (id) DO UPDATE SET
              prompt = EXCLUDED.prompt,
              options_json = EXCLUDED.options_json,
              correct_answer = EXCLUDED.correct_answer,
              position = EXCLUDED.position;
          `,
          [
            question.id,
            quiz.id,
            question.prompt,
            JSON.stringify(question.options),
            question.correctAnswer,
            index
          ]
        );
      }
    }
  });
}

export async function initializeDatabase() {
  if (!hasDatabase()) {
    console.warn("DATABASE_URL is not set. Backend will use in-memory data only.");
    return { enabled: false };
  }

  await createTables();
  await seedQuizzes();
  console.log("PostgreSQL schema is ready.");
  return { enabled: true };
}
