import { NextResponse } from "next/server";
import { query } from "@/lib/db";
import { hasAdminSession } from "@/lib/admin-session";
import { CITIZEN_MEDIA_FOLDER, cloudinary } from "@/lib/citizen-media";
import { submissionTypes, type SubmissionAttachment } from "@/lib/submissions";

export const runtime = "nodejs";

type UploadReference = { publicId: string; type: "image" | "video"; name: string };

function field(value: unknown, max: number) {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  return trimmed && trimmed.length <= max ? trimmed : null;
}

async function verifiedAttachments(value: unknown): Promise<SubmissionAttachment[]> {
  if (!Array.isArray(value) || value.length > 4) throw new Error("Invalid attachments");
  const references = value as UploadReference[];
  if (references.filter((item) => item?.type === "image").length > 3 || references.filter((item) => item?.type === "video").length > 1) throw new Error("Too many attachments");

  const attachments: SubmissionAttachment[] = [];
  for (const item of references) {
    if (!item || !["image", "video"].includes(item.type) || typeof item.publicId !== "string" || !item.publicId.startsWith(`${CITIZEN_MEDIA_FOLDER}/`) || item.publicId.length > 250 || typeof item.name !== "string" || item.name.length > 120) throw new Error("Invalid attachment");
    const resource = await cloudinary.api.resource(item.publicId, { resource_type: item.type });
    const maxBytes = item.type === "image" ? 3 * 1024 * 1024 : 10 * 1024 * 1024;
    if (resource.bytes > maxBytes || !resource.secure_url || resource.resource_type !== item.type || !resource.public_id.startsWith(`${CITIZEN_MEDIA_FOLDER}/`)) throw new Error("Attachment is too large or invalid");
    attachments.push({ type: item.type, url: resource.secure_url, name: item.name });
  }
  return attachments;
}

export async function POST(request: Request) {
  if (Number(request.headers.get("content-length") ?? 0) > 16_000) return NextResponse.json({ error: "Submission is too large." }, { status: 413 });
  const body = await request.json().catch(() => null);
  if (body?.website) return NextResponse.json({ success: true });
  const type = field(body?.type, 20);
  const name = field(body?.name, 120);
  const contact = field(body?.contact, 160);
  const community = typeof body?.community === "string" ? body.community.trim() : "";
  const message = field(body?.message, 4000);
  if (!type || !submissionTypes.includes(type as typeof submissionTypes[number]) || !name || !contact || !message || community.length > 120) {
    return NextResponse.json({ error: "Please complete all required fields with valid information." }, { status: 400 });
  }

  let attachments: SubmissionAttachment[];
  try {
    attachments = await verifiedAttachments(body?.attachments ?? []);
  } catch (error) {
    console.error("Attachment verification failed:", error);
    return NextResponse.json({ error: "Could not verify an attachment. Please choose it again." }, { status: 400 });
  }

  try {
    const result = await query(
      `INSERT INTO citizen_submissions (type, name, contact, community, message, attachments)
       VALUES ($1, $2, $3, $4, $5, $6::jsonb) RETURNING id`,
      [type, name, contact, community, message, JSON.stringify(attachments)],
    );
    return NextResponse.json({ success: true, reference: `TN-${String(result.rows[0].id).padStart(6, "0")}` }, { status: 201 });
  } catch (error) {
    console.error("POST /api/submissions error:", error);
    return NextResponse.json({ error: "We could not send your submission. Please try again." }, { status: 500 });
  }
}

export async function GET() {
  if (!(await hasAdminSession())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try {
    const result = await query("SELECT id, type, name, contact, community, message, attachments, status, created_at FROM citizen_submissions ORDER BY created_at DESC, id DESC");
    return NextResponse.json(result.rows, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    console.error("GET /api/submissions error:", error);
    return NextResponse.json({ error: "Could not load submissions." }, { status: 500 });
  }
}
