"use client";

import { useState, type FormEvent } from "react";
import { ArrowRight, CheckCircle2, FileVideo, ImagePlus, Lightbulb, MessageSquareWarning, HandHeart } from "lucide-react";
import { type SubmissionType } from "@/lib/submissions";

type UploadSignature = { cloudName: string; apiKey: string; timestamp: number; folder: string; allowedFormats: string; signature: string };
type UploadedFile = { publicId: string; type: "image" | "video"; name: string };

async function uploadFile(file: File, type: "image" | "video", signature: UploadSignature): Promise<UploadedFile> {
  const data = new FormData();
  data.append("file", file);
  data.append("api_key", signature.apiKey);
  data.append("timestamp", String(signature.timestamp));
  data.append("folder", signature.folder);
  data.append("allowed_formats", signature.allowedFormats);
  data.append("signature", signature.signature);
  const response = await fetch(`https://api.cloudinary.com/v1_1/${encodeURIComponent(signature.cloudName)}/${type}/upload`, { method: "POST", body: data });
  const result = await response.json().catch(() => null);
  if (!response.ok || typeof result?.public_id !== "string") throw new Error(`Could not upload ${file.name}. Please try again.`);
  return { publicId: result.public_id, type, name: file.name.slice(0, 120) };
}

const choices = [
  { type: "complaint" as const, label: "Complaint", help: "Report a problem", icon: MessageSquareWarning },
  { type: "request" as const, label: "Request", help: "Ask for support", icon: HandHeart },
  { type: "suggestion" as const, label: "Suggestion", help: "Share an idea", icon: Lightbulb },
];

const fieldClass = "w-full rounded-lg border border-[var(--line)] bg-[var(--surface)] px-4 py-3 text-sm text-[var(--foreground)] focus:border-[var(--primary)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/20";

