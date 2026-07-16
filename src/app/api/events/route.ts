import { NextResponse } from "next/server";
import { query } from "@/lib/db";

export async function GET() {
  try {
    const result = await query("SELECT * FROM events ORDER BY id ASC");
    const events = result.rows.map((row) => ({
      title: row.title,
      date: row.date,
      location: row.location,
      type: row.type,
    }));
    return NextResponse.json(events);
  } catch (error) {
    console.error("GET /api/events error:", error);
    return NextResponse.json({ error: "Failed to fetch events" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const items = await req.json();
    if (!Array.isArray(items)) {
      return NextResponse.json({ error: "Invalid parameters" }, { status: 400 });
    }

    // Safe targeted delete
    const existing = await query("SELECT id FROM events");
    const ids = existing.rows.map((r) => r.id);
    if (ids.length > 0) {
      await query("DELETE FROM events WHERE id = ANY($1::int[])", [ids]);
    }

    // Insert new events
    for (const item of items) {
      await query(
        "INSERT INTO events (title, date, location, type) VALUES ($1, $2, $3, $4)",
        [item.title, item.date, item.location, item.type]
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("POST /api/events error:", error);
    return NextResponse.json({ error: "Failed to save events" }, { status: 500 });
  }
}
