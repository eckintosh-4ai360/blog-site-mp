"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Inbox, RefreshCw, ExternalLink } from "lucide-react";
import AdminShell from "@/components/admin/AdminShell";
import type { CitizenSubmission, SubmissionStatus } from "@/lib/submissions";

const statusLabels: Record<SubmissionStatus, string> = {
  new: "New",
  in_review: "In review",
  resolved: "Resolved",
};

function SubmissionsContent() {
  const [items, setItems] = useState<CitizenSubmission[]>([]);
  const [filter, setFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState<number | null>(null);
  const [error, setError] = useState("");

  const refresh = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const response = await fetch("/api/submissions", { cache: "no-store" });
      const data = await response.json();
      if (!response.ok || !Array.isArray(data)) throw new Error(data?.error || "Could not load submissions.");
      setItems(data);
    } catch (failure) {
      setError(failure instanceof Error ? failure.message : "Could not load submissions.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { void refresh(); }, [refresh]);

  const visible = useMemo(() => items.filter((item) => filter === "all" || item.type === filter), [items, filter]);

  async function updateStatus(id: number, status: SubmissionStatus) {
    setSavingId(id);
    setError("");
    try {
      const response = await fetch(`/api/submissions/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (!response.ok) throw new Error("Could not update the submission status.");
      setItems((current) => current.map((item) => item.id === id ? { ...item, status } : item));
    } catch (failure) {
      setError(failure instanceof Error ? failure.message : "Could not update status.");
    } finally {
      setSavingId(null);
    }
  }

  return (
    <>
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.16em] text-[var(--primary)]">Constituency office</p>
          <h1 className="mt-2 text-3xl font-black text-[var(--foreground)]">Citizen submissions</h1>
          <p className="mt-1 text-sm text-[var(--muted)]">Read complaints, requests and suggestions sent through the website.</p>
        </div>
        <button type="button" onClick={() => void refresh()} disabled={loading} className="inline-flex items-center gap-2 rounded-xl border border-[var(--line)] bg-[var(--surface)] px-4 py-2.5 text-sm font-bold text-[var(--foreground)] disabled:opacity-50"><RefreshCw size={16} /> Refresh</button>
      </div>
      <div className="mb-6 flex flex-wrap gap-2">
        {[
          ["all", "All"], ["complaint", "Complaints"], ["request", "Requests"], ["suggestion", "Suggestions"],
        ].map(([value, label]) => (
          <button key={value} type="button" onClick={() => setFilter(value)} aria-pressed={filter === value} className={`rounded-full px-4 py-2 text-sm font-bold ${filter === value ? "bg-[var(--primary)] text-white" : "border border-[var(--line)] bg-[var(--surface)] text-[var(--foreground)]"}`}>
            {label} ({value === "all" ? items.length : items.filter((item) => item.type === value).length})
          </button>
        ))}
      </div>
      {error && <p role="alert" className="mb-5 rounded-xl border border-red-200 bg-red-50 p-4 text-sm font-semibold text-red-700">{error}</p>}
      {loading ? <p className="text-sm text-[var(--muted)]">Loading submissions…</p> : visible.length === 0 ? <div className="portal-card flex items-center gap-3 p-8 text-sm text-[var(--muted)]"><Inbox size={22} /> No submissions in this category yet.</div> : (
        <div className="grid gap-4">
          {visible.map((item) => (
            <article key={item.id} className="portal-card p-5 sm:p-6">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="rounded-full bg-[var(--surface-soft)] px-3 py-1 text-xs font-black uppercase tracking-wide text-[var(--primary)]">{item.type}</span>
                    <span className="text-xs font-bold text-[var(--muted)]">TN-{String(item.id).padStart(6, "0")}</span>
                  </div>
                  <h2 className="mt-3 text-lg font-black text-[var(--foreground)]">{item.name || "Name in voice note"}</h2>
                  <p className="mt-1 text-sm text-[var(--muted)]">{item.contact || "Contact in voice note"}{item.community ? ` · ${item.community}` : ""}</p>
                  <p className="mt-1 text-xs text-[var(--muted)]">{new Date(item.created_at).toLocaleString("en-GH", { dateStyle: "medium", timeStyle: "short", timeZone: "Africa/Accra" })}</p>
                </div>
                <label className="grid gap-1 text-xs font-black uppercase tracking-wide text-[var(--muted)]">Status
                  <select value={item.status} disabled={savingId === item.id} onChange={(event) => void updateStatus(item.id, event.target.value as SubmissionStatus)} className="rounded-lg border border-[var(--line)] bg-[var(--surface)] px-3 py-2 text-sm font-semibold normal-case tracking-normal text-[var(--foreground)]">
                    {Object.entries(statusLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
                  </select>
                </label>
              </div>
              {item.message && <p className="mt-5 whitespace-pre-wrap break-words text-sm leading-7 text-[var(--foreground)]">{item.message}</p>}
              {item.attachments.length > 0 && <div className="mt-5 flex flex-wrap gap-2 border-t border-[var(--line)] pt-4">
                {item.attachments.map((attachment, index) => attachment.type === "audio" ? <div key={`${attachment.url}-${index}`} className="w-full rounded-xl bg-[var(--surface-soft)] p-3"><p className="mb-2 text-xs font-bold text-[var(--foreground)]">Voice message</p><audio controls preload="none" src={attachment.url} className="w-full" /><a href={attachment.url} target="_blank" rel="noopener noreferrer" className="mt-2 inline-flex items-center gap-1 text-xs font-bold text-[var(--primary)]"><ExternalLink size={12} /> Open recording</a></div> : <a key={`${attachment.url}-${index}`} href={attachment.url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 rounded-lg border border-[var(--line)] px-3 py-2 text-xs font-bold text-[var(--primary)] hover:bg-[var(--surface-soft)]"><ExternalLink size={13} /> {attachment.type === "video" ? "Video" : `Photo ${index + 1}`} · {attachment.name}</a>)}
              </div>}
            </article>
          ))}
        </div>
      )}
    </>
  );
}

export default function AdminSubmissionsPage() {
  return <AdminShell><SubmissionsContent /></AdminShell>;
}
