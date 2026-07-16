"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { PlusCircle, Trash2, Save, ArrowLeft } from "lucide-react";
import { categories, statuses, type Project, type ProjectStatus } from "@/lib/portal-data";
import { useAdminData } from "@/lib/admin-data";
import ImageUploadField from "./ImageUploadField";

// ─── Helpers ───────────────────────────────────────────────────────────────
function slugify(str: string) {
  return str
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-");
}

const EMPTY_PROJECT: Omit<Project, "slug"> & { slug: string } = {
  slug: "",
  title: "",
  category: categories[0],
  status: "Planned",
  community: "",
  budget: 0,
  budgetLabel: "",
  year: String(new Date().getFullYear()),
  progress: 0,
  image: "",
  beforeImage: "",
  afterImage: "",
  contractor: "",
  fundingSource: "",
  startDate: "",
  expectedCompletion: "",
  completionDate: "",
  description: "",
  story: "",
  objectives: [""],
  challenges: [""],
  outcomes: [""],
  timeline: [{ label: "Proposal", date: "", done: false }],
  updates: [{ date: "", text: "" }],
  gallery: [{ title: "", type: "Photo", image: "" }],
  map: { lat: 5.6037, lng: -0.187, x: 50, y: 50 },
};

// ─── Field Components ──────────────────────────────────────────────────────
function Field({
  label,
  required,
  children,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-black uppercase tracking-[0.14em] text-[var(--muted)]">
        {label}
        {required && <span className="ml-1 text-[var(--danger)]">*</span>}
      </span>
      {children}
    </label>
  );
}

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

// ─── Section Heading ───────────────────────────────────────────────────────
function SectionHeading({ label }: { label: string }) {
  return (
    <div className="mt-10 mb-5 flex items-center gap-3">
      <div className="h-px flex-1 bg-[var(--line)]" />
      <span className="text-xs font-black uppercase tracking-[0.2em] text-[var(--primary)]">{label}</span>
      <div className="h-px flex-1 bg-[var(--line)]" />
    </div>
  );
}

// ─── Dynamic String Array Editor ───────────────────────────────────────────
function StringArrayEditor({
  label,
  items,
  onChange,
  placeholder,
}: {
  label: string;
  items: string[];
  onChange: (v: string[]) => void;
  placeholder?: string;
}) {
  return (
    <div>
      <p className="mb-2 text-xs font-black uppercase tracking-[0.14em] text-[var(--muted)]">{label}</p>
      <div className="space-y-2">
        {items.map((item, i) => (
          <div key={i} className="flex gap-2">
            <input
              className={inputCls + " flex-1"}
              value={item}
              placeholder={placeholder ?? "Enter item…"}
              onChange={(e) => {
                const next = [...items];
                next[i] = e.target.value;
                onChange(next);
              }}
            />
            <button
              type="button"
              onClick={() => onChange(items.filter((_, idx) => idx !== i))}
              className="grid size-11 shrink-0 place-items-center rounded-xl border border-[var(--line)] text-[var(--danger)] hover:bg-red-500/10 transition"
            >
              <Trash2 size={15} />
            </button>
          </div>
        ))}
      </div>
      <button
        type="button"
        onClick={() => onChange([...items, ""])}
        className="mt-3 flex items-center gap-2 text-xs font-black text-[var(--primary)] hover:underline"
      >
        <PlusCircle size={14} /> Add item
      </button>
    </div>
  );
}

// ─── Main Form ─────────────────────────────────────────────────────────────
type Props = {
  initial?: Project;
  mode: "create" | "edit";
};

