"use client";

import { AnimatePresence, motion } from "motion/react";
import {
  CalendarClock,
  ExternalLink,
  ImageIcon,
  LoaderCircle,
  MonitorSmartphone,
  UserRound,
  X,
} from "lucide-react";
import { useEffect, useId, useRef, useState } from "react";
import type { SystemFeedbackItem } from "@/api/admin/feedback";
import { FormStatus } from "@/components/form";
import {
  systemFeedbackStatuses,
  systemFeedbackStatusLabels,
  type SystemFeedbackStatus,
} from "@/domain/system-feedback";
import { cn } from "@/lib/utils";

const statusStyles: Record<SystemFeedbackStatus, string> = {
  new: "border-blue-200 bg-blue-50 text-blue-800",
  in_progress: "border-amber-200 bg-amber-50 text-amber-800",
  resolved: "border-emerald-200 bg-emerald-50 text-emerald-800",
  dismissed: "border-slate-200 bg-slate-100 text-slate-700",
};

function formatFeedbackTime(value: string) {
  return new Intl.DateTimeFormat("vi-VN", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

type FeedbackDialogProps = {
  item: SystemFeedbackItem | null;
  pending: boolean;
  errorMessage?: string;
  onSave: (status: SystemFeedbackStatus, adminNote: string) => Promise<void>;
  onClose: () => void;
};

function FeedbackDialogPanel({
  item,
  pending,
  errorMessage,
  onSave,
  onClose,
}: Omit<FeedbackDialogProps, "item"> & { item: SystemFeedbackItem }) {
  const titleId = useId();
  const descriptionId = useId();
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const [status, setStatus] = useState<SystemFeedbackStatus>(item.status);
  const [adminNote, setAdminNote] = useState(item.adminNote ?? "");

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const frame = requestAnimationFrame(() => closeButtonRef.current?.focus());

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape" && !pending) onClose();
    }

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      cancelAnimationFrame(frame);
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [onClose, pending]);

  const viewport =
    typeof item.context.viewportWidth === "number" && typeof item.context.viewportHeight === "number"
      ? `${item.context.viewportWidth} × ${item.context.viewportHeight}px`
      : "Không có thông tin";

  return (
    <motion.div
      className="safe-area-overlay fixed inset-0 z-[100] overflow-y-auto bg-black/45 p-3 backdrop-blur-[2px] sm:p-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onMouseDown={(event) => {
        if (event.target === event.currentTarget && !pending) onClose();
      }}
    >
      <motion.section
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={descriptionId}
        className="mx-auto my-auto max-h-[calc(100dvh-1.5rem)] w-full max-w-5xl overflow-y-auto rounded-[28px] border border-[#eadfc9] bg-[#fffdf8] shadow-2xl [-webkit-overflow-scrolling:touch] sm:max-h-[calc(100dvh-3rem)]"
        initial={{ opacity: 0, scale: 0.98, y: 14 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.98, y: 10 }}
      >
        <header className="sticky top-0 z-10 flex items-start gap-3 border-b border-[#eadfc9] bg-[#fffdf8]/95 p-4 backdrop-blur sm:p-5">
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <span
                className={cn(
                  "type-caption rounded-full border px-2.5 py-1 font-black",
                  statusStyles[item.status],
                )}
              >
                {systemFeedbackStatusLabels[item.status]}
              </span>
              <span className="type-caption inline-flex items-center gap-1 font-bold text-[#786d60]">
                <CalendarClock size={14} aria-hidden="true" /> {formatFeedbackTime(item.createdAt)}
              </span>
            </div>
            <h2 id={titleId} className="type-section-title mt-2 text-[#342f28]">
              {item.pageTitle || "Góp ý từ một trang trong hệ thống"}
            </h2>
            <p id={descriptionId} className="type-supporting mt-1 text-[#786d60]">
              Xem đầy đủ nội dung và cập nhật tiến độ xử lý.
            </p>
          </div>
          <button
            ref={closeButtonRef}
            type="button"
            aria-label="Đóng chi tiết góp ý"
            disabled={pending}
            onClick={onClose}
            className="grid size-10 shrink-0 place-items-center rounded-full border border-[#decdb3] bg-white text-[#62584d] disabled:opacity-50"
          >
            <X size={18} aria-hidden="true" />
          </button>
        </header>

        <div className="space-y-5 p-4 sm:p-5">
          <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_280px]">
            <div className="rounded-2xl border border-[#eadfc9] bg-white p-4">
              <p className="type-label font-black text-[#4f463b]">Trang phát sinh</p>
              <a
                href={item.pagePath}
                target="_blank"
                rel="noreferrer"
                className="type-action mt-2 inline-flex min-w-0 items-center gap-1 font-bold break-all text-[#9f3d0b] hover:underline"
              >
                {item.pagePath} <ExternalLink size={14} className="shrink-0" aria-hidden="true" />
              </a>
            </div>
            <div className="type-caption space-y-2 rounded-2xl border border-[#eadfc9] bg-[#f7f3eb] p-4 text-[#62584d]">
              <p className="flex items-center gap-2 font-black text-[#4f463b]">
                <UserRound size={16} aria-hidden="true" /> {item.userName}
              </p>
              <p className="break-all">{item.userEmail}</p>
              <p className="flex items-center gap-2">
                <MonitorSmartphone size={16} aria-hidden="true" /> Màn hình: {viewport}
              </p>
            </div>
          </div>

          <section aria-labelledby={`${titleId}-content`}>
            <h3 id={`${titleId}-content`} className="type-card-title mb-2 text-[#4f463b]">
              Nội dung góp ý
            </h3>
            <div className="rounded-2xl border border-[#f0d8b7] bg-[#fff8ec] p-4 leading-7 whitespace-pre-wrap text-[#493f35]">
              {item.content}
            </div>
          </section>

          {item.attachments.length ? (
            <section aria-labelledby={`${titleId}-attachments`}>
              <h3
                id={`${titleId}-attachments`}
                className="type-card-title mb-2 flex items-center gap-2 text-[#4f463b]"
              >
                <ImageIcon size={17} aria-hidden="true" /> {item.attachments.length} ảnh đính kèm
              </h3>
              <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                {item.attachments.map((attachment, index) => (
                  <a
                    key={attachment.id}
                    href={attachment.url}
                    target="_blank"
                    rel="noreferrer"
                    className="group overflow-hidden rounded-2xl border border-[#e4d8c5] bg-[#f3eee5]"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={attachment.url}
                      alt={attachment.altText || `Ảnh góp ý ${index + 1}`}
                      className="h-48 w-full object-contain p-2 transition group-hover:scale-[1.01]"
                    />
                    <div className="type-caption flex items-center justify-between gap-2 bg-white px-3 py-2 font-bold">
                      <span className="truncate">{attachment.fileName}</span>
                      <ExternalLink size={14} className="shrink-0" aria-hidden="true" />
                    </div>
                  </a>
                ))}
              </div>
            </section>
          ) : null}

          <form
            className="rounded-2xl border border-[#eadfc9] bg-white p-4"
            onSubmit={async (event) => {
              event.preventDefault();
              await onSave(status, adminNote);
            }}
          >
            <div className="grid gap-4 lg:grid-cols-[220px_minmax(0,1fr)]">
              <label className="type-label grid gap-1.5 font-black text-[#342f28]">
                Trạng thái xử lý
                <select
                  value={status}
                  onChange={(event) => setStatus(event.target.value as SystemFeedbackStatus)}
                  disabled={pending}
                  className="min-h-11 rounded-xl border border-[#d9c9ae] bg-white px-3 outline-none focus:border-[#e9641a] focus:ring-2 focus:ring-[#e9641a]/20 disabled:opacity-60"
                >
                  {systemFeedbackStatuses.map((value) => (
                    <option key={value} value={value}>
                      {systemFeedbackStatusLabels[value]}
                    </option>
                  ))}
                </select>
              </label>
              <label className="type-label grid gap-1.5 font-black text-[#342f28]">
                Ghi chú nội bộ
                <textarea
                  value={adminNote}
                  onChange={(event) => setAdminNote(event.target.value)}
                  rows={3}
                  maxLength={2000}
                  disabled={pending}
                  placeholder="Ghi lại nguyên nhân, hướng xử lý hoặc kết quả kiểm tra..."
                  className="min-h-24 rounded-xl border border-[#d9c9ae] bg-white px-3 py-2.5 font-normal outline-none focus:border-[#e9641a] focus:ring-2 focus:ring-[#e9641a]/20 disabled:opacity-60"
                />
              </label>
            </div>
            <div className="mt-4 flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
              <FormStatus status={errorMessage ? "error" : "idle"} message={errorMessage} />
              <button
                type="submit"
                disabled={pending}
                aria-busy={pending}
                className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-[#b9470d] px-5 font-black text-white shadow-[0_5px_0_#7f2e05] disabled:cursor-wait disabled:opacity-60"
              >
                {pending ? <LoaderCircle size={18} className="animate-spin" aria-hidden="true" /> : null}
                {pending ? "Đang lưu..." : "Lưu xử lý"}
              </button>
            </div>
          </form>
        </div>
      </motion.section>
    </motion.div>
  );
}

export function SystemFeedbackDialog(props: FeedbackDialogProps) {
  return (
    <AnimatePresence>
      {props.item ? <FeedbackDialogPanel key={props.item.id} {...props} item={props.item} /> : null}
    </AnimatePresence>
  );
}
