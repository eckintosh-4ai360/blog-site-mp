import { NextResponse } from "next/server";
import { query } from "@/lib/db";

export async function GET() {
  try {
    const result = await query("SELECT * FROM media_items ORDER BY id ASC");
    const media = result.rows.map((row) => ({
      label: row.label,
      count: row.count,
    }));
    return NextResponse.json(media);
  } catch (error) {
    console.error("GET /api/media error:", error);
    return NextResponse.json({ error: "Failed to fetch media items" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const items = await req.json();
    if (!Array.isArray(items)) {
      return NextResponse.json({ error: "Invalid parameters" }, { status: 400 });
    }

    // Upsert media items
    for (const item of items) {
      await query(
        `INSERT INTO media_items (label, count) 
         VALUES ($1, $2) 
         ON CONFLICT (label) DO UPDATE SET count = EXCLUDED.count`,
        [item.label, item.count]
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("POST /api/media error:", error);
    return NextResponse.json({ error: "Failed to save media items" }, { status: 500 });
  }
}
