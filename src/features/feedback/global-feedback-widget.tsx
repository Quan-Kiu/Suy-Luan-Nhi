"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery } from "@tanstack/react-query";
import { AnimatePresence, motion } from "motion/react";
import {
  Camera,
  CheckCircle2,
  ImagePlus,
  LoaderCircle,
  MessageSquarePlus,
  RefreshCw,
  Trash2,
  X,
} from "lucide-react";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useId, useMemo, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { feedbackApi } from "@/api/feedback";
import type { SnapdomPlugin } from "@zumer/snapdom";
import { FormStatus, SubmitButton, TextareaField } from "@/components/form";
import {
  redactFeedbackCaptureClone,
  shouldIncludeInFeedbackCapture,
} from "@/features/feedback/capture-privacy";
import { contentText, useContent } from "@/content/client";
import { systemFeedbackContentSchema } from "@/domain/system-feedback";
import { getImageUploadPolicySummary, validateImageFileForCategory } from "@/lib/media/image-file-validation";
import { queryKeys } from "@/lib/query/keys";

const schema = z.object({ content: systemFeedbackContentSchema });
type FormValues = z.infer<typeof schema>;
type ImageSource = "auto" | "upload" | "none";

function fileKey(file: File) {
  return `${file.name}-${file.size}-${file.lastModified}`;
}

