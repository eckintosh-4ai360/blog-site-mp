import { neon, type NeonQueryFunction } from "@neondatabase/serverless";

let sql: NeonQueryFunction<false, true> | undefined;

function getSql() {
  if (!sql) {
    const connectionString = process.env.DATABASE_URL;
    if (!connectionString) throw new Error("DATABASE_URL is not defined in environment variables.");
    sql = neon(connectionString, { fullResults: true });
  }
  return sql;
}

export async function query(text: string, params?: any[]) {
  const start = Date.now();
  try {
    const res = await getSql().query(text, params);
    const duration = Date.now() - start;
    console.log("Executed query:", { text, duration, rows: res.rowCount });
    return res;
  } catch (error) {
    console.error("Database query error:", { text, error });
    throw error;
  }
}
