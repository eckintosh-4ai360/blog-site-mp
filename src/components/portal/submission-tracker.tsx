"use client";

import { useEffect, useState, type FormEvent } from "react";
import { ArrowRight, CheckCircle2, Search } from "lucide-react";
import type { SubmissionStatus } from "@/lib/submissions";

const steps: { status: SubmissionStatus; label: string; detail: string }[] = [
  { status: "new", label: "Received", detail: "The office has your submission." },
  { status: "in_review", label: "Under review", detail: "The office is looking into it." },
  { status: "resolved", label: "Resolved", detail: "The office has marked it resolved." },
];

export default function SubmissionTracker({ latestReference }: { latestReference: string }) {
  const [input, setInput] = useState("");
  const [result, setResult] = useState<{ reference: string; status: SubmissionStatus } | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (latestReference) {
      setInput(latestReference);
      setResult(null);
      setError("");
    }
  }, [latestReference]);

  async function checkStatus(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setResult(null);
    setLoading(true);
    try {
      const response = await fetch(`/api/submissions/track?reference=${encodeURIComponent(input.trim())}`, { cache: "no-store" });
      const data = await response.json().catch(() => null);
      if (!response.ok) throw new Error(data?.error || "Could not check the status right now.");
      setResult(data);
    } catch (failure) {
      setError(failure instanceof Error ? failure.message : "Could not check the status right now.");
    } finally {
      setLoading(false);
    }
  }

  const currentStep = steps.findIndex((step) => step.status === result?.status);

  return (
    <div id="track-submission" className="portal-card scroll-mt-28 p-5 sm:p-6">
      <div className="flex items-start gap-3">
        <span className="grid size-11 shrink-0 place-items-center rounded-full bg-[var(--surface-soft)] text-[var(--primary)]"><Search size={19} aria-hidden="true" /></span>
        <div>
          <h3 className="text-lg font-black text-[var(--foreground)]">Track your submission</h3>
          <p className="mt-1 text-sm leading-6 text-[var(--muted)]">Enter the reference number you received when you sent your complaint, request, or suggestion.</p>
        </div>
      </div>
      <form onSubmit={checkStatus} className="mt-5 flex flex-col gap-2 sm:flex-row">
        <label className="sr-only" htmlFor="tracking-reference">Reference number</label>
        <input id="tracking-reference" value={input} onChange={(event) => { setInput(event.target.value); setResult(null); setError(""); }} required maxLength={18} placeholder="TN-000123" autoComplete="off" className="min-w-0 flex-1 rounded-lg border border-[var(--line)] bg-[var(--surface)] px-4 py-3 text-sm font-semibold uppercase text-[var(--foreground)] placeholder:normal-case focus:border-[var(--primary)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/20" />
        <button type="submit" disabled={loading} className="inline-flex items-center justify-center gap-2 rounded-lg bg-[var(--primary)] px-5 py-3 text-sm font-black text-white disabled:opacity-60">{loading ? "Checking…" : "Check status"}<ArrowRight size={16} aria-hidden="true" /></button>
      </form>
      {error && <p role="alert" className="mt-3 text-sm font-semibold text-[var(--danger)]">{error}</p>}
      {result && currentStep >= 0 && (
        <div role="status" className="mt-5 border-t border-[var(--line)] pt-5">
          <p className="text-xs font-bold uppercase tracking-wide text-[var(--muted)]">{result.reference}</p>
          <p className="mt-1 text-xl font-black text-[var(--foreground)]">{steps[currentStep].label}</p>
          <p className="mt-1 text-sm text-[var(--muted)]">{steps[currentStep].detail}</p>
          <ol className="mt-5 grid gap-3 sm:grid-cols-3" aria-label="Submission progress">
            {steps.map((step, index) => (
              <li key={step.status} className={`flex items-center gap-2 text-xs font-bold ${index <= currentStep ? "text-[var(--primary)]" : "text-[var(--muted)]"}`}>
                <span className={`grid size-7 shrink-0 place-items-center rounded-full border ${index <= currentStep ? "border-[var(--primary)] bg-[var(--surface-soft)]" : "border-[var(--line)]"}`}>{index < currentStep ? <CheckCircle2 size={15} aria-hidden="true" /> : index + 1}</span>
                {step.label}
              </li>
            ))}
          </ol>
          <p className="mt-4 text-xs leading-5 text-[var(--muted)]">Status changes when the office updates your submission. Check again later for progress.</p>
        </div>
      )}
    </div>
  );
}
