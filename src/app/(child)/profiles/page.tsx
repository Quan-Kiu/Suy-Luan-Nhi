import Image from "next/image";
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
  const children = await listChildren(session.user.id, session.user.name);
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
        <h1 className="mt-4 text-3xl font-black">
          {contentText(content, "list.pageTitle", "Chọn hồ sơ của bé")}
        </h1>
        <p className="mt-2 text-[#806d54]">
          {contentText(
            content,
            "list.pageDescription",
            "Mỗi bé có hành trình và tiến độ riêng, được bảo vệ trong tài khoản phụ huynh.",
          )}
        </p>
      </div>
      <div className="mt-6">
        {children.length ? (
          <ProfileManager profiles={children} maxProfiles={systemSettings.limits.maxChildProfiles} />
        ) : (
          <Card className="p-6 text-center">
            <p className="font-black">
              {contentText(content, "list.emptyTitle", "Gia đình chưa có hồ sơ bé")}
            </p>
            <p className="mt-2 text-sm text-[#806d54]">
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
