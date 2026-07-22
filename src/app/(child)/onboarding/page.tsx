import { redirect } from "next/navigation";
import { requireParent } from "@/auth/session";
import { contentText } from "@/content/resolve";
import { CreateProfileForm } from "@/features/profile/create-profile-form";
import { getContentNamespace } from "@/modules/content/content";
import { listChildren } from "@/modules/family/family";
import { getOperationalSystemSettings } from "@/modules/system-settings/runtime";

export default async function OnboardingPage() {
  const [session, content, systemSettings] = await Promise.all([
    requireParent(),
    getContentNamespace("profile"),
    getOperationalSystemSettings(),
  ]);
  const children = await listChildren(session.user.id, session.user.name);
  if (children.length >= systemSettings.limits.maxChildProfiles) redirect("/profiles");
  const isFirstProfile = children.length === 0;

  return (
    <main className="paper-texture px-5 pt-5 pb-8">
      <div className="mb-6 text-center">
        <p className="type-label font-black text-[#d56617]">
          {contentText(
            content,
            isFirstProfile ? "create.firstProfileBadge" : "create.pageBadge",
            isFirstProfile ? "Bước 2/2 · Hồ sơ của bé" : "Hồ sơ riêng tư tối giản",
          )}
        </p>
        <h1 className="type-child-page-title mt-3">
          {contentText(
            content,
            isFirstProfile ? "create.firstProfileTitle" : "create.pageTitle",
            "Tạo hồ sơ cho bé",
          )}
        </h1>
        <p className="mt-2 text-[#806d54]">
          {contentText(
            content,
            isFirstProfile ? "create.firstProfileDescription" : "create.pageDescription",
            isFirstProfile
              ? "Tài khoản ba mẹ đã sẵn sàng. Chỉ cần tên ở nhà và nhóm tuổi để bắt đầu."
              : "Chỉ mất một chút để bé có hành trình phù hợp nhất.",
          )}
        </p>
      </div>
      <CreateProfileForm />
    </main>
  );
}
