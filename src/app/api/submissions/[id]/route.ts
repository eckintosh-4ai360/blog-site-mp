import { NextResponse } from "next/server";
import { query } from "@/lib/db";
import { ensureSubmissionsTable } from "@/lib/ensure-submissions-table";
import { hasAdminSession } from "@/lib/admin-session";

export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }) {
  if (!(await hasAdminSession())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await context.params;
  const body = await request.json().catch(() => null);
  if (!/^\d+$/.test(id) || !["new", "in_review", "resolved"].includes(body?.status)) {
    return NextResponse.json({ error: "Invalid status." }, { status: 400 });
  }
  try {
    await ensureSubmissionsTable();
    const result = await query("UPDATE citizen_submissions SET status = $1 WHERE id = $2 RETURNING id", [body.status, id]);
    if (!result.rowCount) return NextResponse.json({ error: "Submission not found." }, { status: 404 });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("PATCH /api/submissions error:", error);
    return NextResponse.json({ error: "Could not update status." }, { status: 500 });
  }
}
