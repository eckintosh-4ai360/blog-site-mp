"use client";

import Image from "next/image";
import Link from "next/link";
import { safeImageSrc } from "@/lib/image-helper";
import type { FormEvent } from "react";
import { useEffect, useMemo, useState } from "react";
import {
  ArrowRight,
  BarChart3,
  Building2,
  CheckCircle2,
  ChevronDown,
  Circle,
  Clock,
  Download,
  Folder,
  HandCoins,
  HeartHandshake,
  Home,
  Image as ImageIcon,
  Languages,
  Mail,
  MapPin,
  Menu,
  MessageSquare,
  Moon,
  Newspaper,
  Phone,
  PlayCircle,
  Search,
  ShieldCheck,
  SlidersHorizontal,
  Sun,
  X,
} from "lucide-react";
import {
  categories,
  statuses,
  type Project,
  type ProjectStatus,
  projects as defaultProjects,
  constituencyStats as defaultConstituencyStats,
  impactStats as defaultImpactStats,
  news as defaultNews,
  events as defaultEvents,
  testimonials as defaultTestimonials,
  mediaItems as defaultMediaItems,
  faqs as defaultFaqs,
} from "@/lib/portal-data";
import {
  getAdminProjects,
  getAdminConstituencyStats,
  getAdminImpactStats,
  getAdminNews,
  getAdminEvents,
  getAdminTestimonials,
  getAdminMediaItems,
  getAdminFaqs,
} from "@/lib/admin-data";


const navItems = [
  { label: "Home", href: "#home" },
  { label: "About", href: "#about" },
  { label: "Projects", href: "#projects" },
  { label: "News", href: "#news" },
  { label: "Events", href: "#events" },
  { label: "Gallery", href: "#gallery" },
  { label: "Impact", href: "#impact" },
  { label: "Contact", href: "#contact" },
];

const mobileNav = [
  { label: "Home", href: "#home", icon: Home },
  { label: "Projects", href: "#projects", icon: Folder },
  { label: "Impact", href: "#impact", icon: BarChart3 },
  { label: "News", href: "#news", icon: Newspaper },
  { label: "Contact", href: "#contact", icon: MessageSquare },
];


const values = [
  "Transparent leadership",
  "Responsive service",
  "Inclusive development",
  "Evidence-based delivery",
];

const timeline = [
  { year: "2012", title: "Community Organizer", text: "Led youth literacy and sanitation campaigns." },
  { year: "2016", title: "Assembly Partnership", text: "Coordinated ward-level infrastructure priorities." },
  { year: "2020", title: "Elected MP", text: "Won a public mandate for transparent development." },
  { year: "2024", title: "Second Term", text: "Expanded project tracking and citizen reporting." },
  { year: "2026", title: "Open Portal", text: "Launched a digital accountability platform." },
];

function statusClass(status: ProjectStatus) {
  return `status-${status.toLowerCase().replaceAll(" ", "-")}`;
}

