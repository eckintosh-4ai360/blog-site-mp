import { NextResponse } from "next/server";
import { query } from "@/lib/db";
import { ensureSubmissionsTable } from "@/lib/ensure-submissions-table";

export async function GET(request: Request) {
  const reference = new URL(request.url).searchParams.get("reference")?.trim().toUpperCase() ?? "";
  const match = /^TN-(\d{6,15})$/.exec(reference);
  if (!match) {
    return NextResponse.json({ error: "Enter a valid reference, such as TN-000123." }, { status: 400 });
  }

  try {
    await ensureSubmissionsTable();
    const result = await query("SELECT status FROM citizen_submissions WHERE id = $1 LIMIT 1", [match[1]]);
    if (!result.rows.length) {
      return NextResponse.json({ error: "No submission was found for that reference. Check the number and try again." }, { status: 404, headers: { "Cache-Control": "no-store" } });
    }
    return NextResponse.json({ reference, status: result.rows[0].status }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    console.error("GET /api/submissions/track error:", error);
    return NextResponse.json({ error: "Could not check the status right now. Please try again." }, { status: 500 });
  }
}
