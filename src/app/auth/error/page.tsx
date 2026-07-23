import Link from "next/link";
import { AuthShell } from "@/features/auth/auth-shell";
import { SwitchAccountButton } from "@/features/auth/switch-account-button";

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ reason?: string | string[] }>;
}) {
  const reason = (await searchParams).reason;
  const banned = reason === "banned";
  return (
    <AuthShell
      title={banned ? "Tài khoản đã bị tạm ngưng" : "Tài khoản này chưa được phép vào đây"}
      subtitle={
        banned
          ? "Các phiên đăng nhập của tài khoản này đã bị thu hồi. Vui lòng liên hệ quản trị viên nếu cần hỗ trợ."
          : "Hãy đăng nhập bằng tài khoản quản trị đã được cấp quyền cho khu vực này."
      }
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
