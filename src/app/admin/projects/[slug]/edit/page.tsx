"use client";

import { useEffect, useState } from "react";
import { useParams, notFound } from "next/navigation";
import AdminShell from "@/components/admin/AdminShell";
import ProjectForm from "@/components/admin/ProjectForm";
import { getAdminProject } from "@/lib/admin-data";
import type { Project } from "@/lib/portal-data";

export default function EditProjectPage() {
  const params = useParams<{ slug: string }>();
  const [project, setProject] = useState<Project | null | undefined>(undefined);

  useEffect(() => {
    const found = getAdminProject(params.slug);
    setProject(found ?? null);
  }, [params.slug]);

  if (project === undefined) {
    return (
      <AdminShell>
        <div className="flex h-64 items-center justify-center text-sm text-[var(--muted)]">
          Loading project…
        </div>
      </AdminShell>
    );
  }

  if (project === null) {
    // Project not found — trigger Next.js 404
    notFound();
  }

  return (
    <AdminShell>
      <ProjectForm mode="edit" initial={project} />
    </AdminShell>
  );
}
