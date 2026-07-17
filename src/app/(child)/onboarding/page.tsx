import { requireParent } from "@/auth/session";
import { contentText } from "@/content/resolve";
import { CreateProfileForm } from "@/features/profile/create-profile-form";
import { getContentNamespace } from "@/modules/content/content";

export default async function OnboardingPage() {
  const [, content] = await Promise.all([requireParent(), getContentNamespace("profile")]);
  return (
    <main className="paper-texture px-5 pt-5 pb-8">
      <div className="mb-6 text-center">
        <p className="text-sm font-black text-[#d56617]">
          {contentText(content, "create.pageBadge", "Hồ sơ riêng tư tối giản")}
        </p>
        <h1 className="mt-3 text-3xl font-black">
          {contentText(content, "create.pageTitle", "Tạo hồ sơ cho bé")}
        </h1>
        <p className="mt-2 text-[#806d54]">
          {contentText(
            content,
            "create.pageDescription",
            "Chỉ mất một chút để bé có hành trình phù hợp nhất.",
          )}
        </p>
      </div>
      <CreateProfileForm />
    </main>
  );
}
