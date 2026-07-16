"use client";

import { useQuery } from "@tanstack/react-query";
import Image from "next/image";
import Link from "next/link";
import { Compass, LockKeyhole, RefreshCw, Sparkles } from "lucide-react";
import { BrandHeader } from "@/components/brand-header";
import { ChildShell } from "@/components/child-shell";
import { Card, Pill } from "@/components/ui";
import type { MissionWorld } from "@/domain/schemas";
import { useChildProfile } from "@/lib/use-child-profile";
import { useCompletedMissionIds } from "@/lib/use-mission-progress";
import { requestJson } from "@/lib/http";

const themeClasses = {
  green: "border-[#8eb273] bg-[#f0f6e9]",
  blue: "border-[#77a7bc] bg-[#eaf5f8]",
  purple: "border-[#9b83bd] bg-[#f1ecf8]",
  orange: "border-[#e6a35e] bg-[#fff0df]",
};

export default function MissionMapPage() {
  const profile = useChildProfile();
  const completedMissionIds = useCompletedMissionIds();
  const {
    data = [],
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ["mission-worlds"],
    queryFn: () => requestJson<MissionWorld[]>("/api/missions"),
  });

  return (
    <ChildShell>
      <BrandHeader />
      <main className="paper-texture min-h-[calc(100vh-5rem)] px-5 pt-5 pb-8">
        <Card className="flex items-center gap-3 p-3">
          <Image
            src="/assets/mascots/mascot-dog-bong-avatar.png"
            width={58}
            height={58}
            alt="Bống"
            className="size-14 rounded-full bg-[#efe5d3] object-contain"
          />
          <div className="flex-1">
            <p className="font-black">Xin chào, {profile?.displayName ?? "Bống"}!</p>
            <p className="text-xs text-[#806d54]">Hôm nay mình cùng tìm một bí mật nhỏ nhé.</p>
          </div>
          <Pill>
            <Sparkles size={15} /> Nhà thám hiểm
          </Pill>
        </Card>
        <div className="mt-6 flex items-end justify-between">
          <div>
            <p className="text-sm font-black tracking-widest text-[#d17c14] uppercase">Chọn một thế giới</p>
            <h1 className="mt-1 text-4xl font-black text-[#d95713]">Bản đồ nhiệm vụ</h1>
            <p className="mt-1 text-[#806d54]">Chạm thẻ gần mình nhất để bắt đầu!</p>
          </div>
          <Compass size={62} className="text-[#927349]" />
        </div>

        {isLoading ? (
          <Card className="mt-6 p-8 text-center font-bold text-[#806d54]">Bống đang mở bản đồ...</Card>
        ) : isError ? (
          <Card className="mt-6 p-6 text-center">
            <p className="font-black">Bản đồ chưa tải được</p>
            <button
              type="button"
              onClick={() => refetch()}
              className="mt-3 inline-flex min-h-11 items-center gap-2 rounded-xl bg-[#6f914c] px-4 font-black text-white"
            >
              <RefreshCw size={17} /> Thử tải lại
            </button>
          </Card>
        ) : (
          <div className="relative mt-6 grid grid-cols-2 gap-4 before:absolute before:inset-y-6 before:left-1/2 before:-z-0 before:border-l-4 before:border-dashed before:border-[#d9c7a9]">
            {data.map((world) => {
              const isFirstWorld = world.id === "pattern-detective";
              const locked = world.status === "locked" || !isFirstWorld;
              const completed = isFirstWorld && completedMissionIds.includes("footprint-detective");
              const card = (
                <Card
                  className={`relative z-10 overflow-hidden border-2 p-2 transition ${themeClasses[world.theme]} ${locked ? "opacity-65 grayscale-[.35]" : "hover:-translate-y-1"}`}
                >
                  <div className="relative h-40 overflow-hidden rounded-[22px]">
                    <Image
                      src={world.coverImage}
                      fill
                      alt={world.title}
                      className="object-cover"
                      sizes="220px"
                      loading={isFirstWorld ? "eager" : "lazy"}
                    />
                    <span className="absolute top-2 left-2 grid size-9 place-items-center rounded-full bg-white/90 font-black">
                      {world.order}
                    </span>
                    {locked ? (
                      <span className="absolute top-2 right-2 grid size-9 place-items-center rounded-full bg-white/90">
                        <LockKeyhole size={18} />
                      </span>
                    ) : null}
                  </div>
                  <div className="p-2 text-center">
                    <h2 className="text-lg leading-tight font-black">{world.title}</h2>
                    <p className="mt-1 text-xs text-[#6f604b]">{world.subtitle}</p>
                    <span className="mt-2 inline-block rounded-full bg-white/75 px-3 py-1 text-[11px] font-black">
                      {completed ? "Đã hoàn thành" : locked ? "Sắp mở" : "Tiếp tục khám phá"}
                    </span>
                  </div>
                </Card>
              );
              return locked ? (
                <div key={world.id}>{card}</div>
              ) : (
                <Link key={world.id} href="/missions/footprint-detective">
                  {card}
                </Link>
              );
            })}
          </div>
        )}

        <Card className="mt-6 flex items-center gap-4 bg-[#edf4df] p-4">
          <Image
            src="/assets/mascots/mascot-hedgehog-map.png"
            width={72}
            height={72}
            alt="Nhím cầm bản đồ"
            className="size-16 object-contain"
          />
          <div>
            <p className="font-black text-[#526d43]">Mỗi ngày một nhiệm vụ nhỏ</p>
            <p className="text-sm text-[#637555]">
              Bé có thể nghỉ bất cứ lúc nào và quay lại đúng nơi đang khám phá.
            </p>
          </div>
        </Card>
      </main>
    </ChildShell>
  );
}
