"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { ageGroupCodes } from "@/domain/age-groups";
import { childrenApi, type ChildSummary } from "@/api/children";
import { FormStatus, SelectField, SubmitButton, TextField } from "@/components/form";
import { Card } from "@/components/ui";
import { contentText, useContent } from "@/content/client";
import { getAgeGroupOptions } from "@/features/profile/age-group-options";
import { queryKeys } from "@/lib/query/keys";

const schema = z.object({
  displayName: z.string().trim().min(1, "Hãy nhập tên thân mật").max(20, "Tên tối đa 20 ký tự"),
  ageGroup: z.enum(ageGroupCodes),
});

type FormValues = z.infer<typeof schema>;

export function EditProfileForm({ child }: { child: ChildSummary }) {
  const content = useContent("profile");
  const router = useRouter();
  const queryClient = useQueryClient();
  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { displayName: child.displayName, ageGroup: child.ageGroup },
  });
  const mutation = useMutation({
    mutationFn: (values: FormValues) => childrenApi.update(child.id, values),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: queryKeys.children.all });
      toast.success(contentText(content, "edit.success", "Đã cập nhật hồ sơ"));
      router.push("/profiles");
      router.refresh();
    },
  });

  return (
    <form className="space-y-4" onSubmit={form.handleSubmit((values) => mutation.mutate(values))} noValidate>
      <Card className="space-y-4 p-5">
        <TextField
          label={contentText(content, "edit.nameLabel", "Tên thân mật")}
          placeholder={contentText(content, "edit.namePlaceholder", "Tên thân mật của bé")}
          registration={form.register("displayName")}
          error={form.formState.errors.displayName?.message}
        />
        <SelectField
          label={contentText(content, "edit.ageLabel", "Nhóm tuổi")}
          registration={form.register("ageGroup")}
          error={form.formState.errors.ageGroup?.message}
          options={getAgeGroupOptions(content).map((option) => ({ value: option.id, label: option.title }))}
        />
      </Card>
      <FormStatus status={mutation.isError ? "error" : "idle"} message={mutation.error?.message} />
      <SubmitButton
        pending={mutation.isPending}
        pendingLabel={contentText(content, "edit.submitting", "Đang lưu...")}
      >
        {contentText(content, "edit.submit", "Lưu thay đổi")}
      </SubmitButton>
    </form>
  );
}
