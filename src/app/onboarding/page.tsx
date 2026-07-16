import { BrandHeader } from "@/components/brand-header";
import { ChildShell } from "@/components/child-shell";
import { CreateProfileForm } from "@/features/profile/create-profile-form";
import { requireParent } from "@/auth/session";
export default async function OnboardingPage() {
  await requireParent();
  return (
    <ChildShell>
      <BrandHeader backHref="/profiles" />
      <main className="paper-texture px-5 pt-5 pb-8">
        <div className="mb-6 text-center">
          <p className="text-sm font-black text-[#d56617]">Hồ sơ riêng tư tối giản</p>
          <h1 className="mt-3 text-3xl font-black">Tạo hồ sơ cho bé</h1>
          <p className="mt-2 text-[#806d54]">Chỉ mất một chút để bé có hành trình phù hợp nhất.</p>
        </div>
        <CreateProfileForm />
      </main>
    </ChildShell>
  );
}
