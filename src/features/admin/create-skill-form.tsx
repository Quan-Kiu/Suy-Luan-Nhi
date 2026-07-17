"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { taxonomyApi } from "@/api/admin/taxonomy";
import { FormStatus, SubmitButton, TextField } from "@/components/form";
import { contentText, useContent } from "@/content/client";
import { queryKeys } from "@/lib/query/keys";

const schema = z.object({
  slug: z
    .string()
    .trim()
    .regex(/^[a-z0-9-]+$/, "Slug chỉ gồm chữ thường, số và dấu gạch ngang"),
  title: z.string().trim().min(2),
  description: z.string().trim().min(8),
  category: z.string().trim().min(2),
});
type FormValues = z.infer<typeof schema>;

export function CreateSkillForm() {
  const content = useContent("admin");
  const router = useRouter();
  const queryClient = useQueryClient();
  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { slug: "", title: "", description: "", category: "thinking" },
  });
  const mutation = useMutation({
    mutationFn: taxonomyApi.createSkill,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: queryKeys.admin.taxonomy });
      form.reset();
      toast.success(contentText(content, "taxonomy.createSuccess", "Đã tạo kỹ năng"));
      router.refresh();
    },
  });

  return (
    <section aria-labelledby="new-skill-title" className="rounded-2xl border-2 border-dashed bg-white/70 p-4">
      <h3 id="new-skill-title" className="font-black">
        {contentText(content, "taxonomy.createTitle", "Tạo kỹ năng mới")}
      </h3>
      <form
        onSubmit={form.handleSubmit((values) => mutation.mutate(values))}
        className="mt-3 grid gap-3 md:grid-cols-[180px_1fr_1fr_160px_auto] md:items-end"
        noValidate
      >
        <TextField
          label="Slug"
          placeholder="slug"
          registration={form.register("slug")}
          error={form.formState.errors.slug?.message}
        />
        <TextField
          label={contentText(content, "taxonomy.skillName", "Tên kỹ năng")}
          placeholder="Tên kỹ năng"
          registration={form.register("title")}
          error={form.formState.errors.title?.message}
        />
        <TextField
          label={contentText(content, "taxonomy.skillDescription", "Mô tả")}
          placeholder="Mô tả"
          registration={form.register("description")}
          error={form.formState.errors.description?.message}
        />
        <TextField
          label={contentText(content, "taxonomy.skillCategory", "Danh mục")}
          placeholder="category"
          registration={form.register("category")}
          error={form.formState.errors.category?.message}
        />
        <SubmitButton
          pending={mutation.isPending}
          pendingLabel={contentText(content, "taxonomy.creating", "Đang tạo...")}
          className="w-auto"
        >
          {contentText(content, "taxonomy.create", "Tạo")}
        </SubmitButton>
        <FormStatus
          status={mutation.isError ? "error" : "idle"}
          message={mutation.error?.message}
          className="md:col-span-5"
        />
      </form>
    </section>
  );
}
