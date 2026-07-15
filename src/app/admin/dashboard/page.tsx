"use client";

import { useState, Suspense } from "react";
import Link from "next/link";
import Image from "next/image";
import { useSearchParams } from "next/navigation";
import {
  PlusCircle,
  Pencil,
  Trash2,
  LayoutDashboard,
  FolderOpen,
  CheckCircle2,
  Clock,
  Calendar,
  RotateCcw,
} from "lucide-react";
import AdminShell from "@/components/admin/AdminShell";
import ConfirmDialog from "@/components/admin/ConfirmDialog";
import PageDetailForms from "@/components/admin/PageDetailForms";
import { useAdminData } from "@/lib/admin-data";
import { safeImageSrc } from "@/lib/image-helper";
import type { Project } from "@/lib/portal-data";

// ── Status badge ──────────────────────────────────────────────────────────
function statusClass(status: string) {
  const map: Record<string, string> = {
    Completed: "bg-emerald-500/12 text-emerald-700 border-emerald-500/24",
    Ongoing: "bg-blue-500/12 text-blue-700 border-blue-500/24",
    Planned: "bg-amber-500/14 text-amber-700 border-amber-500/28",
    "On Hold": "bg-red-500/12 text-red-700 border-red-500/24",
    Archived: "bg-slate-500/14 text-slate-600 border-slate-500/26",
  };
  return map[status] ?? "bg-slate-100 text-slate-600";
}

// ── Stat card ─────────────────────────────────────────────────────────────
function StatCard({ label, value, icon: Icon, color }: { label: string; value: number; icon: React.ElementType; color: string }) {
  return (
    <div className="portal-card p-6 flex items-center gap-5">
      <span className={`grid size-12 shrink-0 place-items-center rounded-xl ${color}`}>
        <Icon size={20} />
      </span>
      <div>
        <p className="text-3xl font-black text-[var(--foreground)]">{value}</p>
        <p className="text-xs font-black uppercase tracking-[0.14em] text-[var(--muted)]">{label}</p>
      </div>
    </div>
  );
}

