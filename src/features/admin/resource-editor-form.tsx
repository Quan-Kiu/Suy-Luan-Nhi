"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Save } from "lucide-react";
import { useForm, useWatch } from "react-hook-form";
import { useState } from "react";
import { toast } from "sonner";
import { z } from "zod";
import { adminResourcesApi, type AdminResourceInput, type AdminResourceItem } from "@/api/admin/resources";
import { FormStatus, SubmitButton, TextField, TextareaField } from "@/components/form";
import { ageGroupCodes, type AgeGroup } from "@/domain/age-groups";
import { MediaUploadField } from "@/features/admin/media-upload-field";
import {
  parentResourceCategories,
  parentResourceCategoryLabels,
  parentResourceErrorCodes,
  parentResourceTypes,
  parentResourceTypeLabels,
} from "@/domain/parent-resources";
import { useHydrated } from "@/hooks/use-hydrated";
import { usePendingRouter } from "@/hooks/use-pending-router";
import { ApiRequestError } from "@/lib/api/error";
import { queryKeys } from "@/lib/query/keys";
import { createSlug } from "@/lib/slug";

const schema = z
  .object({
    slug: z
      .string()
      .trim()
      .min(3, "Mã đường dẫn cần ít nhất 3 ký tự")
      .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Chỉ dùng chữ thường, số và dấu gạch ngang"),
    title: z.string().trim().min(5, "Tiêu đề cần ít nhất 5 ký tự"),
    excerpt: z.string().trim().min(10, "Tóm tắt cần ít nhất 10 ký tự").max(500),
    content: z.string().trim().min(30, "Nội dung cần ít nhất 30 ký tự"),
    resourceType: z.enum(parentResourceTypes),
    category: z.enum(parentResourceCategories),
    ageGroups: z.array(z.enum(ageGroupCodes)).min(1, "Chọn ít nhất một nhóm tuổi"),
    coverUrl: z.string().trim().min(1, "Hãy chọn ảnh bìa"),
    mediaUrl: z.string().trim(),
    sortOrder: z.number().int().min(0).max(10_000),
    status: z.enum(["draft", "published", "archived"]),
  })
  .superRefine((resource, context) => {
    if (resource.resourceType === "video" && !resource.mediaUrl) {
      context.addIssue({
        code: "custom",
        path: ["mediaUrl"],
        message: "Hãy tải lên tệp video",
      });
    }
  });

type FormValues = z.infer<typeof schema>;
const emptyResource: FormValues = {
  slug: "",
  title: "",
  excerpt: "",
  content: "",
  resourceType: "article",
  category: "companionship",
  ageGroups: ["6-8"],
  coverUrl: "",
  mediaUrl: "",
  sortOrder: 0,
  status: "draft",
};

function toFormValues(resource?: AdminResourceItem | null): FormValues {
  if (!resource) return emptyResource;
  return {
    slug: resource.slug,
    title: resource.title,
    excerpt: resource.excerpt,
    content: resource.content,
    resourceType: resource.resourceType,
    category: resource.category,
    ageGroups: resource.ageGroups,
    coverUrl: resource.coverUrl ?? "",
    mediaUrl: resource.mediaUrl ?? "",
    sortOrder: resource.sortOrder,
    status: resource.status,
  };
}

type ResourceConflictDetails = {
  currentRevision: number;
  currentUpdatedAt: string;
};

function getResourceConflictDetails(error: unknown): ResourceConflictDetails | null {
  if (!(error instanceof ApiRequestError) || error.code !== parentResourceErrorCodes.editConflict)
    return null;
  if (!error.details || typeof error.details !== "object") return null;
  const details = error.details as Record<string, unknown>;
  return typeof details.currentRevision === "number" && typeof details.currentUpdatedAt === "string"
    ? { currentRevision: details.currentRevision, currentUpdatedAt: details.currentUpdatedAt }
    : null;
}

