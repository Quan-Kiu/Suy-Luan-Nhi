"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import Image from "next/image";
import { Controller, useForm, useWatch } from "react-hook-form";
import { useEffect } from "react";
import { toast } from "sonner";
import { childrenApi, type ChildProfile } from "@/api/children";
import { FormStatus, SubmitButton, TextField } from "@/components/form";
import { Card } from "@/components/ui";
import { contentText, useContent } from "@/content/client";
import { createChildProfileSchema, type CreateChildProfileInput } from "@/domain/schemas";
import { DEFAULT_CHILD_AVATAR_ASSET_ID } from "@/domain/child-avatar";
import { useActiveChild, useSetActiveChild } from "@/features/child/active-child-context";
import { AgeGroupCardsField } from "@/features/profile/age-group-cards-field";
import { AvatarPickerField } from "@/features/profile/avatar-picker-field";
import { useChildAvatars } from "@/features/profile/use-child-avatars";
import { getAgeGroupOptions } from "@/features/profile/age-group-options";
import { usePendingRouter } from "@/hooks/use-pending-router";
import { queryKeys } from "@/lib/query/keys";

export function CreateProfileForm() {
  const content = useContent("profile");
  const navigation = usePendingRouter();
  const queryClient = useQueryClient();
  const activeChild = useActiveChild();
  const setActiveChild = useSetActiveChild();
  const form = useForm<CreateChildProfileInput>({
    resolver: zodResolver(createChildProfileSchema),
    defaultValues: {
      displayName: "",
      ageGroup: "6-8",
      avatarAssetId: DEFAULT_CHILD_AVATAR_ASSET_ID,
    },
  });
  const selectedAgeGroup = useWatch({ control: form.control, name: "ageGroup" });
  const selectedAvatarId = useWatch({ control: form.control, name: "avatarAssetId" });
  const avatarsQuery = useChildAvatars();
  useEffect(() => {
    const avatars = avatarsQuery.data ?? [];
    if (avatars.length && !avatars.some((avatar) => avatar.id === selectedAvatarId)) {
      form.setValue("avatarAssetId", avatars[0].id, { shouldDirty: true, shouldValidate: true });
    }
  }, [avatarsQuery.data, form, selectedAvatarId]);
  const mutation = useMutation({
    mutationFn: childrenApi.create,
    onSuccess: (profile) => {
      if (!activeChild) setActiveChild(profile);
      queryClient.setQueryData<ChildProfile[]>(queryKeys.children.list, (current = []) => [
        profile,
        ...current.filter((item) => item.id !== profile.id),
      ]);
      void queryClient.invalidateQueries({
        queryKey: queryKeys.children.list,
        exact: true,
        refetchType: "none",
      });
      toast.success(
        `${profile.displayName}: ${contentText(content, "create.success", "Hồ sơ đã sẵn sàng!")}`,
      );
      navigation.push("/profiles");
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
          className="min-h-14"
        />
      </Card>

      <Card className="p-5">
        <Controller
          control={form.control}
          name="avatarAssetId"
          render={({ field }) => (
            <AvatarPickerField
              label={contentText(content, "avatar.label", "Chọn avatar cho bé")}
              description={contentText(
                content,
                "avatar.description",
                "Bé có thể đổi sang một avatar khác bất cứ lúc nào.",
              )}
              avatars={avatarsQuery.data ?? []}
              value={field.value}
              onChange={field.onChange}
              loading={avatarsQuery.isPending}
              loadingLabel={contentText(content, "avatar.loading", "Đang tải avatar...")}
              emptyMessage={contentText(
                content,
                "avatar.empty",
                "Hệ thống chưa có avatar phù hợp. Vui lòng liên hệ quản trị viên.",
              )}
              loadError={
                avatarsQuery.isError
                  ? contentText(content, "avatar.error", "Chưa tải được avatar. Hãy thử lại.")
                  : undefined
              }
              fieldError={form.formState.errors.avatarAssetId?.message}
            />
          )}
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
          <p className="type-supporting text-[#5b714c]">
            {contentText(content, "create.privacyDescription", "Không thu thập thông tin định danh của bé.")}
          </p>
        </div>
      </Card>
      <FormStatus status={mutation.isError ? "error" : "idle"} message={mutation.error?.message} />
      <SubmitButton
        pending={mutation.isPending || navigation.isPending}
        disabled={avatarsQuery.isPending || avatarsQuery.isError || !avatarsQuery.data?.length}
        pendingLabel={contentText(content, "create.submitting", "Đang tạo hồ sơ...")}
      >
        {contentText(content, "create.submit", "Bắt đầu chế độ bé →")}
      </SubmitButton>
    </form>
  );
}
