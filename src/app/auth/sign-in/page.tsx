import type { Metadata } from "next";
import { Suspense } from "react";
import { connection } from "next/server";
import { googleAuthConfigured } from "@/config/auth-providers";
import { AuthShell } from "@/features/auth/auth-shell";
import { SignInForm } from "@/features/auth/auth-forms";
import { getOperationalSystemSettings } from "@/modules/system-settings/runtime";

export const metadata: Metadata = {
  title: "Đăng nhập",
};

export default async function Page() {
  await connection();
  const settings = await getOperationalSystemSettings();
  return (
    <AuthShell
      title="Đăng nhập vào Suy Luận Nhí"
      subtitle="Hệ thống sẽ đưa bạn đến phần phù hợp với tài khoản: quản lý gia đình hoặc trang quản trị."
    >
      <Suspense>
        <SignInForm
          googleAuthEnabled={googleAuthConfigured && settings.features.socialLoginEnabled}
          registrationEnabled={settings.features.registrationEnabled}
        />
      </Suspense>
    </AuthShell>
  );
}
