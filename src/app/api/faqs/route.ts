import { NextResponse } from "next/server";
import { query } from "@/lib/db";

export async function GET() {
  try {
    const result = await query("SELECT * FROM faqs ORDER BY id ASC");
    const faqs = result.rows.map((row) => ({
      question: row.question,
      answer: row.answer,
    }));
    return NextResponse.json(faqs);
  } catch (error) {
    console.error("GET /api/faqs error:", error);
    return NextResponse.json({ error: "Failed to fetch FAQs" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const items = await req.json();
    if (!Array.isArray(items)) {
      return NextResponse.json({ error: "Invalid parameters" }, { status: 400 });
    }

    // Safe targeted delete
    const existing = await query("SELECT id FROM faqs");
    const ids = existing.rows.map((r) => r.id);
    if (ids.length > 0) {
      await query("DELETE FROM faqs WHERE id = ANY($1::int[])", [ids]);
    }

    // Insert new FAQs
    for (const item of items) {
      await query(
        "INSERT INTO faqs (question, answer) VALUES ($1, $2)",
        [item.question, item.answer]
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("POST /api/faqs error:", error);
    return NextResponse.json({ error: "Failed to save FAQs" }, { status: 500 });
  }
}
