import type { Metadata } from "next";
import { Suspense } from "react";
import { AuthShell } from "@/features/auth/auth-shell";
import { ResetPasswordForm } from "@/features/auth/auth-forms";
export const metadata: Metadata = {
  title: "Đặt mật khẩu mới",
};

export default function Page() {
  return (
    <AuthShell
      title="Đặt mật khẩu mới"
      subtitle="Chọn mật khẩu ít nhất 10 ký tự và không dùng lại mật khẩu ở nơi khác."
    >
      <Suspense>
        <ResetPasswordForm />
      </Suspense>
    </AuthShell>
  );
}
