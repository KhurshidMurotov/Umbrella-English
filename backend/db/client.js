import { Pool } from "pg";

let pool;

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
      ssl: shouldUseSsl(connectionString) ? { rejectUnauthorized: false } : false
    });

    pool.on("error", (error) => {
      console.error("PostgreSQL pool error:", error.message);
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
