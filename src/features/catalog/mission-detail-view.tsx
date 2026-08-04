import Image from "next/image";
import { Clock3, Gift, Lightbulb } from "lucide-react";
import { Card, Pill } from "@/components/ui";
import { renderContentTemplate, type ContentVariableDefinition } from "@/domain/content-variables";
import { StartMissionButton } from "@/features/catalog/start-mission-button";

type Published = NonNullable<
  Awaited<ReturnType<typeof import("@/modules/catalog/catalog").getPublishedMission>>
>;

type MissionChild = {
  id: string;
  displayName?: string | null;
  ageGroup?: string | null;
  currentRank?: string | null;
};

export function MissionDetailView({
  data,
  child,
  templateVariables,
}: {
  data: Published;
  child: MissionChild;
  templateVariables: ContentVariableDefinition[];
}) {
  const snapshot = data.version.snapshot as { questions?: unknown[]; secondarySkills?: string[] };
  const context = { child };
  const title = renderContentTemplate(data.mission.title, templateVariables, context);
  const subtitle = renderContentTemplate(data.mission.subtitle, templateVariables, context);
  const storyIntro = renderContentTemplate(data.mission.storyIntro, templateVariables, context);

  return (
    <main className="paper-texture min-h-[calc(100svh-5rem)] px-5 pt-4 pb-8">
      <Card className="overflow-hidden border-2 border-[#d9bf91] p-0">
        <div className="relative">
          <Image
            src={data.mission.coverUrl}
            width={760}
            height={500}
            preload
            alt={title}
            className="block h-72 w-full object-cover"
          />
          <div className="absolute top-4 left-4">
            <Pill className="bg-[#55773a] text-white">{data.world.title}</Pill>
          </div>
        </div>
        <div className="relative -mt-px bg-white p-5 text-center">
          <h1 className="type-child-page-title">{title}</h1>
          <p className="mt-3 font-bold text-[#8a6b39]">{subtitle}</p>
          <p className="mt-4 leading-7 text-[#715f47]">{storyIntro}</p>
        </div>
      </Card>
      <div className="mt-4 grid grid-cols-3 gap-3">
        <Card className="p-3 text-center">
          <Clock3 className="mx-auto text-[#d97816]" />
          <p className="type-caption mt-2">Thời gian</p>
          <p className="font-black">{data.mission.estimatedMinutes} phút</p>
        </Card>
        <Card className="p-3 text-center">
          <Lightbulb className="mx-auto text-[#638c4e]" />
          <p className="type-caption mt-2">Kỹ năng</p>
          <p className="type-label font-black">{data.primarySkill.title}</p>
        </Card>
        <Card className="p-3 text-center">
          <span className="text-2xl">🧩</span>
          <p className="type-caption mt-2">Câu hỏi</p>
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
            <p className="type-overline flex items-center gap-2 font-black tracking-wider text-[#9a5f0e] uppercase">
              <Gift size={16} /> Phần thưởng
            </p>
            <p className="type-child-section-title mt-1">{data.badge.name}</p>
            <p className="type-supporting text-[#806d54]">{data.badge.description}</p>
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
        <StartMissionButton childId={child.id} missionId={data.mission.id} />
      </div>
    </main>
  );
}
