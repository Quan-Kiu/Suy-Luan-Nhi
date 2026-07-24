import Link from "next/link";
import { UserRoundX } from "lucide-react";
import { connection } from "next/server";
import { googleAuthConfigured } from "@/config/auth-providers";
import { contentText } from "@/content/resolve";
import { AuthShell } from "@/features/auth/auth-shell";
import { SignUpForm } from "@/features/auth/auth-forms";
import { getContentNamespace } from "@/modules/content/content";
import { getOperationalSystemSettings } from "@/modules/system-settings/runtime";

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  await connection();
  const [settings, content, params] = await Promise.all([
    getOperationalSystemSettings(),
    getContentNamespace("auth"),
    searchParams,
  ]);
  const oauthError = params.oauth === "google" && typeof params.error === "string" ? params.error : null;
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
          <p className="type-supporting rounded-2xl bg-[#fff8e8] p-4 text-[#6f5731]">
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
        "Sau khi xác minh email, ba mẹ sẽ tạo mã PIN rồi thiết lập hồ sơ cho bé.",
      )}
    >
      <div
        aria-label="Tiến trình thiết lập"
        className="mb-5 grid grid-cols-[1fr_auto_1fr_auto_1fr] items-center gap-2"
      >
        <div className="type-caption rounded-2xl bg-[#fff0df] px-2 py-2 text-center font-black text-[#b9470d]">
          1 · {contentText(content, "signUp.stepAccount", "Tài khoản")}
        </div>
        <span aria-hidden="true" className="h-px w-3 bg-[#dcc8a7]" />
        <div className="type-caption rounded-2xl border border-[#e8dcc8] bg-[#faf7f1] px-2 py-2 text-center font-bold text-[#806d54]">
          2 · {contentText(content, "signUp.stepPin", "Mã PIN")}
        </div>
        <span aria-hidden="true" className="h-px w-3 bg-[#dcc8a7]" />
        <div className="type-caption rounded-2xl border border-[#e8dcc8] bg-[#faf7f1] px-2 py-2 text-center font-bold text-[#806d54]">
          3 · {contentText(content, "signUp.stepProfile", "Hồ sơ bé")}
        </div>
      </div>
      <SignUpForm
        googleAuthEnabled={googleAuthConfigured && settings.features.socialLoginEnabled}
        oauthError={oauthError}
      />
    </AuthShell>
  );
}
