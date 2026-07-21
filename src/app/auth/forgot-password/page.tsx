import { AuthShell } from "@/features/auth/auth-shell";
import { ForgotPasswordForm } from "@/features/auth/auth-forms";
export default function Page() {
  return (
    <AuthShell title="Quên mật khẩu" subtitle="Nhập email đã đăng ký để nhận liên kết tạo mật khẩu mới.">
      <ForgotPasswordForm />
    </AuthShell>
  );
}
