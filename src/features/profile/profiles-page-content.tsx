"use client";

import { useQuery } from "@tanstack/react-query";
import Image from "next/image";
import { childrenApi, type ChildProfile } from "@/api/children";
import { FormStatus } from "@/components/form";
import { contentText, useContent } from "@/content/client";
import { ProfileManager } from "@/features/profile/profile-manager";
import type { DeletedProfileListItem } from "@/features/profile/profile-trash";
import { queryKeys } from "@/lib/query/keys";

export function ProfilesPageContent({
  profiles,
  deletedProfiles,
  maxProfiles,
}: {
  profiles: ChildProfile[];
  deletedProfiles: DeletedProfileListItem[];
  maxProfiles: number;
}) {
  const content = useContent("profile");
  const profilesQuery = useQuery({
    queryKey: queryKeys.children.list,
    queryFn: childrenApi.list,
    initialData: profiles,
  });
  const activeProfiles = profilesQuery.data;
  const hasProfiles = activeProfiles.length > 0;

  return (
    <main className="paper-texture min-h-[calc(100vh-5rem)] px-5 py-7">
      <div className="text-center">
        <Image
          src="/assets/scenes/scene-profile-dog-treehouse.png"
          width={260}
          height={170}
          priority
          alt={contentText(content, "list.imageAlt", "Bống bên nhà cây")}
          className="mx-auto h-36 w-56 rounded-[26px] object-cover"
        />
        {!hasProfiles ? (
          <p className="type-label mt-4 font-black text-[#d56617]">
            {contentText(content, "list.emptyPageBadge", "Bước 3/3 · Hồ sơ của bé")}
          </p>
        ) : null}
        <h1 className={hasProfiles ? "type-child-page-title mt-4" : "type-child-page-title mt-2"}>
          {contentText(
            content,
            hasProfiles ? "list.pageTitle" : "list.emptyPageTitle",
            hasProfiles ? "Chọn hồ sơ của bé" : "Tạo hồ sơ cho bé",
          )}
        </h1>
        <p className="mt-2 text-[#806d54]">
          {contentText(
            content,
            hasProfiles ? "list.pageDescription" : "list.emptyPageDescription",
            hasProfiles
              ? "Mỗi bé có hành trình và tiến độ riêng, được bảo vệ trong tài khoản phụ huynh."
              : "Tài khoản ba mẹ đã sẵn sàng. Thêm hồ sơ đầu tiên để bé bắt đầu khám phá.",
          )}
        </p>
      </div>
      <div className="mt-6">
        <FormStatus
          status={profilesQuery.isError ? "error" : "idle"}
          message={profilesQuery.error?.message}
        />
        <ProfileManager
          profiles={activeProfiles}
          deletedProfiles={deletedProfiles}
          maxProfiles={maxProfiles}
        />
      </div>
    </main>
  );
}
