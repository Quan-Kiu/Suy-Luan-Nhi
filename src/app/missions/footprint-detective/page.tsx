import Image from "next/image";
import Link from "next/link";
import { Clock3, Eye, Gift, Search } from "lucide-react";
import { BrandHeader } from "@/components/brand-header";
import { ChildShell } from "@/components/child-shell";
import { Card, Pill } from "@/components/ui";
import { footprintMission } from "@/domain/content";

export default function MissionDetailPage() {
  return (
    <ChildShell>
      <BrandHeader backHref="/missions" />
      <main className="paper-texture min-h-[calc(100vh-5rem)] px-5 pt-4 pb-8">
        <div className="relative overflow-hidden rounded-[28px] border-2 border-[#d9bf91] bg-[#e9ddc4]">
          <Image
            src={footprintMission.coverImage}
            width={760}
            height={500}
            priority
            alt="Bé thám tử quan sát dấu chân trong khu rừng"
            className="h-72 w-full object-cover"
          />
          <div className="absolute top-4 left-4">
            <Pill className="bg-[#6f914c] text-white">
              <span className="grid size-6 place-items-center rounded-full bg-white text-[#55733a]">1</span>{" "}
              Thám tử Quy luật
            </Pill>
          </div>
        </div>
        <Card className="relative mx-2 -mt-5 p-5">
          <h1 className="text-center text-4xl leading-none font-black">{footprintMission.title}</h1>
          <p className="mt-4 text-center leading-7 text-[#715f47]">{footprintMission.storyIntro}</p>
        </Card>
        <div className="mt-4 grid grid-cols-2 gap-3">
          <Card className="flex items-center gap-3 p-4">
            <Clock3 className="text-[#d97816]" />
            <div>
              <p className="text-xs text-[#806d54]">Thời gian ước tính</p>
              <p className="font-black">{footprintMission.estimatedMinutes} phút</p>
            </div>
          </Card>
          <Card className="flex items-center gap-3 p-4">
            <Eye className="text-[#638c4e]" />
            <div>
              <p className="text-xs text-[#806d54]">Thói quen tư duy</p>
              <p className="font-black">{footprintMission.primarySkill}</p>
            </div>
          </Card>
        </div>
        <Card className="mt-4 flex items-center gap-4 bg-[#fff5db] p-4">
          <Image
            src={footprintMission.reward.asset}
            width={82}
            height={82}
            alt={`Huy hiệu ${footprintMission.reward.name}`}
            className="size-20 object-contain"
          />
          <div>
            <p className="flex items-center gap-2 text-xs font-black tracking-wider text-[#bc7917] uppercase">
              <Gift size={16} /> Phần thưởng
            </p>
            <p className="mt-1 text-xl font-black">Huy hiệu “{footprintMission.reward.name}”</p>
          </div>
        </Card>
        <Card className="mt-4 p-4">
          <p className="font-black">Nhiệm vụ nhỏ hôm nay</p>
          <div className="mt-3 space-y-2 text-sm text-[#6d5c45]">
            <p>🔎 Nhìn kỹ chuỗi hình.</p>
            <p>💡 Nhận gợi ý khi cần.</p>
            <p>🌱 Thử lại mà không bị trừ điểm.</p>
          </div>
        </Card>
        <Link
          href="/play"
          className="wood-button mt-5 flex min-h-14 items-center justify-center gap-2 rounded-2xl font-black text-white"
        >
          <Search size={21} /> Bắt đầu nhiệm vụ →
        </Link>
      </main>
    </ChildShell>
  );
}
