import { notFound } from "next/navigation";
import type { ChildProfile } from "@/api/children";
import { requireParent } from "@/auth/session";
import { contentText } from "@/content/resolve";
import { getOwnedChild } from "@/modules/family/family";
import { EditProfileForm } from "@/features/profile/edit-profile-form";
import { getContentNamespace } from "@/modules/content/content";
export default async function Page({ params }: { params: Promise<{ childId: string }> }) {
  const [session, content] = await Promise.all([requireParent(), getContentNamespace("profile")]);
  const { childId } = await params;
  const owned = await getOwnedChild(session.user.id, childId);
  if (!owned || owned.child.status === "deleted") notFound();
  const child: ChildProfile = {
    id: owned.child.id,
    displayName: owned.child.displayName,
    ageGroup: owned.child.ageGroup,
    avatarAssetId: owned.child.avatarAssetId,
    avatarUrl: owned.child.avatarUrl,
    currentRank: owned.child.currentRank,
    status: owned.child.status,
    deletionRequestedAt: owned.child.deletionRequestedAt?.toISOString() ?? null,
  };
  return (
    <main className="paper-texture min-h-[calc(100vh-5rem)] px-5 py-7">
      <h1 className="type-child-page-title">{contentText(content, "edit.pageTitle", "Chỉnh sửa hồ sơ")}</h1>
      <p className="type-supporting mt-2 mb-6 text-[#806d54]">
        {contentText(content, "edit.pageDescription", "Chỉ lưu tên thân mật và nhóm tuổi phù hợp.")}
      </p>
      <EditProfileForm child={child} />
    </main>
  );
}
