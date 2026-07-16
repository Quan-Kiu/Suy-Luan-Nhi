import { notFound } from "next/navigation";
import { BrandHeader } from "@/components/brand-header";
import { ChildShell } from "@/components/child-shell";
import { requireParent } from "@/auth/session";
import { getOwnedChild } from "@/modules/family/family";
import { EditProfileForm } from "@/features/profile/edit-profile-form";
export default async function Page({ params }: { params: Promise<{ childId: string }> }) {
  const session = await requireParent();
  const { childId } = await params;
  const owned = await getOwnedChild(session.user.id, childId);
  if (!owned) notFound();
  return (
    <ChildShell>
      <BrandHeader backHref="/profiles" />
      <main className="paper-texture min-h-[calc(100vh-5rem)] px-5 py-7">
        <h1 className="text-3xl font-black">Chỉnh sửa hồ sơ</h1>
        <p className="mt-2 mb-6 text-[#806d54]">Chỉ lưu tên thân mật và nhóm tuổi phù hợp.</p>
        <EditProfileForm child={owned.child} />
      </main>
    </ChildShell>
  );
}
