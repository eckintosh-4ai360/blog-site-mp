import { getProject, projects } from "@/lib/portal-data";
import ProjectPageClient from "@/components/portal/project-page-client";

type ProjectPageProps = {
  params: Promise<{ slug: string }>;
};

export function generateStaticParams() {
  return projects.map((project) => ({ slug: project.slug }));
}

export async function generateMetadata({ params }: ProjectPageProps) {
  const { slug } = await params;
  const project = getProject(slug);

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
  const project = getProject(slug);

  return <ProjectPageClient initialProject={project} slug={slug} />;
}
