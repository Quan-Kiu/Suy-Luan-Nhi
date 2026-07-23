"use client";

import { Camera, CheckCircle2, ImagePlus, LoaderCircle, Pencil, RefreshCw, Trash2 } from "lucide-react";
import Image from "next/image";
import { type RefObject, useEffect, useMemo } from "react";
import type { FeedbackAttachmentDraft } from "@/features/feedback/feedback-image-attachment";

type FeedbackAttachmentsPanelProps = {
  attachments: FeedbackAttachmentDraft[];
  maxAttachments: number;
  policySummary: string | null;
  capturing: boolean;
  addingUploads: boolean;
  disabled: boolean;
  error?: string;
  attachmentsDisabledText: string;
  capturePrivacyText: string;
  fileInputRef: RefObject<HTMLInputElement | null>;
  onCapture: () => void;
  onAddFiles: (files: File[]) => void;
  onEdit: (attachmentId: string) => void;
  onRemove: (attachmentId: string) => void;
};

function PreviewImage({ file, alt }: { file: File; alt: string }) {
  const url = useMemo(() => URL.createObjectURL(file), [file]);
  useEffect(() => () => URL.revokeObjectURL(url), [url]);
  return <Image src={url} fill unoptimized alt={alt} className="object-cover" />;
}

export function FeedbackAttachmentsPanel({
  attachments,
  maxAttachments,
  policySummary,
  capturing,
  addingUploads,
  disabled,
  error,
  attachmentsDisabledText,
  capturePrivacyText,
  fileInputRef,
  onCapture,
  onAddFiles,
  onEdit,
  onRemove,
}: FeedbackAttachmentsPanelProps) {
  const processingImages = capturing || addingUploads;

  return (
    <section className="rounded-2xl border border-[#eadfc9] bg-[#fff8ec] p-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h3 className="type-card-title flex items-center gap-2">
            <Camera size={18} /> Ảnh đính kèm
          </h3>
          <p className="type-caption mt-1 font-bold text-[#806d54]">
            {maxAttachments > 0
              ? `${policySummary ?? "Theo cấu hình hệ thống"} mỗi ảnh · đã chọn ${attachments.length}/${maxAttachments} ảnh.`
              : "Ảnh đính kèm đang tắt."}
          </p>
          {maxAttachments > 0 ? (
            <p className="type-caption mt-1 text-[#806d54]">
              Có thể chọn nhiều ảnh cùng lúc hoặc thêm từng ảnh ở nhiều lần.
            </p>
          ) : null}
        </div>
        {maxAttachments > 0 ? (
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              disabled={processingImages || disabled}
              onClick={onCapture}
              className="type-action inline-flex min-h-10 cursor-pointer items-center gap-2 rounded-xl border bg-white px-3 hover:bg-[#fff2df] disabled:cursor-wait disabled:opacity-60"
            >
              {capturing ? <LoaderCircle size={16} className="animate-spin" /> : <RefreshCw size={16} />}
              Chụp lại trang
            </button>
            <label className="type-label inline-flex min-h-10 cursor-pointer items-center gap-2 rounded-xl border bg-white px-3 font-black hover:bg-[#fff2df] has-[:disabled]:cursor-wait has-[:disabled]:opacity-60">
              {addingUploads ? <LoaderCircle size={16} className="animate-spin" /> : <ImagePlus size={16} />}
              Thêm ảnh từ máy
              <input
                ref={fileInputRef}
                type="file"
                multiple
                disabled={processingImages || disabled}
                accept="image/png,image/jpeg,image/webp,image/gif,image/avif"
                className="sr-only"
                aria-label="Thêm ảnh từ máy"
                onChange={(event) => onAddFiles(Array.from(event.currentTarget.files ?? []))}
              />
            </label>
          </div>
        ) : null}
      </div>

      {maxAttachments === 0 ? (
        <p className="type-supporting mt-4 rounded-xl border border-dashed bg-white p-4 text-center text-[#806d54]">
          {attachmentsDisabledText}
        </p>
      ) : capturing && !attachments.length ? (
        <div className="type-label mt-4 flex min-h-36 items-center justify-center gap-2 rounded-xl border border-dashed bg-white font-bold text-[#6f604b]">
          <LoaderCircle size={20} className="animate-spin" /> Đang chuẩn bị ảnh trang hiện tại...
        </div>
      ) : attachments.length ? (
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          {attachments.map((attachment, index) => (
            <div
              key={attachment.id}
              data-feedback-file-name={attachment.displayName}
              className="overflow-hidden rounded-xl border bg-white"
            >
              <div className="relative aspect-video bg-[#eee7dc]">
                <PreviewImage file={attachment.file} alt={`Ảnh góp ý ${index + 1}`} />
              </div>
              <div className="space-y-2 p-3">
                <div className="flex min-w-0 items-center gap-2">
                  {attachment.source === "auto" ? (
                    <CheckCircle2 size={15} className="shrink-0 text-green-700" />
                  ) : null}
                  <span
                    title={attachment.displayName}
                    className="type-caption min-w-0 flex-1 truncate font-bold text-[#6f604b]"
                  >
                    {attachment.source === "auto" ? "Ảnh trang hiện tại" : attachment.displayName}
                  </span>
                  {attachment.annotated ? (
                    <span className="type-caption shrink-0 rounded-full bg-[#fff0d6] px-2 py-1 font-black text-[#8f3a0c]">
                      Đã đánh dấu
                    </span>
                  ) : null}
                </div>
                <div className="flex items-center justify-end gap-2">
                  <button
                    type="button"
                    disabled={disabled}
                    onClick={() => onEdit(attachment.id)}
                    aria-label={`Đánh dấu ảnh ${index + 1}`}
                    className="type-caption inline-flex min-h-9 cursor-pointer items-center gap-1.5 rounded-xl border px-3 font-black text-[#6f3d20] hover:bg-[#fff2df] disabled:cursor-not-allowed"
                  >
                    <Pencil size={15} /> Đánh dấu
                  </button>
                  <button
                    type="button"
                    disabled={disabled}
                    onClick={() => onRemove(attachment.id)}
                    aria-label={`Bỏ ảnh đính kèm ${index + 1}`}
                    className="grid size-9 cursor-pointer place-items-center rounded-xl border text-red-700 hover:bg-red-50 disabled:cursor-not-allowed"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="type-supporting mt-4 rounded-xl border border-dashed bg-white p-4 text-center text-[#806d54]">
          Không có ảnh đính kèm. Góp ý vẫn có thể được gửi.
        </p>
      )}

      {capturing && attachments.length ? (
        <p className="type-caption mt-3 flex items-center gap-2 font-bold text-[#806d54]">
          <LoaderCircle size={15} className="animate-spin" /> Đang chụp lại trang...
        </p>
      ) : null}
      {addingUploads ? (
        <p className="type-caption mt-3 flex items-center gap-2 font-bold text-[#806d54]">
          <LoaderCircle size={15} className="animate-spin" /> Đang kiểm tra ảnh được chọn...
        </p>
      ) : null}
      {error ? (
        <p role="alert" className="type-supporting mt-3 font-bold text-amber-800">
          {error}
        </p>
      ) : null}
      {maxAttachments > 0 ? <p className="type-caption mt-3 text-[#806d54]">{capturePrivacyText}</p> : null}
    </section>
  );
}
