import { Pool, neonConfig } from "@neondatabase/serverless";
import ws from "ws";

// Set the WebSocket constructor for local Node.js environments
neonConfig.webSocketConstructor = ws;

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("DATABASE_URL is not defined in environment variables.");
}

export const pool = new Pool({
  connectionString,
  ssl: true,
});

export async function query(text: string, params?: any[]) {
  const start = Date.now();
  try {
    const res = await pool.query(text, params);
    const duration = Date.now() - start;
    console.log("Executed query:", { text, duration, rows: res.rowCount });
    return res;
  } catch (error) {
    console.error("Database query error:", { text, error });
    throw error;
  }
}
