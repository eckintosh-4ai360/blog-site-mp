"use client";

import { useEffect, useRef } from "react";
import { AlertTriangle, X } from "lucide-react";

type Props = {
  open: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
};

export default function ConfirmDialog({
  open,
  title,
  message,
  confirmLabel = "Delete",
  onConfirm,
  onCancel,
}: Props) {
  const dialogRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (open) dialogRef.current?.focus();
  }, [open]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[999] flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirm-title"
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onCancel}
      />

      {/* Panel */}
      <div
        ref={dialogRef}
        tabIndex={-1}
        className="relative w-full max-w-md rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-8 shadow-2xl animate-[reveal-up_240ms_ease_both]"
      >
        <button
          onClick={onCancel}
          className="absolute right-4 top-4 grid size-8 place-items-center rounded-full text-[var(--muted)] hover:bg-[var(--surface-soft)] transition"
          aria-label="Close"
        >
          <X size={16} />
        </button>

        <div className="flex items-center gap-4">
          <span className="grid size-12 shrink-0 place-items-center rounded-full bg-red-500/12 text-[var(--danger)]">
            <AlertTriangle size={22} />
          </span>
          <div>
            <h2 id="confirm-title" className="text-lg font-black text-[var(--foreground)]">
              {title}
            </h2>
            <p className="mt-1 text-sm leading-6 text-[var(--muted)]">{message}</p>
          </div>
        </div>

        <div className="mt-8 flex justify-end gap-3">
          <button
            onClick={onCancel}
            className="h-10 rounded-xl border border-[var(--line)] px-5 text-sm font-black text-[var(--foreground)] hover:bg-[var(--surface-soft)] transition"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="h-10 rounded-xl bg-[var(--danger)] px-5 text-sm font-black text-white hover:opacity-90 transition"
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
