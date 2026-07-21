"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useRef } from "react";
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
      <h2 className="text-xl font-black">
        {contentText(content, "media.uploadTitle", "Thêm hình ảnh, âm thanh hoặc video")}
      </h2>
      <p className="mt-1 text-sm text-[#806d54]">
        {contentText(
          content,
          "media.uploadDescription",
          "Hãy viết mô tả ngắn để người dùng trình đọc màn hình hiểu nội dung.",
        )}
      </p>
      <div className="mt-5 grid gap-x-3 gap-y-4 md:grid-cols-2 2xl:grid-cols-[minmax(320px,1.25fr)_minmax(180px,0.45fr)_minmax(300px,1fr)_auto] 2xl:items-start">
        <label className="grid content-start gap-2 font-bold md:col-span-2 2xl:col-span-1">
          <span>Tệp hình ảnh, âm thanh hoặc video</span>
          <span className="relative flex min-h-12 items-stretch overflow-hidden rounded-2xl border-2 border-[#eadfc9] bg-[#fffdf8] transition outline-none focus-within:border-[#e9641a]">
            <span className="inline-flex shrink-0 items-center border-r border-[#eadfc9] bg-[#fff7e9] px-4 text-sm font-black text-[#5e4b34]">
              Chọn tệp
            </span>
            <span className="min-w-0 flex-1 truncate px-3 py-3 font-normal text-[#6f6558]">
              {selectedFileName}
            </span>
            <input
              type="file"
              accept="image/png,image/jpeg,image/webp,image/gif,image/avif,audio/mpeg,audio/wav,audio/ogg,video/mp4,video/webm,video/quicktime"
              className="absolute inset-0 cursor-pointer opacity-0"
              name={fileRegistration.name}
              onBlur={fileRegistration.onBlur}
              onChange={fileRegistration.onChange}
              aria-invalid={Boolean(fileError)}
              aria-describedby="media-file-message"
              ref={(element) => {
                fileRegistration.ref(element);
                fileInputRef.current = element;
              }}
            />
          </span>
          <span
            id="media-file-message"
            role={fileError ? "alert" : undefined}
            aria-hidden={fileError || policySummary ? undefined : true}
            className={
              fileError
                ? "min-h-5 text-sm leading-5 font-bold text-red-700"
                : "min-h-5 text-xs leading-5 font-bold text-[#6f6558]"
            }
          >
            {fileError ?? (policySummary ? `Yêu cầu đối với ảnh: ${policySummary}.` : "\u00a0")}
          </span>
        </label>
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
        <div className="md:col-span-2 2xl:col-span-1 2xl:pt-8">
          <SubmitButton
            pending={mutation.isPending}
            pendingLabel={contentText(content, "media.uploading", "Đang tải...")}
            className="min-h-12 w-full 2xl:w-auto 2xl:min-w-32"
          >
            {contentText(content, "media.upload", "Chọn và tải lên")}
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
