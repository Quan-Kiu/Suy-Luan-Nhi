"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Award, Users } from "lucide-react";
import { useForm, useWatch } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { badgesApi, type BadgeItem } from "@/api/admin/badges";
import {
  ControlledCheckboxField,
  FormStatus,
  SelectField,
  SubmitButton,
  TextareaField,
  TextField,
} from "@/components/form";
import { MediaUploadField } from "@/features/admin/media-upload-field";
import { usePendingRouter } from "@/hooks/use-pending-router";
import { queryKeys } from "@/lib/query/keys";
import { createSlug } from "@/lib/slug";

const schema = z.object({
  slug: z
    .string()
    .trim()
    .min(2)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
  name: z.string().trim().min(2, "Tên huy hiệu cần ít nhất 2 ký tự").max(80),
  description: z.string().trim().min(8, "Mô tả cần ít nhất 8 ký tự").max(300),
  iconUrl: z.string().trim().min(1, "Hãy chọn ảnh huy hiệu"),
  skillId: z.string().uuid().nullable(),
  active: z.boolean(),
});

type FormValues = z.infer<typeof schema>;
type SkillOption = { id: string; title: string };

export function BadgeForm({
  mode,
  initial,
  skills,
  showUsageSummary = true,
}: {
  mode: "create" | "edit";
  initial: FormValues & Partial<BadgeItem>;
  skills: SkillOption[];
  showUsageSummary?: boolean;
}) {
  const navigation = usePendingRouter();
  const queryClient = useQueryClient();
  const form = useForm<FormValues>({ resolver: zodResolver(schema), defaultValues: initial });
  const name = useWatch({ control: form.control, name: "name" });
  const iconUrl = useWatch({ control: form.control, name: "iconUrl" });
  const mutation = useMutation({
    mutationFn: (values: FormValues) =>
      mode === "create"
        ? badgesApi.create({
            slug: values.slug,
            name: values.name,
            description: values.description,
            iconUrl: values.iconUrl,
            skillId: values.skillId,
          })
        : badgesApi.update(initial.id!, {
            name: values.name,
            description: values.description,
            iconUrl: values.iconUrl,
            skillId: values.skillId,
            active: values.active,
          }),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: queryKeys.admin.badges }),
        queryClient.invalidateQueries({ queryKey: queryKeys.admin.missions }),
        queryClient.invalidateQueries({ queryKey: queryKeys.children.all }),
      ]);
      toast.success(mode === "create" ? "Đã thêm huy hiệu" : "Đã cập nhật huy hiệu");
      if (mode === "create")
        form.reset({ slug: "", name: "", description: "", iconUrl: "", skillId: null, active: true });
      navigation.refresh();
    },
  });

  return (
    <form onSubmit={form.handleSubmit((values) => mutation.mutate(values))} className="space-y-4" noValidate>
      {mode === "edit" && showUsageSummary ? (
        <div className="type-caption flex flex-wrap gap-2 font-bold text-[#6f6558]">
          <span className="inline-flex items-center gap-1 rounded-full bg-[#f5f2ec] px-3 py-1.5">
            <Award size={14} /> {initial.missionCount ?? 0} nhiệm vụ đang gắn
          </span>
          <span className="inline-flex items-center gap-1 rounded-full bg-[#edf4df] px-3 py-1.5 text-[#587048]">
            <Users size={14} /> {initial.earnedCount ?? 0} bé đã nhận
          </span>
        </div>
      ) : null}
      <div className="grid gap-4 md:grid-cols-2">
        <TextField
          id={`badge-${initial.id ?? "new"}-name`}
          label="Tên huy hiệu"
          placeholder="Ví dụ: Người bạn Khu phố Xanh"
          description="Tên ngắn, tích cực và dễ đọc trên màn hình hoàn thành."
          registration={form.register("name", {
            onChange: (event) => {
              if (mode === "create" && !form.formState.dirtyFields.slug)
                form.setValue("slug", createSlug(event.target.value), { shouldValidate: true });
            },
          })}
          error={form.formState.errors.name?.message}
        />
        <SelectField
          id={`badge-${initial.id ?? "new"}-skill`}
          label="Kỹ năng liên quan"
          description="Dùng để nhóm và giải thích ý nghĩa huy hiệu."
          registration={form.register("skillId", { setValueAs: (value) => (value === "" ? null : value) })}
          options={[
            { value: "", label: "Không gắn kỹ năng cụ thể" },
            ...skills.map((skill) => ({ value: skill.id, label: skill.title })),
          ]}
          error={form.formState.errors.skillId?.message}
        />
      </div>
      <TextareaField
        id={`badge-${initial.id ?? "new"}-description`}
        label="Mô tả huy hiệu"
        placeholder="Giải thích bé nhận huy hiệu khi hoàn thành điều gì."
        description="Mô tả này sẽ xuất hiện trong khu vực phụ huynh và lịch sử phần thưởng."
        rows={3}
        registration={form.register("description")}
        error={form.formState.errors.description?.message}
      />
      <MediaUploadField
        label="Ảnh huy hiệu"
        value={iconUrl}
        onChange={(url) => form.setValue("iconUrl", url, { shouldDirty: true, shouldValidate: true })}
        category="badge-icon"
        altText={name ? `Huy hiệu ${name}` : "Ảnh huy hiệu"}
        description="Nên dùng ảnh vuông, nền trong suốt và hình rõ khi thu nhỏ."
        compact
        error={form.formState.errors.iconUrl?.message}
      />
      {mode === "edit" ? (
        <ControlledCheckboxField
          id={`badge-${initial.id}-active`}
          control={form.control}
          name="active"
          label="Cho phép chọn huy hiệu này trong nhiệm vụ mới"
          description="Tắt mục này không làm mất huy hiệu mà bé đã nhận và không thay đổi nhiệm vụ đã xuất bản."
        />
      ) : null}
      <details className="type-supporting rounded-xl bg-[#f7f3eb] p-3">
        <summary className="cursor-pointer font-black">Thông tin dành cho đội kỹ thuật</summary>
        <div className="mt-3 max-w-xl">
          {mode === "create" ? (
            <TextField
              id="new-badge-slug"
              label="Mã huy hiệu"
              placeholder="nguoi-ban-khu-pho-xanh"
              description="Hệ thống tự tạo từ tên và không thể đổi sau khi tạo."
              registration={form.register("slug")}
              error={form.formState.errors.slug?.message}
            />
          ) : (
            <p className="type-caption font-mono text-[#6f6558]">Mã nội bộ: {initial.slug}</p>
          )}
        </div>
      </details>
      <FormStatus status={mutation.isError ? "error" : "idle"} message={mutation.error?.message} />
      <SubmitButton
        pending={mutation.isPending || navigation.isPending}
        pendingLabel="Đang lưu..."
        className="w-auto"
      >
        {mode === "create" ? "Thêm huy hiệu" : "Lưu thay đổi"}
      </SubmitButton>
    </form>
  );
}
