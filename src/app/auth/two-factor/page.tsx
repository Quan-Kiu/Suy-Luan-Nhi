import type { Metadata } from "next";
import { AuthShell } from "@/features/auth/auth-shell";
import { TwoFactorChallengeForm } from "@/features/auth/auth-forms";

export const metadata: Metadata = {
  title: "Xác minh bước thứ hai",
};

export default function Page() {
  return (
    <AuthShell
      title="Xác minh bước thứ hai"
      subtitle="Nhập mã bảo mật để hoàn tất đăng nhập vào tài khoản nhân sự."
    >
      <TwoFactorChallengeForm />
    </AuthShell>
  );
}
