import type { Metadata } from "next";
import { AuthShell } from "@/features/auth/auth-shell";
import { TwoFactorChallengeForm } from "@/features/auth/auth-forms";
import { SwitchAccountButton } from "@/features/auth/switch-account-button";

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
      <div className="mt-5 border-t border-[#eadfc9] pt-5">
        <SwitchAccountButton
          callbackUrl="/admin"
          label="Đăng xuất và dùng tài khoản khác"
          pendingLabel="Đang đăng xuất..."
        />
      </div>
    </AuthShell>
  );
}
