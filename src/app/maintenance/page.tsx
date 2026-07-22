import type { Metadata } from "next";
import Link from "next/link";
import { Clock3, RefreshCw, ShieldCheck, Wrench } from "lucide-react";
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
    <main className="paper-texture grid min-h-screen place-items-center px-4 py-8 sm:px-6 sm:py-12">
      <section className="w-full max-w-xl rounded-[32px] border border-[#ead7aa] bg-white/95 p-6 text-center shadow-[0_20px_60px_rgba(76,55,31,0.12)] sm:p-9">
        <span className="mx-auto grid size-16 place-items-center rounded-[22px] bg-amber-100 text-amber-800">
          <Wrench size={30} strokeWidth={2.25} aria-hidden="true" />
        </span>

        <p className="type-overline mt-5 font-bold tracking-wide text-amber-700">Đang nâng cấp hệ thống</p>
        <h1 className="type-page-title mt-2">{settings.maintenance.title}</h1>
        <p className="type-lead mx-auto mt-3 max-w-lg text-[#6f6558]">{settings.maintenance.message}</p>

        <div className="mt-6 overflow-hidden rounded-2xl bg-[#fff9ec] text-left">
          <div className="type-supporting flex gap-3 p-4 text-[#6f5731]">
            <Clock3 className="mt-0.5 shrink-0" size={20} aria-hidden="true" />
            <span>Ba/mẹ có thể kiểm tra lại sau ít phút.</span>
          </div>
          <div className="mx-4 border-t border-[#eadfc9]" />
          <div className="type-supporting flex gap-3 p-4 text-[#526b43]">
            <ShieldCheck className="mt-0.5 shrink-0" size={20} aria-hidden="true" />
            <span>Hồ sơ và tiến độ của bé vẫn được giữ an toàn trong thời gian bảo trì.</span>
          </div>
        </div>

        <Link
          href="/"
          className="mt-6 inline-flex min-h-12 items-center justify-center gap-2 rounded-2xl bg-[#b9470d] px-7 py-3 font-black text-white shadow-sm transition hover:bg-[#a93f0b] active:translate-y-px"
        >
          <RefreshCw size={18} aria-hidden="true" />
          Kiểm tra lại
        </Link>
      </section>
    </main>
  );
}
