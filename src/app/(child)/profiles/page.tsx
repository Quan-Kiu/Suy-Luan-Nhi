import Image from "next/image";
import type { ChildProfile } from "@/api/children";
import Link from "next/link";
import { requireParent } from "@/auth/session";
import { Card } from "@/components/ui";
import { contentText } from "@/content/resolve";
import { ProfileManager } from "@/features/profile/profile-manager";
import { getContentNamespace } from "@/modules/content/content";
import { listChildren } from "@/modules/family/family";
import { getOperationalSystemSettings } from "@/modules/system-settings/runtime";

export default async function ProfilesPage() {
  const [session, content, systemSettings] = await Promise.all([
    requireParent(),
    getContentNamespace("profile"),
    getOperationalSystemSettings(),
  ]);
  const allChildren = await listChildren(session.user.id, session.user.name, true);
  const children: ChildProfile[] = allChildren
    .filter((child) => !child.deletedAt)
    .map((child) => ({
      id: child.id,
      displayName: child.displayName,
      ageGroup: child.ageGroup,
      avatarAssetId: child.avatarAssetId,
      avatarUrl: child.avatarUrl,
      currentRank: child.currentRank,
      status: child.status === "pending_deletion" ? "pending_deletion" : "active",
      deletionRequestedAt: child.deletionRequestedAt?.toISOString() ?? null,
    }));
  const deletedChildren = allChildren.flatMap((child) => {
    const deletedAt = child.deletionRequestedAt ?? child.deletedAt;
    return deletedAt
      ? [
          {
            id: child.id,
            displayName: child.displayName,
            ageGroup: child.ageGroup,
            avatarUrl: child.avatarUrl,
            currentRank: child.currentRank,
            deletionRequestedAt: deletedAt.toISOString(),
          },
        ]
      : [];
  });
  const hasProfiles = children.length > 0;
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
            {contentText(content, "list.emptyPageBadge", "Bước 2/2 · Hồ sơ của bé")}
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
        {allChildren.length ? (
          <ProfileManager
            profiles={children}
            deletedProfiles={deletedChildren}
            maxProfiles={systemSettings.limits.maxChildProfiles}
          />
        ) : (
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
        )}
      </div>
    </main>
  );
}
