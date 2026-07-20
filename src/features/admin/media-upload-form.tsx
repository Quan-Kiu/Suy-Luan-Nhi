"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { mediaApi, type MediaItem } from "@/api/admin/media";
import { FormStatus, SubmitButton, TextField } from "@/components/form";
import { contentText, useContent } from "@/content/client";
import { mediaCategories, mediaCategoryLabels } from "@/domain/media";

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
  const mutation = useMutation({
    mutationFn: ({ file, altText, category }: FormValues) => mediaApi.upload(file[0], altText, category),
    onSuccess: (item) => {
      onUploaded(item);
      form.reset();
      toast.success(contentText(content, "media.uploadSuccess", "Đã tải tư liệu lên thư viện"));
    },
  });

  return (
    <form
      className="rounded-2xl border bg-white p-5"
      onSubmit={form.handleSubmit((values) => mutation.mutate(values))}
      noValidate
    >
      <h2 className="text-xl font-black">{contentText(content, "media.uploadTitle", "Tải tư liệu mới")}</h2>
      <p className="mt-1 text-sm text-[#806d54]">
        {contentText(
          content,
          "media.uploadDescription",
          "Hãy mô tả rõ hình ảnh, âm thanh hoặc video để hỗ trợ khả năng tiếp cận.",
        )}
      </p>
      <div className="mt-4 grid gap-3 lg:grid-cols-[minmax(260px,1fr)_190px_minmax(260px,1fr)_auto] lg:items-end">
        <label className="block font-bold">
          Tệp hình ảnh, âm thanh hoặc video
          <input
            type="file"
            accept="image/png,image/jpeg,image/webp,image/gif,image/avif,audio/mpeg,audio/wav,audio/ogg,video/mp4,video/webm,video/quicktime"
            className="mt-1 min-h-12 w-full rounded-xl border p-2"
            {...form.register("file")}
          />
          {form.formState.errors.file ? (
            <span role="alert" className="mt-1 block text-sm text-red-700">
              {form.formState.errors.file.message}
            </span>
          ) : null}
        </label>
        <label className="block font-bold">
          Nhóm tư liệu
          <select className="mt-1 min-h-12 w-full rounded-xl border px-3" {...form.register("category")}>
            {mediaCategories.map((category) => (
              <option key={category} value={category}>
                {mediaCategoryLabels[category]}
              </option>
            ))}
          </select>
        </label>
        <TextField
          label={contentText(content, "media.altLabel", "Mô tả nội dung tư liệu")}
          placeholder={contentText(content, "media.altPlaceholder", "Mô tả hình ảnh, âm thanh hoặc video")}
          registration={form.register("altText")}
          error={form.formState.errors.altText?.message}
        />
        <SubmitButton
          pending={mutation.isPending}
          pendingLabel={contentText(content, "media.uploading", "Đang tải...")}
          className="md:w-auto"
        >
          {contentText(content, "media.upload", "Tải lên")}
        </SubmitButton>
      </div>
      <FormStatus
        status={mutation.isError ? "error" : "idle"}
        message={mutation.error?.message}
        className="mt-3"
      />
    </form>
  );
}
