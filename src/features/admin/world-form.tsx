"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import Image from "next/image";
import { useForm, useWatch } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { worldsApi, type WorldInput, type WorldStatus } from "@/api/admin/worlds";
import { FormStatus, SelectField, SubmitButton, TextareaField, TextField } from "@/components/form";
import { contentText, useContent } from "@/content/client";
import { MediaUploadField } from "@/features/admin/media-upload-field";
import { usePendingRouter } from "@/hooks/use-pending-router";
import { queryKeys } from "@/lib/query/keys";
import { createSlug } from "@/lib/slug";

const schema = z.object({
  slug: z
    .string()
    .trim()
    .regex(/^[a-z0-9-]+$/, "Slug chỉ gồm chữ thường, số và dấu gạch ngang"),
  title: z.string().trim().min(2, "Tiêu đề cần ít nhất 2 ký tự"),
  subtitle: z.string().trim().min(2, "Phụ đề cần ít nhất 2 ký tự"),
  description: z.string().trim().min(8, "Mô tả cần ít nhất 8 ký tự"),
  sortOrder: z.number().int().positive(),
  themeColor: z.string().min(3),
  coverUrl: z.string().trim().min(1, "Hãy nhập cover URL"),
  status: z.enum(["draft", "published", "archived"]),
});

type FormValues = z.infer<typeof schema>;
export type WorldItem = FormValues & { id: string };

const statusLabels: Record<WorldStatus, string> = {
  draft: "Bản nháp",
  published: "Đang hiển thị",
  archived: "Đã lưu trữ",
};

function toInput(values: FormValues, mode: "create" | "edit"): WorldInput {
  const input: WorldInput = {
    title: values.title,
    subtitle: values.subtitle,
    description: values.description,
    sortOrder: values.sortOrder,
    themeColor: values.themeColor,
    coverUrl: values.coverUrl,
  };
  if (mode === "create") input.slug = values.slug;
  if (mode === "edit") input.status = values.status;
  return input;
}

export function WorldForm({
  mode,
  initial,
}: {
  mode: "create" | "edit";
  initial: FormValues & { id?: string };
}) {
  const content = useContent("admin");
  const navigation = usePendingRouter();
  const queryClient = useQueryClient();
  const fieldPrefix = `world-${initial.id ?? "new"}`;
  const form = useForm<FormValues>({ resolver: zodResolver(schema), defaultValues: initial });
  const title = useWatch({ control: form.control, name: "title" });
  const coverUrl = useWatch({ control: form.control, name: "coverUrl" });
  const mutation = useMutation({
    mutationFn: (values: FormValues) => {
      const input = toInput(values, mode);
      return mode === "create" ? worldsApi.create(input) : worldsApi.update(initial.id!, input);
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: queryKeys.admin.worlds });
      toast.success(
        mode === "create"
          ? contentText(content, "world.createSuccess", "Đã thêm chủ đề nhiệm vụ")
          : contentText(content, "world.updateSuccess", "Đã cập nhật chủ đề nhiệm vụ"),
      );
      if (mode === "create") {
        form.reset({ ...initial, sortOrder: initial.sortOrder + 1 });
      }
      navigation.refresh();
    },
  });

  return (
    <form onSubmit={form.handleSubmit((values) => mutation.mutate(values))} className="space-y-3" noValidate>
      {mode === "edit" && coverUrl ? (
        <Image
          src={coverUrl}
          width={320}
          height={180}
          alt=""
          className="h-32 w-full rounded-xl object-cover"
        />
      ) : null}
      <div className="grid gap-3 md:grid-cols-2">
        <TextField
          id={`${fieldPrefix}-title`}
          label={contentText(content, "world.titleLabel", "Tên chủ đề")}
          placeholder="Ví dụ: Thám tử Quy luật"
          registration={form.register("title", {
            onChange: (event) => {
              if (mode === "create" && !form.formState.dirtyFields.slug) {
                form.setValue("slug", createSlug(event.target.value), { shouldValidate: true });
              }
            },
          })}
          error={form.formState.errors.title?.message}
        />
        <TextField
          id={`${fieldPrefix}-subtitle`}
          label={contentText(content, "world.subtitleLabel", "Câu giới thiệu ngắn")}
          placeholder="Ví dụ: Quan sát thật tinh"
          registration={form.register("subtitle")}
          error={form.formState.errors.subtitle?.message}
        />
      </div>
      <TextareaField
        id={`${fieldPrefix}-description`}
        label={contentText(content, "world.descriptionLabel", "Mô tả cho phụ huynh và bé")}
        placeholder="Giới thiệu trẻ sẽ khám phá điều gì trong thế giới này"
        rows={3}
        registration={form.register("description")}
        error={form.formState.errors.description?.message}
      />
      <div className="grid gap-3 md:grid-cols-3">
        <TextField
          id={`${fieldPrefix}-sort-order`}
          type="number"
          label={contentText(content, "world.sortOrderLabel", "Vị trí trên bản đồ")}
          registration={form.register("sortOrder", { valueAsNumber: true })}
          error={form.formState.errors.sortOrder?.message}
        />
        <SelectField
          id={`${fieldPrefix}-theme`}
          label={contentText(content, "world.themeLabel", "Màu chủ đề")}
          registration={form.register("themeColor")}
          options={[
            { value: "green", label: "Xanh lá" },
            { value: "blue", label: "Xanh dương" },
            { value: "purple", label: "Tím" },
            { value: "orange", label: "Cam" },
          ]}
        />
        <SelectField
          id={`${fieldPrefix}-status`}
          label={contentText(content, "world.statusLabel", "Trạng thái hiển thị")}
          registration={form.register("status")}
          disabled={mode === "create"}
          options={(["draft", "published", "archived"] as WorldStatus[]).map((value) => ({
            value,
            label: statusLabels[value],
          }))}
        />
      </div>
      <details className="rounded-xl bg-[#f7f3eb] p-3">
        <summary className="cursor-pointer text-sm font-black">Thiết lập nâng cao</summary>
        <div className="mt-3 grid gap-3 md:grid-cols-2">
          {mode === "create" ? (
            <TextField
              id={`${fieldPrefix}-slug`}
              label={contentText(content, "world.slugLabel", "Mã đường dẫn")}
              placeholder="tham-tu-quy-luat"
              description="Hệ thống tự tạo từ tên; chỉ sửa khi thật sự cần."
              registration={form.register("slug")}
              error={form.formState.errors.slug?.message}
            />
          ) : null}
          <MediaUploadField
            label={contentText(content, "world.coverLabel", "Ảnh bìa chủ đề")}
            value={coverUrl}
            onChange={(url) => form.setValue("coverUrl", url, { shouldDirty: true, shouldValidate: true })}
            category="world-cover"
            altText={title || "Ảnh bìa chủ đề"}
            error={form.formState.errors.coverUrl?.message}
          />
        </div>
      </details>
      <FormStatus
        status={mutation.isError ? "error" : mutation.isSuccess ? "success" : "idle"}
        message={
          mutation.isError ? mutation.error.message : mutation.isSuccess ? "Dữ liệu đã được lưu" : undefined
        }
      />
      <SubmitButton
        pending={mutation.isPending || navigation.isPending}
        pendingLabel={
          mode === "create"
            ? contentText(content, "world.creating", "Đang tạo...")
            : contentText(content, "world.updating", "Đang lưu...")
        }
        className="w-auto"
      >
        {mode === "create"
          ? contentText(content, "world.create", "Thêm chủ đề")
          : contentText(content, "world.update", "Lưu")}
      </SubmitButton>
    </form>
  );
}
