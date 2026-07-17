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

export type AgeGroupItem = {
  code: "2-3" | "4-5" | "6-8";
  label: string;
  description: string;
  minAge: number;
  maxAge: number;
  sortOrder: number;
  active: boolean;
};

const schema = z.object({
  label: z.string().trim().min(2),
  description: z.string().trim().min(8),
  active: z.boolean(),
});
type FormValues = z.infer<typeof schema>;

export function AgeGroupForm({ item }: { item: AgeGroupItem }) {
  const content = useContent("admin");
  const router = useRouter();
  const queryClient = useQueryClient();
  const form = useForm<FormValues>({ resolver: zodResolver(schema), defaultValues: item });
  const mutation = useMutation({
    mutationFn: (values: FormValues) => taxonomyApi.updateAgeGroup(item.code, values),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: queryKeys.admin.taxonomy });
      toast.success(contentText(content, "taxonomy.ageSaved", "Đã lưu nhóm tuổi"));
      router.refresh();
    },
  });

  return (
    <form onSubmit={form.handleSubmit((values) => mutation.mutate(values))} className="space-y-3" noValidate>
      <strong>{item.code} tuổi</strong>
      <TextField
        label={contentText(content, "taxonomy.ageLabel", "Tên nhóm tuổi")}
        placeholder="Ví dụ: 4–5 tuổi"
        registration={form.register("label")}
        error={form.formState.errors.label?.message}
      />
      <TextareaField
        label={contentText(content, "taxonomy.ageDescription", "Mô tả nhóm tuổi")}
        rows={4}
        placeholder="Mô tả khả năng và dạng nhiệm vụ phù hợp"
        registration={form.register("description")}
        error={form.formState.errors.description?.message}
      />
      <CheckboxField
        label={contentText(content, "taxonomy.active", "Đang sử dụng")}
        registration={form.register("active")}
      />
      <FormStatus status={mutation.isError ? "error" : "idle"} message={mutation.error?.message} />
      <SubmitButton
        pending={mutation.isPending}
        pendingLabel={contentText(content, "taxonomy.saving", "Đang lưu...")}
        className="w-auto"
      >
        {contentText(content, "taxonomy.save", "Lưu")}
      </SubmitButton>
    </form>
  );
}
