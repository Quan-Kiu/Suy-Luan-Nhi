"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import { useState } from "react";
import { toast } from "sonner";
import { childrenApi, type ChildProfile } from "@/api/children";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { FormStatus } from "@/components/form";
import { Card } from "@/components/ui";
import { contentText, useContent } from "@/content/client";
import { useActiveChild, useSetActiveChild } from "@/features/child/active-child-context";
import { ProfileCard, type ProfileListItem } from "@/features/profile/profile-card";
import { ProfileTrash, type DeletedProfileListItem } from "@/features/profile/profile-trash";
import { usePendingRouter } from "@/hooks/use-pending-router";
import { queryKeys } from "@/lib/query/keys";

function toProfileListItem(profile: ChildProfile): ProfileListItem {
  return {
    id: profile.id,
    displayName: profile.displayName,
    ageGroup: profile.ageGroup,
    avatarUrl: profile.avatarUrl,
    currentRank: profile.currentRank,
  };
}

export function ProfileManager({
  profiles,
  deletedProfiles,
  maxProfiles,
}: {
  profiles: ChildProfile[];
  deletedProfiles: DeletedProfileListItem[];
  maxProfiles: number;
}) {
  const content = useContent("profile");
  const navigation = usePendingRouter();
  const queryClient = useQueryClient();
  const activeChild = useActiveChild();
  const setActiveChild = useSetActiveChild();
  const activeProfiles = profiles.map(toProfileListItem);
  const [trashProfiles, setTrashProfiles] = useState(deletedProfiles);
  const [trashOpen, setTrashOpen] = useState(deletedProfiles.length > 0);
  const [deleteTarget, setDeleteTarget] = useState<ProfileListItem | null>(null);
  const [permanentDeleteTarget, setPermanentDeleteTarget] = useState<DeletedProfileListItem | null>(null);

  const refreshProfiles = () => {
    void queryClient.invalidateQueries({ queryKey: queryKeys.children.all });
    navigation.refresh();
  };

  const selectMutation = useMutation({
    mutationFn: (profile: ProfileListItem) => childrenApi.select(profile.id).then(() => profile),
    onSuccess: (profile) => {
      setActiveChild({ id: profile.id, displayName: profile.displayName, ageGroup: profile.ageGroup });
      navigation.push("/missions");
    },
  });
  const restoreMutation = useMutation({
    mutationFn: (profile: DeletedProfileListItem) => childrenApi.restore(profile.id),
    onSuccess: (restored, profile) => {
      setTrashProfiles((current) => current.filter((item) => item.id !== profile.id));
      queryClient.setQueryData<ChildProfile[]>(queryKeys.children.list, (current = []) => [
        restored,
        ...current.filter((item) => item.id !== restored.id),
      ]);
      toast.success(contentText(content, "trash.restoreSuccess", "Đã khôi phục hồ sơ"));
      refreshProfiles();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (profile: ProfileListItem) => ({
      profile,
      deleted: await childrenApi.remove(profile.id),
    }),
    onSuccess: ({ profile, deleted }) => {
      const trashProfile: DeletedProfileListItem = {
        ...profile,
        deletionRequestedAt: deleted.deletionRequestedAt,
      };
      queryClient.setQueryData<ChildProfile[]>(queryKeys.children.list, (current = []) =>
        current.filter((item) => item.id !== profile.id),
      );
      setTrashProfiles((current) => [trashProfile, ...current.filter((item) => item.id !== profile.id)]);
      setTrashOpen(true);
      setDeleteTarget(null);
      if (activeChild?.id === profile.id) setActiveChild(null);
      toast.success(contentText(content, "list.deleteSuccess", "Đã đưa hồ sơ vào thùng rác"), {
        action: {
          label: contentText(content, "trash.undo", "Hoàn tác"),
          onClick: () => restoreMutation.mutate(trashProfile),
        },
      });
      refreshProfiles();
    },
  });

  const permanentDeleteMutation = useMutation({
    mutationFn: (profile: DeletedProfileListItem) =>
      childrenApi.removePermanently(profile.id).then(() => profile),
    onSuccess: (profile) => {
      setTrashProfiles((current) => current.filter((item) => item.id !== profile.id));
      setPermanentDeleteTarget(null);
      toast.success(contentText(content, "trash.deleteForeverSuccess", "Đã xóa vĩnh viễn hồ sơ"));
      refreshProfiles();
    },
  });

  const labels = {
    ageGroup: contentText(content, "list.ageGroup", "Nhóm tuổi"),
    edit: contentText(content, "list.edit", "Chỉnh sửa"),
    delete: contentText(content, "list.delete", "Xóa"),
    enterMap: contentText(content, "list.enterMap", "Vào bản đồ"),
  };
  const trashLabels = {
    title: contentText(content, "trash.title", "Hồ sơ đã xóa"),
    description: contentText(
      content,
      "trash.description",
      "Ba/mẹ có thể khôi phục hoặc xóa vĩnh viễn các hồ sơ ở đây.",
    ),
    deletedAt: contentText(content, "trash.deletedAt", "Đưa vào thùng rác lúc"),
    restore: contentText(content, "trash.restore", "Khôi phục"),
    deleteForever: contentText(content, "trash.deleteForever", "Xóa vĩnh viễn"),
  };
  const error =
    selectMutation.error ?? deleteMutation.error ?? restoreMutation.error ?? permanentDeleteMutation.error;
  const trashPendingId = restoreMutation.isPending
    ? restoreMutation.variables.id
    : permanentDeleteMutation.isPending
      ? permanentDeleteMutation.variables.id
      : null;

  return (
    <div className="space-y-4">
      {activeProfiles.map((profile) => {
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

      {!activeProfiles.length && !trashProfiles.length ? (
        <Card className="p-6 text-center">
          <p className="font-black">
            {contentText(content, "list.firstProfileTitle", "Thêm hồ sơ đầu tiên")}
          </p>
          <p className="type-supporting mt-2 text-[#806d54]">
            {contentText(
              content,
              "list.emptyDescription",
              "Tạo hồ sơ bằng tên thân mật và nhóm tuổi; không cần ngày sinh đầy đủ.",
            )}
          </p>
          <Link
            href="/onboarding"
            className="mt-4 inline-block rounded-2xl bg-[#b9470d] px-5 py-3 font-black text-white"
          >
            {contentText(content, "list.emptyAction", "Tạo hồ sơ đầu tiên")}
          </Link>
        </Card>
      ) : null}

      {!activeProfiles.length && trashProfiles.length ? (
        <div className="rounded-2xl border border-[#eadfc9] bg-white/80 p-5 text-center">
          <p className="type-card-title text-[#342f28]">
            {contentText(content, "list.noActiveProfiles", "Hiện chưa có hồ sơ đang sử dụng")}
          </p>
          <p className="type-supporting mt-2 text-[#806d54]">
            {contentText(
              content,
              "list.noActiveProfilesDescription",
              "Ba/mẹ có thể tạo hồ sơ mới hoặc khôi phục một hồ sơ bên dưới.",
            )}
          </p>
        </div>
      ) : null}

      <FormStatus status={error ? "error" : "idle"} message={error?.message} />
      <ConfirmDialog
        open={Boolean(deleteTarget)}
        title={`Đưa hồ sơ ${deleteTarget?.displayName ?? "bé"} vào thùng rác?`}
        description={contentText(
          content,
          "list.deleteConfirm",
          "Hồ sơ sẽ tạm thời bị ẩn. Ba/mẹ có thể khôi phục trong mục Hồ sơ đã xóa.",
        )}
        confirmLabel={contentText(content, "list.deleteConfirmLabel", "Đưa vào thùng rác")}
        cancelLabel={contentText(content, "list.deleteCancelLabel", "Giữ lại")}
        pendingLabel={contentText(content, "list.deletePending", "Đang chuyển...")}
        tone="danger"
        pending={deleteMutation.isPending}
        errorMessage={deleteMutation.error?.message}
        onClose={() => {
          deleteMutation.reset();
          setDeleteTarget(null);
        }}
        onConfirm={() => deleteTarget && deleteMutation.mutate(deleteTarget)}
      />

      <ConfirmDialog
        open={Boolean(permanentDeleteTarget)}
        title={`Xóa vĩnh viễn hồ sơ ${permanentDeleteTarget?.displayName ?? "bé"}?`}
        description={contentText(
          content,
          "trash.deleteForeverConfirm",
          "Toàn bộ tiến độ và dữ liệu của hồ sơ sẽ bị xóa vĩnh viễn. Thao tác này không thể hoàn tác.",
        )}
        confirmLabel={contentText(content, "trash.deleteForever", "Xóa vĩnh viễn")}
        cancelLabel={contentText(content, "trash.deleteForeverCancel", "Giữ lại")}
        pendingLabel={contentText(content, "trash.deleteForeverPending", "Đang xóa...")}
        tone="danger"
        pending={permanentDeleteMutation.isPending}
        errorMessage={permanentDeleteMutation.error?.message}
        onClose={() => {
          permanentDeleteMutation.reset();
          setPermanentDeleteTarget(null);
        }}
        onConfirm={() => permanentDeleteTarget && permanentDeleteMutation.mutate(permanentDeleteTarget)}
      />

      {activeProfiles.length || trashProfiles.length ? (
        activeProfiles.length >= maxProfiles ? (
          <div className="rounded-2xl border border-amber-200 bg-amber-50 p-5 text-center">
            <p className="type-card-title text-amber-900">Đã đạt giới hạn {maxProfiles} hồ sơ bé</p>
            <p className="type-supporting mt-2 text-amber-800">
              Có thể đưa một hồ sơ không còn sử dụng vào thùng rác trước khi tạo hồ sơ mới.
            </p>
          </div>
        ) : (
          <Link
            href="/onboarding"
            className="type-action block rounded-2xl border-2 border-dashed border-[#d7c39d] bg-white/70 p-5 text-center text-[#6d5738]"
          >
            {contentText(content, "list.createMore", "+ Tạo thêm hồ sơ bé")}
          </Link>
        )
      ) : null}
      <ProfileTrash
        profiles={trashProfiles}
        open={trashOpen}
        pendingId={trashPendingId}
        labels={trashLabels}
        onToggle={() => setTrashOpen((current) => !current)}
        onRestore={(profile) => restoreMutation.mutate(profile)}
        onDeleteForever={setPermanentDeleteTarget}
      />
    </div>
  );
}
