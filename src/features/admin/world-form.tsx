"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useForm, useWatch } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { worldsApi, type WorldInput, type WorldStatus } from "@/api/admin/worlds";
import { FormStatus, SelectField, SubmitButton, TextareaField, TextField } from "@/components/form";
import { contentText, useContent } from "@/content/client";
import { queryKeys } from "@/lib/query/keys";

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
  const router = useRouter();
  const queryClient = useQueryClient();
  const form = useForm<FormValues>({ resolver: zodResolver(schema), defaultValues: initial });
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
          ? contentText(content, "world.createSuccess", "Đã tạo Mission World")
          : contentText(content, "world.updateSuccess", "Đã cập nhật Mission World"),
      );
      if (mode === "create") {
        form.reset({ ...initial, sortOrder: initial.sortOrder + 1 });
      }
      router.refresh();
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
      {mode === "create" ? (
        <TextField
          label={contentText(content, "world.slugLabel", "Slug")}
          placeholder="slug"
          registration={form.register("slug")}
          error={form.formState.errors.slug?.message}
        />
      ) : null}
      <div className="grid gap-3 md:grid-cols-2">
        <TextField
          label={contentText(content, "world.titleLabel", "Tiêu đề")}
          placeholder="Tiêu đề"
          registration={form.register("title")}
          error={form.formState.errors.title?.message}
        />
        <TextField
          label={contentText(content, "world.subtitleLabel", "Phụ đề")}
          placeholder="Phụ đề"
          registration={form.register("subtitle")}
          error={form.formState.errors.subtitle?.message}
        />
      </div>
      <TextareaField
        label={contentText(content, "world.descriptionLabel", "Mô tả")}
        placeholder="Mô tả"
        rows={3}
        registration={form.register("description")}
        error={form.formState.errors.description?.message}
      />
      <div className="grid gap-3 md:grid-cols-3">
        <TextField
          type="number"
          label={contentText(content, "world.sortOrderLabel", "Thứ tự")}
          registration={form.register("sortOrder", { valueAsNumber: true })}
          error={form.formState.errors.sortOrder?.message}
        />
        <SelectField
          label={contentText(content, "world.themeLabel", "Màu chủ đề")}
          registration={form.register("themeColor")}
          options={["green", "blue", "purple", "orange"].map((value) => ({ value, label: value }))}
        />
        <SelectField
          label={contentText(content, "world.statusLabel", "Trạng thái")}
          registration={form.register("status")}
          disabled={mode === "create"}
          options={(["draft", "published", "archived"] as WorldStatus[]).map((value) => ({
            value,
            label: value,
          }))}
        />
      </div>
      <TextField
        label={contentText(content, "world.coverLabel", "Cover URL")}
        placeholder="Cover URL"
        registration={form.register("coverUrl")}
        error={form.formState.errors.coverUrl?.message}
      />
      <FormStatus
        status={mutation.isError ? "error" : mutation.isSuccess ? "success" : "idle"}
        message={
          mutation.isError ? mutation.error.message : mutation.isSuccess ? "Dữ liệu đã được lưu" : undefined
        }
      />
      <SubmitButton
        pending={mutation.isPending}
        pendingLabel={
          mode === "create"
            ? contentText(content, "world.creating", "Đang tạo...")
            : contentText(content, "world.updating", "Đang lưu...")
        }
        className="w-auto"
      >
        {mode === "create"
          ? contentText(content, "world.create", "Tạo thế giới")
          : contentText(content, "world.update", "Lưu")}
      </SubmitButton>
    </form>
  );
}
