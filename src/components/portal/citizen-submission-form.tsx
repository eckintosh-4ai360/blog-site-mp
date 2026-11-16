"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import { ArrowRight, CheckCircle2, FileVideo, ImagePlus, Lightbulb, MessageSquareWarning, HandHeart, Mic, Square, RotateCcw } from "lucide-react";
import { type SubmissionType } from "@/lib/submissions";

type UploadSignature = { cloudName: string; apiKey: string; timestamp: number; folder: string; allowedFormats: string; signature: string };
type UploadedFile = { publicId: string; type: "image" | "video" | "audio"; name: string };

async function uploadFile(file: File, type: "image" | "video" | "audio", signature: UploadSignature): Promise<UploadedFile> {
  const data = new FormData();
  data.append("file", file);
  data.append("api_key", signature.apiKey);
  data.append("timestamp", String(signature.timestamp));
  data.append("folder", signature.folder);
  data.append("allowed_formats", signature.allowedFormats);
  data.append("signature", signature.signature);
  const response = await fetch(`https://api.cloudinary.com/v1_1/${encodeURIComponent(signature.cloudName)}/${type === "audio" ? "video" : type}/upload`, { method: "POST", body: data });
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
  const [audio, setAudio] = useState<File | null>(null);
  const [audioUrl, setAudioUrl] = useState("");
  const [starting, setStarting] = useState(false);
  const [recording, setRecording] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const cancelledRef = useRef(false);
  const mountedRef = useRef(true);
  const audioUrlRef = useRef("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [reference, setReference] = useState("");

  useEffect(() => {
    if (!recording) return;
    const started = Date.now();
    const timer = window.setInterval(() => {
      const elapsed = Math.floor((Date.now() - started) / 1000);
      setSeconds(elapsed);
      if (elapsed >= 120 && recorderRef.current?.state === "recording") recorderRef.current.stop();
    }, 500);
    return () => window.clearInterval(timer);
  }, [recording]);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
      cancelledRef.current = true;
      if (recorderRef.current?.state === "recording") recorderRef.current.stop();
      streamRef.current?.getTracks().forEach((track) => track.stop());
      if (audioUrlRef.current) URL.revokeObjectURL(audioUrlRef.current);
    };
  }, []);

  function clearAudio() {
    if (audioUrlRef.current) URL.revokeObjectURL(audioUrlRef.current);
    audioUrlRef.current = "";
    setAudioUrl("");
    setAudio(null);
  }

  async function startRecording() {
    setError("");
    if (!navigator.mediaDevices?.getUserMedia || typeof MediaRecorder === "undefined") {
      setError("Voice recording is unavailable in this browser. You can still type your message.");
      return;
    }
    setStarting(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      if (!mountedRef.current) {
        stream.getTracks().forEach((track) => track.stop());
        return;
      }
      streamRef.current = stream;
      clearAudio();
      cancelledRef.current = false;
      const mimeType = ["audio/webm;codecs=opus", "audio/mp4", "audio/ogg;codecs=opus", "audio/aac"].find((candidate) => MediaRecorder.isTypeSupported(candidate));
      const recorder = new MediaRecorder(stream, mimeType ? { mimeType, audioBitsPerSecond: 64000 } : { audioBitsPerSecond: 64000 });
      recorderRef.current = recorder;
      const chunks: Blob[] = [];
      recorder.ondataavailable = (event) => { if (event.data.size) chunks.push(event.data); };
      recorder.onerror = () => {
        cancelledRef.current = true;
        setError("Recording failed. Please try again.");
        if (recorder.state === "recording") recorder.stop();
      };
      recorder.onstop = () => {
        stream.getTracks().forEach((track) => track.stop());
        streamRef.current = null;
        setRecording(false);
        if (cancelledRef.current) return;
        const actualType = recorder.mimeType || mimeType || "audio/webm";
        const extension = actualType.includes("mp4") ? "m4a" : actualType.includes("ogg") ? "ogg" : actualType.includes("aac") ? "aac" : actualType.includes("webm") ? "webm" : "";
        if (!extension) {
          setError("This browser's recording format is unsupported. Please try another browser.");
          return;
        }
        const blob = new Blob(chunks, { type: actualType });
        if (!blob.size || blob.size > 10 * 1024 * 1024) {
          setError("The recording could not be saved. Please try a shorter one.");
          return;
        }
        const file = new File([blob], `voice-message.${extension}`, { type: actualType });
        const url = URL.createObjectURL(blob);
        audioUrlRef.current = url;
        setAudio(file);
        setAudioUrl(url);
      };
      recorder.start();
      setSeconds(0);
      setRecording(true);
    } catch {
      streamRef.current?.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
      setError("Microphone access was unavailable. Check browser permission and try again.");
    } finally {
      setStarting(false);
    }
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setReference("");
    if (recording) {
      setError("Stop recording before sending your submission.");
      return;
    }
    const form = event.currentTarget;
    const values = new FormData(form);
    if (!audio && (!String(values.get("name") ?? "").trim() || !String(values.get("contact") ?? "").trim() || !String(values.get("message") ?? "").trim())) {
      setError("Add your name, contact details and a message, or record a voice note.");
      return;
    }
    if (photos.length > 3 || photos.some((file) => file.size > 3 * 1024 * 1024) || (video && video.size > 10 * 1024 * 1024)) {
      setError("Choose up to 3 photos under 3 MB each and one video under 10 MB.");
      return;
    }
    setBusy(true);
    try {
      const attachments: UploadedFile[] = [];
      if (photos.length || video || audio) {
        const signatureResponse = await fetch("/api/submissions/upload-signature", { method: "POST" });
        const signature = await signatureResponse.json().catch(() => null);
        if (!signatureResponse.ok) throw new Error(signature?.error || "Media uploads are unavailable right now.");
        for (const photo of photos) attachments.push(await uploadFile(photo, "image", signature));
        if (video) attachments.push(await uploadFile(video, "video", signature));
        if (audio) attachments.push(await uploadFile(audio, "audio", signature));
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
      clearAudio();
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
        <label className="grid gap-2 text-sm font-bold text-[var(--foreground)]">Full name {audio && <span className="text-xs font-normal text-[var(--muted)]">Optional with voice note</span>}<input name="name" required={!audio} maxLength={120} autoComplete="name" className={fieldClass} /></label>
        <label className="grid gap-2 text-sm font-bold text-[var(--foreground)]">Phone or email {audio && <span className="text-xs font-normal text-[var(--muted)]">Optional with voice note</span>}<input name="contact" required={!audio} maxLength={160} autoComplete="email" className={fieldClass} /></label>
      </div>
      <label className="grid gap-2 text-sm font-bold text-[var(--foreground)]">Community or location <span className="text-xs font-normal text-[var(--muted)]">Optional</span><input name="community" maxLength={120} className={fieldClass} /></label>
      <label className="grid gap-2 text-sm font-bold text-[var(--foreground)]">Details {audio && <span className="text-xs font-normal text-[var(--muted)]">Optional with voice note</span>}<textarea name="message" required={!audio} maxLength={4000} minLength={audio ? undefined : 10} rows={5} placeholder="Describe the issue, request or idea, and where it relates to. Or record a voice note below." className={fieldClass} /></label>
      <div className="rounded-xl border border-[var(--line)] bg-[var(--surface-soft)] p-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3 text-[var(--foreground)]"><Mic size={21} className="text-[var(--primary)]" aria-hidden="true" /><div><strong className="block text-sm">Record a voice message</strong><span className="text-xs text-[var(--muted)]">Speak in the language you prefer. Up to 2 minutes.</span></div></div>
          {recording ? <button type="button" onClick={() => recorderRef.current?.stop()} className="inline-flex items-center gap-2 rounded-full bg-[var(--danger)] px-4 py-2 text-sm font-bold text-white"><Square size={14} fill="currentColor" /> Stop recording</button> : <button type="button" onClick={() => void startRecording()} disabled={busy || starting} className="inline-flex items-center gap-2 rounded-full bg-[var(--primary)] px-4 py-2 text-sm font-bold text-white disabled:opacity-50"><Mic size={16} /> {starting ? "Opening microphone…" : audio ? "Record again" : "Start recording"}</button>}
        </div>
        {recording && <p role="status" className="mt-3 text-sm font-bold text-[var(--danger)]">Recording… {Math.floor(seconds / 60)}:{String(seconds % 60).padStart(2, "0")} / 2:00</p>}
        {audio && audioUrl && !recording && <div className="mt-4 grid gap-2"><p className="text-xs font-semibold text-[var(--foreground)]">Listen before sending:</p><audio controls src={audioUrl} className="w-full" /><button type="button" onClick={clearAudio} className="inline-flex w-fit items-center gap-1 text-xs font-bold text-[var(--danger)]"><RotateCcw size={13} /> Remove recording</button></div>}
        <p className="mt-3 text-xs leading-5 text-[var(--muted)]">If typing is difficult, you can send only a voice note. Please say your name, how the office can reach you, and where the matter happened if you want a reply.</p>
      </div>
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
      <button type="submit" disabled={busy || starting} className="inline-flex h-12 items-center justify-center gap-2 rounded-full bg-[var(--primary)] px-6 text-sm font-black text-white transition hover:opacity-90 disabled:cursor-wait disabled:opacity-60">
        {busy ? "Sending…" : `Send ${type}`} <ArrowRight size={16} aria-hidden="true" />
      </button>
      {error && <p role="alert" className="text-sm font-semibold text-[var(--danger)]">{error}</p>}
      {reference && <p role="status" className="flex items-center gap-2 text-sm font-semibold text-[var(--secondary)]"><CheckCircle2 size={18} /> Received. Your reference is {reference}. Please save it for follow up.</p>}
    </form>
  );
}