export function ResourceEditorForm({ resource }: { resource?: AdminResourceItem | null }) {
  const navigation = usePendingRouter();
  const queryClient = useQueryClient();
  const interactive = useHydrated();
  const [currentRevision, setCurrentRevision] = useState(resource?.revision ?? 0);
  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: toFormValues(resource),
  });
  const mutation = useMutation({
    mutationFn: (values: FormValues) => {
      const input: AdminResourceInput = {
        ...values,
        mediaUrl: values.resourceType === "video" ? values.mediaUrl : null,
      };
      return resource
        ? adminResourcesApi.update(resource.id, input, currentRevision)
        : adminResourcesApi.create(input);
    },
    onSuccess: async (saved) => {
      setCurrentRevision(saved.revision);
      form.reset(toFormValues(saved));
      await queryClient.invalidateQueries({ queryKey: queryKeys.admin.resources });
      toast.success(saved.status === "published" ? "Bài viết đã được hiển thị" : "Đã lưu bài viết");
      if (!resource) navigation.push(`/admin/resources/${saved.id}/edit`);
    },
  });
  const reloadMutation = useMutation({
    mutationFn: () => {
      if (!resource) throw new Error("Không thể tải lại tài nguyên chưa được tạo");
      return adminResourcesApi.get(resource.id);
    },
    onSuccess: (latest) => {
      setCurrentRevision(latest.revision);
      form.reset(toFormValues(latest));
      mutation.reset();
      toast.success("Đã tải phiên bản mới nhất");
    },
  });
  const title = useWatch({ control: form.control, name: "title" });
  const coverUrl = useWatch({ control: form.control, name: "coverUrl" });
  const mediaUrl = useWatch({ control: form.control, name: "mediaUrl" });
  const resourceType = useWatch({ control: form.control, name: "resourceType" });
  const selectedAgeGroups = useWatch({ control: form.control, name: "ageGroups" });
  const conflict = getResourceConflictDetails(mutation.error);
  function toggleAgeGroup(ageGroup: AgeGroup) {
    const next = selectedAgeGroups.includes(ageGroup)
      ? selectedAgeGroups.filter((item) => item !== ageGroup)
      : [...selectedAgeGroups, ageGroup];
    form.setValue("ageGroups", next, { shouldDirty: true, shouldValidate: true });
  }

  return (
    <form
      className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_320px]"
      onSubmit={form.handleSubmit((values) => mutation.mutate(values))}
      aria-busy={!interactive || mutation.isPending || navigation.isPending}
      noValidate
    >
      <fieldset disabled={!interactive || mutation.isPending || navigation.isPending} className="contents">
        <div className="space-y-5">
          <section className="rounded-2xl border bg-white p-5">
            <h2 className="type-section-title">Nội dung bài đăng</h2>
            <div className="mt-4 grid gap-4 md:grid-cols-2">
              <TextField
                label="Tiêu đề"
                placeholder="Ví dụ: Cùng con luyện cách quan sát"
                description="Dùng câu ngắn, rõ lợi ích và tránh thuật ngữ chuyên môn."
                registration={form.register("title", {
                  onChange: (event) => {
                    if (!resource && !form.formState.dirtyFields.slug) {
                      form.setValue("slug", createSlug(event.target.value), { shouldValidate: true });
                    }
                  },
                })}
                error={form.formState.errors.title?.message}
                containerClassName="md:col-span-2"
              />
              <MediaUploadField
                label="Ảnh bìa"
                value={coverUrl}
                onChange={(url) =>
                  form.setValue("coverUrl", url, { shouldDirty: true, shouldValidate: true })
                }
                category="resource-cover"
                previewFit="cover"
                eagerPreview
                altText={title || "Ảnh bìa tài nguyên"}
                error={form.formState.errors.coverUrl?.message}
              />
              {resourceType === "video" ? (
                <div className="md:col-span-2">
                  <MediaUploadField
                    label="Tệp video"
                    value={mediaUrl}
                    onChange={(url) =>
                      form.setValue("mediaUrl", url, { shouldDirty: true, shouldValidate: true })
                    }
                    category="video-guide"
                    altText={title || "Video hướng dẫn phụ huynh"}
                    accept="video/mp4,video/webm,video/quicktime"
                    allowedKinds={["video"]}
                    description="Chọn video đã có trong thư viện hoặc tải video mới từ máy."
                    error={form.formState.errors.mediaUrl?.message}
                  />
                </div>
              ) : null}
            </div>
            <div className="mt-4 space-y-4">
              <TextareaField
                label="Tóm tắt"
                rows={3}
                placeholder="Mô tả ngắn hiển thị trên thẻ tài nguyên."
                registration={form.register("excerpt")}
                error={form.formState.errors.excerpt?.message}
              />
              <TextareaField
                label="Nội dung chi tiết"
                rows={14}
                placeholder="Viết nội dung rõ ràng, thực tế và phù hợp cho phụ huynh có con 6–12 tuổi."
                registration={form.register("content")}
                error={form.formState.errors.content?.message}
              />
              <details className="rounded-2xl bg-[#f5f2ec] p-4">
                <summary className="type-action cursor-pointer font-black text-[#4f463b]">
                  Thiết lập nâng cao
                </summary>
                <div className="mt-3 max-w-xl">
                  <TextField
                    label="Mã đường dẫn"
                    placeholder="cung-con-luyen-quan-sat"
                    description="Hệ thống tự tạo từ tiêu đề khi tạo mới. Chỉ sửa khi thật sự cần giữ một đường dẫn riêng."
                    registration={form.register("slug")}
                    error={form.formState.errors.slug?.message}
                  />
                </div>
              </details>
            </div>
          </section>
        </div>
        <aside className="space-y-5">
          <section className="rounded-2xl border bg-white p-5">
            <h2 className="type-card-title">Bài này dành cho ai?</h2>
            <div className="mt-4 space-y-4">
              <label className="block font-bold">
                Loại tài nguyên
                <select
                  value={resourceType}
                  onChange={(event) =>
                    form.setValue("resourceType", event.target.value as FormValues["resourceType"], {
                      shouldDirty: true,
                      shouldValidate: true,
                    })
                  }
                  className="mt-1 min-h-12 w-full rounded-xl border px-3"
                >
                  {parentResourceTypes.map((type) => (
                    <option key={type} value={type}>
                      {parentResourceTypeLabels[type]}
                    </option>
                  ))}
                </select>
              </label>
              <label className="block font-bold">
                Chủ đề
                <select
                  className="mt-1 min-h-12 w-full rounded-xl border px-3"
                  {...form.register("category")}
                >
                  {parentResourceCategories.map((category) => (
                    <option key={category} value={category}>
                      {parentResourceCategoryLabels[category]}
                    </option>
                  ))}
                </select>
              </label>
              <label className="block font-bold">
                Trạng thái
                <select className="mt-1 min-h-12 w-full rounded-xl border px-3" {...form.register("status")}>
                  <option value="draft">Bản nháp</option>
                  <option value="published">Đang hiển thị</option>
                  <option value="archived">Đã cất</option>
                </select>
              </label>
              <TextField
                type="number"
                label="Thứ tự hiển thị"
                registration={form.register("sortOrder", { valueAsNumber: true })}
                error={form.formState.errors.sortOrder?.message}
              />
            </div>
          </section>
          <section className="rounded-2xl border bg-white p-5">
            <h2 className="type-card-title">Nhóm tuổi</h2>
            <p className="type-supporting mt-1 text-[#6f6558]">
              Chỉ cho các gia đình có bé trong nhóm tuổi phù hợp xem bài này.
            </p>
            <div className="mt-4 space-y-2">
              {ageGroupCodes.map((ageGroup) => (
                <label
                  key={ageGroup}
                  className="flex min-h-12 items-center gap-3 rounded-xl border px-3 font-bold"
                >
                  <input
                    type="checkbox"
                    checked={selectedAgeGroups.includes(ageGroup)}
                    onChange={() => toggleAgeGroup(ageGroup)}
                    className="size-5 accent-[#b9470d]"
                  />
                  {ageGroup} tuổi
                </label>
              ))}
            </div>
            {form.formState.errors.ageGroups?.message ? (
              <p role="alert" className="type-supporting mt-2 font-bold text-red-700">
                {form.formState.errors.ageGroups.message}
              </p>
            ) : null}
          </section>
          {conflict ? (
            <div role="alert" className="rounded-2xl border border-amber-300 bg-amber-50 p-4 text-amber-950">
              <p className="type-label font-black">Bài viết vừa được cập nhật ở nơi khác</p>
              <p className="type-supporting mt-1">
                Phiên bản hiện tại là {conflict.currentRevision}, cập nhật lúc{" "}
                {new Date(conflict.currentUpdatedAt).toLocaleString("vi-VN")}. Tải lại sẽ bỏ các thay đổi chưa
                lưu trên màn hình này.
              </p>
              <button
                type="button"
                disabled={reloadMutation.isPending}
                onClick={() => reloadMutation.mutate()}
                className="type-action mt-3 inline-flex min-h-10 items-center justify-center rounded-xl border border-amber-400 bg-white px-4 font-black disabled:opacity-60"
              >
                {reloadMutation.isPending ? "Đang tải..." : "Tải phiên bản mới nhất"}
              </button>
            </div>
          ) : null}
          <FormStatus
            status={mutation.isError && !conflict ? "error" : reloadMutation.isError ? "error" : "idle"}
            message={!conflict ? (mutation.error?.message ?? reloadMutation.error?.message) : undefined}
          />
          <SubmitButton pending={mutation.isPending || navigation.isPending} pendingLabel="Đang lưu...">
            <Save size={18} className="mr-2 inline" />
            {resource ? "Lưu thay đổi" : "Tạo bài đăng"}
          </SubmitButton>
        </aside>
      </fieldset>
    </form>
  );
}
