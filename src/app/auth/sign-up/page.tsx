import Link from "next/link";
import { UserRoundX } from "lucide-react";
import { connection } from "next/server";
import { contentText } from "@/content/resolve";
import { AuthShell } from "@/features/auth/auth-shell";
import { SignUpForm } from "@/features/auth/auth-forms";
import { getContentNamespace } from "@/modules/content/content";
import { getOperationalSystemSettings } from "@/modules/system-settings/runtime";

export default async function Page() {
  await connection();
  const [settings, content] = await Promise.all([
    getOperationalSystemSettings(),
    getContentNamespace("auth"),
  ]);
  if (!settings.features.registrationEnabled) {
    return (
      <AuthShell
        title="Tạm dừng tạo tài khoản mới"
        subtitle="Hệ thống hiện chưa tiếp nhận thêm tài khoản phụ huynh. Tài khoản đã có vẫn đăng nhập bình thường."
      >
        <div className="space-y-5 text-center">
          <span className="mx-auto grid size-16 place-items-center rounded-3xl bg-amber-100 text-amber-800">
            <UserRoundX size={30} aria-hidden="true" />
          </span>
          <p className="rounded-2xl bg-[#fff8e8] p-4 text-sm leading-6 text-[#6f5731]">
            Vui lòng quay lại sau hoặc đăng nhập bằng tài khoản hiện có.
          </p>
          <Link
            href="/auth/sign-in"
            className="block rounded-2xl bg-[#b9470d] px-5 py-3 font-black text-white"
          >
            Đăng nhập
          </Link>
        </div>
      </AuthShell>
    );
  }

  return (
    <AuthShell
      title={contentText(content, "signUp.pageTitle", "Bước 1: Tạo tài khoản ba mẹ")}
      subtitle={contentText(
        content,
        "signUp.pageSubtitle",
        "Sau khi xác minh email, ba mẹ sẽ tạo hồ sơ cho bé ở bước 2.",
      )}
    >
      <div
        aria-label="Tiến trình thiết lập"
        className="mb-5 grid grid-cols-[1fr_auto_1fr] items-center gap-3"
      >
        <div className="rounded-2xl bg-[#fff0df] px-3 py-2 text-center text-xs font-black text-[#b9470d]">
          <span className="mr-1 inline-grid size-5 place-items-center rounded-full bg-[#b9470d] text-white">
            1
          </span>
          {contentText(content, "signUp.stepAccount", "Tài khoản ba mẹ")}
        </div>
        <span aria-hidden="true" className="h-px w-5 bg-[#dcc8a7]" />
        <div className="rounded-2xl border border-[#e8dcc8] bg-[#faf7f1] px-3 py-2 text-center text-xs font-bold text-[#88755d]">
          <span className="mr-1 inline-grid size-5 place-items-center rounded-full bg-[#e4d8c5] text-[#75624b]">
            2
          </span>
          {contentText(content, "signUp.stepProfile", "Hồ sơ của bé")}
        </div>
      </div>
      <SignUpForm />
    </AuthShell>
  );
}