// ── Project row ───────────────────────────────────────────────────────────
function ProjectRow({
  project,
  onDelete,
}: {
  project: Project;
  onDelete: (slug: string) => void;
}) {
  return (
    <tr className="group border-b border-[var(--line)] transition hover:bg-[var(--surface-soft)]">
      <td className="px-5 py-4">
        <div className="flex items-center gap-4">
          <div className="relative size-12 shrink-0 overflow-hidden rounded-lg">
            {project.image ? (
              <Image src={safeImageSrc(project.image)} alt={project.title} fill sizes="48px" className="object-cover" />
            ) : (
              <div className="size-full bg-[var(--surface-soft)]" />
            )}
          </div>
          <div>
            <p className="text-sm font-black text-[var(--foreground)]">{project.title}</p>
            <p className="text-xs text-[var(--muted)]">{project.community} · {project.year}</p>
          </div>
        </div>
      </td>
      <td className="px-5 py-4">
        <span className="text-xs font-semibold text-[var(--muted)]">{project.category}</span>
      </td>
      <td className="px-5 py-4">
        <span
          className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-black ${statusClass(project.status)}`}
        >
          {project.status}
        </span>
      </td>
      <td className="px-5 py-4">
        <div className="flex items-center gap-2">
          <div className="h-1.5 w-24 overflow-hidden rounded-full bg-[var(--line)]">
            <div
              className="h-full rounded-full bg-gradient-to-r from-[var(--primary)] to-[var(--secondary)]"
              style={{ width: `${project.progress}%` }}
            />
          </div>
          <span className="text-xs font-black text-[var(--muted)]">{project.progress}%</span>
        </div>
      </td>
      <td className="px-5 py-4">
        <span className="text-xs font-semibold text-[var(--muted)]">{project.budgetLabel}</span>
      </td>
      <td className="px-5 py-4">
        <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <Link
            href={`/admin/projects/${project.slug}/edit`}
            className="flex items-center gap-1.5 rounded-lg border border-[var(--line)] px-3 py-1.5 text-xs font-black text-[var(--foreground)] hover:bg-[var(--surface-soft)] transition"
          >
            <Pencil size={12} /> Edit
          </Link>
          <Link
            href={`/projects/${project.slug}`}
            target="_blank"
            className="flex items-center gap-1.5 rounded-lg border border-[var(--line)] px-3 py-1.5 text-xs font-black text-[var(--muted)] hover:bg-[var(--surface-soft)] transition"
          >
            View
          </Link>
          <button
            type="button"
            onClick={() => onDelete(project.slug)}
            className="flex items-center gap-1.5 rounded-lg border border-red-200 px-3 py-1.5 text-xs font-black text-[var(--danger)] hover:bg-red-50 transition"
          >
            <Trash2 size={12} /> Delete
          </button>
        </div>
      </td>
    </tr>
  );
}

// ── Inner dashboard (needs useSearchParams, must be in Suspense) ──────────
function DashboardInner() {
  const searchParams = useSearchParams();
  const initialTab = searchParams.get("tab") === "page" ? "page" : "projects";

  const [activeTab, setActiveTab] = useState<"projects" | "page">(initialTab);
  const [deleteSlug, setDeleteSlug] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  const { projects, deleteProject, resetAll } = useAdminData();

  const filtered = projects.filter(
    (p) =>
      p.title.toLowerCase().includes(search.toLowerCase()) ||
      p.community.toLowerCase().includes(search.toLowerCase()) ||
      p.category.toLowerCase().includes(search.toLowerCase())
  );

  const total = projects.length;
  const completed = projects.filter((p) => p.status === "Completed").length;
  const ongoing = projects.filter((p) => p.status === "Ongoing").length;
  const planned = projects.filter((p) => p.status === "Planned").length;

  function confirmDelete(slug: string) {
    setDeleteSlug(slug);
  }

  function doDelete() {
    if (deleteSlug) deleteProject(deleteSlug);
    setDeleteSlug(null);
  }

  const deleteProject_ = projects.find((p) => p.slug === deleteSlug);

  return (
    <>
      <ConfirmDialog
        open={!!deleteSlug}
        title="Delete Project"
        message={`Are you sure you want to delete "${deleteProject_?.title ?? ""}"? This action cannot be undone.`}
        onConfirm={doDelete}
        onCancel={() => setDeleteSlug(null)}
      />

      {/* Page Header */}
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-[var(--foreground)]">Dashboard</h1>
          <p className="mt-1 text-sm text-[var(--muted)]">Manage all projects and page content from here.</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => {
              if (confirm("Reset ALL data to defaults? This cannot be undone.")) resetAll();
            }}
            className="flex items-center gap-2 rounded-xl border border-[var(--line)] px-4 py-2.5 text-xs font-black text-[var(--muted)] hover:bg-[var(--surface-soft)] transition"
          >
            <RotateCcw size={13} /> Reset to Defaults
          </button>
          <Link
            href="/admin/projects/new"
            className="flex items-center gap-2 rounded-xl bg-[var(--primary)] px-5 py-2.5 text-sm font-black text-white hover:opacity-90 transition"
          >
            <PlusCircle size={16} /> New Project
          </Link>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Total Projects" value={total} icon={FolderOpen} color="bg-blue-500/12 text-blue-600" />
        <StatCard label="Completed" value={completed} icon={CheckCircle2} color="bg-emerald-500/12 text-emerald-600" />
        <StatCard label="Ongoing" value={ongoing} icon={Clock} color="bg-amber-500/12 text-amber-600" />
        <StatCard label="Planned" value={planned} icon={Calendar} color="bg-purple-500/12 text-purple-600" />
      </div>

      {/* Tab Bar */}
      <div className="mb-6 flex gap-2 rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-2 w-fit">
        {[
          { id: "projects", label: "Projects", icon: FolderOpen },
          { id: "page", label: "Page Details", icon: LayoutDashboard },
        ].map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            type="button"
            onClick={() => setActiveTab(id as "projects" | "page")}
            className={`flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-black transition-all ${
              activeTab === id
                ? "bg-[var(--primary)] text-white shadow"
                : "text-[var(--muted)] hover:bg-[var(--surface-soft)] hover:text-[var(--foreground)]"
            }`}
          >
            <Icon size={15} />
            {label}
          </button>
        ))}
      </div>

      {/* ── Projects Tab ── */}
      {activeTab === "projects" && (
        <div className="rounded-2xl border border-[var(--line)] bg-[var(--surface)] shadow-sm overflow-hidden">
          {/* Search */}
          <div className="border-b border-[var(--line)] px-5 py-4">
            <input
              className="w-full max-w-sm rounded-xl border border-[var(--line)] bg-[var(--background)] px-4 py-2.5 text-sm font-semibold text-[var(--foreground)] placeholder:text-[var(--muted)]/60 focus:border-[var(--primary)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/20 transition"
              placeholder="Search projects…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-[var(--line)] bg-[var(--surface-soft)]">
                  {["Project", "Category", "Status", "Progress", "Budget", "Actions"].map((h) => (
                    <th
                      key={h}
                      className="px-5 py-3 text-left text-xs font-black uppercase tracking-[0.14em] text-[var(--muted)]"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-5 py-12 text-center text-sm text-[var(--muted)]">
                      No projects found.{" "}
                      <Link href="/admin/projects/new" className="font-black text-[var(--primary)] hover:underline">
                        Create one
                      </Link>
                    </td>
                  </tr>
                ) : (
                  filtered.map((p) => (
                    <ProjectRow key={p.slug} project={p} onDelete={confirmDelete} />
                  ))
                )}
              </tbody>
            </table>
          </div>

          {filtered.length > 0 && (
            <div className="border-t border-[var(--line)] px-5 py-3 text-xs text-[var(--muted)]">
              Showing {filtered.length} of {total} projects
            </div>
          )}
        </div>
      )}

      {/* ── Page Details Tab ── */}
      {activeTab === "page" && <PageDetailForms />}
    </>
  );
}

// ── Page export ────────────────────────────────────────────────────────────
export default function AdminDashboardPage() {
  return (
    <AdminShell>
      <Suspense fallback={<div className="text-[var(--muted)] text-sm p-8">Loading…</div>}>
        <DashboardInner />
      </Suspense>
    </AdminShell>
  );
}
