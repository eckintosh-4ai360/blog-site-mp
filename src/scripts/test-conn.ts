import { query } from "../lib/db";

async function test() {
  try {
    const res = await query("SELECT COUNT(*) FROM projects");
    console.log("SUCCESS! Connection works. Projects count in database:", res.rows[0].count);
  } catch (err) {
    console.error("Connection failed:", err);
  }
}

test();
