import { query } from "@/lib/db";
import ProjectPageClient from "@/components/portal/project-page-client";

type ProjectPageProps = {
  params: Promise<{ slug: string }>;
};

export const dynamic = "force-dynamic";

async function getProjectFromDb(slug: string) {
  try {
    const result = await query("SELECT * FROM projects WHERE slug = $1", [slug]);
    if (result.rows.length === 0) return undefined;
    const row = result.rows[0];
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
  } catch (error) {
    console.error("Error loading project in server component:", error);
    return undefined;
  }
}

export async function generateMetadata({ params }: ProjectPageProps) {
  const { slug } = await params;
  const project = await getProjectFromDb(slug);

  if (!project) {
    return {
      title: "Project Detail | MP Project Portal",
    };
  }

  return {
    title: `${project.title} | MP Project Portal`,
    description: project.description,
  };
}

export default async function ProjectPage({ params }: ProjectPageProps) {
  const { slug } = await params;
  const project = await getProjectFromDb(slug);

  return <ProjectPageClient initialProject={project} slug={slug} />;
}