export default function ConstituencyPortal() {
  const [portalProjects, setPortalProjects] = useState<Project[]>(defaultProjects);
  const [portalStats, setPortalStats] = useState(defaultConstituencyStats);
  const [portalImpactStats, setPortalImpactStats] = useState(defaultImpactStats);
  const [portalNews, setPortalNews] = useState(defaultNews);
  const [portalEvents, setPortalEvents] = useState(defaultEvents);
  const [portalTestimonials, setPortalTestimonials] = useState(defaultTestimonials);
  const [portalMediaItems, setPortalMediaItems] = useState(defaultMediaItems);
  const [portalFaqs, setPortalFaqs] = useState(defaultFaqs);

  const [darkMode, setDarkMode] = useState(() => {
    if (typeof window !== "undefined") {
      const savedTheme = window.localStorage.getItem("mp-portal-theme");
      if (savedTheme) {
        return savedTheme === "dark";
      }
      const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
      return prefersDark;
    }
    return false;
  });
  const [navOpen, setNavOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [status, setStatus] = useState("All");
  const [community, setCommunity] = useState("All");
  const [year, setYear] = useState("All");
  const [budgetCap, setBudgetCap] = useState(30);
  const [faqOpen, setFaqOpen] = useState(0);
  const [testimonialIndex, setTestimonialIndex] = useState(0);
  const [comparison, setComparison] = useState(54);
  const [galleryItem, setGalleryItem] =
    useState<Project["gallery"][number] | null>(null);
  const [newsletterSent, setNewsletterSent] = useState(false);
  const [contactSent, setContactSent] = useState(false);

  const heroStats = useMemo(() => {
    const completedCount = portalProjects.filter((p) => p.status === "Completed").length;
    const communitiesCount = new Set(portalProjects.map((p) => p.community)).size;
    const totalBudget = portalProjects.reduce((sum, p) => sum + p.budget, 0);
    const budgetLabel = `GHS ${(totalBudget / 1000000).toFixed(1)}M`;
    const beneficiariesStat = portalStats.find((s) => s.label === "Beneficiaries")?.value || "120,000+";

    return [
      { label: "Projects Completed", value: String(completedCount) },
      { label: "Communities Served", value: String(communitiesCount) },
      { label: "Beneficiaries", value: beneficiariesStat },
      { label: "Invested", value: budgetLabel },
    ];
  }, [portalProjects, portalStats]);

  useEffect(() => {
    async function loadData() {
      try {
        const [projectsRes, statsRes, impactRes, newsRes, eventsRes, testimonialsRes, mediaRes, faqsRes] = await Promise.all([
          fetch("/api/projects").then((r) => r.json()),
          fetch("/api/stats").then((r) => r.json()),
          fetch("/api/stats?type=impact").then((r) => r.json()),
          fetch("/api/news").then((r) => r.json()),
          fetch("/api/events").then((r) => r.json()),
          fetch("/api/testimonials").then((r) => r.json()),
          fetch("/api/media").then((r) => r.json()),
          fetch("/api/faqs").then((r) => r.json()),
        ]);
        if (Array.isArray(projectsRes)) setPortalProjects(projectsRes);
        if (Array.isArray(statsRes)) setPortalStats(statsRes);
        if (Array.isArray(impactRes)) setPortalImpactStats(impactRes);
        if (Array.isArray(newsRes)) setPortalNews(newsRes);
        if (Array.isArray(eventsRes)) setPortalEvents(eventsRes);
        if (Array.isArray(testimonialsRes)) setPortalTestimonials(testimonialsRes);
        if (Array.isArray(mediaRes)) setPortalMediaItems(mediaRes);
        if (Array.isArray(faqsRes)) setPortalFaqs(faqsRes);
      } catch (err) {
        console.error("Failed to load portal data:", err);
      }
    }
    loadData();
  }, []);

  // Theme is initialized in useState; keep effect to sync document and storage only
  // (avoid calling setState synchronously in effect)

  useEffect(() => {
    document.documentElement.dataset.theme = darkMode ? "dark" : "light";
    window.localStorage.setItem("mp-portal-theme", darkMode ? "dark" : "light");
  }, [darkMode]);

  const communities = useMemo(
    () => Array.from(new Set(portalProjects.map((project) => project.community))).sort(),
    [portalProjects],
  );

  const years = useMemo(
    () => Array.from(new Set(portalProjects.map((project) => project.year))).sort(),
    [portalProjects],
  );

  const filteredProjects = useMemo(() => {
    const query = search.trim().toLowerCase();

    return portalProjects.filter((project) => {
      const matchesQuery =
        !query ||
        [
          project.title,
          project.category,
          project.community,
          project.status,
          project.description,
        ]
          .join(" ")
          .toLowerCase()
          .includes(query);

      return (
        matchesQuery &&
        (category === "All" || project.category === category) &&
        (status === "All" || project.status === status) &&
        (community === "All" || project.community === community) &&
        (year === "All" || project.year === year) &&
        project.budget <= budgetCap * 1_000_000
      );
    });
  }, [portalProjects, budgetCap, category, community, search, status, year]);

  const featuredProject = portalProjects[1] || portalProjects[0];


  function handleNewsletter(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setNewsletterSent(true);
  }

  function handleContact(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setContactSent(true);
  }

  return (
    <div className="portal-shell min-h-screen pb-24 lg:pb-0">
      <header className="fixed inset-x-0 top-0 z-50 border-b border-[var(--line)] bg-[var(--glass)] backdrop-blur-xl">
        <nav
          aria-label="Primary"
          className="mx-auto flex h-20 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8"
        >
          <a href="#home" className="flex items-center gap-3">
            <span className="grid size-11 place-items-center rounded-full bg-[var(--primary)] text-white shadow-lg shadow-blue-900/20">
              <Building2 size={22} aria-hidden="true" />
            </span>
            <span className="leading-tight">
              <span className="block text-sm font-bold text-[var(--foreground)]">
                 Hon. Issah Salifu Taylor 
              </span>
            </span>
          </a>

          <div className="hidden items-center gap-1 xl:flex">
            {navItems.map((item) => (
              <a
                key={item.href}
                href={item.href}
                className="rounded-full px-3 py-2 text-xs font-semibold text-[var(--muted)] transition hover:bg-[var(--surface-soft)] hover:text-[var(--primary)]"
              >
                {item.label}
              </a>
            ))}
          </div>

          <div className="hidden items-center gap-2 lg:flex">
            <button
              type="button"
              onClick={() => setDarkMode((current) => !current)}
              className="grid size-11 place-items-center rounded-full border border-[var(--line)] bg-[var(--surface)] text-[var(--foreground)] transition hover:border-[var(--primary)]"
              aria-label="Toggle dark mode"
            >
              {darkMode ? <Sun size={18} aria-hidden="true" /> : <Moon size={18} aria-hidden="true" />}
            </button>

            <Link
              href="/admin"
              className="flex h-11 items-center gap-2 rounded-full border border-[var(--line)] bg-[var(--surface)] px-5 text-xs font-bold text-[var(--foreground)] transition hover:border-[var(--primary)] hover:text-[var(--primary)]"
            >
              <ShieldCheck size={16} aria-hidden="true" />
              <span>Admin</span>
            </Link>
          </div>

          <button
            type="button"
            onClick={() => setNavOpen((current) => !current)}
            className="grid size-11 place-items-center rounded-full border border-[var(--line)] bg-[var(--surface)] text-[var(--foreground)] xl:hidden"
            aria-label="Toggle menu"
            aria-expanded={navOpen}
          >
            {navOpen ? <X size={20} aria-hidden="true" /> : <Menu size={20} aria-hidden="true" />}
          </button>
        </nav>

        {navOpen ? (
          <div className="border-t border-[var(--line)] bg-[var(--surface)] px-4 py-4 xl:hidden">
            <div className="mx-auto grid max-w-7xl gap-2 sm:grid-cols-2 lg:grid-cols-4">
              {navItems.map((item) => (
                <a
                  key={item.href}
                  href={item.href}
                  onClick={() => setNavOpen(false)}
                  className="rounded-lg px-3 py-3 text-sm font-semibold text-[var(--foreground)] hover:bg-[var(--surface-soft)]"
                >
                  {item.label}
                </a>
              ))}
              <Link
                href="/admin"
                onClick={() => setNavOpen(false)}
                className="flex items-center gap-2 rounded-lg px-3 py-3 text-sm font-semibold text-[var(--primary)] hover:bg-[var(--surface-soft)]"
              >
                <ShieldCheck size={16} aria-hidden="true" />
                <span>Admin Login</span>
              </Link>
            </div>
          </div>
        ) : null}
      </header>

      <main>
        <section
          id="home"
          className="hero-scrim relative isolate min-h-[760px] overflow-hidden pt-20 text-white"
        >
          <Image
            src="/bg_sheik.jpg"
            alt="MP with team picture"
            fill
            priority
            sizes="100vw"
            className="object-cover"
          />
          {/* <div className="hero-pattern absolute inset-0 z-[2] opacity-50" aria-hidden="true" /> */}
          <div className="relative z-[3] mx-auto flex min-h-[680px] max-w-7xl flex-col justify-center px-4 py-14 sm:px-6 lg:px-8">
            <div className="max-w-3xl reveal-up">
              <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/12 px-4 py-2 text-sm font-semibold backdrop-blur">
                <ShieldCheck size={17} aria-hidden="true" />
                Transparency, accountability, community delivery
              </div>
              <h1 className="max-w-4xl text-5xl font-black leading-[1.02] tracking-normal sm:text-6xl lg:text-7xl">
                Building a Better Constituency Together
              </h1>
              <p className="mt-6 max-w-2xl text-base leading-8 text-white/82 sm:text-lg">
                A modern public-service platform for tracking the MP&apos;s vision,
                development projects, community impact, events, and citizen
                support with clarity and trust.
              </p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <a
                  href="#projects"
                  className="inline-flex h-12 items-center justify-center gap-2 rounded-full bg-[var(--accent)] px-6 text-sm font-black text-slate-950 shadow-xl shadow-amber-950/20 transition hover:-translate-y-0.5"
                >
                  Explore Projects
                  <ArrowRight size={17} aria-hidden="true" />
                </a>
                <a
                  href="#about"
                  className="inline-flex h-12 items-center justify-center gap-2 rounded-full border border-white/30 bg-white/12 px-6 text-sm font-black text-white backdrop-blur transition hover:bg-white/20"
                >
                  Meet the MP
                </a>
              </div>
            </div>

            <div className="mt-12 grid max-w-4xl  gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {heroStats.map((stat, index) => (
                <div
                  key={stat.label}
                  className={`floating-action rounded-lg border border-white/20 bg-white/10 p-4 backdrop-blur-md delay-${Math.min(index, 3)}`}
                >
                  <div className="text-2xl font-black text-white">{stat.value}</div>
                  <div className="mt-1 text-xs font-semibold uppercase tracking-[0.18em] text-white/70">
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section id="about" className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
          <div className="grid gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
            <div className="relative min-h-[560px] overflow-hidden rounded-lg border border-[var(--line)] bg-[var(--surface)] shadow-[var(--shadow)]">
              <Image
                src="/sheik_mp.jpg"
                alt="Professional portrait of  Hon. Issah Salifu Taylor "
                fill
                sizes="(min-width: 1024px) 42vw, 100vw"
                className="object-cover"
              />
              <div className="absolute inset-x-4 bottom-4 rounded-lg border border-white/25 bg-slate-950/62 p-5 text-white backdrop-blur-xl">
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-amber-200">
                  Member of Parliament
                </p>
                <h2 className="mt-2 text-2xl font-black"> Hon. Issah Salifu Taylor </h2>
                <p className="mt-2 text-sm leading-6 text-white/78">
                  10 years of public service, constituency advocacy, and
                  results-focused development leadership.
                </p>
              </div>
            </div>

            <div>
              <p className="text-sm font-black uppercase tracking-[0.22em] text-[var(--primary)]">
                About the MP
              </p>
              <h2 className="mt-3 text-4xl font-black leading-tight text-[var(--foreground)] sm:text-5xl">
                Public leadership with measurable delivery.
              </h2>
              <p className="mt-5 text-base leading-8 text-[var(--muted)]">
                 Hon. Issah Salifu Taylor  represents Tarkwa Nsuaem with a focus on
                transparent project delivery, youth opportunity, health access,
                education quality, and resilient local infrastructure.
              </p>

              <div className="mt-8 grid gap-4 sm:grid-cols-2">
                <div className="portal-card p-5">
                  <h3 className="text-sm font-black text-[var(--foreground)]">Vision</h3>
                  <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
                    A constituency where every resident can see, shape, and
                    benefit from development.
                  </p>
                </div>
                <div className="portal-card p-5">
                  <h3 className="text-sm font-black text-[var(--foreground)]">Mission</h3>
                  <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
                    Deliver accountable projects, responsive services, and
                    inclusive opportunity through open governance.
                  </p>
                </div>
              </div>

              <div className="mt-8 grid gap-3 sm:grid-cols-2">
                {values.map((value) => (
                  <div key={value} className="flex items-center gap-3 text-sm font-bold text-[var(--foreground)]">
                    <span className="grid size-8 place-items-center rounded-full bg-emerald-500/12 text-[var(--secondary)]">
                      <CheckCircle2 size={17} aria-hidden="true" />
                    </span>
                    {value}
                  </div>
                ))}
              </div>

              <div className="mt-10">
                <h3 className="text-sm font-black uppercase tracking-[0.18em] text-[var(--muted)]">
                  Political Journey
                </h3>
                <div className="relative mt-5 space-y-5 pl-7">
                  <div className="timeline-line absolute bottom-2 left-2 top-2 w-1 rounded-full" aria-hidden="true" />
                  {timeline.map((item) => (
                    <div key={item.year} className="relative">
                      <span className="absolute -left-[1.68rem] top-1 grid size-5 place-items-center rounded-full bg-[var(--surface)] ring-4 ring-[var(--primary)]" />
                      <div className="text-sm font-black text-[var(--primary)]">{item.year}</div>
                      <div className="mt-1 font-black text-[var(--foreground)]">{item.title}</div>
                      <p className="mt-1 text-sm leading-6 text-[var(--muted)]">{item.text}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className=" border-y border-[var(--line)] bg-[var(--surface)] py-20">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col justify-between gap-5 md:flex-row md:items-end">
              <div>
                <p className="text-sm font-black uppercase tracking-[0.22em] text-[var(--secondary)]">
                  Constituency Statistics
                </p>
                <h2 className="mt-3 text-4xl font-black text-[var(--foreground)]">
                  A public dashboard for delivery.
                </h2>
              </div>
            </div>

            <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
              {portalStats.map((stat) => (
                <div key={stat.label} className="portal-card metric-card p-5">
                  <div className="text-3xl font-black text-[var(--primary)]">{stat.value}</div>
                  <div className="mt-2 text-sm font-black text-[var(--foreground)]">{stat.label}</div>
                  <p className="mt-2 text-xs leading-5 text-[var(--muted)]">{stat.note}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section id="projects" className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
          <div className="flex flex-col justify-between gap-5 lg:flex-row lg:items-end">
            <div>
              <p className="text-sm font-black uppercase tracking-[0.22em] text-[var(--primary)]">
                Project Archive
              </p>
              <h2 className="mt-3 max-w-3xl text-4xl font-black leading-tight text-[var(--foreground)] sm:text-5xl">
                Track every major promise from proposal to commissioning.
              </h2>
            </div>
            <div className="glass-panel flex items-center gap-3 px-4 py-3 text-sm font-bold text-[var(--foreground)]">
              <SlidersHorizontal size={18} aria-hidden="true" />
              {filteredProjects.length} matching projects
            </div>
          </div>

          <div className="mt-8 grid gap-3 rounded-lg border border-[var(--line)] bg-[var(--surface)] p-4 shadow-[var(--shadow)] lg:grid-cols-[1.4fr_repeat(4,1fr)]">
            <label className="flex min-h-12 items-center gap-3 rounded-lg border border-[var(--line)] px-4">
              <Search size={17} className="text-[var(--muted)]" aria-hidden="true" />
              <span className="sr-only">Search project archive</span>
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search title, community, category"
                className="w-full bg-transparent text-sm text-[var(--foreground)] placeholder:text-[var(--muted)] focus:outline-none"
              />
            </label>

            <label className="min-h-12 rounded-lg border border-[var(--line)] px-3 py-2">
              <span className="block text-[10px] font-black uppercase tracking-[0.16em] text-[var(--muted)]">
                Category
              </span>
              <select
                value={category}
                onChange={(event) => setCategory(event.target.value)}
                className="mt-1 w-full bg-transparent text-sm font-bold text-[var(--foreground)] focus:outline-none"
              >
                <option>All</option>
                {categories.map((item) => (
                  <option key={item}>{item}</option>
                ))}
              </select>
            </label>

            <label className="min-h-12 rounded-lg border border-[var(--line)] px-3 py-2">
              <span className="block text-[10px] font-black uppercase tracking-[0.16em] text-[var(--muted)]">
                Status
              </span>
              <select
                value={status}
                onChange={(event) => setStatus(event.target.value)}
                className="mt-1 w-full bg-transparent text-sm font-bold text-[var(--foreground)] focus:outline-none"
              >
                <option>All</option>
                {statuses.map((item) => (
                  <option key={item}>{item}</option>
                ))}
              </select>
            </label>

            <label className="min-h-12 rounded-lg border border-[var(--line)] px-3 py-2">
              <span className="block text-[10px] font-black uppercase tracking-[0.16em] text-[var(--muted)]">
                Community
              </span>
              <select
                value={community}
                onChange={(event) => setCommunity(event.target.value)}
                className="mt-1 w-full bg-transparent text-sm font-bold text-[var(--foreground)] focus:outline-none"
              >
                <option>All</option>
                {communities.map((item) => (
                  <option key={item}>{item}</option>
                ))}
              </select>
            </label>

            <div className="min-h-12 rounded-lg border border-[var(--line)] px-3 py-2">
              <div className="flex items-center justify-between gap-3">
                <span className="text-[10px] font-black uppercase tracking-[0.16em] text-[var(--muted)]">
                  Budget
                </span>
                <span className="text-xs font-black text-[var(--foreground)]">
                  Up to GHS {budgetCap}M
                </span>
              </div>
              <input
                type="range"
                min="5"
                max="30"
                value={budgetCap}
                onChange={(event) => setBudgetCap(Number(event.target.value))}
                className="comparison-range mt-2 w-full"
                aria-label="Maximum budget in millions of Ghana cedis"
              />
            </div>
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            {years.map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => setYear((current) => (current === item ? "All" : item))}
                className={`rounded-full border px-4 py-2 text-xs font-black transition ${
                  year === item
                    ? "border-[var(--primary)] bg-[var(--primary)] text-white"
                    : "border-[var(--line)] bg-[var(--surface)] text-[var(--muted)] hover:text-[var(--primary)]"
                }`}
              >
                {item}
              </button>
            ))}
          </div>

          <div className="mt-10 grid gap-5 lg:grid-cols-3">
            {filteredProjects.map((project) => (
              <article key={project.slug} className="portal-card overflow-hidden transition hover:-translate-y-1 hover:shadow-[var(--shadow)]">
                <div className="relative aspect-[16/10]">
                  <Image
                    src={safeImageSrc(project.image)}
                    alt={project.title}
                    fill
                    sizes="(min-width: 1024px) 33vw, 100vw"
                    className="object-cover"
                  />
                  <div className="absolute left-4 top-4 flex flex-wrap gap-2">
                    <span className={`rounded-full border px-3 py-1 text-xs font-black ${statusClass(project.status)}`}>
                      {project.status}
                    </span>
                    <span className="rounded-full border border-white/30 bg-white/85 px-3 py-1 text-xs font-black text-slate-900 backdrop-blur">
                      {project.category}
                    </span>
                  </div>
                </div>
                <div className="p-5">
                  <div className="flex items-center gap-2 text-xs font-bold text-[var(--muted)]">
                    <MapPin size={14} aria-hidden="true" />
                    {project.community}
                  </div>
                  <h3 className="mt-3 text-xl font-black leading-snug text-[var(--foreground)]">
                    {project.title}
                  </h3>
                  <p className="mt-3 min-h-[4.5rem] text-sm leading-6 text-[var(--muted)]">
                    {project.description}
                  </p>
                  <div className="mt-5 flex items-center justify-between text-sm">
                    <span className="font-black text-[var(--foreground)]">{project.budgetLabel}</span>
                    <span className="font-bold text-[var(--muted)]">{project.progress}%</span>
                  </div>
                  <div className="mt-2 h-2 overflow-hidden rounded-full bg-[var(--surface-soft)]">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-[var(--primary)] via-[var(--secondary)] to-[var(--accent)]"
                      style={{ width: `${project.progress}%` }}
                    />
                  </div>
                  <div className="mt-5 flex justify-end">
                    <Link
                      href={`/projects/${project.slug}`}
                      className="inline-flex h-10 items-center gap-2 rounded-full bg-[var(--primary)] px-4 text-xs font-black text-white transition hover:bg-[var(--primary-strong)]"
                    >
                      View Details
                      <ArrowRight size={15} aria-hidden="true" />
                    </Link>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="mx-auto grid max-w-7xl gap-10 px-4 py-20 sm:px-6 lg:grid-cols-[1.1fr_0.9fr] lg:px-8">
          <div>
            <p className="text-sm font-black uppercase tracking-[0.22em] text-[var(--primary)]">
              Before & After
            </p>
            <h2 className="mt-3 text-4xl font-black text-[var(--foreground)]">
              Visible transformation, not vague promises.
            </h2>
            <p className="mt-4 max-w-2xl text-sm leading-7 text-[var(--muted)]">
              Compare the state of a project site before intervention and after
              the latest milestone.
            </p>

            <div className="comparison-frame mt-8 aspect-[16/10]">
              <Image
                src={safeImageSrc(featuredProject.beforeImage)}
                alt={`${featuredProject.title} before project intervention`}
                fill
                sizes="(min-width: 1024px) 58vw, 100vw"
                className="object-cover"
              />
              <div className="comparison-after" style={{ width: `${comparison}%` }}>
                <Image
                  src={safeImageSrc(featuredProject.afterImage)}
                  alt={`${featuredProject.title} after project intervention`}
                  fill
                  sizes="(min-width: 1024px) 58vw, 100vw"
                  className="object-cover"
                />
              </div>
              <div className="comparison-handle" style={{ left: `${comparison}%` }} />
              <div className="absolute inset-x-4 bottom-4 flex items-center gap-4 rounded-lg bg-slate-950/70 p-4 text-white backdrop-blur">
                <span className="text-xs font-black uppercase tracking-[0.16em]">Before</span>
                <input
                  type="range"
                  min="8"
                  max="92"
                  value={comparison}
                  onChange={(event) => setComparison(Number(event.target.value))}
                  className="comparison-range w-full"
                  aria-label="Before and after image comparison"
                />
                <span className="text-xs font-black uppercase tracking-[0.16em]">After</span>
              </div>
            </div>
          </div>

          <aside className="grid content-start gap-4">
            {featuredProject.timeline.map((item) => (
              <div key={item.label} className="portal-card flex items-start gap-4 p-4">
                <span
                  className={`mt-1 grid size-8 place-items-center rounded-full ${
                    item.done
                      ? "bg-emerald-500/12 text-[var(--secondary)]"
                      : "bg-slate-500/12 text-[var(--muted)]"
                  }`}
                >
                  {item.done ? <CheckCircle2 size={17} aria-hidden="true" /> : <Circle size={17} aria-hidden="true" />}
                </span>
                <div>
                  <div className="font-black text-[var(--foreground)]">{item.label}</div>
                  <div className="mt-1 text-sm font-semibold text-[var(--muted)]">{item.date}</div>
                </div>
              </div>
            ))}
          </aside>
        </section>

        <section id="impact" className="border-y border-[var(--line)] bg-[var(--primary)] py-20 text-white">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="grid gap-8 lg:grid-cols-[0.8fr_1.2fr] lg:items-end">
              <div>
                <p className="text-sm font-black uppercase tracking-[0.22em] text-amber-200">
                  Community Impact
                </p>
                <h2 className="mt-3 text-4xl font-black leading-tight sm:text-5xl">
                  Development measured by lives improved.
                </h2>
              </div>
              <div className="grid gap-3 sm:grid-cols-3">
                {portalImpactStats.map((item) => (
                  <div key={item.label} className="rounded-lg border border-white/18 bg-white/10 p-5 backdrop-blur">
                    <div className="text-3xl font-black">{item.value}</div>
                    <div className="mt-2 text-sm font-semibold text-white/76">{item.label}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section id="news" className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
          <div className="flex flex-col justify-between gap-5 md:flex-row md:items-end">
            <div>
              <p className="text-sm font-black uppercase tracking-[0.22em] text-[var(--primary)]">
                News & Announcements
              </p>
              <h2 className="mt-3 text-4xl font-black text-[var(--foreground)]">
                Latest public updates.
              </h2>
            </div>
            <a href="#newsletter" className="inline-flex h-11 items-center gap-2 rounded-full border border-[var(--line)] px-5 text-sm font-black text-[var(--foreground)]">
              Newsletter
              <ArrowRight size={16} aria-hidden="true" />
            </a>
          </div>

          <div className="mt-10 grid gap-5 lg:grid-cols-[1.2fr_0.8fr]">
            {portalNews[0] && (
              <article className="portal-card overflow-hidden">
                <div className="relative aspect-[16/8]">
                  <Image
                    src={safeImageSrc(portalNews[0].image)}
                    alt={portalNews[0].title}
                    fill
                    sizes="(min-width: 1024px) 58vw, 100vw"
                    className="object-cover"
                  />
                </div>
                <div className="p-6">
                  <div className="flex flex-wrap gap-3 text-xs font-black uppercase tracking-[0.14em] text-[var(--muted)]">
                    <span>{portalNews[0].category}</span>
                    <span>{portalNews[0].date}</span>
                    <span>{portalNews[0].readTime}</span>
                  </div>
                  <h3 className="mt-3 text-3xl font-black text-[var(--foreground)]">{portalNews[0].title}</h3>
                  <p className="mt-3 text-sm leading-7 text-[var(--muted)]">{portalNews[0].excerpt}</p>
                  <button className="mt-5 inline-flex h-11 items-center gap-2 rounded-full bg-[var(--primary)] px-5 text-sm font-black text-white" type="button">
                    Read More
                    <ArrowRight size={16} aria-hidden="true" />
                  </button>
                </div>
              </article>
            )}

            <div className="grid gap-5">
              {portalNews.slice(1).map((item) => (
                <article key={item.title} className="portal-card grid grid-cols-[120px_1fr] overflow-hidden">
                  <div className="relative min-h-40">
                    <Image
                      src={safeImageSrc(item.image)}
                      alt={item.title}
                      fill
                      sizes="120px"
                      className="object-cover"
                    />
                  </div>
                  <div className="p-5">
                    <div className="text-xs font-black uppercase tracking-[0.14em] text-[var(--muted)]">
                      {item.category} / {item.date}
                    </div>
                    <h3 className="mt-2 text-lg font-black leading-snug text-[var(--foreground)]">{item.title}</h3>
                    <p className="mt-2 text-sm leading-6 text-[var(--muted)]">{item.excerpt}</p>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section id="events" className="border-y border-[var(--line)] bg-[var(--surface)] py-20">
          <div className="mx-auto grid max-w-7xl gap-10 px-4 sm:px-6 lg:grid-cols-[0.9fr_1.1fr] lg:px-8">
            <div>
              <p className="text-sm font-black uppercase tracking-[0.22em] text-[var(--secondary)]">
                Upcoming Events
              </p>
              <h2 className="mt-3 text-4xl font-black text-[var(--foreground)]">
                Meet the MP in your community.
              </h2>
              <p className="mt-4 text-sm leading-7 text-[var(--muted)]">
                Town halls, commissioning ceremonies, health outreach, and youth
                engagement programs are published as soon as dates are approved.
              </p>
            </div>
            <div className="relative space-y-4 pl-7">
              <div className="timeline-line absolute bottom-4 left-2 top-4 w-1 rounded-full" />
              {portalEvents.map((event) => (
                <article key={event.title} className="portal-card relative p-5">
                  <span className="absolute -left-[1.75rem] top-6 grid size-5 place-items-center rounded-full bg-[var(--surface)] ring-4 ring-[var(--accent)]" />
                  <div className="flex flex-wrap items-center gap-3 text-xs font-black uppercase tracking-[0.14em] text-[var(--muted)]">
                    <span>{event.type}</span>
                    <span>{event.date}</span>
                  </div>
                  <h3 className="mt-2 text-xl font-black text-[var(--foreground)]">{event.title}</h3>
                  <p className="mt-2 flex items-center gap-2 text-sm font-semibold text-[var(--muted)]">
                    <MapPin size={15} aria-hidden="true" />
                    {event.location}
                  </p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section id="gallery" className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
          <div className="flex flex-col justify-between gap-5 md:flex-row md:items-end">
            <div>
              <p className="text-sm font-black uppercase tracking-[0.22em] text-[var(--primary)]">
                Project Gallery
              </p>
              <h2 className="mt-3 text-4xl font-black text-[var(--foreground)]">
                Photos, drone footage, videos, and documents.
              </h2>
            </div>
            <div className="flex gap-2">
              <button type="button" className="grid size-11 place-items-center rounded-full border border-[var(--line)] text-[var(--foreground)]" aria-label="Play media">
                <PlayCircle size={18} aria-hidden="true" />
              </button>
              <button type="button" className="grid size-11 place-items-center rounded-full border border-[var(--line)] text-[var(--foreground)]" aria-label="Download media pack">
                <Download size={18} aria-hidden="true" />
              </button>
            </div>
          </div>

          <div className="masonry-gallery mt-10">
            {portalProjects.flatMap((project) => project.gallery).slice(0, 12).map((item) => (
              <button
                type="button"
                key={`${item.title}-${item.image}`}
                onClick={() => setGalleryItem(item)}
                className="masonry-item group block w-full overflow-hidden rounded-lg border border-[var(--line)] bg-[var(--surface)] text-left shadow-sm"
              >
                <div className="relative aspect-[4/3]">
                  <Image
                    src={safeImageSrc(item.image)}
                    alt={item.title}
                    fill
                    sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                    className="object-cover transition duration-300 group-hover:scale-105"
                  />
                </div>
                <div className="p-4">
                  <span className="text-xs font-black uppercase tracking-[0.14em] text-[var(--primary)]">
                    {item.type}
                  </span>
                  <div className="mt-1 text-sm font-black text-[var(--foreground)]">{item.title}</div>
                </div>
              </button>
            ))}
          </div>
        </section>

        <section className="border-y border-[var(--line)] bg-[var(--surface)] py-20">
          <div className="mx-auto grid max-w-7xl gap-10 px-4 sm:px-6 lg:grid-cols-[0.95fr_1.05fr] lg:px-8">
            <div>
              <p className="text-sm font-black uppercase tracking-[0.22em] text-[var(--secondary)]">
                Testimonials
              </p>
              <h2 className="mt-3 text-4xl font-black text-[var(--foreground)]">
                Community voices.
              </h2>
              <div className="mt-8 flex gap-2">
                {portalTestimonials.map((item, index) => (
                  <button
                    key={item.name}
                    type="button"
                    onClick={() => setTestimonialIndex(index)}
                    className={`h-2 rounded-full transition-all ${
                      testimonialIndex === index
                        ? "w-10 bg-[var(--primary)]"
                        : "w-5 bg-slate-300"
                    }`}
                    aria-label={`Show testimonial from ${item.name}`}
                  />
                ))}
              </div>
            </div>

            {portalTestimonials[testimonialIndex] && (
              <article className="portal-card p-6">
                <div className="flex items-center gap-4">
                  <div className="relative size-16 overflow-hidden rounded-full">
                    <Image
                      src={safeImageSrc(portalTestimonials[testimonialIndex].image)}
                      alt={portalTestimonials[testimonialIndex].name}
                      fill
                      sizes="64px"
                      className="object-cover"
                    />
                  </div>
                  <div>
                    <h3 className="text-lg font-black text-[var(--foreground)]">
                      {portalTestimonials[testimonialIndex].name}
                    </h3>
                    <p className="text-sm font-semibold text-[var(--muted)]">
                      {portalTestimonials[testimonialIndex].role}
                    </p>
                  </div>
                </div>
                <p className="mt-6 text-2xl font-bold leading-10 text-[var(--foreground)]">
                  &ldquo;{portalTestimonials[testimonialIndex].quote}&rdquo;
                </p>
              </article>
            )}
          </div>
        </section>

        <section className="mx-auto grid max-w-7xl gap-10 px-4 py-20 sm:px-6 lg:grid-cols-[1fr_1fr] lg:px-8">
          <div>
            <p className="text-sm font-black uppercase tracking-[0.22em] text-[var(--primary)]">
              Media Center
            </p>
            <h2 className="mt-3 text-4xl font-black text-[var(--foreground)]">
              Public records and media in one library.
            </h2>
            <div className="mt-8 grid gap-3 sm:grid-cols-2">
              {portalMediaItems.map((item) => (
                <div key={item.label} className="portal-card flex items-center justify-between p-5">
                  <div>
                    <div className="text-sm font-black text-[var(--foreground)]">{item.label}</div>
                    <div className="mt-1 text-xs font-semibold text-[var(--muted)]">{item.count} items</div>
                  </div>
                  <span className="grid size-10 place-items-center rounded-full bg-[var(--surface-soft)] text-[var(--primary)]">
                    <ImageIcon size={18} aria-hidden="true" />
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div>
            <p className="text-sm font-black uppercase tracking-[0.22em] text-[var(--secondary)]">
              Frequently Asked Questions
            </p>
            <div className="mt-6 divide-y divide-[var(--line)] rounded-lg border border-[var(--line)] bg-[var(--surface)]">
              {portalFaqs.map((item, index) => (
                <div key={item.question}>
                  <button
                    type="button"
                    onClick={() => setFaqOpen((current) => (current === index ? -1 : index))}
                    className="flex w-full items-center justify-between gap-4 px-5 py-5 text-left font-black text-[var(--foreground)]"
                    aria-expanded={faqOpen === index}
                  >
                    {item.question}
                    <ChevronDown
                      size={18}
                      className={`shrink-0 transition ${faqOpen === index ? "rotate-180" : ""}`}
                      aria-hidden="true"
                    />
                  </button>
                  {faqOpen === index ? (
                    <p className="px-5 pb-5 text-sm leading-7 text-[var(--muted)]">
                      {item.answer}
                    </p>
                  ) : null}
                </div>
              ))}
            </div>
          </div>
        </section>

        <section id="newsletter" className="bg-[var(--primary)] py-16 text-white">
          <div className="mx-auto flex max-w-7xl flex-col justify-between gap-6 px-4 sm:px-6 lg:flex-row lg:items-center lg:px-8">
            <div>
              <p className="text-sm font-black uppercase tracking-[0.22em] text-amber-200">
                Newsletter
              </p>
              <h2 className="mt-2 text-3xl font-black">Project updates in your inbox.</h2>
            </div>
            <form onSubmit={handleNewsletter} className="flex w-full max-w-xl flex-col gap-3 sm:flex-row">
              <label className="sr-only" htmlFor="newsletter-email">
                Email address
              </label>
              <input
                id="newsletter-email"
                type="email"
                required
                placeholder="Email address"
                className="h-12 flex-1 rounded-full border border-white/20 bg-white px-5 text-sm font-semibold text-slate-900 placeholder:text-slate-500"
              />
              <button
                type="submit"
                className="h-12 rounded-full bg-[var(--accent)] px-6 text-sm font-black text-slate-950"
              >
                Subscribe
              </button>
            </form>
          </div>
          {newsletterSent ? (
            <div className="mx-auto mt-4 max-w-7xl px-4 text-sm font-semibold text-amber-100 sm:px-6 lg:px-8">
              Subscription saved for this demo.
            </div>
          ) : null}
        </section>

        <section id="contact" className="mx-auto grid max-w-7xl gap-10 px-4 py-20 sm:px-6 lg:grid-cols-[0.88fr_1.12fr] lg:px-8">
          <div>
            <p className="text-sm font-black uppercase tracking-[0.22em] text-[var(--primary)]">
              Contact
            </p>
            <h2 className="mt-3 text-4xl font-black text-[var(--foreground)]">
              Constituency office.
            </h2>
            <div className="mt-8 grid gap-4">
              {[
                { icon: MapPin, label: "Office Address", value: "Civic Center Road, Tarkwa Nsuaem" },
                { icon: Phone, label: "Phone", value: "+233 30 000 2040" },
                { icon: Mail, label: "Email", value: "office@anidasonorth.gov.gh" },
                { icon: Clock, label: "Office Hours", value: "Mon-Fri, 8:30 AM - 5:00 PM" },
                { icon: HeartHandshake, label: "Emergency Contacts", value: "District NADMO and Health Desk available 24/7" },
              ].map((item) => {
                const Icon = item.icon;

                return (
                  <div key={item.label} className="portal-card flex gap-4 p-5">
                    <span className="grid size-11 shrink-0 place-items-center rounded-full bg-[var(--surface-soft)] text-[var(--primary)]">
                      <Icon size={19} aria-hidden="true" />
                    </span>
                    <div>
                      <div className="text-sm font-black text-[var(--foreground)]">{item.label}</div>
                      <p className="mt-1 text-sm leading-6 text-[var(--muted)]">{item.value}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <form onSubmit={handleContact} className="portal-card grid gap-4 p-5 sm:p-6">
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="grid gap-2 text-sm font-bold text-[var(--foreground)]">
                Full name
                <input required className="h-12 rounded-lg border border-[var(--line)] bg-transparent px-4 text-sm focus:outline-none" />
              </label>
              <label className="grid gap-2 text-sm font-bold text-[var(--foreground)]">
                Phone or email
                <input required className="h-12 rounded-lg border border-[var(--line)] bg-transparent px-4 text-sm focus:outline-none" />
              </label>
            </div>
            <label className="grid gap-2 text-sm font-bold text-[var(--foreground)]">
              Topic
              <select className="h-12 rounded-lg border border-[var(--line)] bg-transparent px-4 text-sm focus:outline-none">
                <option>Project request</option>
                <option>Case work</option>
                <option>Event invitation</option>
                <option>Media inquiry</option>
                <option>Support / donation</option>
              </select>
            </label>
            <label className="grid gap-2 text-sm font-bold text-[var(--foreground)]">
              Message
              <textarea required rows={6} className="rounded-lg border border-[var(--line)] bg-transparent p-4 text-sm focus:outline-none" />
            </label>
            <button
              type="submit"
              className="inline-flex h-12 items-center justify-center gap-2 rounded-full bg-[var(--primary)] px-6 text-sm font-black text-white"
            >
              Send Message
              <ArrowRight size={16} aria-hidden="true" />
            </button>
            {contactSent ? (
              <p className="text-sm font-semibold text-[var(--secondary)]">
                Message captured for this demo.
              </p>
            ) : null}
          </form>
        </section>
      </main>

      <footer className="border-t border-[var(--line)] bg-[var(--surface)]">
        <div className="mx-auto grid max-w-7xl gap-8 px-4 py-12 sm:px-6 lg:grid-cols-[1.2fr_repeat(3,1fr)] lg:px-8">
          <div>
            <div className="flex items-center gap-3">
              <span className="grid size-11 place-items-center rounded-full bg-[var(--primary)] text-white">
                <Building2 size={22} aria-hidden="true" />
              </span>
              <div>
                <div className="font-black text-[var(--foreground)]">Tarkwa Nsuaem</div>
                <div className="text-xs font-semibold text-[var(--muted)]">MP Portfolio & Project Portal</div>
              </div>
            </div>
            <p className="mt-4 max-w-sm text-sm leading-7 text-[var(--muted)]">
              A premium civic interface for transparent development, community
              trust, and measurable public service.
            </p>
          </div>
          {[
            { title: "Quick Links", items: ["About the MP", "Projects", "Events", "Contact"] },
            { title: "Projects", items: ["Education", "Health", "Roads", "Water"] },
            { title: "Latest News", items: ["Project Updates", "Press Releases", "Media Center", "Newsletter"] },
          ].map((group) => (
            <div key={group.title}>
              <h3 className="text-sm font-black text-[var(--foreground)]">{group.title}</h3>
              <div className="mt-4 grid gap-3">
                {group.items.map((item) => (
                  <a key={item} href="#home" className="text-sm font-semibold text-[var(--muted)] hover:text-[var(--primary)]">
                    {item}
                  </a>
                ))}
              </div>
            </div>
          ))}
        </div>
        <div className="border-t border-[var(--line)] px-4 py-6 text-center text-xs font-semibold text-[var(--muted)]">
          Copyright 2026 Office of  Hon. Issah Salifu Taylor . All rights reserved.
        </div>
      </footer>

      <a
        href="#contact"
        className="fixed bottom-24 right-4 z-40 grid size-12 place-items-center rounded-full bg-[var(--accent)] text-slate-950 shadow-xl shadow-amber-950/20 lg:bottom-6"
        aria-label="Contact the constituency office"
      >
        <MessageSquare size={21} aria-hidden="true" />
      </a>

      <nav className="fixed inset-x-3 bottom-3 z-50 rounded-full border border-[var(--line)] bg-[var(--glass)] px-2 py-2 shadow-[var(--shadow)] backdrop-blur-xl lg:hidden" aria-label="Mobile">
        <div className="grid grid-cols-5">
          {mobileNav.map((item) => {
            const Icon = item.icon;

            return (
              <a key={item.href} href={item.href} className="grid place-items-center gap-1 rounded-full py-2 text-[10px] font-black text-[var(--muted)]">
                <Icon size={18} aria-hidden="true" />
                {item.label}
              </a>
            );
          })}
        </div>
      </nav>

      {galleryItem ? (
        <div className="fixed inset-0 z-[70] grid place-items-center bg-slate-950/82 p-4 backdrop-blur" role="dialog" aria-modal="true" aria-label={galleryItem.title}>
          <button
            type="button"
            onClick={() => setGalleryItem(null)}
            className="absolute right-5 top-5 grid size-11 place-items-center rounded-full bg-white text-slate-950"
            aria-label="Close gallery preview"
          >
            <X size={20} aria-hidden="true" />
          </button>
          <div className="w-full max-w-5xl overflow-hidden rounded-lg bg-[var(--surface)]">
            <div className="relative aspect-[16/10]">
              <Image
                src={safeImageSrc(galleryItem.image)}
                alt={galleryItem.title}
                fill
                sizes="90vw"
                className="object-cover"
              />
            </div>
            <div className="p-5">
              <div className="text-xs font-black uppercase tracking-[0.14em] text-[var(--primary)]">
                {galleryItem.type}
              </div>
              <h2 className="mt-1 text-xl font-black text-[var(--foreground)]">{galleryItem.title}</h2>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
