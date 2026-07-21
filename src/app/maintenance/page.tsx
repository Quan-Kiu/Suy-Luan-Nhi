import type { Metadata } from "next";
import Link from "next/link";
import { Clock3, ShieldCheck, Wrench } from "lucide-react";
import { redirect } from "next/navigation";
import { connection } from "next/server";
import { getOperationalSystemSettings } from "@/modules/system-settings/runtime";

export const metadata: Metadata = {
  title: "Đang bảo trì | Suy Luận Nhí",
  robots: { index: false, follow: false },
};

export default async function MaintenancePage() {
  await connection();
  const settings = await getOperationalSystemSettings({ fresh: true });
  if (!settings.maintenance.enabled) redirect("/");

  return (
    <main className="paper-texture grid min-h-screen place-items-center px-5 py-12">
      <section className="w-full max-w-2xl rounded-[36px] border border-amber-200 bg-white/95 p-7 text-center shadow-[0_24px_70px_rgba(76,55,31,0.14)] sm:p-10">
        <span className="mx-auto grid size-20 place-items-center rounded-3xl bg-amber-100 text-amber-800">
          <Wrench size={36} aria-hidden="true" />
        </span>
        <p className="mt-6 text-sm font-black tracking-wide text-amber-700 uppercase">Tạm dừng để nâng cấp</p>
        <h1 className="mt-3 text-3xl font-black text-[#342f28] sm:text-4xl">{settings.maintenance.title}</h1>
        <p className="mx-auto mt-4 max-w-xl text-base leading-7 text-[#6f6558] sm:text-lg">
          {settings.maintenance.message}
        </p>

        <div className="mt-7 grid gap-3 text-left sm:grid-cols-2">
          <div className="flex gap-3 rounded-2xl bg-[#fff8e8] p-4 text-sm leading-6 text-[#6f5731]">
            <Clock3 className="mt-0.5 shrink-0" size={20} aria-hidden="true" />
            <span>Ba/mẹ có thể tải lại trang sau ít phút để kiểm tra hệ thống đã hoạt động trở lại.</span>
          </div>
          <div className="flex gap-3 rounded-2xl bg-[#edf4df] p-4 text-sm leading-6 text-[#526b43]">
            <ShieldCheck className="mt-0.5 shrink-0" size={20} aria-hidden="true" />
            <span>Dữ liệu hồ sơ và tiến độ của bé vẫn được giữ an toàn trong thời gian bảo trì.</span>
          </div>
        </div>

        <div className="mt-7 flex flex-col justify-center gap-3 sm:flex-row">
          <Link href="/" className="rounded-2xl bg-[#b9470d] px-6 py-3 font-black text-white">
            Kiểm tra lại
          </Link>
          <Link
            href="/auth/sign-in"
            className="rounded-2xl border border-[#d8c8ae] bg-white px-6 py-3 font-black text-[#4f463b]"
          >
            Đăng nhập quản trị
          </Link>
        </div>
      </section>
    </main>
  );
}