export default function ProjectForm({ initial, mode }: Props) {
  const router = useRouter();
  const { saveProject } = useAdminData();

  const [form, setForm] = useState<Project>(
    initial ?? (EMPTY_PROJECT as Project)
  );
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  // ── Generic field updater ──
  function set<K extends keyof Project>(key: K, value: Project[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  // Auto-generate slug from title when creating
  function handleTitleChange(v: string) {
    set("title", v);
    if (mode === "create") set("slug", slugify(v));
  }

  // ── Submit ──
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!form.title.trim()) { setError("Title is required."); return; }
    if (!form.slug.trim()) { setError("Slug is required."); return; }
    if (!form.description.trim()) { setError("Description is required."); return; }
    setSaving(true);
    try {
      // Clean up empty array entries
      const clean: Project = {
        ...form,
        objectives: form.objectives.filter(Boolean),
        challenges: form.challenges.filter(Boolean),
        outcomes: form.outcomes.filter(Boolean),
        timeline: form.timeline.filter((t) => t.label),
        updates: form.updates.filter((u) => u.text || u.date),
        gallery: form.gallery.filter((g) => g.title || g.image),
      };
      saveProject(clean);
      router.push("/admin/dashboard");
    } catch {
      setError("Something went wrong. Please try again.");
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} noValidate>
      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        <button
          type="button"
          onClick={() => router.back()}
          className="flex items-center gap-2 text-sm font-black text-[var(--muted)] hover:text-[var(--foreground)] transition"
        >
          <ArrowLeft size={16} /> Back
        </button>
        <h1 className="text-2xl font-black text-[var(--foreground)]">
          {mode === "create" ? "New Project" : "Edit Project"}
        </h1>
        <button
          type="submit"
          disabled={saving}
          className="flex items-center gap-2 rounded-xl bg-[var(--primary)] px-6 py-3 text-sm font-black text-white hover:opacity-90 disabled:opacity-60 transition"
        >
          <Save size={16} />
          {saving ? "Saving…" : "Save Project"}
        </button>
      </div>

      {error && (
        <div className="mb-6 rounded-xl border border-red-300 bg-red-50 px-5 py-4 text-sm font-semibold text-[var(--danger)]">
          {error}
        </div>
      )}

      <div className="rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-8 shadow-sm">

        {/* ── Core Info ── */}
        <SectionHeading label="Core Information" />
        <div className="grid gap-5 sm:grid-cols-2">
          <Field label="Title" required>
            <input
              className={inputCls}
              value={form.title}
              onChange={(e) => handleTitleChange(e.target.value)}
              placeholder="e.g. Adom New Town STEM Block"
            />
          </Field>
          <Field label="Slug (URL key)" required>
            <input
              className={inputCls}
              value={form.slug}
              onChange={(e) => set("slug", slugify(e.target.value))}
              placeholder="auto-generated from title"
            />
          </Field>
          <Field label="Category" required>
            <select
              className={inputCls}
              value={form.category}
              onChange={(e) => set("category", e.target.value)}
            >
              {categories.map((c) => <option key={c}>{c}</option>)}
            </select>
          </Field>
          <Field label="Status" required>
            <select
              className={inputCls}
              value={form.status}
              onChange={(e) => set("status", e.target.value as ProjectStatus)}
            >
              {statuses.map((s) => <option key={s}>{s}</option>)}
            </select>
          </Field>
          <Field label="Community">
            <input
              className={inputCls}
              value={form.community}
              onChange={(e) => set("community", e.target.value)}
              placeholder="e.g. Adom New Town"
            />
          </Field>
          <Field label="Year">
            <input
              className={inputCls}
              value={form.year}
              onChange={(e) => set("year", e.target.value)}
              placeholder="e.g. 2025"
            />
          </Field>
          <Field label="Progress (%)">
            <input
              type="number"
              min={0}
              max={100}
              className={inputCls}
              value={form.progress}
              onChange={(e) => set("progress", Number(e.target.value))}
            />
          </Field>
          <Field label="Budget (GHS, numeric)">
            <input
              type="number"
              className={inputCls}
              value={form.budget}
              onChange={(e) => {
                const v = Number(e.target.value);
                set("budget", v);
                set("budgetLabel", `GHS ${(v / 1_000_000).toFixed(1)}M`);
              }}
              placeholder="e.g. 12400000"
            />
          </Field>
          <Field label="Budget Label">
            <input
              className={inputCls}
              value={form.budgetLabel}
              onChange={(e) => set("budgetLabel", e.target.value)}
              placeholder="e.g. GHS 12.4M"
            />
          </Field>
          <Field label="Contractor">
            <input
              className={inputCls}
              value={form.contractor}
              onChange={(e) => set("contractor", e.target.value)}
            />
          </Field>
          <Field label="Funding Source">
            <input
              className={inputCls}
              value={form.fundingSource}
              onChange={(e) => set("fundingSource", e.target.value)}
            />
          </Field>
          <Field label="Start Date">
            <input
              type="date"
              className={inputCls}
              value={dbDateToInputDate(form.startDate)}
              onChange={(e) => set("startDate", inputDateToDbDate(e.target.value))}
            />
          </Field>
          <Field label="Expected Completion">
            <input
              type="date"
              className={inputCls}
              value={dbDateToInputDate(form.expectedCompletion)}
              onChange={(e) => set("expectedCompletion", inputDateToDbDate(e.target.value))}
            />
          </Field>
          <Field label="Completion Date (if done)">
            <input
              type="date"
              className={inputCls}
              value={dbDateToInputDate(form.completionDate ?? "")}
              onChange={(e) => set("completionDate", inputDateToDbDate(e.target.value) || undefined)}
            />
          </Field>
        </div>

        {/* ── Description & Story ── */}
        <SectionHeading label="Description & Story" />
        <div className="grid gap-5">
          <Field label="Short Description" required>
            <textarea
              rows={3}
              className={textareaCls}
              value={form.description}
              onChange={(e) => set("description", e.target.value)}
              placeholder="1-2 sentence summary shown on the project card and hero."
            />
          </Field>
          <Field label="Full Story">
            <textarea
              rows={5}
              className={textareaCls}
              value={form.story}
              onChange={(e) => set("story", e.target.value)}
              placeholder="Background context and narrative for the project page."
            />
          </Field>
        </div>

        {/* ── Images ── */}
        <SectionHeading label="Images" />
        <div className="grid gap-5 sm:grid-cols-3">
          <ImageUploadField
            label="Main Image"
            required
            value={form.image}
            onChange={(v) => set("image", v)}
          />
          <ImageUploadField
            label="Before Image"
            value={form.beforeImage}
            onChange={(v) => set("beforeImage", v)}
          />
          <ImageUploadField
            label="After Image"
            value={form.afterImage}
            onChange={(v) => set("afterImage", v)}
          />
        </div>
        {form.image && (
          <div className="mt-4 h-40 w-full overflow-hidden rounded-xl border border-[var(--line)]">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={form.image} alt="Preview" className="h-full w-full object-cover" />
          </div>
        )}

        {/* ── Dynamic Arrays ── */}
        <SectionHeading label="Objectives, Challenges & Outcomes" />
        <div className="grid gap-8 md:grid-cols-3">
          <StringArrayEditor
            label="Objectives"
            items={form.objectives}
            onChange={(v) => set("objectives", v)}
            placeholder="Enter an objective…"
          />
          <StringArrayEditor
            label="Challenges"
            items={form.challenges}
            onChange={(v) => set("challenges", v)}
            placeholder="Enter a challenge…"
          />
          <StringArrayEditor
            label="Outcomes"
            items={form.outcomes}
            onChange={(v) => set("outcomes", v)}
            placeholder="Enter an outcome…"
          />
        </div>

        {/* ── Timeline ── */}
        <SectionHeading label="Project Timeline" />
        <div className="space-y-3">
          {form.timeline.map((item, i) => (
            <div key={i} className="flex items-center gap-3">
              <input
                className={inputCls + " flex-1"}
                value={item.label}
                placeholder="Stage label (e.g. Ground Breaking)"
                onChange={(e) => {
                  const next = [...form.timeline];
                  next[i] = { ...next[i], label: e.target.value };
                  set("timeline", next);
                }}
              />
              <input
                type="date"
                className={inputCls + " w-44"}
                value={dbDateToInputDate(item.date)}
                onChange={(e) => {
                  const next = [...form.timeline];
                  next[i] = { ...next[i], date: inputDateToDbDate(e.target.value) };
                  set("timeline", next);
                }}
              />
              <label className="flex shrink-0 items-center gap-2 text-xs font-black text-[var(--muted)]">
                <input
                  type="checkbox"
                  checked={item.done}
                  onChange={(e) => {
                    const next = [...form.timeline];
                    next[i] = { ...next[i], done: e.target.checked };
                    set("timeline", next);
                  }}
                  className="size-4 accent-[var(--primary)]"
                />
                Done
              </label>
              <button
                type="button"
                onClick={() => set("timeline", form.timeline.filter((_, idx) => idx !== i))}
                className="grid size-11 shrink-0 place-items-center rounded-xl border border-[var(--line)] text-[var(--danger)] hover:bg-red-500/10 transition"
              >
                <Trash2 size={15} />
              </button>
            </div>
          ))}
          <button
            type="button"
            onClick={() => set("timeline", [...form.timeline, { label: "", date: "", done: false }])}
            className="flex items-center gap-2 text-xs font-black text-[var(--primary)] hover:underline"
          >
            <PlusCircle size={14} /> Add Stage
          </button>
        </div>

        {/* ── Updates ── */}
        <SectionHeading label="Recent Updates" />
        <div className="space-y-3">
          {form.updates.map((item, i) => (
            <div key={i} className="flex items-start gap-3">
              <input
                type="date"
                className={inputCls + " w-44 shrink-0"}
                value={dbDateToInputDate(item.date)}
                onChange={(e) => {
                  const next = [...form.updates];
                  next[i] = { ...next[i], date: inputDateToDbDate(e.target.value) };
                  set("updates", next);
                }}
              />
              <input
                className={inputCls + " flex-1"}
                value={item.text}
                placeholder="Update text…"
                onChange={(e) => {
                  const next = [...form.updates];
                  next[i] = { ...next[i], text: e.target.value };
                  set("updates", next);
                }}
              />
              <button
                type="button"
                onClick={() => set("updates", form.updates.filter((_, idx) => idx !== i))}
                className="grid size-11 shrink-0 place-items-center rounded-xl border border-[var(--line)] text-[var(--danger)] hover:bg-red-500/10 transition"
              >
                <Trash2 size={15} />
              </button>
            </div>
          ))}
          <button
            type="button"
            onClick={() => set("updates", [...form.updates, { date: "", text: "" }])}
            className="flex items-center gap-2 text-xs font-black text-[var(--primary)] hover:underline"
          >
            <PlusCircle size={14} /> Add Update
          </button>
        </div>

        {/* ── Gallery ── */}
        <SectionHeading label="Gallery Items" />
        <div className="space-y-4">
          {form.gallery.map((item, i) => (
            <div key={i} className="rounded-xl border border-[var(--line)] p-4 space-y-3">
              <div className="flex items-center gap-3">
                <input
                  className={inputCls + " flex-1"}
                  value={item.title}
                  placeholder="Item title"
                  onChange={(e) => {
                    const next = [...form.gallery];
                    next[i] = { ...next[i], title: e.target.value };
                    set("gallery", next);
                  }}
                />
                <select
                  className={inputCls + " w-36"}
                  value={item.type}
                  onChange={(e) => {
                    const next = [...form.gallery];
                    next[i] = {
                      ...next[i],
                      type: e.target.value as "Photo" | "Video" | "Drone" | "Document",
                    };
                    set("gallery", next);
                  }}
                >
                  {["Photo", "Video", "Drone", "Document"].map((t) => (
                    <option key={t}>{t}</option>
                  ))}
                </select>
                <button
                  type="button"
                  onClick={() => set("gallery", form.gallery.filter((_, idx) => idx !== i))}
                  className="grid size-11 shrink-0 place-items-center rounded-xl border border-[var(--line)] text-[var(--danger)] hover:bg-red-500/10 transition"
                >
                  <Trash2 size={15} />
                </button>
              </div>
              <ImageUploadField
                label="Gallery Image"
                value={item.image}
                onChange={(v) => {
                  const next = [...form.gallery];
                  next[i] = { ...next[i], image: v };
                  set("gallery", next);
                }}
              />
              {item.image && (
                <div className="h-28 w-full overflow-hidden rounded-lg">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={item.image} alt={item.title} className="h-full w-full object-cover" />
                </div>
              )}
            </div>
          ))}
          <button
            type="button"
            onClick={() =>
              set("gallery", [...form.gallery, { title: "", type: "Photo", image: "" }])
            }
            className="flex items-center gap-2 text-xs font-black text-[var(--primary)] hover:underline"
          >
            <PlusCircle size={14} /> Add Gallery Item
          </button>
        </div>



        {/* ── Bottom save ── */}
        <div className="mt-10 flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="flex items-center gap-2 rounded-xl bg-[var(--primary)] px-8 py-4 text-sm font-black text-white hover:opacity-90 disabled:opacity-60 transition"
          >
            <Save size={16} />
            {saving ? "Saving…" : "Save Project"}
          </button>
        </div>
      </div>
    </form>
  );
}
