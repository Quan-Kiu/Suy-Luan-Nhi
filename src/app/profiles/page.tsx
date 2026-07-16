import Image from "next/image";
import { BrandHeader } from "@/components/brand-header";
import { ChildShell } from "@/components/child-shell";
import { Card } from "@/components/ui";
import { requireParent } from "@/auth/session";
import { listChildren } from "@/modules/family/family";
import { ProfileManager } from "@/features/profile/profile-manager";

export default async function ProfilesPage() {
  const session = await requireParent();
  const children = await listChildren(session.user.id, session.user.name);
  return (
    <ChildShell>
      <BrandHeader />
      <main className="paper-texture min-h-[calc(100vh-5rem)] px-5 py-7">
        <div className="text-center">
          <Image
            src="/assets/scenes/scene-profile-dog-treehouse.png"
            width={260}
            height={170}
            priority
            alt="Bống bên nhà cây"
            className="mx-auto h-36 w-56 rounded-[26px] object-cover"
          />
          <h1 className="mt-4 text-3xl font-black">Chọn hồ sơ của bé</h1>
          <p className="mt-2 text-[#806d54]">
            Mỗi bé có hành trình và tiến độ riêng, được bảo vệ trong tài khoản phụ huynh.
          </p>
        </div>
        <div className="mt-6">
          {children.length ? (
            <ProfileManager profiles={children} />
          ) : (
            <Card className="p-6 text-center">
              <p className="font-black">Gia đình chưa có hồ sơ bé</p>
              <p className="mt-2 text-sm text-[#806d54]">
                Tạo hồ sơ bằng tên thân mật và nhóm tuổi; không cần ngày sinh đầy đủ.
              </p>
              <a
                href="/onboarding"
                className="mt-4 inline-block rounded-2xl bg-[#e9641a] px-5 py-3 font-black text-white"
              >
                Tạo hồ sơ đầu tiên
              </a>
            </Card>
          )}
        </div>
      </main>
    </ChildShell>
  );
}
