import { redirect } from "next/navigation";
import { isStaffAccount } from "@/auth/access-policy";
import { getAuthenticatedHome } from "@/auth/navigation";
import { requireSession } from "@/auth/session";
import { AuthShell } from "@/features/auth/auth-shell";
import { TwoFactorSetupForm } from "@/features/auth/auth-forms";

export default async function Page() {
  const session = await requireSession();
  if (!isStaffAccount(session.user)) redirect(getAuthenticatedHome(session.user.role));
  if (session.user.twoFactorEnabled) redirect("/admin");

  return (
    <AuthShell
      title="Bảo vệ tài khoản quản trị"
      subtitle="Thiết lập xác thực hai lớp là bắt buộc trước khi truy cập khu vực quản trị."
    >
      <TwoFactorSetupForm />
    </AuthShell>
  );
}
