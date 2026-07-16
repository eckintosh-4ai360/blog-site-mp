"use client";

import { useState, useEffect } from "react";
import { PlusCircle, Trash2, Save } from "lucide-react";
import ImageUploadField from "./ImageUploadField";
import {
  useAdminData,
  type StatItem,
  type ImpactStat,
  type NewsItem,
  type EventItem,
  type Testimonial,
  type MediaItem,
  type FaqItem,
} from "@/lib/admin-data";

// ─── Shared Styles ─────────────────────────────────────────────────────────
const inputCls =
  "w-full rounded-xl border border-[var(--line)] bg-[var(--surface)] px-4 py-3 text-sm font-semibold text-[var(--foreground)] placeholder:text-[var(--muted)]/60 focus:border-[var(--primary)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/20 transition";

const textareaCls = inputCls + " resize-none leading-7";

function dbDateToInputDate(dbDate: string | undefined | null): string {
  if (!dbDate) return "";
  dbDate = dbDate.trim();
  if (/^\d{4}-\d{2}-\d{2}$/.test(dbDate)) {
    return dbDate;
  }
  const parts = dbDate.split(/\s+/);
  if (parts.length === 3) {
    const day = parts[0];
    const monthName = parts[1].toLowerCase().slice(0, 3);
    const year = parts[2];
    const MONTH_MAP: Record<string, string> = {
      jan: "01", feb: "02", mar: "03", apr: "04", may: "05", jun: "06",
      jul: "07", aug: "08", sep: "09", oct: "10", nov: "11", dec: "12"
    };
    const month = MONTH_MAP[monthName];
    if (month) {
      return `${year}-${month}-${day.padStart(2, '0')}`;
    }
  }
  const parsed = Date.parse(dbDate);
  if (!isNaN(parsed)) {
    const d = new Date(parsed);
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const dayStr = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${dayStr}`;
  }
  return "";
}

function inputDateToDbDate(inputDate: string | undefined | null): string {
  if (!inputDate) return "";
  inputDate = inputDate.trim();
  const parts = inputDate.split("-");
  if (parts.length === 3) {
    const year = parts[0];
    const monthIndex = parseInt(parts[1], 10);
    const day = parseInt(parts[2], 10);
    const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const monthName = MONTHS[monthIndex - 1];
    if (monthName) {
      return `${day} ${monthName} ${year}`;
    }
  }
  return inputDate;
}

function SaveButton({ onClick, saved }: { onClick: () => void; saved: boolean }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex items-center gap-2 rounded-xl bg-[var(--secondary)] px-5 py-2.5 text-sm font-black text-white hover:opacity-90 transition"
    >
      <Save size={15} />
      {saved ? "Saved ✓" : "Save Changes"}
    </button>
  );
}

function SectionCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-6 shadow-sm">
      <h3 className="mb-6 text-base font-black text-[var(--foreground)]">{title}</h3>
      {children}
    </div>
  );
}

// ─── Constituency Stats ────────────────────────────────────────────────────
function ConstituencyStatsEditor() {
  const { constituencyStats, saveConstituencyStats } = useAdminData();
  const [items, setItems] = useState<StatItem[]>([]);
  const [saved, setSaved] = useState(false);

  // Sync data from database hook using useEffect
  useEffect(() => {
    if (constituencyStats && constituencyStats.length > 0) {
      setItems(constituencyStats);
    }
  }, [constituencyStats]);

  function save() {
    saveConstituencyStats(items);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  return (
    <SectionCard title="Constituency Stats">
      {/* Column Headers */}
      {items.length > 0 && (
        <div className="mb-2 hidden gap-3 px-1 text-[10px] font-black uppercase tracking-wider text-[var(--muted)] sm:flex">
          <div className="flex-[2]">Stat Label / Description</div>
          <div className="w-32">Current Value</div>
          <div className="flex-[2]">Context / Note</div>
          <div className="w-11"></div>
        </div>
      )}

      <div className="space-y-4">
        {items.map((item, i) => (
          <div key={i} className="flex flex-col gap-3 rounded-2xl border border-[var(--line)] bg-[var(--surface-soft)]/20 p-4 sm:flex-row sm:items-end sm:border-0 sm:bg-transparent sm:p-0">
            {/* Stat Label */}
            <div className="flex-[2]">
              <label className="block text-[10px] font-black uppercase tracking-[0.16em] text-[var(--muted)] mb-1 sm:hidden">
                Stat Label / Description
              </label>
              <input
                className={inputCls}
                placeholder="Label"
                value={item.label}
                onChange={(e) => {
                  const n = [...items]; n[i] = { ...n[i], label: e.target.value }; setItems(n);
                }}
              />
            </div>

            {/* Value */}
            <div className="w-full sm:w-32">
              <label className="block text-[10px] font-black uppercase tracking-[0.16em] text-[var(--muted)] mb-1 sm:hidden">
                Current Value
              </label>
              <input
                className={inputCls}
                placeholder="Value"
                value={item.value}
                onChange={(e) => {
                  const n = [...items]; n[i] = { ...n[i], value: e.target.value }; setItems(n);
                }}
              />
            </div>

            {/* Note */}
            <div className="flex-[2]">
              <label className="block text-[10px] font-black uppercase tracking-[0.16em] text-[var(--muted)] mb-1 sm:hidden">
                Context / Note
              </label>
              <input
                className={inputCls}
                placeholder="Note"
                value={item.note}
                onChange={(e) => {
                  const n = [...items]; n[i] = { ...n[i], note: e.target.value }; setItems(n);
                }}
              />
            </div>

            {/* Actions */}
            <button
              type="button"
              onClick={() => setItems(items.filter((_, idx) => idx !== i))}
              className="grid size-11 shrink-0 place-items-center rounded-xl border border-[var(--line)] text-[var(--danger)] hover:bg-red-500/10 transition self-end sm:self-auto"
              aria-label="Delete stat"
            >
              <Trash2 size={14} />
            </button>
          </div>
        ))}
      </div>

      <div className="mt-4 flex justify-between">
        <button
          type="button"
          onClick={() => setItems([...items, { label: "", value: "", note: "" }])}
          className="flex items-center gap-2 text-xs font-black text-[var(--primary)] hover:underline"
        >
          <PlusCircle size={14} /> Add Stat
        </button>
        <SaveButton onClick={save} saved={saved} />
      </div>
    </SectionCard>
  );
}

// ─── Impact Stats ──────────────────────────────────────────────────────────
function ImpactStatsEditor() {
  const { impactStats, saveImpactStats } = useAdminData();
  const [items, setItems] = useState<ImpactStat[]>([]);
  const [saved, setSaved] = useState(false);

  // Sync data from database hook using useEffect
  useEffect(() => {
    if (impactStats && impactStats.length > 0) {
      setItems(impactStats);
    }
  }, [impactStats]);

  function save() {
    saveImpactStats(items);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  return (
    <SectionCard title="Impact Stats (Hero Numbers)">
      {/* Column Headers */}
      {items.length > 0 && (
        <div className="mb-2 hidden gap-3 px-1 text-[10px] font-black uppercase tracking-wider text-[var(--muted)] sm:flex">
          <div className="w-32">Stat Value</div>
          <div className="flex-1">Stat Label / Description</div>
          <div className="w-11"></div>
        </div>
      )}

      <div className="space-y-4">
        {items.map((item, i) => (
          <div key={i} className="flex flex-col gap-3 rounded-2xl border border-[var(--line)] bg-[var(--surface-soft)]/20 p-4 sm:flex-row sm:items-end sm:border-0 sm:bg-transparent sm:p-0">
            {/* Value */}
            <div className="w-full sm:w-32">
              <label className="block text-[10px] font-black uppercase tracking-[0.16em] text-[var(--muted)] mb-1 sm:hidden">
                Stat Value
              </label>
              <input
                className={inputCls}
                placeholder="Value e.g. 15"
                value={item.value}
                onChange={(e) => {
                  const n = [...items]; n[i] = { ...n[i], value: e.target.value }; setItems(n);
                }}
              />
            </div>

            {/* Label */}
            <div className="flex-1">
              <label className="block text-[10px] font-black uppercase tracking-[0.16em] text-[var(--muted)] mb-1 sm:hidden">
                Stat Label / Description
              </label>
              <input
                className={inputCls}
                placeholder="Label e.g. Schools Built"
                value={item.label}
                onChange={(e) => {
                  const n = [...items]; n[i] = { ...n[i], label: e.target.value }; setItems(n);
                }}
              />
            </div>

            {/* Actions */}
            <button
              type="button"
              onClick={() => setItems(items.filter((_, idx) => idx !== i))}
              className="grid size-11 shrink-0 place-items-center rounded-xl border border-[var(--line)] text-[var(--danger)] hover:bg-red-500/10 transition self-end sm:self-auto"
              aria-label="Delete stat"
            >
              <Trash2 size={14} />
            </button>
          </div>
        ))}
      </div>

      <div className="mt-4 flex justify-between">
        <button
          type="button"
          onClick={() => setItems([...items, { value: "", label: "" }])}
          className="flex items-center gap-2 text-xs font-black text-[var(--primary)] hover:underline"
        >
          <PlusCircle size={14} /> Add Stat
        </button>
        <SaveButton onClick={save} saved={saved} />
      </div>
    </SectionCard>
  );
}

// ─── News ──────────────────────────────────────────────────────────────────
function NewsEditor() {
  const { news, saveNews } = useAdminData();
  const [items, setItems] = useState<NewsItem[]>([]);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (news && news.length > 0) {
      setItems(news);
    }
  }, [news]);

  function save() {
    saveNews(items);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  return (
    <SectionCard title="News Articles">
      <div className="space-y-5">
        {items.map((item, i) => (
          <div key={i} className="rounded-xl border border-[var(--line)] p-4 space-y-3">
            <div className="flex justify-between">
              <span className="text-xs font-black uppercase tracking-[0.14em] text-[var(--primary)]">Article #{i + 1}</span>
              <button
                type="button"
                onClick={() => setItems(items.filter((_, idx) => idx !== i))}
                className="text-xs font-black text-[var(--danger)] hover:underline flex items-center gap-1"
              >
                <Trash2 size={12} /> Remove
              </button>
            </div>
            <input className={inputCls} placeholder="Title" value={item.title}
              onChange={(e) => { const n = [...items]; n[i] = { ...n[i], title: e.target.value }; setItems(n); }} />
            <div className="grid gap-3 sm:grid-cols-3">
              <input className={inputCls} placeholder="Category" value={item.category}
                onChange={(e) => { const n = [...items]; n[i] = { ...n[i], category: e.target.value }; setItems(n); }} />
              <input type="date" className={inputCls} value={dbDateToInputDate(item.date)}
                onChange={(e) => { const n = [...items]; n[i] = { ...n[i], date: inputDateToDbDate(e.target.value) }; setItems(n); }} />
              <input className={inputCls} placeholder="Read time e.g. 3 min read" value={item.readTime}
                onChange={(e) => { const n = [...items]; n[i] = { ...n[i], readTime: e.target.value }; setItems(n); }} />
            </div>
            <ImageUploadField label="Article Image" value={item.image}
              onChange={(v) => { const n = [...items]; n[i] = { ...n[i], image: v }; setItems(n); }} />
            <textarea rows={2} className={textareaCls} placeholder="Excerpt…" value={item.excerpt}
              onChange={(e) => { const n = [...items]; n[i] = { ...n[i], excerpt: e.target.value }; setItems(n); }} />
          </div>
        ))}
      </div>
      <div className="mt-4 flex justify-between">
        <button type="button"
          onClick={() => setItems([...items, { title: "", category: "", date: "", readTime: "", image: "", excerpt: "" }])}
          className="flex items-center gap-2 text-xs font-black text-[var(--primary)] hover:underline"
        >
          <PlusCircle size={14} /> Add Article
        </button>
        <SaveButton onClick={save} saved={saved} />
      </div>
    </SectionCard>
  );
}

// ─── Events ────────────────────────────────────────────────────────────────
function EventsEditor() {
  const { events, saveEvents } = useAdminData();
  const [items, setItems] = useState<EventItem[]>([]);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (events && events.length > 0) {
      setItems(events);
    }
  }, [events]);

  function save() {
    saveEvents(items);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  return (
    <SectionCard title="Upcoming Events">
      <div className="space-y-3">
        {items.map((item, i) => (
          <div key={i} className="grid gap-3 sm:grid-cols-4 items-start">
            <input className={inputCls} placeholder="Title" value={item.title}
              onChange={(e) => { const n = [...items]; n[i] = { ...n[i], title: e.target.value }; setItems(n); }} />
            <input type="date" className={inputCls} value={dbDateToInputDate(item.date)}
              onChange={(e) => { const n = [...items]; n[i] = { ...n[i], date: inputDateToDbDate(e.target.value) }; setItems(n); }} />
            <input className={inputCls} placeholder="Location" value={item.location}
              onChange={(e) => { const n = [...items]; n[i] = { ...n[i], location: e.target.value }; setItems(n); }} />
            <div className="flex gap-2">
              <input className={inputCls + " flex-1"} placeholder="Type" value={item.type}
                onChange={(e) => { const n = [...items]; n[i] = { ...n[i], type: e.target.value }; setItems(n); }} />
              <button type="button"
                onClick={() => setItems(items.filter((_, idx) => idx !== i))}
                className="grid size-11 shrink-0 place-items-center rounded-xl border border-[var(--line)] text-[var(--danger)] hover:bg-red-500/10 transition"
              >
                <Trash2 size={14} />
              </button>
            </div>
          </div>
        ))}
      </div>
      <div className="mt-4 flex justify-between">
        <button type="button"
          onClick={() => setItems([...items, { title: "", date: "", location: "", type: "" }])}
          className="flex items-center gap-2 text-xs font-black text-[var(--primary)] hover:underline"
        >
          <PlusCircle size={14} /> Add Event
        </button>
        <SaveButton onClick={save} saved={saved} />
      </div>
    </SectionCard>
  );
}

// ─── Testimonials ──────────────────────────────────────────────────────────
function TestimonialsEditor() {
  const { testimonials, saveTestimonials } = useAdminData();
  const [items, setItems] = useState<Testimonial[]>([]);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (testimonials && testimonials.length > 0) {
      setItems(testimonials);
    }
  }, [testimonials]);

  function save() {
    saveTestimonials(items);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  return (
    <SectionCard title="Testimonials">
      <div className="space-y-5">
        {items.map((item, i) => (
          <div key={i} className="rounded-xl border border-[var(--line)] p-4 space-y-3">
            <div className="flex justify-between">
              <span className="text-xs font-black uppercase tracking-[0.14em] text-[var(--primary)]">Testimonial #{i + 1}</span>
              <button type="button" onClick={() => setItems(items.filter((_, idx) => idx !== i))}
                className="text-xs font-black text-[var(--danger)] hover:underline flex items-center gap-1">
                <Trash2 size={12} /> Remove
              </button>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <input className={inputCls} placeholder="Name" value={item.name}
                onChange={(e) => { const n = [...items]; n[i] = { ...n[i], name: e.target.value }; setItems(n); }} />
              <input className={inputCls} placeholder="Role" value={item.role}
                onChange={(e) => { const n = [...items]; n[i] = { ...n[i], role: e.target.value }; setItems(n); }} />
            </div>
            <ImageUploadField label="Photo" value={item.image}
              onChange={(v) => { const n = [...items]; n[i] = { ...n[i], image: v }; setItems(n); }} />
            <textarea rows={3} className={textareaCls} placeholder="Quote…" value={item.quote}
              onChange={(e) => { const n = [...items]; n[i] = { ...n[i], quote: e.target.value }; setItems(n); }} />
          </div>
        ))}
      </div>
      <div className="mt-4 flex justify-between">
        <button type="button"
          onClick={() => setItems([...items, { name: "", role: "", image: "", quote: "" }])}
          className="flex items-center gap-2 text-xs font-black text-[var(--primary)] hover:underline"
        >
          <PlusCircle size={14} /> Add Testimonial
        </button>
        <SaveButton onClick={save} saved={saved} />
      </div>
    </SectionCard>
  );
}

// ─── Media Items ───────────────────────────────────────────────────────────
function MediaItemsEditor() {
  const { mediaItems, saveMediaItems } = useAdminData();
  const [items, setItems] = useState<MediaItem[]>([]);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (mediaItems && mediaItems.length > 0) {
      setItems(mediaItems);
    }
  }, [mediaItems]);

  function save() {
    saveMediaItems(items);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  return (
    <SectionCard title="Media Section Counts">
      <div className="grid gap-3 sm:grid-cols-2">
        {items.map((item, i) => (
          <div key={i} className="flex gap-3">
            <input className={inputCls + " flex-1"} placeholder="Label" value={item.label}
              onChange={(e) => { const n = [...items]; n[i] = { ...n[i], label: e.target.value }; setItems(n); }} />
            <input className={inputCls + " w-24"} placeholder="Count" value={item.count}
              onChange={(e) => { const n = [...items]; n[i] = { ...n[i], count: e.target.value }; setItems(n); }} />
            <button type="button" onClick={() => setItems(items.filter((_, idx) => idx !== i))}
              className="grid size-11 shrink-0 place-items-center rounded-xl border border-[var(--line)] text-[var(--danger)] hover:bg-red-500/10 transition">
              <Trash2 size={14} />
            </button>
          </div>
        ))}
      </div>
      <div className="mt-4 flex justify-between">
        <button type="button"
          onClick={() => setItems([...items, { label: "", count: "0" }])}
          className="flex items-center gap-2 text-xs font-black text-[var(--primary)] hover:underline"
        >
          <PlusCircle size={14} /> Add Media Type
        </button>
        <SaveButton onClick={save} saved={saved} />
      </div>
    </SectionCard>
  );
}

// ─── FAQs ──────────────────────────────────────────────────────────────────
function FaqsEditor() {
  const { faqs, saveFaqs } = useAdminData();
  const [items, setItems] = useState<FaqItem[]>([]);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (faqs && faqs.length > 0) {
      setItems(faqs);
    }
  }, [faqs]);

  function save() {
    saveFaqs(items);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  return (
    <SectionCard title="FAQs">
      <div className="space-y-4">
        {items.map((item, i) => (
          <div key={i} className="rounded-xl border border-[var(--line)] p-4 space-y-3">
            <div className="flex justify-between">
              <span className="text-xs font-black uppercase tracking-[0.14em] text-[var(--primary)]">FAQ #{i + 1}</span>
              <button type="button" onClick={() => setItems(items.filter((_, idx) => idx !== i))}
                className="text-xs font-black text-[var(--danger)] hover:underline flex items-center gap-1">
                <Trash2 size={12} /> Remove
              </button>
            </div>
            <input className={inputCls} placeholder="Question" value={item.question}
              onChange={(e) => { const n = [...items]; n[i] = { ...n[i], question: e.target.value }; setItems(n); }} />
            <textarea rows={3} className={textareaCls} placeholder="Answer…" value={item.answer}
              onChange={(e) => { const n = [...items]; n[i] = { ...n[i], answer: e.target.value }; setItems(n); }} />
          </div>
        ))}
      </div>
      <div className="mt-4 flex justify-between">
        <button type="button"
          onClick={() => setItems([...items, { question: "", answer: "" }])}
          className="flex items-center gap-2 text-xs font-black text-[var(--primary)] hover:underline"
        >
          <PlusCircle size={14} /> Add FAQ
        </button>
        <SaveButton onClick={save} saved={saved} />
      </div>
    </SectionCard>
  );
}

// ─── Tab Container ──────────────────────────────────────────────────────────
const TABS = [
  { id: "stats", label: "Stats" },
  { id: "impact", label: "Impact Numbers" },
  { id: "news", label: "News" },
  { id: "events", label: "Events" },
  { id: "testimonials", label: "Testimonials" },
  { id: "media", label: "Media Counts" },
  { id: "faqs", label: "FAQs" },
];

export default function PageDetailForms() {
  const [activeTab, setActiveTab] = useState("stats");

  return (
    <div>
      {/* Tab bar */}
      <div className="mb-6 flex flex-wrap gap-2 rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-2">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id)}
            className={`rounded-xl px-4 py-2 text-xs font-black transition-all ${
              activeTab === tab.id
                ? "bg-[var(--primary)] text-white shadow"
                : "text-[var(--muted)] hover:bg-[var(--surface-soft)] hover:text-[var(--foreground)]"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      {activeTab === "stats" && <ConstituencyStatsEditor />}
      {activeTab === "impact" && <ImpactStatsEditor />}
      {activeTab === "news" && <NewsEditor />}
      {activeTab === "events" && <EventsEditor />}
      {activeTab === "testimonials" && <TestimonialsEditor />}
      {activeTab === "media" && <MediaItemsEditor />}
      {activeTab === "faqs" && <FaqsEditor />}
    </div>
  );
}
