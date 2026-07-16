"use client";

import { useState, useEffect, useCallback } from "react";
import { type Project } from "@/lib/portal-data";

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

// ─── Legacy Sync Placeholders (Refactored to async fetches in components) ───
export function getAdminProjects(): Project[] {
  return [];
}
export function getAdminProject(slug: string): Project | undefined {
  return undefined;
}
export function getAdminNews(): NewsItem[] {
  return [];
}
export function getAdminEvents(): EventItem[] {
  return [];
}
export function getAdminTestimonials(): Testimonial[] {
  return [];
}
export function getAdminFaqs(): FaqItem[] {
  return [];
}
export function getAdminConstituencyStats(): StatItem[] {
  return [];
}
export function getAdminImpactStats(): ImpactStat[] {
  return [];
}
export function getAdminMediaItems(): MediaItem[] {
  return [];
}

// ─── Modern Client Data Hook ───
export function useAdminData() {
  const [projects, setProjectsState] = useState<Project[]>([]);
  const [constituencyStats, setConstituencyStatsState] = useState<StatItem[]>([]);
  const [impactStats, setImpactStatsState] = useState<ImpactStat[]>([]);
  const [news, setNewsState] = useState<NewsItem[]>([]);
  const [events, setEventsState] = useState<EventItem[]>([]);
  const [testimonials, setTestimonialsState] = useState<Testimonial[]>([]);
  const [mediaItems, setMediaItemsState] = useState<MediaItem[]>([]);
  const [faqs, setFaqsState] = useState<FaqItem[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    try {
      const [p, cs, is, n, e, t, m, f] = await Promise.all([
        fetch("/api/projects").then((r) => r.json()),
        fetch("/api/stats").then((r) => r.json()),
        fetch("/api/stats?type=impact").then((r) => r.json()),
        fetch("/api/news").then((r) => r.json()),
        fetch("/api/events").then((r) => r.json()),
        fetch("/api/testimonials").then((r) => r.json()),
        fetch("/api/media").then((r) => r.json()),
        fetch("/api/faqs").then((r) => r.json()),
      ]);

      if (Array.isArray(p)) setProjectsState(p);
      if (Array.isArray(cs)) setConstituencyStatsState(cs);
      if (Array.isArray(is)) setImpactStatsState(is);
      if (Array.isArray(n)) setNewsState(n);
      if (Array.isArray(e)) setEventsState(e);
      if (Array.isArray(t)) setTestimonialsState(t);
      if (Array.isArray(m)) setMediaItemsState(m);
      if (Array.isArray(f)) setFaqsState(f);
    } catch (err) {
      console.error("Failed to refresh admin data from API:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const saveProject = useCallback(async (project: Project) => {
    setLoading(true);
    try {
      const res = await fetch("/api/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(project),
      });
      if (!res.ok) throw new Error("Failed to save project");
      await refresh();
    } catch (err) {
      console.error(err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [refresh]);

  const deleteProject = useCallback(async (slug: string) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/projects/${slug}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Failed to delete project");
      await refresh();
    } catch (err) {
      console.error(err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [refresh]);

  const saveConstituencyStats = useCallback(async (data: StatItem[]) => {
    setLoading(true);
    try {
      const res = await fetch("/api/stats", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "constituency", items: data }),
      });
      if (!res.ok) throw new Error("Failed to save constituency stats");
      await refresh();
    } catch (err) {
      console.error(err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [refresh]);

  const saveImpactStats = useCallback(async (data: ImpactStat[]) => {
    setLoading(true);
    try {
      const res = await fetch("/api/stats", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "impact", items: data }),
      });
      if (!res.ok) throw new Error("Failed to save impact stats");
      await refresh();
    } catch (err) {
      console.error(err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [refresh]);

  const saveNews = useCallback(async (data: NewsItem[]) => {
    setLoading(true);
    try {
      const res = await fetch("/api/news", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed to save news");
      await refresh();
    } catch (err) {
      console.error(err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [refresh]);

  const saveEvents = useCallback(async (data: EventItem[]) => {
    setLoading(true);
    try {
      const res = await fetch("/api/events", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed to save events");
      await refresh();
    } catch (err) {
      console.error(err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [refresh]);

  const saveTestimonials = useCallback(async (data: Testimonial[]) => {
    setLoading(true);
    try {
      const res = await fetch("/api/testimonials", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed to save testimonials");
      await refresh();
    } catch (err) {
      console.error(err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [refresh]);

  const saveMediaItems = useCallback(async (data: MediaItem[]) => {
    setLoading(true);
    try {
      const res = await fetch("/api/media", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed to save media items");
      await refresh();
    } catch (err) {
      console.error(err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [refresh]);

  const saveFaqs = useCallback(async (data: FaqItem[]) => {
    setLoading(true);
    try {
      const res = await fetch("/api/faqs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed to save FAQs");
      await refresh();
    } catch (err) {
      console.error(err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [refresh]);

  const resetAll = useCallback(async () => {
    // Placeholder to match hook type
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
    loading,
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
