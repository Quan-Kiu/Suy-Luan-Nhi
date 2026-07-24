"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Controller, useForm, useWatch } from "react-hook-form";
import { useEffect } from "react";
import { toast } from "sonner";
import { z } from "zod";
import { ageGroupCodes } from "@/domain/age-groups";
import { DEFAULT_CHILD_AVATAR_ASSET_ID } from "@/domain/child-avatar";
import { childrenApi, type ChildProfile } from "@/api/children";
import { FormStatus, HydrationSafeForm, SelectField, SubmitButton, TextField } from "@/components/form";
import { Card } from "@/components/ui";
import { contentText, useContent } from "@/content/client";
import { useActiveChild, useSetActiveChild } from "@/features/child/active-child-context";
import { getAgeGroupOptions } from "@/features/profile/age-group-options";
import { AvatarPickerField } from "@/features/profile/avatar-picker-field";
import { useChildAvatars } from "@/features/profile/use-child-avatars";
import { usePendingRouter } from "@/hooks/use-pending-router";
import { queryKeys } from "@/lib/query/keys";

const schema = z.object({
  displayName: z.string().trim().min(1, "Hãy nhập tên thân mật").max(20, "Tên tối đa 20 ký tự"),
  ageGroup: z.enum(ageGroupCodes),
  avatarAssetId: z.string().uuid("Hãy chọn avatar cho bé"),
});

type FormValues = z.infer<typeof schema>;

export function EditProfileForm({ child }: { child: ChildProfile }) {
  const content = useContent("profile");
  const navigation = usePendingRouter();
  const queryClient = useQueryClient();
  const activeChild = useActiveChild();
  const setActiveChild = useSetActiveChild();
  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      displayName: child.displayName,
      ageGroup: child.ageGroup,
      avatarAssetId: child.avatarAssetId ?? DEFAULT_CHILD_AVATAR_ASSET_ID,
    },
  });
  const selectedAvatarId = useWatch({ control: form.control, name: "avatarAssetId" });
  const avatarsQuery = useChildAvatars();
  useEffect(() => {
    const avatars = avatarsQuery.data ?? [];
    if (avatars.length && !avatars.some((avatar) => avatar.id === selectedAvatarId)) {
      form.setValue("avatarAssetId", avatars[0].id, { shouldDirty: true, shouldValidate: true });
    }
  }, [avatarsQuery.data, form, selectedAvatarId]);
  const mutation = useMutation({
    mutationFn: (values: FormValues) => childrenApi.update(child.id, values),
    onSuccess: (updated) => {
      if (activeChild?.id === updated.id) setActiveChild(updated);
      queryClient.setQueryData<ChildProfile[]>(queryKeys.children.list, (current = []) =>
        current.map((item) => (item.id === updated.id ? updated : item)),
      );
      void queryClient.invalidateQueries({
        queryKey: queryKeys.children.list,
        exact: true,
        refetchType: "none",
      });
      toast.success(contentText(content, "edit.success", "Đã cập nhật hồ sơ"));
      navigation.push("/profiles");
    },
  });

  return (
    <HydrationSafeForm
      busy={mutation.isPending || navigation.isPending}
      fieldsetClassName="space-y-4"
      onSubmit={form.handleSubmit((values) => mutation.mutate(values))}
      noValidate
    >
      <Card className="space-y-5 p-5" data-testid="edit-profile-card">
        <TextField
          label={contentText(content, "edit.nameLabel", "Tên thân mật")}
          placeholder={contentText(content, "edit.namePlaceholder", "Tên thân mật của bé")}
          registration={form.register("displayName")}
          error={form.formState.errors.displayName?.message}
        />
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
        <SelectField
          label={contentText(content, "edit.ageLabel", "Nhóm tuổi")}
          registration={form.register("ageGroup")}
          error={form.formState.errors.ageGroup?.message}
          options={getAgeGroupOptions(content).map((option) => ({ value: option.id, label: option.title }))}
        />
        <div className="flex flex-col gap-3 border-t border-[#eadfc9] pt-5">
          <FormStatus status={mutation.isError ? "error" : "idle"} message={mutation.error?.message} />
          <SubmitButton
            className="w-full sm:w-auto"
            pending={mutation.isPending || navigation.isPending}
            disabled={avatarsQuery.isPending || avatarsQuery.isError || !avatarsQuery.data?.length}
            pendingLabel={contentText(content, "edit.submitting", "Đang lưu...")}
          >
            {contentText(content, "edit.submit", "Lưu thay đổi")}
          </SubmitButton>
        </div>
      </Card>
    </HydrationSafeForm>
  );
}
