import Link from "next/link";
import { AuthShell } from "@/features/auth/auth-shell";
export default function Page() {
  return (
    <AuthShell title="Không có quyền truy cập" subtitle="Tài khoản hiện tại không có quyền mở khu vực này.">
      <Link href="/" className="block rounded-2xl bg-[#e9641a] px-5 py-3 text-center font-black text-white">
        Về trang chủ
      </Link>
    </AuthShell>
  );
}
