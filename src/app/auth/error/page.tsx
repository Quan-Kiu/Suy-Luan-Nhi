import Link from "next/link";
import { AuthShell } from "@/features/auth/auth-shell";
import { SwitchAccountButton } from "@/features/auth/switch-account-button";

export default function Page() {
  return (
    <AuthShell
      title="Không có quyền truy cập"
      subtitle="Tài khoản hiện tại không có quyền mở khu vực này. Hãy dùng tài khoản quản trị phù hợp."
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
