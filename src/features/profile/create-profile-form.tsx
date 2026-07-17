"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useForm, useWatch } from "react-hook-form";
import { toast } from "sonner";
import { childrenApi } from "@/api/children";
import { FormStatus, SubmitButton, TextField } from "@/components/form";
import { Card } from "@/components/ui";
import { contentText, useContent } from "@/content/client";
import { createChildProfileSchema, type CreateChildProfileInput } from "@/domain/schemas";
import { AgeGroupCardsField } from "@/features/profile/age-group-cards-field";
import { getAgeGroupOptions } from "@/features/profile/age-group-options";
import { queryKeys } from "@/lib/query/keys";

export function CreateProfileForm() {
  const content = useContent("profile");
  const router = useRouter();
  const queryClient = useQueryClient();
  const form = useForm<CreateChildProfileInput>({
    resolver: zodResolver(createChildProfileSchema),
    defaultValues: { displayName: "", ageGroup: "4-5" },
  });
  const selectedAgeGroup = useWatch({ control: form.control, name: "ageGroup" });
  const mutation = useMutation({
    mutationFn: childrenApi.create,
    onSuccess: async (profile) => {
      await queryClient.invalidateQueries({ queryKey: queryKeys.children.all });
      toast.success(
        `${profile.displayName}: ${contentText(content, "create.success", "Hồ sơ đã sẵn sàng!")}`,
      );
      router.push("/profiles");
      router.refresh();
    },
  });

  return (
    <form onSubmit={form.handleSubmit((values) => mutation.mutate(values))} className="space-y-5" noValidate>
      <Card className="p-5">
        <TextField
          label={contentText(content, "create.nameLabel", "Tên thân mật của bé")}
          description={contentText(content, "create.nameDescription", "Không cần dùng tên thật đâu nhé.")}
          placeholder={contentText(content, "create.namePlaceholder", "Ví dụ: Bống, Mít...")}
          autoComplete="off"
          registration={form.register("displayName")}
          error={form.formState.errors.displayName?.message}
          className="min-h-14 text-lg"
        />
      </Card>

      <Card className="p-5">
        <AgeGroupCardsField
          label={contentText(content, "create.ageLabel", "Bé thuộc nhóm tuổi nào?")}
          description={contentText(content, "create.ageDescription", "Chọn nhiệm vụ vừa sức nhất.")}
          options={getAgeGroupOptions(content)}
          value={selectedAgeGroup}
          registration={form.register("ageGroup")}
          error={form.formState.errors.ageGroup?.message}
        />
      </Card>

      <Card className="flex gap-3 bg-[#edf4df] p-4">
        <Image
          src="/assets/props/badge-privacy-shield-lock.png"
          width={58}
          height={58}
          alt=""
          className="size-14 object-contain"
        />
        <div>
          <p className="font-black text-[#47643a]">
            {contentText(content, "create.privacyTitle", "Chỉ thu thập điều thật sự cần")}
          </p>
          <p className="text-sm text-[#5b714c]">
            {contentText(content, "create.privacyDescription", "Không thu thập thông tin định danh của bé.")}
          </p>
        </div>
      </Card>
      <FormStatus status={mutation.isError ? "error" : "idle"} message={mutation.error?.message} />
      <SubmitButton
        pending={mutation.isPending}
        pendingLabel={contentText(content, "create.submitting", "Đang tạo hồ sơ...")}
      >
        {contentText(content, "create.submit", "Bắt đầu chế độ bé →")}
      </SubmitButton>
    </form>
  );
}
