import Image from "next/image";
import { Clock3, Gift, Lightbulb } from "lucide-react";
import { Card, Pill } from "@/components/ui";
import { StartMissionButton } from "@/features/catalog/start-mission-button";

type Published = NonNullable<
  Awaited<ReturnType<typeof import("@/modules/catalog/catalog").getPublishedMission>>
>;
export function MissionDetailView({ data, childId }: { data: Published; childId: string }) {
  const snapshot = data.version.snapshot as { questions?: unknown[]; secondarySkills?: string[] };
  return (
    <main className="paper-texture min-h-[calc(100vh-5rem)] px-5 pt-4 pb-8">
      <Card className="overflow-hidden border-2 border-[#d9bf91] p-0">
        <div className="relative">
          <Image
            src={data.mission.coverUrl}
            width={760}
            height={500}
            priority
            alt={data.mission.title}
            className="block h-72 w-full object-cover"
          />
          <div className="absolute top-4 left-4">
            <Pill className="bg-[#55773a] text-white">{data.world.title}</Pill>
          </div>
        </div>
        <div className="relative -mt-px bg-white p-5 text-center">
          <h1 className="text-4xl leading-none font-black">{data.mission.title}</h1>
          <p className="mt-3 font-bold text-[#8a6b39]">{data.mission.subtitle}</p>
          <p className="mt-4 leading-7 text-[#715f47]">{data.mission.storyIntro}</p>
        </div>
      </Card>
      <div className="mt-4 grid grid-cols-3 gap-3">
        <Card className="p-3 text-center">
          <Clock3 className="mx-auto text-[#d97816]" />
          <p className="mt-2 text-xs">Thời gian</p>
          <p className="font-black">{data.mission.estimatedMinutes} phút</p>
        </Card>
        <Card className="p-3 text-center">
          <Lightbulb className="mx-auto text-[#638c4e]" />
          <p className="mt-2 text-xs">Kỹ năng</p>
          <p className="text-sm font-black">{data.primarySkill.title}</p>
        </Card>
        <Card className="p-3 text-center">
          <span className="text-2xl">🧩</span>
          <p className="mt-2 text-xs">Câu hỏi</p>
          <p className="font-black">{snapshot.questions?.length ?? 0}</p>
        </Card>
      </div>
      {data.badge ? (
        <Card className="mt-4 flex items-center gap-4 bg-[#fff5db] p-4">
          <Image
            src={data.badge.iconUrl}
            width={80}
            height={80}
            alt={`Huy hiệu ${data.badge.name}`}
            className="size-20 object-contain"
          />
          <div>
            <p className="flex items-center gap-2 text-xs font-black tracking-wider text-[#9a5f0e] uppercase">
              <Gift size={16} />
              Phần thưởng
            </p>
            <p className="mt-1 text-xl font-black">{data.badge.name}</p>
            <p className="text-sm text-[#806d54]">{data.badge.description}</p>
          </div>
        </Card>
      ) : null}
      <Card className="mt-4 p-4">
        <p className="font-black">Thói quen tư duy</p>
        <div className="mt-3 flex flex-wrap gap-2">
          {data.secondarySkills.map((skill) => (
            <Pill key={skill.slug}>{skill.title}</Pill>
          ))}
        </div>
      </Card>
      <div className="mt-5">
        <StartMissionButton childId={childId} missionId={data.mission.id} />
      </div>
    </main>
  );
}
