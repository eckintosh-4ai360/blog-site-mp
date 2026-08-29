"use client";

import React from "react";
import { ImagePlus, Loader2, Trash2, Upload } from "lucide-react";

import { compressImage } from "@/lib/image-helper";

const inputCls =
  "w-full rounded-xl border border-[var(--line)] bg-[var(--surface)] px-4 py-3 text-sm font-semibold text-[var(--foreground)] placeholder:text-[var(--muted)]/60 focus:border-[var(--primary)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/20 transition";

const LOCAL_LABEL = "data:image/... [Local Uploaded Image]";

/**
 * Only one drop zone may claim a window-level paste at a time. The zone under
 * the cursor wins; without one, the zone holding focus does.
 */
let hoveredZoneId: string | null = null;

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
    <div className="block">
      <span className="mb-1.5 block text-xs font-black uppercase tracking-[0.14em] text-[var(--muted)]">
        {label}
        {required && <span className="ml-1 text-[var(--danger)]">*</span>}
      </span>
      {children}
    </div>
  );
}

/** First image file found in a clipboard or drag payload. */
function imageFileFrom(dt: DataTransfer | null | undefined): File | null {
  if (!dt) return null;
  for (const item of Array.from(dt.items ?? [])) {
    if (item.kind !== "file") continue;
    const file = item.getAsFile();
    if (file && file.type.startsWith("image/")) return file;
  }
  return Array.from(dt.files ?? []).find((f) => f.type.startsWith("image/")) ?? null;
}

