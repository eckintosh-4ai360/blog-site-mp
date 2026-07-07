import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  CalendarDays,
  CheckCircle2,
  Circle,
  ExternalLink,
  Landmark,
  MapPin,
  ShieldCheck,
} from "lucide-react";
import BeforeAfterSlider from "@/components/portal/before-after-slider";
import { getProject, projects, type ProjectStatus } from "@/lib/portal-data";

type ProjectPageProps = {
  params: Promise<{ slug: string }>;
};

function statusClass(status: ProjectStatus) {
  return `status-${status.toLowerCase().replaceAll(" ", "-")}`;
}

export function generateStaticParams() {
  return projects.map((project) => ({ slug: project.slug }));
}

export async function generateMetadata({ params }: ProjectPageProps) {
  const { slug } = await params;
  const project = getProject(slug);

  if (!project) {
    return {
      title: "Project Not Found",
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

  if (!project) {
    notFound();
  }

  const info = [
    { label: "Category", value: project.category },
    { label: "Status", value: project.status },
    { label: "Community", value: project.community },
    { label: "Contractor", value: project.contractor },
    { label: "Budget", value: project.budgetLabel },
    { label: "Funding Source", value: project.fundingSource },
    { label: "Start Date", value: project.startDate },
    { label: "Expected Completion", value: project.expectedCompletion },
    { label: "Completion Date", value: project.completionDate ?? "Pending" },
  ];

  return (
    <main className="portal-shell min-h-screen">
      <header className="fixed inset-x-0 top-0 z-50 border-b border-[var(--line)] bg-[var(--glass)] backdrop-blur-xl">
        <nav className="mx-auto flex h-20 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link
            href="/#projects"
            className="inline-flex h-11 items-center gap-2 rounded-full border border-[var(--line)] bg-[var(--surface)] px-4 text-sm font-black text-[var(--foreground)]"
          >
            <ArrowLeft size={16} aria-hidden="true" />
            Projects
          </Link>
          <Link
            href="/"
            className="inline-flex h-11 items-center gap-2 rounded-full bg-[var(--primary)] px-5 text-sm font-black text-white"
          >
            Portal Home
            <ArrowRight size={16} aria-hidden="true" />
          </Link>
        </nav>
      </header>

      <section className="hero-scrim relative isolate min-h-[650px] overflow-hidden pt-20 text-white">
        <Image
          src={project.image}
          alt={project.title}
          fill
          priority
          sizes="100vw"
          className="object-cover"
        />
        <div className="hero-pattern absolute inset-0 z-[2] opacity-45" aria-hidden="true" />
        <div className="relative z-[3] mx-auto flex min-h-[560px] max-w-7xl flex-col justify-end px-4 pb-14 sm:px-6 lg:px-8">
          <div className="max-w-4xl reveal-up">
            <div className="mb-5 flex flex-wrap gap-2">
              <span className={`rounded-full border px-3 py-1 text-xs font-black ${statusClass(project.status)}`}>
                {project.status}
              </span>
              <span className="rounded-full border border-white/25 bg-white/12 px-3 py-1 text-xs font-black backdrop-blur">
                {project.category}
              </span>
            </div>
            <h1 className="text-5xl font-black leading-tight tracking-normal sm:text-6xl">
              {project.title}
            </h1>
            <p className="mt-5 max-w-2xl text-base leading-8 text-white/82">
              {project.description}
            </p>
            <div className="mt-8 grid max-w-3xl gap-3 sm:grid-cols-3">
              <div className="glass-panel p-4">
                <div className="text-xs font-black uppercase tracking-[0.16em] text-white/68">
                  Budget
                </div>
                <div className="mt-2 text-2xl font-black">{project.budgetLabel}</div>
              </div>
              <div className="glass-panel p-4">
                <div className="text-xs font-black uppercase tracking-[0.16em] text-white/68">
                  Progress
                </div>
                <div className="mt-2 text-2xl font-black">{project.progress}%</div>
              </div>
              <div className="glass-panel p-4">
                <div className="text-xs font-black uppercase tracking-[0.16em] text-white/68">
                  Community
                </div>
                <div className="mt-2 text-2xl font-black">{project.community}</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-8 px-4 py-16 sm:px-6 lg:grid-cols-[0.9fr_1.1fr] lg:px-8">
        <div>
          <p className="text-sm font-black uppercase tracking-[0.22em] text-[var(--primary)]">
            Project Information
          </p>
          <h2 className="mt-3 text-4xl font-black text-[var(--foreground)]">
            Public facts and delivery status.
          </h2>
          <div className="mt-8 grid gap-3 sm:grid-cols-2">
            {info.map((item) => (
              <div key={item.label} className="portal-card p-5">
                <div className="text-xs font-black uppercase tracking-[0.16em] text-[var(--muted)]">
                  {item.label}
                </div>
                <div className="mt-2 text-sm font-black text-[var(--foreground)]">
                  {item.value}
                </div>
              </div>
            ))}
          </div>
        </div>

        <article className="portal-card p-6">
          <p className="text-sm font-black uppercase tracking-[0.22em] text-[var(--secondary)]">
            Project Story
          </p>
          <h2 className="mt-3 text-3xl font-black text-[var(--foreground)]">
            Need, objectives, challenges, and expected outcomes.
          </h2>
          <p className="mt-5 text-sm leading-8 text-[var(--muted)]">{project.story}</p>

          <div className="mt-8 grid gap-5 md:grid-cols-3">
            {[
              { title: "Objectives", items: project.objectives, icon: ShieldCheck },
              { title: "Challenges", items: project.challenges, icon: Landmark },
              { title: "Outcomes", items: project.outcomes, icon: CheckCircle2 },
            ].map((group) => {
              const Icon = group.icon;

              return (
                <div key={group.title}>
                  <div className="flex items-center gap-2 text-sm font-black text-[var(--foreground)]">
                    <span className="grid size-8 place-items-center rounded-full bg-[var(--surface-soft)] text-[var(--primary)]">
                      <Icon size={16} aria-hidden="true" />
                    </span>
                    {group.title}
                  </div>
                  <ul className="mt-4 space-y-3">
                    {group.items.map((item) => (
                      <li key={item} className="flex gap-3 text-sm leading-6 text-[var(--muted)]">
                        <CheckCircle2 className="mt-1 shrink-0 text-[var(--secondary)]" size={15} aria-hidden="true" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })}
          </div>
        </article>
      </section>

      <section className="border-y border-[var(--line)] bg-[var(--surface)] py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col justify-between gap-5 md:flex-row md:items-end">
            <div>
              <p className="text-sm font-black uppercase tracking-[0.22em] text-[var(--primary)]">
                Interactive Progress Timeline
              </p>
              <h2 className="mt-3 text-4xl font-black text-[var(--foreground)]">
                Every stage, clearly marked.
              </h2>
            </div>
            <div className="rounded-full border border-[var(--line)] bg-[var(--surface-soft)] px-5 py-3 text-sm font-black text-[var(--foreground)]">
              {project.progress}% complete
            </div>
          </div>

          <div className="mt-10 grid gap-4 md:grid-cols-7">
            {project.timeline.map((item) => (
              <div key={item.label} className="portal-card p-4">
                <span
                  className={`grid size-9 place-items-center rounded-full ${
                    item.done
                      ? "bg-emerald-500/12 text-[var(--secondary)]"
                      : "bg-slate-500/12 text-[var(--muted)]"
                  }`}
                >
                  {item.done ? <CheckCircle2 size={18} aria-hidden="true" /> : <Circle size={18} aria-hidden="true" />}
                </span>
                <h3 className="mt-4 text-sm font-black text-[var(--foreground)]">{item.label}</h3>
                <p className="mt-2 text-xs font-semibold text-[var(--muted)]">{item.date}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-10 px-4 py-16 sm:px-6 lg:grid-cols-[1.1fr_0.9fr] lg:px-8">
        <div>
          <p className="text-sm font-black uppercase tracking-[0.22em] text-[var(--secondary)]">
            Before & After Showcase
          </p>
          <h2 className="mt-3 text-4xl font-black text-[var(--foreground)]">
            Compare the site transformation.
          </h2>
          <div className="mt-8">
            <BeforeAfterSlider
              title={project.title}
              beforeImage={project.beforeImage}
              afterImage={project.afterImage}
            />
          </div>
        </div>

        <div>
          <p className="text-sm font-black uppercase tracking-[0.22em] text-[var(--primary)]">
            Recent Updates
          </p>
          <div className="relative mt-8 space-y-4 pl-7">
            <div className="timeline-line absolute bottom-4 left-2 top-4 w-1 rounded-full" />
            {project.updates.map((update) => (
              <article key={`${update.date}-${update.text}`} className="portal-card relative p-5">
                <span className="absolute -left-[1.75rem] top-6 grid size-5 place-items-center rounded-full bg-[var(--surface)] ring-4 ring-[var(--accent)]" />
                <div className="flex items-center gap-2 text-xs font-black uppercase tracking-[0.14em] text-[var(--muted)]">
                  <CalendarDays size={14} aria-hidden="true" />
                  {update.date}
                </div>
                <p className="mt-2 text-sm leading-7 text-[var(--foreground)]">{update.text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="border-y border-[var(--line)] bg-[var(--surface)] py-16">
        <div className="mx-auto grid max-w-7xl gap-10 px-4 sm:px-6 lg:grid-cols-[0.95fr_1.05fr] lg:px-8">
          <div>
            <p className="text-sm font-black uppercase tracking-[0.22em] text-[var(--primary)]">
              Project Gallery
            </p>
            <h2 className="mt-3 text-4xl font-black text-[var(--foreground)]">
              Photos, videos, drone footage, and documents.
            </h2>
            <div className="mt-8 grid gap-4 sm:grid-cols-2">
              {project.gallery.map((item) => (
                <article key={item.title} className="portal-card overflow-hidden">
                  <div className="relative aspect-[4/3]">
                    <Image
                      src={item.image}
                      alt={item.title}
                      fill
                      sizes="(min-width: 1024px) 25vw, 50vw"
                      className="object-cover"
                    />
                  </div>
                  <div className="p-4">
                    <div className="text-xs font-black uppercase tracking-[0.14em] text-[var(--primary)]">
                      {item.type}
                    </div>
                    <h3 className="mt-1 text-sm font-black text-[var(--foreground)]">{item.title}</h3>
                  </div>
                </article>
              ))}
            </div>
          </div>

          <div>
            <p className="text-sm font-black uppercase tracking-[0.22em] text-[var(--secondary)]">
              Google Maps Integration
            </p>
            <div className="project-map mt-8">
              <span className="map-road left-[12%] top-[36%] w-[62%] rotate-[16deg]" />
              <span className="map-road left-[30%] top-[66%] w-[52%] -rotate-[10deg]" />
              <button
                type="button"
                className="map-pin"
                style={{ left: `${project.map.x}%`, top: `${project.map.y}%` }}
                aria-label={project.title}
              >
                <MapPin size={18} aria-hidden="true" />
              </button>
            </div>
            <div className="mt-5 flex flex-wrap gap-3">
              <a
                href={`https://www.google.com/maps/search/?api=1&query=${project.map.lat},${project.map.lng}`}
                target="_blank"
                rel="noreferrer"
                className="inline-flex h-11 items-center gap-2 rounded-full bg-[var(--primary)] px-5 text-sm font-black text-white"
              >
                Open in Google Maps
                <ExternalLink size={16} aria-hidden="true" />
              </a>
              <Link
                href="/#projects"
                className="inline-flex h-11 items-center gap-2 rounded-full border border-[var(--line)] px-5 text-sm font-black text-[var(--foreground)]"
              >
                Back to Archive
                <ArrowRight size={16} aria-hidden="true" />
              </Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
