"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import { useState } from "react";
import { toast } from "sonner";
import { childrenApi } from "@/api/children";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { FormStatus } from "@/components/form";
import { contentText, useContent } from "@/content/client";
import { useSetActiveChild } from "@/features/child/active-child-context";
import { ProfileCard, type ProfileListItem } from "@/features/profile/profile-card";
import { usePendingRouter } from "@/hooks/use-pending-router";
import { queryKeys } from "@/lib/query/keys";

export function ProfileManager({
  profiles,
  maxProfiles,
}: {
  profiles: ProfileListItem[];
  maxProfiles: number;
}) {
  const content = useContent("profile");
  const navigation = usePendingRouter();
  const queryClient = useQueryClient();
  const setActiveChild = useSetActiveChild();
  const [deleteTarget, setDeleteTarget] = useState<ProfileListItem | null>(null);
  const selectMutation = useMutation({
    mutationFn: (profile: ProfileListItem) => childrenApi.select(profile.id).then(() => profile),
    onSuccess: (profile) => {
      setActiveChild({
        id: profile.id,
        displayName: profile.displayName,
        ageGroup: profile.ageGroup,
      });
      navigation.push("/missions");
    },
  });
  const deleteMutation = useMutation({
    mutationFn: (profile: ProfileListItem) => childrenApi.remove(profile.id).then(() => profile),
    onSuccess: async () => {
      setDeleteTarget(null);
      await queryClient.invalidateQueries({ queryKey: queryKeys.children.all });
      toast.success(contentText(content, "list.deleteSuccess", "Đã ghi nhận yêu cầu xóa hồ sơ"));
      navigation.refresh();
    },
  });
  const labels = {
    ageGroup: contentText(content, "list.ageGroup", "Nhóm tuổi"),
    edit: contentText(content, "list.edit", "Chỉnh sửa"),
    delete: contentText(content, "list.delete", "Xóa"),
    enterMap: contentText(content, "list.enterMap", "Vào bản đồ"),
  };
  const error = selectMutation.error ?? deleteMutation.error;

  return (
    <div className="space-y-4">
      {profiles.map((profile) => {
        const pending =
          navigation.isPending ||
          (selectMutation.isPending && selectMutation.variables.id === profile.id) ||
          (deleteMutation.isPending && deleteMutation.variables.id === profile.id);
        return (
          <ProfileCard
            key={profile.id}
            profile={profile}
            pending={pending}
            labels={labels}
            onSelect={() => selectMutation.mutate(profile)}
            onDelete={() => setDeleteTarget(profile)}
          />
        );
      })}
      <FormStatus status={error ? "error" : "idle"} message={error?.message} />
      <ConfirmDialog
        open={Boolean(deleteTarget)}
        title={`Xóa hồ sơ ${deleteTarget?.displayName ?? "bé"}?`}
        description={contentText(
          content,
          "list.deleteConfirm",
          "Hồ sơ sẽ được chuyển sang trạng thái chờ xóa để phụ huynh có thời gian xem lại.",
        )}
        confirmLabel="Chuyển sang chờ xóa"
        pendingLabel="Đang xử lý..."
        tone="danger"
        pending={deleteMutation.isPending || navigation.isPending}
        onClose={() => setDeleteTarget(null)}
        onConfirm={() => deleteTarget && deleteMutation.mutate(deleteTarget)}
      />
      {profiles.length >= maxProfiles ? (
        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-5 text-center">
          <p className="font-black text-amber-900">Đã đạt giới hạn {maxProfiles} hồ sơ bé</p>
          <p className="mt-2 text-sm leading-6 text-amber-800">
            Có thể xóa một hồ sơ không còn sử dụng trước khi tạo hồ sơ mới.
          </p>
        </div>
      ) : (
        <Link
          href="/onboarding"
          className="block rounded-2xl border-2 border-dashed border-[#d7c39d] bg-white/70 p-5 text-center font-black text-[#6d5738]"
        >
          {contentText(content, "list.createMore", "+ Tạo thêm hồ sơ bé")}
        </Link>
      )}
    </div>
  );
}
