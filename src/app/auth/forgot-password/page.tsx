import { AuthShell } from "@/features/auth/auth-shell";
import { ForgotPasswordForm } from "@/features/auth/auth-forms";
export default function Page() {
  return (
    <AuthShell title="Quên mật khẩu" subtitle="Nhập email để nhận liên kết đặt lại mật khẩu an toàn.">
      <ForgotPasswordForm />
    </AuthShell>
  );
}
