import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { isStaffAccount } from "@/auth/access-policy";
import { getAuthenticatedHome } from "@/auth/navigation";
import { requireSession } from "@/auth/session";
import { AuthShell } from "@/features/auth/auth-shell";
import { TwoFactorSetupForm } from "@/features/auth/auth-forms";
import { SwitchAccountButton } from "@/features/auth/switch-account-button";
import { hasPasswordCredential } from "@/modules/auth/account-capabilities";

export const metadata: Metadata = {
  title: "Bảo vệ tài khoản quản trị",
};

export default async function Page() {
  const session = await requireSession();
  if (!isStaffAccount(session.user)) redirect(getAuthenticatedHome(session.user.role));
  if (session.user.twoFactorEnabled) redirect("/admin");
  const requiresPassword = await hasPasswordCredential(session.user.id);

  return (
    <AuthShell
      title="Bảo vệ tài khoản quản trị"
      subtitle="Thiết lập xác thực hai lớp là bắt buộc trước khi truy cập khu vực quản trị."
    >
      <TwoFactorSetupForm requiresPassword={requiresPassword} />
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
