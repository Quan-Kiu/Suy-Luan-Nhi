import Image from "next/image";
import Link from "next/link";
import { CheckCircle2, Home } from "lucide-react";
import { BrandHeader } from "@/components/brand-header";
import { ChildShell } from "@/components/child-shell";
import { Card } from "@/components/ui";
import { assets, footprintMission } from "@/domain/content";

export default function CompletePage() {
  return (
    <ChildShell>
      <BrandHeader />
      <main className="paper-texture min-h-[calc(100vh-5rem)] px-5 pt-4 pb-8">
        <div className="relative overflow-hidden rounded-[28px]">
          <Image
            src={assets.complete}
            width={760}
            height={760}
            priority
            alt="Bé thám tử và Bống ăn mừng hoàn thành nhiệm vụ"
            className="h-[430px] w-full object-cover"
          />
          <div className="absolute inset-x-3 top-3 rounded-[24px] border-4 border-[#8d6031] bg-[#f2d28c]/95 p-4 text-center shadow-xl">
            <p className="text-xs font-black tracking-[.2em] text-[#50733c] uppercase">
              Nhiệm vụ hoàn thành!
            </p>
            <h1 className="text-4xl font-black text-[#db5712]">Tuyệt vời!</h1>
            <p className="font-black">Bé thật là thám tử tài ba!</p>
          </div>
        </div>
        <Card className="relative mx-3 -mt-6 flex items-center gap-4 p-4">
          <Image
            src={footprintMission.reward.asset}
            width={96}
            height={96}
            alt={`Huy hiệu ${footprintMission.reward.name}`}
            className="size-24 object-contain"
          />
          <div>
            <p className="text-xs font-black tracking-wider text-[#b77b20] uppercase">Huy hiệu mới</p>
            <h2 className="text-2xl font-black">{footprintMission.reward.name}</h2>
            <p className="text-sm text-[#76634b]">Con đã quan sát chuỗi thật cẩn thận.</p>
          </div>
        </Card>
        <h2 className="mt-6 text-center text-xl font-black">Con đã dùng cách nào để tìm ra manh mối?</h2>
        <div className="mt-3 grid grid-cols-4 gap-2">
          {footprintMission.secondarySkills.map((skill) => (
            <div key={skill} className="rounded-2xl border border-[#eadfc9] bg-white p-3 text-center">
              <CheckCircle2 className="mx-auto text-[#658e4e]" size={24} />
              <p className="mt-2 text-xs font-black">{skill}</p>
            </div>
          ))}
        </div>
        <Card className="mt-5 flex items-center gap-3 bg-[#fff3d5] p-4">
          <Image
            src={assets.hedgehogThumb}
            width={72}
            height={72}
            alt="Nhím chúc mừng"
            className="size-16 object-contain"
          />
          <p className="font-bold text-[#6f582a]">
            Mỗi lần con nhìn kỹ và thử lại là một lần bộ não khỏe hơn một chút!
          </p>
        </Card>
        <Link
          href="/missions"
          className="wood-button mt-5 flex min-h-14 items-center justify-center gap-2 rounded-2xl font-black text-white"
        >
          <Home size={20} /> Về trang chủ
        </Link>
      </main>
    </ChildShell>
  );
}
