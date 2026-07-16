import { Suspense } from "react";
import { AuthShell } from "@/features/auth/auth-shell";
import { ResetPasswordForm } from "@/features/auth/auth-forms";
export default function Page() {
  return (
    <AuthShell title="Đặt mật khẩu mới" subtitle="Dùng mật khẩu dài, riêng biệt và khó đoán.">
      <Suspense>
        <ResetPasswordForm />
      </Suspense>
    </AuthShell>
  );
}
