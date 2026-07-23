import { redirect } from "next/navigation";
import { requireParent } from "@/auth/session";
import { resolveParentPinSetupNextPath } from "@/auth/navigation";
import { contentText } from "@/content/resolve";
import { AuthShell } from "@/features/auth/auth-shell";
import { ParentPinSetupForm } from "@/features/auth/parent-pin-setup-form";
import { getContentNamespace } from "@/modules/content/content";
import { getOrCreateParentProfile } from "@/modules/family/family";

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const [session, content, params] = await Promise.all([
    requireParent(),
    getContentNamespace("auth"),
    searchParams,
  ]);
  const nextPath = resolveParentPinSetupNextPath(params.next);
  const parent = await getOrCreateParentProfile(session.user.id, session.user.name);
  if (parent.pinHash) redirect(nextPath);

  return (
    <AuthShell
      title={contentText(content, "pinSetup.title", "Tạo mã PIN phụ huynh")}
      subtitle={contentText(
        content,
        "pinSetup.subtitle",
        "Đây là bước bảo vệ riêng trước khi tạo hồ sơ hoặc xem thông tin của bé.",
      )}
    >
      <div
        className="mb-5 grid grid-cols-[1fr_auto_1fr_auto_1fr] items-center gap-2"
        aria-label="Tiến trình thiết lập"
      >
        <div className="type-caption rounded-2xl bg-[#edf4df] px-2 py-2 text-center font-bold text-[#567044]">
          1 · Tài khoản
        </div>
        <span aria-hidden="true" className="h-px w-3 bg-[#dcc8a7]" />
        <div className="type-caption rounded-2xl bg-[#fff0df] px-2 py-2 text-center font-black text-[#b9470d]">
          2 · Mã PIN
        </div>
        <span aria-hidden="true" className="h-px w-3 bg-[#dcc8a7]" />
        <div className="type-caption rounded-2xl border border-[#e8dcc8] bg-[#faf7f1] px-2 py-2 text-center font-bold text-[#88755d]">
          3 · Hồ sơ bé
        </div>
      </div>
      <ParentPinSetupForm nextPath={nextPath} />
    </AuthShell>
  );
}
