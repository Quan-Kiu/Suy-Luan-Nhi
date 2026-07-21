import Link from "next/link";
import { UserRoundX } from "lucide-react";
import { connection } from "next/server";
import { AuthShell } from "@/features/auth/auth-shell";
import { SignUpForm } from "@/features/auth/auth-forms";
import { getOperationalSystemSettings } from "@/modules/system-settings/runtime";

export default async function Page() {
  await connection();
  const settings = await getOperationalSystemSettings();
  if (!settings.features.registrationEnabled) {
    return (
      <AuthShell
        title="Tạm dừng tạo tài khoản mới"
        subtitle="Hệ thống hiện chưa tiếp nhận thêm tài khoản phụ huynh. Tài khoản đã có vẫn đăng nhập bình thường."
      >
        <div className="space-y-5 text-center">
          <span className="mx-auto grid size-16 place-items-center rounded-3xl bg-amber-100 text-amber-800">
            <UserRoundX size={30} aria-hidden="true" />
          </span>
          <p className="rounded-2xl bg-[#fff8e8] p-4 text-sm leading-6 text-[#6f5731]">
            Vui lòng quay lại sau hoặc đăng nhập bằng tài khoản hiện có.
          </p>
          <Link
            href="/auth/sign-in"
            className="block rounded-2xl bg-[#b9470d] px-5 py-3 font-black text-white"
          >
            Đăng nhập
          </Link>
        </div>
      </AuthShell>
    );
  }

  return (
    <AuthShell
      title="Tạo tài khoản phụ huynh"
      subtitle="Chỉ ba/mẹ cần tài khoản. Hồ sơ của bé chỉ lưu tên ở nhà và nhóm tuổi."
    >
      <SignUpForm />
    </AuthShell>
  );
}
