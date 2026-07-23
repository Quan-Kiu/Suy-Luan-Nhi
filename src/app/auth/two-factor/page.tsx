import { AuthShell } from "@/features/auth/auth-shell";
import { TwoFactorChallengeForm } from "@/features/auth/auth-forms";

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
