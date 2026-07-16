import { AuthShell } from "@/features/auth/auth-shell";
import { SignUpForm } from "@/features/auth/auth-forms";
export default function Page() {
  return (
    <AuthShell
      title="Tạo tài khoản phụ huynh"
      subtitle="Chỉ ba/mẹ cần tài khoản. Hồ sơ của bé luôn tối giản dữ liệu."
    >
      <SignUpForm />
    </AuthShell>
  );
}
