import Link from "next/link";
import { AuthShell } from "@/features/auth/auth-shell";
import { SwitchAccountButton } from "@/features/auth/switch-account-button";

export default function Page() {
  return (
    <AuthShell
      title="Tài khoản này chưa được phép vào đây"
      subtitle="Hãy đăng nhập bằng tài khoản quản trị đã được cấp quyền cho khu vực này."
    >
      <div className="space-y-3">
        <SwitchAccountButton />
        <Link href="/" className="block rounded-2xl border px-5 py-3 text-center font-black">
          Về trang chủ
        </Link>
      </div>
    </AuthShell>
  );
}
