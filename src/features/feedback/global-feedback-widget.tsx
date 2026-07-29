"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery } from "@tanstack/react-query";
import { AnimatePresence, motion } from "motion/react";
import { MessageSquarePlus, X } from "lucide-react";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useId, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { feedbackApi } from "@/api/feedback";
import type { SnapdomPlugin } from "@zumer/snapdom";
import { FormStatus, SubmitButton, TextareaField } from "@/components/form";
import { contentText, useContent } from "@/content/client";
import { systemFeedbackContentSchema } from "@/domain/system-feedback";
import {
  redactFeedbackCaptureClone,
  shouldIncludeInFeedbackCapture,
} from "@/features/feedback/capture-privacy";
import { FeedbackAttachmentsPanel } from "@/features/feedback/feedback-attachments-panel";
import {
  createFeedbackAttachment,
  feedbackFileKey,
  getFeedbackCaptureMode,
  type FeedbackAttachmentDraft,
} from "@/features/feedback/feedback-image-attachment";
import { FeedbackImageAnnotator } from "@/features/feedback/feedback-image-annotator";
import { getImageUploadPolicySummary, validateImageFileForCategory } from "@/lib/media/image-file-validation";
import { queryKeys } from "@/lib/query/keys";

const schema = z.object({ content: systemFeedbackContentSchema });
type FormValues = z.infer<typeof schema>;
async function canvasToScreenshotFile(canvas: HTMLCanvasElement) {
  const maxWidth = 1600;
  const maxHeight = 1200;
  const scale = Math.min(1, maxWidth / canvas.width, maxHeight / canvas.height);
  const output = document.createElement("canvas");
  output.width = Math.max(1, Math.round(canvas.width * scale));
  output.height = Math.max(1, Math.round(canvas.height * scale));
  const context = output.getContext("2d");
  if (!context) throw new Error("Không thể tạo ảnh chụp trang");
  context.drawImage(canvas, 0, 0, output.width, output.height);
  const blob = await new Promise<Blob | null>((resolve) => output.toBlob(resolve, "image/jpeg", 0.82));
  if (!blob) throw new Error("Không thể tạo ảnh chụp trang");
  return new File([blob], `feedback-${Date.now()}.jpg`, { type: "image/jpeg", lastModified: Date.now() });
}

const feedbackCapturePrivacyPlugin: SnapdomPlugin = {
  name: "feedback-capture-privacy",
  afterClone(context) {
    if (context.clone) redactFeedbackCaptureClone(context.clone);
  },
};

async function captureViewport() {
  const { snapdom } = await import("@zumer/snapdom");
  const capture = snapdom.toCanvas(document.body, {
    clip: "viewport",
    dpr: 1,
    embedFonts: false,
    compress: true,
    fast: true,
    cache: "soft",
    exclude: ["[data-feedback-ui]"],
    excludeMode: "remove",
    filter: shouldIncludeInFeedbackCapture,
    filterMode: "hide",
    plugins: [feedbackCapturePrivacyPlugin],
    backgroundColor: getComputedStyle(document.body).backgroundColor || "#ffffff",
  });
  const canvas = await Promise.race([
    capture,
    new Promise<never>((_, reject) =>
      window.setTimeout(() => reject(new Error("Quá thời gian chụp trang")), 12_000),
    ),
  ]);
  return canvasToScreenshotFile(canvas);
}

