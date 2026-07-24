"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useId, useRef } from "react";
import { useForm, useWatch } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { mediaApi, type MediaItem } from "@/api/admin/media";
import { FormStatus, SelectField, SubmitButton, TextField } from "@/components/form";
import { contentText, useContent } from "@/content/client";
import { mediaCategories, mediaCategoryLabels } from "@/domain/media";
import {
  getImageUploadPolicySummary,
  validateImageFileForCategory,
} from "@/features/admin/media-file-validation";
import { queryKeys } from "@/lib/query/keys";

const schema = z.object({
  file: z.custom<FileList>(
    (value) => value instanceof FileList && value.length === 1,
    "Hãy chọn một tệp hình ảnh, âm thanh hoặc video",
  ),
  category: z.enum(mediaCategories),
  altText: z.string().trim().min(3, "Mô tả cần ít nhất 3 ký tự"),
});

type FormValues = z.infer<typeof schema>;

export function MediaUploadForm({ onUploaded }: { onUploaded: (item: MediaItem) => void }) {
  const content = useContent("admin");
  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { category: "general", altText: "" },
  });
  const fileInputId = useId();
  const fileLabelId = `${fileInputId}-label`;
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const fileRegistration = form.register("file");
  const category = useWatch({ control: form.control, name: "category" });
  const selectedFiles = useWatch({ control: form.control, name: "file" });
  const selectedFileName = selectedFiles?.[0]?.name ?? "Chưa chọn tệp";
  const fileError = form.formState.errors.file?.message;
  const policiesQuery = useQuery({
    queryKey: queryKeys.admin.mediaUploadPolicies,
    queryFn: mediaApi.getUploadPolicies,
    staleTime: 5 * 60 * 1000,
  });
  const policySummary = getImageUploadPolicySummary(category, policiesQuery.data);
  const fileDescriptionIds = [
    policySummary ? "media-upload-policy" : null,
    fileError ? "media-file-error" : null,
  ]
    .filter(Boolean)
    .join(" ");
  function resetFileInput() {
    form.resetField("file");
    if (fileInputRef.current) fileInputRef.current.value = "";
  }
  const mutation = useMutation({
    mutationFn: async ({ file, altText, category }: FormValues) => {
      await validateImageFileForCategory(file[0], category, policiesQuery.data);
      return mediaApi.upload(file[0], altText, category);
    },
    onSuccess: (item) => {
      onUploaded(item);
      form.reset();
      if (fileInputRef.current) fileInputRef.current.value = "";
      toast.success(contentText(content, "media.uploadSuccess", "Đã thêm vào thư viện"));
    },
    onError: resetFileInput,
  });

  return (
    <form
      className="rounded-2xl border bg-white p-5"
      onSubmit={form.handleSubmit((values) => mutation.mutate(values))}
      noValidate
    >
      <h2 className="type-section-title">
        {contentText(content, "media.uploadTitle", "Thêm hình ảnh, âm thanh hoặc video")}
      </h2>
      <p className="type-supporting mt-1 text-[#806d54]">
        {contentText(
          content,
          "media.uploadDescription",
          "Tải tệp lên thư viện và viết mô tả ngắn để người dùng trình đọc màn hình hiểu nội dung.",
        )}
      </p>
      {policySummary ? (
        <p id="media-upload-policy" className="type-caption mt-2 font-bold text-[#6f6558]">
          Yêu cầu đối với ảnh: {policySummary}.
        </p>
      ) : null}
      <div className="mt-5 grid gap-x-3 gap-y-4 md:grid-cols-2 2xl:grid-cols-[minmax(0,1.25fr)_minmax(180px,0.45fr)_minmax(0,1fr)_minmax(8rem,max-content)] 2xl:items-start">
        <div className="grid content-start gap-2 font-bold md:col-span-2 2xl:col-span-1">
          <span id={fileLabelId} className="type-label">
            Tệp hình ảnh, âm thanh hoặc video
          </span>
          <input
            id={fileInputId}
            type="file"
            accept="image/png,image/jpeg,image/webp,image/gif,image/avif,audio/mpeg,audio/wav,audio/ogg,video/mp4,video/webm,video/quicktime"
            hidden
            name={fileRegistration.name}
            onBlur={fileRegistration.onBlur}
            onChange={fileRegistration.onChange}
            aria-labelledby={fileLabelId}
            aria-invalid={Boolean(fileError)}
            aria-describedby={fileDescriptionIds || undefined}
            ref={(element) => {
              fileRegistration.ref(element);
              fileInputRef.current = element;
            }}
          />
          <div
            className="flex min-h-12 items-stretch overflow-hidden rounded-2xl border-2 border-[#eadfc9] bg-[#fffdf8] transition focus-within:border-[#e9641a] focus-within:ring-4 focus-within:ring-[#f6be78]/45"
            data-testid="media-file-picker"
          >
            <button
              type="button"
              className="type-label inline-flex shrink-0 cursor-pointer items-center border-r border-[#eadfc9] bg-[#fff7e9] px-4 font-black text-[#5e4b34] transition hover:bg-[#ffefd5] focus-visible:outline-none"
              onClick={() => fileInputRef.current?.click()}
              aria-label="Chọn tệp hình ảnh, âm thanh hoặc video"
              aria-describedby={fileDescriptionIds || undefined}
            >
              Chọn tệp
            </button>
            <span
              className="flex min-w-0 flex-1 items-center truncate px-3 font-normal text-[#6f6558]"
              aria-live="polite"
            >
              {selectedFileName}
            </span>
          </div>
          {fileError ? (
            <span id="media-file-error" role="alert" className="type-supporting font-bold text-red-700">
              {fileError}
            </span>
          ) : null}
        </div>
        <SelectField
          label="Loại nội dung"
          registration={form.register("category")}
          options={mediaCategories.map((category) => ({
            value: category,
            label: mediaCategoryLabels[category],
          }))}
        />
        <TextField
          label={contentText(content, "media.altLabel", "Mô tả cho người không xem được nội dung")}
          placeholder={contentText(content, "media.altPlaceholder", "Ví dụ: Bống cầm kính lúp bên cây")}
          registration={form.register("altText")}
          error={form.formState.errors.altText?.message}
        />
        <div className="grid content-start gap-2 md:col-span-2 2xl:col-span-1">
          <span aria-hidden="true" className="type-label invisible hidden select-none 2xl:block">
            Thao tác
          </span>
          <SubmitButton
            pending={mutation.isPending}
            pendingLabel={contentText(content, "media.uploading", "Đang tải...")}
            className="min-h-12 w-full whitespace-nowrap shadow-none hover:translate-y-0 active:translate-y-0 active:shadow-none"
          >
            {contentText(content, "media.upload", "Tải lên")}
          </SubmitButton>
        </div>
      </div>
      <FormStatus
        status={mutation.isError ? "error" : "idle"}
        message={mutation.error?.message}
        className="mt-3"
      />
    </form>
  );
}
