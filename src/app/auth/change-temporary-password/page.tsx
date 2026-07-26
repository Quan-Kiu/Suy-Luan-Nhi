import type { Metadata } from "next";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/auth/auth";
import { getAuthenticatedHome } from "@/auth/navigation";
import { AuthShell } from "@/features/auth/auth-shell";
import { ChangeTemporaryPasswordForm } from "@/features/auth/change-temporary-password-form";

export const metadata: Metadata = {
  title: "Đổi mật khẩu tạm thời",
};

export default async function Page() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/auth/sign-in");
  const destination = getAuthenticatedHome(session.user.role);
  if (!session.user.mustChangePassword) redirect(destination);

  return (
    <AuthShell
      title="Tạo mật khẩu mới"
      subtitle="Mật khẩu hiện tại chỉ dùng tạm thời. Hãy đổi mật khẩu trước khi tiếp tục để bảo vệ tài khoản."
    >
      <ChangeTemporaryPasswordForm destination={destination} />
    </AuthShell>
  );
}