export function GlobalFeedbackWidget() {
  const common = useContent("common");
  const pathname = usePathname();
  const dialogTitleId = useId();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [open, setOpen] = useState(false);
  const [capturing, setCapturing] = useState(false);
  const [addingUploads, setAddingUploads] = useState(false);
  const [captureError, setCaptureError] = useState<string>();
  const [attachments, setAttachments] = useState<FeedbackAttachmentDraft[]>([]);
  const [editingAttachmentId, setEditingAttachmentId] = useState<string>();

  const configQuery = useQuery({
    queryKey: queryKeys.feedback.uploadConfig,
    queryFn: feedbackApi.getUploadConfig,
    staleTime: 5 * 60 * 1000,
  });
  const form = useForm<FormValues>({ resolver: zodResolver(schema), defaultValues: { content: "" } });
  const mutation = useMutation({
    mutationFn: (values: FormValues) => {
      const configuredLimit = configQuery.data?.maxAttachments ?? 0;
      const selectedAttachments = configuredLimit > 0 ? attachments.slice(0, configuredLimit) : [];
      return feedbackApi.create({
        content: values.content,
        images: selectedAttachments.map((attachment) => attachment.file),
        pagePath: pathname,
        pageTitle: document.title,
        viewportWidth: window.innerWidth,
        viewportHeight: window.innerHeight,
        devicePixelRatio: window.devicePixelRatio || 1,
        captureMode: getFeedbackCaptureMode(selectedAttachments),
      });
    },
    onSuccess: () => {
      toast.success(contentText(common, "feedback.success", "Đã gửi góp ý. Cảm ơn bạn!"));
      closeDialog();
    },
  });

  const closeDialog = useCallback(() => {
    if (mutation.isPending) return;
    setOpen(false);
    setCapturing(false);
    setAddingUploads(false);
    setCaptureError(undefined);
    setAttachments([]);
    setEditingAttachmentId(undefined);
    form.reset({ content: "" });
    if (fileInputRef.current) fileInputRef.current.value = "";
  }, [form, mutation.isPending]);

  useEffect(() => {
    if (!open) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const timer = window.setTimeout(() => form.setFocus("content"), 80);
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape" && !editingAttachmentId && !mutation.isPending) closeDialog();
    }
    document.addEventListener("keydown", onKeyDown);
    return () => {
      window.clearTimeout(timer);
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [closeDialog, editingAttachmentId, form, mutation.isPending, open]);

  async function takeScreenshot() {
    const maxAttachments = configQuery.data?.maxAttachments ?? 0;
    if (maxAttachments <= 0) return;
    setCapturing(true);
    setCaptureError(undefined);
    try {
      const screenshot = await captureViewport();
      const autoAttachment = createFeedbackAttachment(screenshot, "auto");
      const existingAutoIndex = attachments.findIndex((attachment) => attachment.source === "auto");
      if (existingAutoIndex >= 0) {
        setAttachments((items) =>
          items.map((attachment) => (attachment.source === "auto" ? autoAttachment : attachment)),
        );
      } else if (attachments.length >= maxAttachments) {
        setCaptureError(`Đã đủ ${maxAttachments} ảnh. Hãy bỏ một ảnh trước khi chụp lại trang.`);
      } else {
        setAttachments((items) => [autoAttachment, ...items]);
      }
    } catch (error) {
      console.error("[feedback.capture_failed]", error);
      setCaptureError("Chưa chụp được trang này. Bạn vẫn có thể gửi góp ý hoặc chọn ảnh từ máy.");
    } finally {
      setCapturing(false);
    }
  }

  function openDialog() {
    setOpen(true);
    if ((configQuery.data?.maxAttachments ?? 0) > 0) {
      window.requestAnimationFrame(() => void takeScreenshot());
    }
  }

  async function addUploads(files: File[]) {
    const maxAttachments = configQuery.data?.maxAttachments ?? 5;
    if (!files.length) return;
    setAddingUploads(true);
    setCaptureError(undefined);

    const existingKeys = new Set(attachments.map((attachment) => attachment.selectionKey));
    const accepted: File[] = [];
    const messages: string[] = [];
    let duplicateCount = 0;

    try {
      for (const file of files) {
        if (
          existingKeys.has(feedbackFileKey(file)) ||
          accepted.some((item) => feedbackFileKey(item) === feedbackFileKey(file))
        ) {
          duplicateCount += 1;
          continue;
        }
        if (!file.type.startsWith("image/")) {
          messages.push(`${file.name}: phần đính kèm chỉ nhận tệp hình ảnh.`);
          continue;
        }
        try {
          await validateImageFileForCategory(file, "feedback-attachment", configQuery.data?.policies);
          accepted.push(file);
        } catch (error) {
          messages.push(`${file.name}: ${error instanceof Error ? error.message : "ảnh chưa hợp lệ"}.`);
        }
      }

      const remainingSlots = Math.max(0, maxAttachments - attachments.length);
      const filesToAdd = accepted.slice(0, remainingSlots);
      if (filesToAdd.length) {
        setAttachments((items) => [
          ...items,
          ...filesToAdd.map((file) => createFeedbackAttachment(file, "upload")),
        ]);
      }
      if (accepted.length > remainingSlots) {
        messages.push(`Chỉ thêm ${remainingSlots} ảnh còn trống trong giới hạn ${maxAttachments} ảnh.`);
      }
      if (duplicateCount) messages.push(`Đã bỏ qua ${duplicateCount} ảnh trùng.`);
      setCaptureError(messages.length ? messages.join(" ") : undefined);
    } finally {
      setAddingUploads(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }

  async function saveAnnotatedImage(attachmentId: string, file: File) {
    await validateImageFileForCategory(file, "feedback-attachment", configQuery.data?.policies);
    setAttachments((items) =>
      items.map((attachment) =>
        attachment.id === attachmentId ? { ...attachment, file, annotated: true } : attachment,
      ),
    );
  }

  if (!configQuery.data || (!configQuery.data.enabled && !open)) return null;
  const selectedAttachments = attachments.slice(0, configQuery.data.maxAttachments);
  const policySummary = getImageUploadPolicySummary("feedback-attachment", configQuery.data.policies);
  const editingAttachment = attachments.find((attachment) => attachment.id === editingAttachmentId);

  return (
    <>
      {configQuery.data.enabled ? (
        <button
          data-feedback-ui
          type="button"
          onClick={openDialog}
          aria-label={contentText(common, "feedback.open", "Gửi góp ý về trang này")}
          className="safe-area-floating-action fixed z-[55] inline-flex min-h-11 min-w-11 cursor-pointer items-center justify-center gap-2 rounded-l-full rounded-r-none border border-r-0 border-[#e4cfaa] bg-white px-3 font-black text-[#8f3a0c] shadow-[0_10px_30px_rgba(71,45,17,0.22)] transition hover:-translate-y-0.5 hover:bg-[#fff7eb] sm:rounded-full sm:border-r sm:px-3.5"
        >
          <MessageSquarePlus size={19} />
          <span className="hidden sm:inline">{contentText(common, "feedback.button", "Góp ý")}</span>
        </button>
      ) : null}

      <AnimatePresence>
        {open ? (
          <motion.div
            data-feedback-ui
            className="fixed inset-0 z-[100] flex items-end justify-center bg-black/45 p-0 sm:items-center sm:p-5"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onMouseDown={(event) => event.target === event.currentTarget && closeDialog()}
          >
            <motion.section
              role="dialog"
              aria-modal="true"
              aria-labelledby={dialogTitleId}
              aria-hidden={editingAttachment ? true : undefined}
              inert={editingAttachment ? true : undefined}
              className="flex max-h-[92dvh] w-full flex-col overflow-hidden rounded-t-[28px] bg-[#fffdf8] shadow-2xl sm:max-w-2xl sm:rounded-[28px]"
              initial={{ opacity: 0, y: 24, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.98 }}
            >
              <div
                data-feedback-header
                className="z-20 flex shrink-0 items-start justify-between gap-4 border-b border-[#eadfc9] bg-[#fffdf8]/95 px-5 pt-[max(1.25rem,env(safe-area-inset-top))] pb-4 backdrop-blur sm:px-6 sm:pt-6 sm:pb-5"
              >
                <div>
                  <p className="type-supporting font-bold text-[#9a6845]">
                    {contentText(common, "feedback.eyebrow", "Góp ý nhanh")}
                  </p>
                  <h2 id={dialogTitleId} className="type-section-title">
                    {contentText(common, "feedback.title", "Bạn muốn chúng tôi cải thiện điều gì?")}
                  </h2>
                  <p className="type-supporting mt-1 text-[#6f604b]">
                    {configQuery.data.maxAttachments > 0
                      ? "Ảnh trang hiện tại sẽ được chuẩn bị sẵn. Bạn có thể thêm và đánh dấu nhiều ảnh."
                      : "Bạn chỉ cần nhập nội dung và gửi góp ý."}
                  </p>
                </div>
                <button
                  type="button"
                  disabled={mutation.isPending}
                  onClick={closeDialog}
                  aria-label="Đóng hộp góp ý"
                  className="grid size-10 shrink-0 cursor-pointer place-items-center rounded-full border hover:bg-[#f5efe4] disabled:cursor-not-allowed"
                >
                  <X size={20} />
                </button>
              </div>

              <form
                className="flex min-h-0 flex-1 flex-col"
                onSubmit={form.handleSubmit((values) => mutation.mutate(values))}
              >
                <div
                  data-feedback-scroll-region
                  className="min-h-0 flex-1 space-y-5 overflow-y-auto overscroll-contain px-5 py-5 sm:px-6"
                >
                  <TextareaField
                    label={contentText(common, "feedback.contentLabel", "Nội dung góp ý")}
                    placeholder={contentText(
                      common,
                      "feedback.contentPlaceholder",
                      "Mô tả điều bạn gặp hoặc kết quả bạn mong muốn...",
                    )}
                    rows={5}
                    maxLength={4000}
                    registration={form.register("content")}
                    error={form.formState.errors.content?.message}
                  />

                  <FeedbackAttachmentsPanel
                    attachments={selectedAttachments}
                    maxAttachments={configQuery.data.maxAttachments}
                    policySummary={policySummary}
                    capturing={capturing}
                    addingUploads={addingUploads}
                    disabled={mutation.isPending}
                    error={captureError}
                    attachmentsDisabledText={contentText(
                      common,
                      "feedback.attachmentsDisabled",
                      "Ảnh đính kèm đang được tắt. Bạn vẫn có thể gửi nội dung góp ý.",
                    )}
                    capturePrivacyText={contentText(
                      common,
                      "feedback.capturePrivacy",
                      "Nội dung đang nhập trong biểu mẫu và các vùng riêng tư sẽ được ẩn khỏi ảnh tự chụp.",
                    )}
                    fileInputRef={fileInputRef}
                    onCapture={() => void takeScreenshot()}
                    onAddFiles={(files) => void addUploads(files)}
                    onEdit={setEditingAttachmentId}
                    onRemove={(attachmentId) =>
                      setAttachments((items) => items.filter((item) => item.id !== attachmentId))
                    }
                  />

                  <FormStatus
                    status={mutation.isError ? "error" : "idle"}
                    message={mutation.error?.message}
                  />
                </div>
                <div
                  data-feedback-actions
                  className="flex shrink-0 flex-col-reverse gap-3 border-t border-[#eadfc9] bg-[#fffdf8]/95 px-5 pt-4 pb-[max(0.75rem,env(safe-area-inset-bottom))] backdrop-blur sm:flex-row sm:justify-end sm:px-6 sm:pb-6"
                >
                  <button
                    type="button"
                    disabled={mutation.isPending}
                    onClick={closeDialog}
                    className="min-h-12 cursor-pointer rounded-2xl border px-5 font-black hover:bg-[#f5efe4] disabled:cursor-not-allowed"
                  >
                    Hủy
                  </button>
                  <SubmitButton pending={mutation.isPending} pendingLabel="Đang gửi...">
                    Gửi góp ý
                  </SubmitButton>
                </div>
              </form>
            </motion.section>
          </motion.div>
        ) : null}
      </AnimatePresence>

      {editingAttachment ? (
        <FeedbackImageAnnotator
          key={editingAttachment.id}
          file={editingAttachment.file}
          onClose={() => setEditingAttachmentId(undefined)}
          onSave={(file) => saveAnnotatedImage(editingAttachment.id, file)}
        />
      ) : null}
    </>
  );
}