function PreviewImage({ file, alt }: { file: File; alt: string }) {
  const url = useMemo(() => URL.createObjectURL(file), [file]);
  useEffect(() => () => URL.revokeObjectURL(url), [url]);
  return <Image src={url} fill unoptimized alt={alt} className="object-cover" />;
}

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
  const [captureError, setCaptureError] = useState<string>();
  const [imageSource, setImageSource] = useState<ImageSource>("none");
  const [autoScreenshot, setAutoScreenshot] = useState<File | null>(null);
  const [uploadedImages, setUploadedImages] = useState<File[]>([]);

  const configQuery = useQuery({
    queryKey: queryKeys.feedback.uploadConfig,
    queryFn: feedbackApi.getUploadConfig,
    staleTime: 5 * 60 * 1000,
  });
  const form = useForm<FormValues>({ resolver: zodResolver(schema), defaultValues: { content: "" } });
  const mutation = useMutation({
    mutationFn: (values: FormValues) => {
      const configuredLimit = configQuery.data?.maxAttachments ?? 0;
      const selectedImages = imageSource === "auto" && autoScreenshot ? [autoScreenshot] : uploadedImages;
      const images = configuredLimit > 0 ? selectedImages.slice(0, configuredLimit) : [];
      return feedbackApi.create({
        content: values.content,
        images,
        pagePath: pathname,
        pageTitle: document.title,
        viewportWidth: window.innerWidth,
        viewportHeight: window.innerHeight,
        devicePixelRatio: window.devicePixelRatio || 1,
        captureMode: images.length ? imageSource : "none",
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
    setCaptureError(undefined);
    setImageSource("none");
    setAutoScreenshot(null);
    setUploadedImages([]);
    form.reset({ content: "" });
    if (fileInputRef.current) fileInputRef.current.value = "";
  }, [form, mutation.isPending]);

  useEffect(() => {
    if (!open) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const timer = window.setTimeout(() => form.setFocus("content"), 80);
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape" && !mutation.isPending) closeDialog();
    }
    document.addEventListener("keydown", onKeyDown);
    return () => {
      window.clearTimeout(timer);
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [closeDialog, form, mutation.isPending, open]);

  async function takeScreenshot() {
    if ((configQuery.data?.maxAttachments ?? 0) <= 0) {
      setAutoScreenshot(null);
      setUploadedImages([]);
      setImageSource("none");
      return;
    }
    setCapturing(true);
    setCaptureError(undefined);
    setUploadedImages([]);
    try {
      const screenshot = await captureViewport();
      setAutoScreenshot(screenshot);
      setImageSource("auto");
    } catch (error) {
      console.error("[feedback.capture_failed]", error);
      setAutoScreenshot(null);
      setImageSource("none");
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

  async function replaceWithUploads(files: File[]) {
    const maxAttachments = configQuery.data?.maxAttachments ?? 5;
    if (!files.length) return;
    if (files.length > maxAttachments) {
      setCaptureError(`Chỉ được chọn tối đa ${maxAttachments} ảnh`);
      return;
    }
    setCapturing(true);
    setCaptureError(undefined);
    try {
      for (const file of files) {
        if (!file.type.startsWith("image/")) throw new Error("Phần đính kèm chỉ nhận tệp hình ảnh");
        await validateImageFileForCategory(file, "feedback-attachment", configQuery.data?.policies);
      }
      setUploadedImages(files);
      setAutoScreenshot(null);
      setImageSource("upload");
    } catch (error) {
      setCaptureError(error instanceof Error ? error.message : "Ảnh chưa hợp lệ. Hãy chọn ảnh khác.");
    } finally {
      setCapturing(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }

  if (!configQuery.data || (!configQuery.data.enabled && !open)) return null;
  const rawSelectedImages = imageSource === "auto" && autoScreenshot ? [autoScreenshot] : uploadedImages;
  const selectedImages = rawSelectedImages.slice(0, configQuery.data.maxAttachments);
  const policySummary = getImageUploadPolicySummary("feedback-attachment", configQuery.data.policies);

  return (
    <>
      {configQuery.data.enabled ? (
        <button
          data-feedback-ui
          type="button"
          onClick={openDialog}
          aria-label={contentText(common, "feedback.open", "Gửi góp ý về trang này")}
          className="fixed right-4 bottom-24 z-[55] inline-flex min-h-11 cursor-pointer items-center gap-2 rounded-full border border-[#e4cfaa] bg-white px-3.5 font-black text-[#8f3a0c] shadow-[0_10px_30px_rgba(71,45,17,0.22)] transition hover:-translate-y-0.5 hover:bg-[#fff7eb] sm:right-6 sm:bottom-6"
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
                  <p className="text-sm font-bold text-[#9a6845]">
                    {contentText(common, "feedback.eyebrow", "Góp ý nhanh")}
                  </p>
                  <h2 id={dialogTitleId} className="text-2xl font-black text-[#342f28]">
                    {contentText(common, "feedback.title", "Bạn muốn chúng tôi cải thiện điều gì?")}
                  </h2>
                  <p className="mt-1 text-sm leading-6 text-[#6f604b]">
                    {configQuery.data.maxAttachments > 0
                      ? "Ảnh trang hiện tại sẽ được chuẩn bị sẵn. Bạn chỉ cần nhập nội dung và gửi."
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

                  <section className="rounded-2xl border border-[#eadfc9] bg-[#fff8ec] p-4">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <h3 className="flex items-center gap-2 font-black text-[#342f28]">
                          <Camera size={18} /> Ảnh đính kèm
                        </h3>
                        <p className="mt-1 text-xs font-bold text-[#806d54]">
                          {configQuery.data.maxAttachments > 0
                            ? `${policySummary} mỗi ảnh · tối đa ${configQuery.data.maxAttachments} ảnh.`
                            : "Ảnh đính kèm đang tắt."}
                        </p>
                      </div>
                      {configQuery.data.maxAttachments > 0 ? (
                        <div className="flex flex-wrap gap-2">
                          <button
                            type="button"
                            disabled={capturing || mutation.isPending}
                            onClick={() => void takeScreenshot()}
                            className="inline-flex min-h-10 cursor-pointer items-center gap-2 rounded-xl border bg-white px-3 text-sm font-black hover:bg-[#fff2df] disabled:cursor-wait disabled:opacity-60"
                          >
                            {capturing ? (
                              <LoaderCircle size={16} className="animate-spin" />
                            ) : (
                              <RefreshCw size={16} />
                            )}
                            Chụp lại trang
                          </button>
                          <label className="inline-flex min-h-10 cursor-pointer items-center gap-2 rounded-xl border bg-white px-3 text-sm font-black hover:bg-[#fff2df]">
                            <ImagePlus size={16} /> Thay bằng ảnh từ máy
                            <input
                              ref={fileInputRef}
                              type="file"
                              multiple
                              disabled={capturing || mutation.isPending}
                              accept="image/png,image/jpeg,image/webp,image/gif,image/avif"
                              className="sr-only"
                              onChange={(event) =>
                                void replaceWithUploads(Array.from(event.currentTarget.files ?? []))
                              }
                            />
                          </label>
                        </div>
                      ) : null}
                    </div>

                    {configQuery.data.maxAttachments === 0 ? (
                      <p className="mt-4 rounded-xl border border-dashed bg-white p-4 text-center text-sm text-[#806d54]">
                        {contentText(
                          common,
                          "feedback.attachmentsDisabled",
                          "Ảnh đính kèm đang được tắt. Bạn vẫn có thể gửi nội dung góp ý.",
                        )}
                      </p>
                    ) : capturing ? (
                      <div className="mt-4 flex min-h-36 items-center justify-center gap-2 rounded-xl border border-dashed bg-white text-sm font-bold text-[#6f604b]">
                        <LoaderCircle size={20} className="animate-spin" /> Đang chuẩn bị ảnh trang hiện
                        tại...
                      </div>
                    ) : selectedImages.length ? (
                      <div className="mt-4 grid gap-3 sm:grid-cols-2">
                        {selectedImages.map((file, index) => (
                          <div key={fileKey(file)} className="overflow-hidden rounded-xl border bg-white">
                            <div className="relative aspect-video bg-[#eee7dc]">
                              <PreviewImage file={file} alt={`Ảnh góp ý ${index + 1}`} />
                            </div>
                            <div className="flex items-center justify-between gap-2 p-3">
                              <span className="flex min-w-0 items-center gap-2 truncate text-xs font-bold text-[#6f604b]">
                                {imageSource === "auto" ? (
                                  <CheckCircle2 size={15} className="text-green-700" />
                                ) : null}
                                {imageSource === "auto" ? "Ảnh trang hiện tại" : file.name}
                              </span>
                              <button
                                type="button"
                                onClick={() => {
                                  if (imageSource === "auto") setAutoScreenshot(null);
                                  else setUploadedImages((items) => items.filter((item) => item !== file));
                                  if (selectedImages.length === 1) setImageSource("none");
                                }}
                                aria-label="Bỏ ảnh đính kèm"
                                className="grid size-9 cursor-pointer place-items-center rounded-xl border text-red-700 hover:bg-red-50"
                              >
                                <Trash2 size={16} />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="mt-4 rounded-xl border border-dashed bg-white p-4 text-center text-sm text-[#806d54]">
                        Không có ảnh đính kèm. Góp ý vẫn có thể được gửi.
                      </p>
                    )}
                    {captureError ? (
                      <p role="alert" className="mt-3 text-sm font-bold text-amber-800">
                        {captureError}
                      </p>
                    ) : null}
                    {configQuery.data.maxAttachments > 0 ? (
                      <p className="mt-3 text-xs leading-5 text-[#806d54]">
                        {contentText(
                          common,
                          "feedback.capturePrivacy",
                          "Nội dung đang nhập trong biểu mẫu và các vùng riêng tư sẽ được ẩn khỏi ảnh tự chụp.",
                        )}
                      </p>
                    ) : null}
                  </section>

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
    </>
  );
}
