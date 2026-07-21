"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { taxonomyApi } from "@/api/admin/taxonomy";
import {
  CheckboxField,
  FormStatus,
  SelectField,
  SubmitButton,
  TextareaField,
  TextField,
} from "@/components/form";
import { contentText, useContent } from "@/content/client";
import { usePendingRouter } from "@/hooks/use-pending-router";
import { queryKeys } from "@/lib/query/keys";

export type SkillItem = {
  id: string;
  slug: string;
  title: string;
  description: string;
  category: string;
  active: boolean;
};

const schema = z.object({
  title: z.string().trim().min(2),
  description: z.string().trim().min(8),
  category: z.enum(["thinking", "habit"]),
  active: z.boolean(),
});
type FormValues = z.infer<typeof schema>;

export function SkillForm({ item }: { item: SkillItem }) {
  const content = useContent("admin");
  const navigation = usePendingRouter();
  const queryClient = useQueryClient();
  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      title: item.title,
      description: item.description,
      category: item.category === "habit" ? "habit" : "thinking",
      active: item.active,
    },
  });
  const mutation = useMutation({
    mutationFn: (values: FormValues) => taxonomyApi.updateSkill(item.id, values),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: queryKeys.admin.taxonomy });
      toast.success(contentText(content, "taxonomy.skillSaved", "Đã lưu kỹ năng"));
      navigation.refresh();
    },
  });

  return (
    <form onSubmit={form.handleSubmit((values) => mutation.mutate(values))} className="space-y-4" noValidate>
      <div className="grid gap-4 md:grid-cols-2">
        <TextField
          id={`skill-${item.id}-title`}
          label={contentText(content, "taxonomy.skillName", "Tên kỹ năng")}
          placeholder="Ví dụ: Quan sát kỹ"
          description="Tên ngắn, tích cực và dễ nhận biết khi soạn nhiệm vụ."
          registration={form.register("title")}
          error={form.formState.errors.title?.message}
        />
        <SelectField
          id={`skill-${item.id}-category`}
          label={contentText(content, "taxonomy.skillCategory", "Loại kỹ năng")}
          description="Chọn kỹ năng suy luận hoặc thói quen tích cực."
          registration={form.register("category")}
          error={form.formState.errors.category?.message}
          options={[
            { value: "thinking", label: "Kỹ năng suy luận" },
            { value: "habit", label: "Thói quen tích cực" },
          ]}
        />
      </div>
      <TextareaField
        id={`skill-${item.id}-description`}
        label={contentText(content, "taxonomy.skillDescription", "Mô tả dễ hiểu")}
        rows={3}
        placeholder="Mô tả hành vi có thể quan sát được ở bé."
        description="Giải thích theo ngôn ngữ phụ huynh và người soạn dễ hiểu."
        registration={form.register("description")}
        error={form.formState.errors.description?.message}
      />
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <CheckboxField
          id={`skill-${item.id}-active`}
          label={contentText(content, "taxonomy.active", "Cho phép dùng kỹ năng này")}
          registration={form.register("active")}
        />
        <SubmitButton
          pending={mutation.isPending || navigation.isPending}
          pendingLabel={contentText(content, "taxonomy.saving", "Đang lưu...")}
          className="w-auto"
        >
          {contentText(content, "taxonomy.save", "Lưu thay đổi")}
        </SubmitButton>
      </div>
      <details className="rounded-xl bg-[#f7f3eb] p-3 text-xs text-[#6f6558]">
        <summary className="cursor-pointer font-black text-[#4f463b]">
          Thông tin dành cho đội kỹ thuật
        </summary>
        <p className="mt-2 font-mono">Mã nội bộ: {item.slug}</p>
      </details>
      <FormStatus status={mutation.isError ? "error" : "idle"} message={mutation.error?.message} />
    </form>
  );
}
