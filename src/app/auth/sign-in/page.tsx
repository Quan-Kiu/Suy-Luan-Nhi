import { Suspense } from "react";
import { AuthShell } from "@/features/auth/auth-shell";
import { SignInForm } from "@/features/auth/auth-forms";
export default function Page() {
  return (
    <AuthShell
      title="Đăng nhập"
      subtitle="Đăng nhập để xem hồ sơ gia đình và tiếp tục hoạt động của bé trên thiết bị này."
    >
      <Suspense>
        <SignInForm />
      </Suspense>
    </AuthShell>
  );
}
