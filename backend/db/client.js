import { Pool } from "pg";

let pool;

export function isDatabaseConnectionError(error) {
  const message = String(error?.message ?? "").toLowerCase();
  const code = String(error?.code ?? "").toUpperCase();

  return (
    message.includes("timeout exceeded when trying to connect") ||
    message.includes("connection terminated unexpectedly") ||
    message.includes("connection refused") ||
    message.includes("connect etimedout") ||
    message.includes("connect econnrefused") ||
    message.includes("getaddrinfo enotfound") ||
    ["ETIMEDOUT", "ECONNREFUSED", "ECONNRESET", "ENOTFOUND", "57P01"].includes(code)
  );
}

function shouldUseSsl(connectionString) {
  if (process.env.PGSSLMODE === "disable" || process.env.DATABASE_SSL === "false") {
    return false;
  }

  return !/localhost|127\.0\.0\.1/i.test(connectionString);
}

export function hasDatabase() {
  return Boolean(process.env.DATABASE_URL);
}

export function getPool() {
  if (!hasDatabase()) {
    return null;
  }

  if (!pool) {
    const connectionString = process.env.DATABASE_URL;
    pool = new Pool({
      connectionString,
      ssl: shouldUseSsl(connectionString) ? { rejectUnauthorized: false } : false,
      max: 20,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 10000
    });

    pool.on("error", (error) => {
      console.error("PostgreSQL pool error:", error.message, error.stack);
    });
  }

  return pool;
}

export async function query(text, params = []) {
  const activePool = getPool();
  if (!activePool) {
    throw new Error("DATABASE_URL is not configured.");
  }

  return activePool.query(text, params);
}

export async function withTransaction(callback) {
  const activePool = getPool();
  if (!activePool) {
    throw new Error("DATABASE_URL is not configured.");
  }

  const client = await activePool.connect();
  try {
    await client.query("BEGIN");
    const result = await callback(client);
    await client.query("COMMIT");
    return result;
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}
