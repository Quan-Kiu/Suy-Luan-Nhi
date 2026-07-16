"use client";

import Image from "next/image";
import Link from "next/link";
import { LockKeyhole, Map } from "lucide-react";
import { BrandHeader } from "@/components/brand-header";
import { ChildShell } from "@/components/child-shell";
import { Card } from "@/components/ui";
import { assets } from "@/domain/content";
import { useChildProfile } from "@/lib/use-child-profile";

export default function ProfilesPage() {
  const profile = useChildProfile();
  const name = profile?.displayName ?? "Bống";

  return (
    <ChildShell>
      <BrandHeader />
      <main className="paper-texture min-h-[calc(100vh-5rem)] px-5 py-7">
        <div className="text-center">
          <p className="text-[#d28a1b]">✦</p>
          <h1 className="text-3xl font-black">Chào mừng bạn quay lại!</h1>
          <p className="mt-2 text-[#806d54]">Chọn hồ sơ để tiếp tục hành trình khám phá nhé.</p>
        </div>
        <Card className="relative mt-7 overflow-hidden p-3">
          <div className="absolute top-4 left-4 z-10 rounded-full bg-[#e9641a] px-3 py-1 text-xs font-black text-white">
            Hồ sơ của bé
          </div>
          <Image
            src={assets.profile}
            width={620}
            height={430}
            alt="Bống trong khu rừng và nhà cây"
            className="h-64 w-full rounded-[22px] object-cover"
          />
          <div className="relative mx-4 -mt-8 rounded-2xl bg-[#fff8e9]/95 p-4 text-center shadow">
            <p className="text-3xl font-black">{name}</p>
            <p className="text-sm text-[#806d54]">Nhà thám hiểm nhí · Linh vật Bống</p>
          </div>
          <Link
            href="/missions"
            className="wood-button mt-4 flex min-h-14 items-center justify-center gap-2 rounded-2xl font-black text-white"
          >
            <Map size={20} /> Vào bản đồ nhiệm vụ →
          </Link>
        </Card>
        <Link
          href="/parent"
          className="mt-5 flex min-h-24 items-center gap-4 rounded-[24px] border border-[#eadfc9] bg-[#f6eddc] px-5"
        >
          <span className="grid size-14 place-items-center rounded-full bg-[#e7d9bd]">
            <LockKeyhole />
          </span>
          <span>
            <strong className="block">Khu vực phụ huynh</strong>
            <small className="text-[#806d54]">Nơi ba/mẹ xem tiến bộ của bé</small>
          </span>
        </Link>
        <Card className="mt-5 flex items-center gap-3 bg-[#edf4df] p-4">
          <Image
            src={assets.hedgehog}
            width={60}
            height={60}
            alt="Nhím phụ tá"
            className="size-14 object-contain"
          />
          <p className="text-sm font-bold text-[#5c714c]">
            Suy Luận Nhí không quảng cáo, không liên kết ngoài và không mua hàng trong chế độ bé.
          </p>
        </Card>
      </main>
    </ChildShell>
  );
}
