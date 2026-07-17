"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { childrenApi } from "@/api/children";
import { FormStatus } from "@/components/form";
import { contentText, useContent } from "@/content/client";
import { ProfileCard, type ProfileListItem } from "@/features/profile/profile-card";
import { queryKeys } from "@/lib/query/keys";

export function ProfileManager({ profiles }: { profiles: ProfileListItem[] }) {
  const content = useContent("profile");
  const router = useRouter();
  const queryClient = useQueryClient();
  const selectMutation = useMutation({
    mutationFn: (profile: ProfileListItem) => childrenApi.select(profile.id).then(() => profile),
    onSuccess: () => {
      router.push("/missions");
      router.refresh();
    },
  });
  const deleteMutation = useMutation({
    mutationFn: (profile: ProfileListItem) => childrenApi.remove(profile.id).then(() => profile),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: queryKeys.children.all });
      toast.success(contentText(content, "list.deleteSuccess", "Đã ghi nhận yêu cầu xóa hồ sơ"));
      router.refresh();
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
          (selectMutation.isPending && selectMutation.variables.id === profile.id) ||
          (deleteMutation.isPending && deleteMutation.variables.id === profile.id);
        return (
          <ProfileCard
            key={profile.id}
            profile={profile}
            pending={pending}
            labels={labels}
            onSelect={() => selectMutation.mutate(profile)}
            onDelete={() => {
              const message = `${profile.displayName}: ${contentText(content, "list.deleteConfirm", "Chuyển hồ sơ vào trạng thái chờ xóa?")}`;
              if (window.confirm(message)) deleteMutation.mutate(profile);
            }}
          />
        );
      })}
      <FormStatus status={error ? "error" : "idle"} message={error?.message} />
      <Link
        href="/onboarding"
        className="block rounded-2xl border-2 border-dashed border-[#d7c39d] bg-white/70 p-5 text-center font-black text-[#6d5738]"
      >
        {contentText(content, "list.createMore", "+ Tạo thêm hồ sơ bé")}
      </Link>
    </div>
  );
}
