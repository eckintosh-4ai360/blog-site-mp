import { NextResponse } from "next/server";
import { query } from "@/lib/db";
import { uploadToCloudinary } from "@/lib/cloudinary-helper";

export async function GET() {
  try {
    const result = await query("SELECT * FROM testimonials ORDER BY id ASC");
    const testimonials = result.rows.map((row) => ({
      name: row.name,
      role: row.role,
      image: row.image,
      quote: row.quote,
    }));
    return NextResponse.json(testimonials);
  } catch (error) {
    console.error("GET /api/testimonials error:", error);
    return NextResponse.json({ error: "Failed to fetch testimonials" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const items = await req.json();
    if (!Array.isArray(items)) {
      return NextResponse.json({ error: "Invalid parameters" }, { status: 400 });
    }

    // Process images in testimonials
    const processed = await Promise.all(
      items.map(async (item: any) => {
        if (item.image?.startsWith("data:image")) {
          const imgUrl = await uploadToCloudinary(item.image, "testimonials");
          return { ...item, image: imgUrl };
        }
        return item;
      })
    );

    // Safe targeted delete
    const existing = await query("SELECT id FROM testimonials");
    const ids = existing.rows.map((r) => r.id);
    if (ids.length > 0) {
      await query("DELETE FROM testimonials WHERE id = ANY($1::int[])", [ids]);
    }

    // Insert new testimonials
    for (const item of processed) {
      await query(
        "INSERT INTO testimonials (name, role, image, quote) VALUES ($1, $2, $3, $4)",
        [item.name, item.role, item.image, item.quote]
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("POST /api/testimonials error:", error);
    return NextResponse.json({ error: "Failed to save testimonials" }, { status: 500 });
  }
}
