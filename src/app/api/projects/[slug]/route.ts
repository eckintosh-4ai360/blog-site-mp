import { NextResponse } from "next/server";
import { query } from "@/lib/db";

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

export async function GET(
  req: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const result = await query("SELECT * FROM projects WHERE slug = $1", [slug]);

    if (result.rows.length === 0) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    return NextResponse.json(mapRowToProject(result.rows[0]));
  } catch (error) {
    console.error("GET /api/projects/[slug] error:", error);
    return NextResponse.json({ error: "Failed to fetch project" }, { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const result = await query("DELETE FROM projects WHERE slug = $1 RETURNING slug", [slug]);

    if (result.rows.length === 0) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: `Project ${slug} deleted` });
  } catch (error) {
    console.error("DELETE /api/projects/[slug] error:", error);
    return NextResponse.json({ error: "Failed to delete project" }, { status: 500 });
  }
}
