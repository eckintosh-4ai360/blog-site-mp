"use client";

import React from "react";

import { compressImage } from "@/lib/image-helper";

const inputCls =
  "w-full rounded-xl border border-[var(--line)] bg-[var(--surface)] px-4 py-3 text-sm font-semibold text-[var(--foreground)] placeholder:text-[var(--muted)]/60 focus:border-[var(--primary)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/20 transition";

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
  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      alert("Please select an image file.");
      return;
    }
    try {
      const compressed = await compressImage(file);
      onChange(compressed);
    } catch (err) {
      console.error(err);
      alert("Failed to compress and upload image.");
    }
  }

  return (
    <Field label={label} required={required}>
      <div className="flex gap-2">
        <div className="relative flex-1">
          <input
            className={inputCls}
            value={value.startsWith("data:image") ? "data:image/... [Local Uploaded Image]" : value}
            onChange={(e) => {
              const v = e.target.value;
              if (v.startsWith("data:image/... [Local Uploaded Image]")) {
                if (v === "data:image/... [Local Uploaded Image]") return;
                onChange(v.replace("data:image/... [Local Uploaded Image]", ""));
              } else {
                onChange(v);
              }
            }}
            placeholder="Paste URL or browse local file…"
          />
          {value.startsWith("data:image") && (
            <button
              type="button"
              onClick={() => onChange("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-black uppercase tracking-wider text-[var(--danger)] hover:underline"
            >
              Clear
            </button>
          )}
        </div>
        <label className="flex h-[46px] items-center gap-1.5 rounded-xl border border-[var(--line)] bg-[var(--surface-soft)] px-4 text-xs font-black text-[var(--foreground)] hover:bg-[var(--line)] transition cursor-pointer shrink-0">
          <input
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleFileChange}
          />
          Browse
        </label>
      </div>
    </Field>
  );
}
