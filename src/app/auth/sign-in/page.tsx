import { Suspense } from "react";
import { AuthShell } from "@/features/auth/auth-shell";
import { SignInForm } from "@/features/auth/auth-forms";
export default function Page() {
  return (
    <AuthShell
      title="Đăng nhập vào Suy Luận Nhí"
      subtitle="Hệ thống sẽ đưa bạn đến phần phù hợp với tài khoản: quản lý gia đình hoặc trang quản trị."
    >
      <Suspense>
        <SignInForm />
      </Suspense>
    </AuthShell>
  );
}
