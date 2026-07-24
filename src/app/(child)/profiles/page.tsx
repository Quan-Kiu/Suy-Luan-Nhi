import type { Metadata } from "next";
import type { ChildProfile } from "@/api/children";
import { requireParent } from "@/auth/session";
import { ProfilesPageContent } from "@/features/profile/profiles-page-content";
import { listChildren } from "@/modules/family/family";
import { getOperationalSystemSettings } from "@/modules/system-settings/runtime";

export const metadata: Metadata = {
  title: "Hồ sơ của bé",
};

export default async function ProfilesPage() {
  const [session, systemSettings] = await Promise.all([requireParent(), getOperationalSystemSettings()]);
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

  return (
    <ProfilesPageContent
      profiles={children}
      deletedProfiles={deletedChildren}
      maxProfiles={systemSettings.limits.maxChildProfiles}
    />
  );
}
