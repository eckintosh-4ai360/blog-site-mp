"use client";

import { useState, useEffect, useCallback } from "react";
import {
  projects as defaultProjects,
  constituencyStats as defaultConstituencyStats,
  impactStats as defaultImpactStats,
  news as defaultNews,
  events as defaultEvents,
  testimonials as defaultTestimonials,
  mediaItems as defaultMediaItems,
  faqs as defaultFaqs,
  type Project,
} from "@/lib/portal-data";

// ─── Storage Keys ──────────────────────────────────────────────────────────
const KEYS = {
  projects: "mp_admin_projects",
  constituencyStats: "mp_admin_constituency_stats",
  impactStats: "mp_admin_impact_stats",
  news: "mp_admin_news",
  events: "mp_admin_events",
  testimonials: "mp_admin_testimonials",
  mediaItems: "mp_admin_media_items",
  faqs: "mp_admin_faqs",
} as const;

// ─── Helper ────────────────────────────────────────────────────────────────
function load<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function save<T>(key: string, value: T): void {
  localStorage.setItem(key, JSON.stringify(value));
}

// ─── Types re-exported for consumers ──────────────────────────────────────
export type { Project } from "@/lib/portal-data";

export type StatItem = { label: string; value: string; note: string };
export type ImpactStat = { value: string; label: string };
export type NewsItem = {
  title: string;
  category: string;
  date: string;
  readTime: string;
  image: string;
  excerpt: string;
};
export type EventItem = {
  title: string;
  date: string;
  location: string;
  type: string;
};
export type Testimonial = {
  name: string;
  role: string;
  image: string;
  quote: string;
};
export type MediaItem = { label: string; count: string };
export type FaqItem = { question: string; answer: string };

// ─── Public getters (used by portal pages) ─────────────────────────────────
export function getAdminProjects(): Project[] {
  return load<Project[]>(KEYS.projects, defaultProjects);
}

export function getAdminProject(slug: string): Project | undefined {
  return getAdminProjects().find((p) => p.slug === slug);
}

export function getAdminNews(): NewsItem[] {
  return load<NewsItem[]>(KEYS.news, defaultNews);
}

export function getAdminEvents(): EventItem[] {
  return load<EventItem[]>(KEYS.events, defaultEvents);
}

export function getAdminTestimonials(): Testimonial[] {
  return load<Testimonial[]>(KEYS.testimonials, defaultTestimonials);
}

export function getAdminFaqs(): FaqItem[] {
  return load<FaqItem[]>(KEYS.faqs, defaultFaqs);
}

export function getAdminConstituencyStats(): StatItem[] {
  return load<StatItem[]>(KEYS.constituencyStats, defaultConstituencyStats);
}

export function getAdminImpactStats(): ImpactStat[] {
  return load<ImpactStat[]>(KEYS.impactStats, defaultImpactStats);
}

export function getAdminMediaItems(): MediaItem[] {
  return load<MediaItem[]>(KEYS.mediaItems, defaultMediaItems);
}

// ─── Admin Data Hook ────────────────────────────────────────────────────────
export function useAdminData() {
  const [projects, setProjectsState] = useState<Project[]>([]);
  const [constituencyStats, setConstituencyStatsState] = useState<StatItem[]>([]);
  const [impactStats, setImpactStatsState] = useState<ImpactStat[]>([]);
  const [news, setNewsState] = useState<NewsItem[]>([]);
  const [events, setEventsState] = useState<EventItem[]>([]);
  const [testimonials, setTestimonialsState] = useState<Testimonial[]>([]);
  const [mediaItems, setMediaItemsState] = useState<MediaItem[]>([]);
  const [faqs, setFaqsState] = useState<FaqItem[]>([]);

  useEffect(() => {
    setProjectsState(load(KEYS.projects, defaultProjects));
    setConstituencyStatsState(load(KEYS.constituencyStats, defaultConstituencyStats));
    setImpactStatsState(load(KEYS.impactStats, defaultImpactStats));
    setNewsState(load(KEYS.news, defaultNews));
    setEventsState(load(KEYS.events, defaultEvents));
    setTestimonialsState(load(KEYS.testimonials, defaultTestimonials));
    setMediaItemsState(load(KEYS.mediaItems, defaultMediaItems));
    setFaqsState(load(KEYS.faqs, defaultFaqs));
  }, []);

  // ── Projects ──
  const saveProject = useCallback((project: Project) => {
    setProjectsState((prev) => {
      const idx = prev.findIndex((p) => p.slug === project.slug);
      const next = idx >= 0 ? prev.map((p, i) => (i === idx ? project : p)) : [project, ...prev];
      save(KEYS.projects, next);
      return next;
    });
  }, []);

  const deleteProject = useCallback((slug: string) => {
    setProjectsState((prev) => {
      const next = prev.filter((p) => p.slug !== slug);
      save(KEYS.projects, next);
      return next;
    });
  }, []);

  // ── Generic section savers ──
  const saveConstituencyStats = useCallback((data: StatItem[]) => {
    save(KEYS.constituencyStats, data);
    setConstituencyStatsState(data);
  }, []);

  const saveImpactStats = useCallback((data: ImpactStat[]) => {
    save(KEYS.impactStats, data);
    setImpactStatsState(data);
  }, []);

  const saveNews = useCallback((data: NewsItem[]) => {
    save(KEYS.news, data);
    setNewsState(data);
  }, []);

  const saveEvents = useCallback((data: EventItem[]) => {
    save(KEYS.events, data);
    setEventsState(data);
  }, []);

  const saveTestimonials = useCallback((data: Testimonial[]) => {
    save(KEYS.testimonials, data);
    setTestimonialsState(data);
  }, []);

  const saveMediaItems = useCallback((data: MediaItem[]) => {
    save(KEYS.mediaItems, data);
    setMediaItemsState(data);
  }, []);

  const saveFaqs = useCallback((data: FaqItem[]) => {
    save(KEYS.faqs, data);
    setFaqsState(data);
  }, []);

  const resetAll = useCallback(() => {
    Object.values(KEYS).forEach((k) => localStorage.removeItem(k));
    setProjectsState(defaultProjects);
    setConstituencyStatsState(defaultConstituencyStats);
    setImpactStatsState(defaultImpactStats);
    setNewsState(defaultNews);
    setEventsState(defaultEvents);
    setTestimonialsState(defaultTestimonials);
    setMediaItemsState(defaultMediaItems);
    setFaqsState(defaultFaqs);
  }, []);

  return {
    projects,
    constituencyStats,
    impactStats,
    news,
    events,
    testimonials,
    mediaItems,
    faqs,
    saveProject,
    deleteProject,
    saveConstituencyStats,
    saveImpactStats,
    saveNews,
    saveEvents,
    saveTestimonials,
    saveMediaItems,
    saveFaqs,
    resetAll,
  };
}
