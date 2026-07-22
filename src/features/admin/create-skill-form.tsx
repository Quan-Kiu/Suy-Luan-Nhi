"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus } from "lucide-react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { taxonomyApi } from "@/api/admin/taxonomy";
import { FormStatus, SelectField, SubmitButton, TextareaField, TextField } from "@/components/form";
import { contentText, useContent } from "@/content/client";
import { usePendingRouter } from "@/hooks/use-pending-router";
import { queryKeys } from "@/lib/query/keys";
import { createSlug } from "@/lib/slug";

const skillCategories = ["thinking", "habit"] as const;
const schema = z.object({
  slug: z
    .string()
    .trim()
    .min(2, "Hãy nhập tên kỹ năng để hệ thống tạo mã")
    .regex(/^[a-z0-9-]+$/, "Mã chỉ gồm chữ thường, số và dấu gạch ngang"),
  title: z.string().trim().min(2, "Tên kỹ năng cần ít nhất 2 ký tự"),
  description: z.string().trim().min(8, "Mô tả ngắn giúp người soạn hiểu khi nào nên dùng kỹ năng này"),
  category: z.enum(skillCategories),
});
type FormValues = z.infer<typeof schema>;

const categoryOptions = [
  { value: "thinking", label: "Kỹ năng suy luận" },
  { value: "habit", label: "Thói quen tích cực" },
];

export function CreateSkillForm() {
  const content = useContent("admin");
  const navigation = usePendingRouter();
  const queryClient = useQueryClient();
  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { slug: "", title: "", description: "", category: "thinking" },
  });
  const mutation = useMutation({
    mutationFn: taxonomyApi.createSkill,
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: queryKeys.admin.taxonomy }),
        queryClient.invalidateQueries({ queryKey: queryKeys.admin.missions }),
        queryClient.invalidateQueries({ queryKey: queryKeys.children.all }),
      ]);
      form.reset();
      toast.success(contentText(content, "taxonomy.createSuccess", "Đã thêm kỹ năng"));
      navigation.refresh();
    },
  });
  return (
    <section
      aria-labelledby="new-skill-title"
      className="rounded-3xl border-2 border-dashed border-[#d9c9ae] bg-[#fffaf0] p-5"
    >
      <div className="flex items-start gap-3">
        <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-[#fff0df] text-[#b9470d]">
          <Plus size={19} />
        </span>
        <div>
          <h3 id="new-skill-title" className="type-card-title">
            {contentText(content, "taxonomy.createTitle", "Thêm kỹ năng hoặc thói quen")}
          </h3>
          <p className="type-supporting mt-1 text-[#6f6558]">
            Đặt tên theo cách phụ huynh và người soạn dễ hiểu. Mã kỹ thuật sẽ được tạo tự động.
          </p>
        </div>
      </div>
      <form
        onSubmit={form.handleSubmit((values) => mutation.mutate(values))}
        className="mt-5 space-y-4"
        noValidate
      >
        <div className="grid gap-4 md:grid-cols-2">
          <TextField
            id="new-skill-title-input"
            label={contentText(content, "taxonomy.skillName", "Tên kỹ năng")}
            placeholder="Ví dụ: Quan sát kỹ"
            description="Tên ngắn, tích cực và dễ nhận biết khi soạn nhiệm vụ."
            registration={form.register("title", {
              onChange: (event) => {
                if (!form.formState.dirtyFields.slug) {
                  form.setValue("slug", createSlug(event.target.value), { shouldValidate: true });
                }
              },
            })}
            error={form.formState.errors.title?.message}
          />
          <SelectField
            id="new-skill-category"
            label={contentText(content, "taxonomy.skillCategory", "Loại kỹ năng")}
            description="Chọn cách nội dung này được dùng trong báo cáo và khi soạn nhiệm vụ."
            registration={form.register("category")}
            options={categoryOptions}
            error={form.formState.errors.category?.message}
          />
        </div>
        <TextareaField
          id="new-skill-description"
          label={contentText(content, "taxonomy.skillDescription", "Mô tả dễ hiểu")}
          rows={3}
          placeholder="Ví dụ: Bé chú ý đến chi tiết và nhận ra tín hiệu quan trọng."
          description="Mô tả hành vi có thể quan sát được, tránh thuật ngữ chuyên môn."
          registration={form.register("description")}
          error={form.formState.errors.description?.message}
        />
        <details className="rounded-2xl bg-[#f5f2ec] p-4">
          <summary className="type-action cursor-pointer font-black text-[#4f463b]">
            Thiết lập nâng cao
          </summary>
          <div className="mt-3 max-w-xl">
            <TextField
              id="new-skill-slug"
              label="Mã nội bộ"
              placeholder="quan-sat-ky"
              description="Hệ thống tự tạo từ tên. Chỉ sửa trước khi tạo nếu cần tích hợp với dữ liệu khác."
              registration={form.register("slug")}
              error={form.formState.errors.slug?.message}
            />
          </div>
        </details>
        <FormStatus status={mutation.isError ? "error" : "idle"} message={mutation.error?.message} />
        <SubmitButton
          pending={mutation.isPending || navigation.isPending}
          pendingLabel={contentText(content, "taxonomy.creating", "Đang thêm...")}
          className="w-auto"
        >
          {contentText(content, "taxonomy.create", "Thêm kỹ năng")}
        </SubmitButton>
      </form>
    </section>
  );
}
