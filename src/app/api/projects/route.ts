import { NextResponse } from "next/server";
import { query } from "@/lib/db";
import { uploadToCloudinary } from "@/lib/cloudinary-helper";

// Map database row to Project type
function mapRowToProject(row: any) {
  return {
    slug: row.slug,
    title: row.title,
    category: row.category,
    status: row.status,
    community: row.community,
    budget: Number(row.budget),
    budgetLabel: row.budget_label,
    year: row.year,
    progress: Number(row.progress),
    image: row.image,
    beforeImage: row.before_image,
    afterImage: row.after_image,
    contractor: row.contractor,
    fundingSource: row.funding_source,
    startDate: row.start_date,
    expectedCompletion: row.expected_completion,
    completionDate: row.completion_date || undefined,
    description: row.description,
    story: row.story,
    objectives: row.objectives || [],
    challenges: row.challenges || [],
    outcomes: row.outcomes || [],
    timeline: row.timeline || [],
    updates: row.updates || [],
    gallery: row.gallery || [],
    map: row.map || { lat: 5.6037, lng: -0.187, x: 50, y: 50 },
  };
}

export async function GET() {
  try {
    const result = await query("SELECT * FROM projects ORDER BY year DESC, title ASC");
    const projects = result.rows.map(mapRowToProject);
    return NextResponse.json(projects);
  } catch (error) {
    console.error("GET /api/projects error:", error);
    return NextResponse.json({ error: "Failed to fetch projects" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      slug,
      title,
      category,
      status,
      community,
      budget,
      budgetLabel,
      year,
      progress,
      image,
      beforeImage,
      afterImage,
      contractor,
      fundingSource,
      startDate,
      expectedCompletion,
      completionDate,
      description,
      story,
      objectives,
      challenges,
      outcomes,
      timeline,
      updates,
      gallery,
      map,
    } = body;

    if (!title || !slug) {
      return NextResponse.json({ error: "Title and slug are required" }, { status: 400 });
    }

    // 1. Upload base64 images to Cloudinary on the server
    const [uploadedImage, uploadedBefore, uploadedAfter] = await Promise.all([
      uploadToCloudinary(image, "projects"),
      uploadToCloudinary(beforeImage, "projects"),
      uploadToCloudinary(afterImage, "projects"),
    ]);

    // 2. Upload gallery images if any are base64
    const processedGallery = gallery ? await Promise.all(
      gallery.map(async (item: any) => {
        if (item.image?.startsWith("data:image")) {
          const imgUrl = await uploadToCloudinary(item.image, "projects/gallery");
          return { ...item, image: imgUrl };
        }
        return item;
      })
    ) : [];

    // 3. Upsert the project row in the Neon database
    await query(
      `INSERT INTO projects (
        slug, title, category, status, community, budget, budget_label, year, progress,
        image, before_image, after_image, contractor, funding_source, start_date,
        expected_completion, completion_date, description, story, objectives,
        challenges, outcomes, timeline, updates, gallery, map
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23, $24, $25, $26)
      ON CONFLICT (slug) DO UPDATE SET
        title = EXCLUDED.title,
        category = EXCLUDED.category,
        status = EXCLUDED.status,
        community = EXCLUDED.community,
        budget = EXCLUDED.budget,
        budget_label = EXCLUDED.budget_label,
        year = EXCLUDED.year,
        progress = EXCLUDED.progress,
        image = EXCLUDED.image,
        before_image = EXCLUDED.before_image,
        after_image = EXCLUDED.after_image,
        contractor = EXCLUDED.contractor,
        funding_source = EXCLUDED.funding_source,
        start_date = EXCLUDED.start_date,
        expected_completion = EXCLUDED.expected_completion,
        completion_date = EXCLUDED.completion_date,
        description = EXCLUDED.description,
        story = EXCLUDED.story,
        objectives = EXCLUDED.objectives,
        challenges = EXCLUDED.challenges,
        outcomes = EXCLUDED.outcomes,
        timeline = EXCLUDED.timeline,
        updates = EXCLUDED.updates,
        gallery = EXCLUDED.gallery,
        map = EXCLUDED.map`,
      [
        slug,
        title,
        category,
        status,
        community,
        budget,
        budgetLabel || `GHS ${(budget / 1_000_000).toFixed(1)}M`,
        year,
        progress,
        uploadedImage,
        uploadedBefore,
        uploadedAfter,
        contractor,
        fundingSource,
        startDate,
        expectedCompletion,
        completionDate || null,
        description,
        story,
        JSON.stringify(objectives || []),
        JSON.stringify(challenges || []),
        JSON.stringify(outcomes || []),
        JSON.stringify(timeline || []),
        JSON.stringify(updates || []),
        JSON.stringify(processedGallery),
        JSON.stringify(map || { lat: 5.6037, lng: -0.187, x: 50, y: 50 }),
      ]
    );

    return NextResponse.json({ success: true, slug });
  } catch (error) {
    console.error("POST /api/projects error:", error);
    return NextResponse.json({ error: "Failed to save project" }, { status: 500 });
  }
}
