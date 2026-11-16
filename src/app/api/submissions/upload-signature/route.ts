import { NextResponse } from "next/server";
import { CITIZEN_MEDIA_FOLDER, cloudinary } from "@/lib/citizen-media";

export const runtime = "nodejs";

export async function POST() {
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;
  if (!cloudName || !apiKey || !apiSecret) {
    return NextResponse.json({ error: "Media uploads are unavailable right now." }, { status: 503 });
  }
  const timestamp = Math.floor(Date.now() / 1000);
  const folder = CITIZEN_MEDIA_FOLDER;
  const allowedFormats = "jpg,jpeg,png,webp,gif,mp4,webm,mov,ogg,m4a,mp3,aac";
  const signature = cloudinary.utils.api_sign_request({ timestamp, folder, allowed_formats: allowedFormats }, apiSecret);
  return NextResponse.json({ cloudName, apiKey, timestamp, folder, allowedFormats, signature }, { headers: { "Cache-Control": "no-store" } });
}
