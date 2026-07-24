"use client";

import { AnimatePresence, motion } from "motion/react";
import { AlertCircle, AlertTriangle, Archive, LoaderCircle, Trash2, X } from "lucide-react";
import { useEffect, useId, useRef } from "react";
import { cn } from "@/lib/utils";

type Tone = "default" | "warning" | "danger";

type ConfirmDialogProps = {
  open: boolean;
  title: string;
  description: string;
  confirmLabel: string;
  cancelLabel?: string;
  pendingLabel?: string;
  tone?: Tone;
  pending?: boolean;
  errorMessage?: string;
  onConfirm: () => void;
  onClose: () => void;
};

const toneStyles: Record<Tone, { icon: typeof Archive; iconClass: string; buttonClass: string }> = {
  default: { icon: Archive, iconClass: "bg-[#fff0df] text-[#b9470d]", buttonClass: "bg-[#b9470d]" },
  warning: { icon: AlertTriangle, iconClass: "bg-amber-100 text-amber-800", buttonClass: "bg-amber-700" },
  danger: { icon: Trash2, iconClass: "bg-red-100 text-red-700", buttonClass: "bg-red-700" },
};
export function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel,
  cancelLabel = "Hủy",
  pendingLabel = "Đang xử lý...",
  tone = "default",
  pending = false,
  errorMessage,
  onConfirm,
  onClose,
}: ConfirmDialogProps) {
  const titleId = useId();
  const descriptionId = useId();
  const errorId = useId();
  const cancelRef = useRef<HTMLButtonElement>(null);
  const styles = toneStyles[tone];
  const Icon = styles.icon;

  useEffect(() => {
    if (!open) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const frame = requestAnimationFrame(() => cancelRef.current?.focus());
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape" && !pending) onClose();
    }
    document.addEventListener("keydown", onKeyDown);
    return () => {
      cancelAnimationFrame(frame);
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [onClose, open, pending]);
  return (
    <AnimatePresence>
      {open ? (
        <motion.div
          className="safe-area-overlay fixed inset-0 z-[100] grid place-items-center overflow-y-auto bg-black/45 backdrop-blur-[2px]"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onMouseDown={(event) => {
            if (event.target === event.currentTarget && !pending) onClose();
          }}
        >
          <motion.section
            role="alertdialog"
            aria-modal="true"
            aria-labelledby={titleId}
            aria-describedby={errorMessage ? `${descriptionId} ${errorId}` : descriptionId}
            className="max-h-full w-full max-w-md overflow-y-auto rounded-[28px] border border-[#eadfc9] bg-[#fffdf8] p-5 shadow-2xl [-webkit-overflow-scrolling:touch] sm:p-6"
            initial={{ opacity: 0, scale: 0.96, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.97, y: 8 }}
          >
            <div className="flex items-start gap-4">
              <span className={cn("grid size-12 shrink-0 place-items-center rounded-2xl", styles.iconClass)}>
                <Icon size={24} />
              </span>
              <div className="min-w-0 flex-1">
                <h2 id={titleId} className="type-section-title">
                  {title}
                </h2>
                <p id={descriptionId} className="type-supporting mt-2 text-[#6f6558]">
                  {description}
                </p>
              </div>
              <button
                type="button"
                aria-label="Đóng hộp thoại"
                disabled={pending}
                onClick={onClose}
                className="grid size-10 shrink-0 place-items-center rounded-full border border-[#eadfc9] disabled:opacity-40"
              >
                <X size={18} />
              </button>
            </div>
            {errorMessage ? (
              <div
                id={errorId}
                role="alert"
                className="type-label mt-5 flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 p-4 font-bold text-red-800"
              >
                <AlertCircle className="mt-0.5 size-5 shrink-0" aria-hidden="true" />
                <span>{errorMessage}</span>
              </div>
            ) : null}
            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              <button
                ref={cancelRef}
                type="button"
                disabled={pending}
                onClick={onClose}
                className="min-h-12 rounded-2xl border border-[#d9c9ae] bg-white px-4 font-black text-[#4f463b] disabled:opacity-50"
              >
                {cancelLabel}
              </button>
              <button
                type="button"
                disabled={pending}
                aria-busy={pending}
                onClick={onConfirm}
                className={cn(
                  "inline-flex min-h-12 items-center justify-center gap-2 rounded-2xl px-4 font-black text-white shadow-[0_5px_0_rgba(82,45,20,0.3)] disabled:opacity-60",
                  styles.buttonClass,
                )}
              >
                {pending ? <LoaderCircle size={18} className="animate-spin" /> : null}
                {pending ? pendingLabel : confirmLabel}
              </button>
            </div>
          </motion.section>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