export default function CitizenSubmissionForm() {
  const [type, setType] = useState<SubmissionType>("complaint");
  const [photos, setPhotos] = useState<File[]>([]);
  const [video, setVideo] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [reference, setReference] = useState("");

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setReference("");
    if (photos.length > 3 || photos.some((file) => file.size > 3 * 1024 * 1024) || (video && video.size > 10 * 1024 * 1024)) {
      setError("Choose up to 3 photos under 3 MB each and one video under 10 MB.");
      return;
    }
    const form = event.currentTarget;
    const values = new FormData(form);
    setBusy(true);
    try {
      const attachments: UploadedFile[] = [];
      if (photos.length || video) {
        const signatureResponse = await fetch("/api/submissions/upload-signature", { method: "POST" });
        const signature = await signatureResponse.json().catch(() => null);
        if (!signatureResponse.ok) throw new Error(signature?.error || "Media uploads are unavailable right now.");
        for (const photo of photos) attachments.push(await uploadFile(photo, "image", signature));
        if (video) attachments.push(await uploadFile(video, "video", signature));
      }
      const response = await fetch("/api/submissions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type,
          name: values.get("name"),
          contact: values.get("contact"),
          community: values.get("community"),
          message: values.get("message"),
          website: values.get("website"),
          attachments,
        }),
      });
      const result = await response.json().catch(() => null);
      if (!response.ok) throw new Error(result?.error || "Could not send your submission.");
      setReference(result.reference || "Received");
      form.reset();
      setPhotos([]);
      setVideo(null);
    } catch (failure) {
      setError(failure instanceof Error ? failure.message : "Could not send your submission.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={submit} className="portal-card grid gap-5 p-5 sm:p-6">
      <div>
        <h3 className="text-xl font-black text-[var(--foreground)]">Tell the office what matters</h3>
        <p className="mt-1 text-sm leading-6 text-[var(--muted)]">Choose a category and give us enough detail to follow up.</p>
      </div>
      <fieldset>
        <legend className="mb-3 text-sm font-bold text-[var(--foreground)]">What would you like to send?</legend>
        <div className="grid gap-2 sm:grid-cols-3">
          {choices.map(({ type: choice, label, help, icon: Icon }) => (
            <button
              key={choice}
              type="button"
              aria-pressed={type === choice}
              onClick={() => setType(choice)}
              className={`flex items-center gap-3 rounded-xl border p-3 text-left transition focus-visible:outline-2 focus-visible:outline-[var(--accent)] ${type === choice ? "border-[var(--primary)] bg-[var(--surface-soft)] text-[var(--primary)]" : "border-[var(--line)] text-[var(--foreground)] hover:border-[var(--primary)]"}`}
            >
              <Icon size={20} aria-hidden="true" className="shrink-0" />
              <span><strong className="block text-sm">{label}</strong><span className="block text-xs text-[var(--muted)]">{help}</span></span>
            </button>
          ))}
        </div>
      </fieldset>
      <input type="hidden" name="type" value={type} />
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="grid gap-2 text-sm font-bold text-[var(--foreground)]">Full name <input name="name" required maxLength={120} autoComplete="name" className={fieldClass} /></label>
        <label className="grid gap-2 text-sm font-bold text-[var(--foreground)]">Phone or email <input name="contact" required maxLength={160} autoComplete="email" className={fieldClass} /></label>
      </div>
      <label className="grid gap-2 text-sm font-bold text-[var(--foreground)]">Community or location <span className="text-xs font-normal text-[var(--muted)]">Optional</span><input name="community" maxLength={120} className={fieldClass} /></label>
      <label className="grid gap-2 text-sm font-bold text-[var(--foreground)]">Details <textarea name="message" required maxLength={4000} minLength={10} rows={5} placeholder="Describe the issue, request or idea, and where it relates to." className={fieldClass} /></label>
      <div className="grid gap-3 sm:grid-cols-2">
        <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-dashed border-[var(--line)] p-4 text-sm text-[var(--foreground)] hover:border-[var(--primary)]">
          <ImagePlus size={22} className="shrink-0 text-[var(--primary)]" aria-hidden="true" />
          <span><strong className="block">Add photos</strong><span className="text-xs text-[var(--muted)]">Up to 3, 3 MB each</span></span>
          <input className="sr-only" type="file" name="photos" accept="image/jpeg,image/png,image/webp,image/gif" multiple onChange={(event) => setPhotos(Array.from(event.target.files ?? []))} />
        </label>
        <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-dashed border-[var(--line)] p-4 text-sm text-[var(--foreground)] hover:border-[var(--primary)]">
          <FileVideo size={22} className="shrink-0 text-[var(--primary)]" aria-hidden="true" />
          <span><strong className="block">Add a video</strong><span className="text-xs text-[var(--muted)]">MP4, WebM or MOV, 10 MB</span></span>
          <input className="sr-only" type="file" name="video" accept="video/mp4,video/webm,video/quicktime" onChange={(event) => setVideo(event.target.files?.[0] ?? null)} />
        </label>
      </div>
      {(photos.length > 0 || video) && <p className="text-xs text-[var(--muted)]">Selected: {[...photos.map((file) => file.name), ...(video ? [video.name] : [])].join(", ")}</p>}
      <input className="absolute -left-[9999px]" name="website" tabIndex={-1} autoComplete="off" aria-hidden="true" />
      <p className="text-xs leading-5 text-[var(--muted)]">Your details and attachments will be shared with the constituency office to respond to your submission.</p>
      <button type="submit" disabled={busy} className="inline-flex h-12 items-center justify-center gap-2 rounded-full bg-[var(--primary)] px-6 text-sm font-black text-white transition hover:opacity-90 disabled:cursor-wait disabled:opacity-60">
        {busy ? "Sending…" : `Send ${type}`} <ArrowRight size={16} aria-hidden="true" />
      </button>
      {error && <p role="alert" className="text-sm font-semibold text-[var(--danger)]">{error}</p>}
      {reference && <p role="status" className="flex items-center gap-2 text-sm font-semibold text-[var(--secondary)]"><CheckCircle2 size={18} /> Received. Your reference is {reference}. Please save it for follow up.</p>}
    </form>
  );
}