/** Image URL dragged in from another tab (no file, just a link or markup). */
function imageUrlFrom(dt: DataTransfer | null | undefined): string | null {
  if (!dt) return null;
  const uri = (dt.getData("text/uri-list") || dt.getData("text/plain") || "").trim();
  if (/^https?:\/\/\S+$/i.test(uri)) return uri;
  const html = dt.getData("text/html");
  const match = html?.match(/<img[^>]+src=["']([^"']+)["']/i);
  if (match && /^https?:\/\//i.test(match[1])) return match[1];
  return null;
}

export default function ImageUploadField({
  label,
  value,
  onChange,
  required,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  required?: boolean;
}) {
  const zoneId = React.useId();
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const dragDepth = React.useRef(0);

  const [dragging, setDragging] = React.useState(false);
  const [hovered, setHovered] = React.useState(false);
  const [focused, setFocused] = React.useState(false);
  const [busy, setBusy] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const acceptFile = React.useCallback(
    async (file: File) => {
      if (!file.type.startsWith("image/")) {
        setError("That file is not an image.");
        return;
      }
      setBusy(true);
      setError(null);
      try {
        onChange(await compressImage(file));
      } catch (err) {
        console.error(err);
        setError("Could not read that image. Try another file.");
      } finally {
        setBusy(false);
      }
    },
    [onChange],
  );

  // ── Ctrl/Cmd+V while hovering the field, or focused anywhere inside it ──
  const listening = hovered || focused;
  React.useEffect(() => {
    if (!listening) return;
    function onPaste(e: ClipboardEvent) {
      // The hovered zone wins; without one, the focused zone handles the paste.
      if (hoveredZoneId ? hoveredZoneId !== zoneId : !focused) return;
      const file = imageFileFrom(e.clipboardData);
      if (!file) return; // plain text keeps its default paste-into-input behaviour
      e.preventDefault();
      void acceptFile(file);
    }
    window.addEventListener("paste", onPaste);
    return () => window.removeEventListener("paste", onPaste);
  }, [listening, focused, zoneId, acceptFile]);

  React.useEffect(
    () => () => {
      if (hoveredZoneId === zoneId) hoveredZoneId = null;
    },
    [zoneId],
  );

  function enterZone() {
    hoveredZoneId = zoneId;
    setHovered(true);
  }

  function leaveZone() {
    if (hoveredZoneId === zoneId) hoveredZoneId = null;
    setHovered(false);
  }

  function onDragEnter(e: React.DragEvent) {
    e.preventDefault();
    dragDepth.current += 1;
    setDragging(true);
  }

  function onDragOver(e: React.DragEvent) {
    e.preventDefault();
    e.dataTransfer.dropEffect = "copy";
  }

  function onDragLeave(e: React.DragEvent) {
    e.preventDefault();
    dragDepth.current = Math.max(0, dragDepth.current - 1);
    if (dragDepth.current === 0) setDragging(false);
  }

  function onDrop(e: React.DragEvent) {
    e.preventDefault();
    dragDepth.current = 0;
    setDragging(false);
    const file = imageFileFrom(e.dataTransfer);
    if (file) {
      void acceptFile(file);
      return;
    }
    const url = imageUrlFrom(e.dataTransfer);
    if (url) {
      setError(null);
      onChange(url);
      return;
    }
    setError("Drop an image file or an image link.");
  }

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = ""; // let the same file be picked twice in a row
    if (file) await acceptFile(file);
  }

  const isLocal = value.startsWith("data:image");
  const hasImage = value.trim().length > 0;

  return (
    <Field label={label} required={required}>
      <div
        onMouseEnter={enterZone}
        onMouseLeave={leaveZone}
        onFocus={() => setFocused(true)}
        onBlur={(e) => {
          if (!e.currentTarget.contains(e.relatedTarget as Node | null)) setFocused(false);
        }}
        onDragEnter={onDragEnter}
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onDrop={onDrop}
        className="space-y-2"
      >
        <div className="flex gap-2">
          <div className="relative flex-1">
            <input
              className={inputCls}
              value={isLocal ? LOCAL_LABEL : value}
              onChange={(e) => {
                const v = e.target.value;
                setError(null);
                if (v.startsWith(LOCAL_LABEL)) {
                  if (v === LOCAL_LABEL) return;
                  onChange(v.replace(LOCAL_LABEL, ""));
                } else {
                  onChange(v);
                }
              }}
              placeholder="Paste URL, or paste/drop an image below…"
            />
            {isLocal && (
              <button
                type="button"
                onClick={() => onChange("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-black uppercase tracking-wider text-[var(--danger)] hover:underline"
              >
                Clear
              </button>
            )}
          </div>
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="flex h-[46px] shrink-0 items-center gap-1.5 rounded-xl border border-[var(--line)] bg-[var(--surface-soft)] px-4 text-xs font-black text-[var(--foreground)] transition hover:bg-[var(--line)]"
          >
            Browse
          </button>
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleFileChange}
        />

        {/* ── Drop / paste zone ── */}
        <div
          role="button"
          tabIndex={0}
          aria-label={`${label}: drop, paste or browse for an image`}
          onClick={() => fileInputRef.current?.click()}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              fileInputRef.current?.click();
            }
          }}
          className={`flex w-full cursor-pointer items-center gap-3 rounded-xl border border-dashed px-3 py-2.5 text-left transition focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/30 ${
            dragging
              ? "border-[var(--primary)] bg-[var(--primary)]/10"
              : "border-[var(--line)] bg-[var(--surface-soft)] hover:border-[var(--primary)]/60"
          }`}
        >
          {busy ? (
            <span className="grid size-10 shrink-0 place-items-center rounded-lg bg-[var(--surface)] text-[var(--muted)]">
              <Loader2 size={16} className="animate-spin" />
            </span>
          ) : hasImage ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={value}
              alt=""
              className="size-10 shrink-0 rounded-lg border border-[var(--line)] object-cover"
            />
          ) : (
            <span className="grid size-10 shrink-0 place-items-center rounded-lg bg-[var(--surface)] text-[var(--muted)]">
              {dragging ? <Upload size={16} /> : <ImagePlus size={16} />}
            </span>
          )}

          <span className="min-w-0 flex-1">
            <span className="block truncate text-[11px] font-black uppercase tracking-wider text-[var(--foreground)]">
              {busy
                ? "Processing…"
                : dragging
                  ? "Drop to upload"
                  : hasImage
                    ? isLocal
                      ? "Uploaded image"
                      : "Linked image"
                    : "Drop image here"}
            </span>
            <span className="block truncate text-[10px] font-semibold text-[var(--muted)]">
              {hasImage ? "Click to replace" : "Paste with Ctrl+V, drag & drop, or click to browse"}
            </span>
          </span>

          {hasImage && !busy && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setError(null);
                onChange("");
              }}
              aria-label="Remove image"
              className="grid size-8 shrink-0 place-items-center rounded-lg text-[var(--danger)] transition hover:bg-red-500/10"
            >
              <Trash2 size={14} />
            </button>
          )}
        </div>

        {error && <p className="text-[10px] font-bold text-[var(--danger)]">{error}</p>}
      </div>
    </Field>
  );
}
