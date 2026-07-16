import { Suspense } from "react";
import { AuthShell } from "@/features/auth/auth-shell";
import { SignInForm } from "@/features/auth/auth-forms";
export default function Page() {
  return (
    <AuthShell
      title="Đăng nhập"
      subtitle="Quản lý hồ sơ gia đình và tiếp tục hành trình của bé trên mọi thiết bị."
    >
      <Suspense>
        <SignInForm />
      </Suspense>
    </AuthShell>
  );
}
