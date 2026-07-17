"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { taxonomyApi } from "@/api/admin/taxonomy";
import { CheckboxField, FormStatus, SubmitButton, TextareaField, TextField } from "@/components/form";
import { contentText, useContent } from "@/content/client";
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
  category: z.string().trim().min(2),
  active: z.boolean(),
});
type FormValues = z.infer<typeof schema>;

export function SkillForm({ item }: { item: SkillItem }) {
  const content = useContent("admin");
  const router = useRouter();
  const queryClient = useQueryClient();
  const form = useForm<FormValues>({ resolver: zodResolver(schema), defaultValues: item });
  const mutation = useMutation({
    mutationFn: (values: FormValues) => taxonomyApi.updateSkill(item.id, values),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: queryKeys.admin.taxonomy });
      toast.success(contentText(content, "taxonomy.skillSaved", "Đã lưu kỹ năng"));
      router.refresh();
    },
  });

  return (
    <form
      onSubmit={form.handleSubmit((values) => mutation.mutate(values))}
      className="grid gap-3 md:grid-cols-[1fr_1.3fr_1fr_auto] md:items-end"
      noValidate
    >
      <div>
        <TextField
          label={contentText(content, "taxonomy.skillName", "Tên kỹ năng")}
          placeholder="Tên kỹ năng"
          registration={form.register("title")}
          error={form.formState.errors.title?.message}
        />
        <small>{item.slug}</small>
      </div>
      <TextareaField
        label={contentText(content, "taxonomy.skillDescription", "Mô tả")}
        rows={2}
        placeholder="Mô tả kỹ năng hoặc thinking habit"
        registration={form.register("description")}
        error={form.formState.errors.description?.message}
      />
      <div className="space-y-2">
        <TextField
          label={contentText(content, "taxonomy.skillCategory", "Danh mục")}
          placeholder="thinking hoặc habit"
          registration={form.register("category")}
          error={form.formState.errors.category?.message}
        />
        <CheckboxField
          label={contentText(content, "taxonomy.active", "Đang sử dụng")}
          registration={form.register("active")}
        />
      </div>
      <SubmitButton
        pending={mutation.isPending}
        pendingLabel={contentText(content, "taxonomy.saving", "Đang lưu...")}
        className="w-auto"
      >
        {contentText(content, "taxonomy.save", "Lưu")}
      </SubmitButton>
      <FormStatus
        status={mutation.isError ? "error" : "idle"}
        message={mutation.error?.message}
        className="md:col-span-4"
      />
    </form>
  );
}
