import { NextResponse } from "next/server";
import { query } from "@/lib/db";
import { uploadToCloudinary } from "@/lib/cloudinary-helper";

export async function GET() {
  try {
    const result = await query("SELECT * FROM news ORDER BY id ASC");
    const news = result.rows.map((row) => ({
      title: row.title,
      category: row.category,
      date: row.date,
      readTime: row.read_time,
      image: row.image,
      excerpt: row.excerpt,
    }));
    return NextResponse.json(news);
  } catch (error) {
    console.error("GET /api/news error:", error);
    return NextResponse.json({ error: "Failed to fetch news" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const items = await req.json();
    if (!Array.isArray(items)) {
      return NextResponse.json({ error: "Invalid parameters" }, { status: 400 });
    }

    // Process image uploads
    const processed = await Promise.all(
      items.map(async (item: any) => {
        if (item.image?.startsWith("data:image")) {
          const imgUrl = await uploadToCloudinary(item.image, "news");
          return { ...item, image: imgUrl };
        }
        return item;
      })
    );

    // Fetch and delete existing news by ID to avoid untargeted DELETE
    const existing = await query("SELECT id FROM news");
    const ids = existing.rows.map((r) => r.id);
    if (ids.length > 0) {
      await query("DELETE FROM news WHERE id = ANY($1::int[])", [ids]);
    }

    // Insert new items
    for (const item of processed) {
      await query(
        `INSERT INTO news (title, category, date, read_time, image, excerpt) 
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [item.title, item.category, item.date, item.readTime, item.image, item.excerpt]
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("POST /api/news error:", error);
    return NextResponse.json({ error: "Failed to save news" }, { status: 500 });
  }
}
