import { BrandHeader } from "@/components/brand-header";
import { ChildShell } from "@/components/child-shell";
import { CreateProfileForm } from "@/features/profile/create-profile-form";

export default function OnboardingPage() {
  return (
    <ChildShell>
      <BrandHeader />
      <main className="paper-texture px-5 pt-5 pb-8">
        <div className="mb-6 text-center">
          <p className="text-sm font-black text-[#d56617]">Bước 1 / 4</p>
          <div className="mx-auto mt-2 flex max-w-xs gap-2">
            {[1, 2, 3, 4].map((n) => (
              <div
                key={n}
                className={`h-2 flex-1 rounded-full ${n === 1 ? "bg-[#e9641a]" : "bg-[#eadfc9]"}`}
              />
            ))}
          </div>
          <h1 className="mt-5 text-3xl font-black">Tạo hồ sơ cho bé</h1>
          <p className="mt-2 text-[#806d54]">Chỉ mất một chút để bé có hành trình phù hợp nhất.</p>
        </div>
        <CreateProfileForm />
      </main>
    </ChildShell>
  );
}
