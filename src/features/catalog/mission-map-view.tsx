import * as motion from "motion/react-client";
import { CheckCircle2, LockKeyhole, Sparkles } from "lucide-react";
import { Pill } from "@/components/ui";
import { contentTemplate, contentText } from "@/content/resolve";
import type { ContentDictionary } from "@/content/types";
import { MissionCard } from "@/features/catalog/mission-card";
import type { MissionMapData } from "@/features/catalog/mission-map-types";

const themes: Record<string, string> = {
  green: "border-[#8eb273] bg-[#f0f6e9]",
  blue: "border-[#77a7bc] bg-[#eaf5f8]",
  purple: "border-[#9b83bd] bg-[#f1ecf8]",
  orange: "border-[#e6a35e] bg-[#fff0df]",
};

export function MissionMapView({ data, content }: { data: MissionMapData; content: ContentDictionary }) {
  return (
    <div className="space-y-7">
      {data.worlds.map((world, worldIndex) => (
        <motion.section key={world.id}>
          <div className="mb-3 flex items-end justify-between gap-3">
            <div>
              <p className="type-overline font-black tracking-widest text-[#d17c14] uppercase">
                {contentTemplate(content, "mission.world", "Thế giới {order}", { order: world.order })}
              </p>
              <h2 className="type-child-section-title">{world.title}</h2>
              <p className="type-supporting text-[#806d54]">{world.subtitle}</p>
            </div>
            {world.completed ? (
              <Pill className="shrink-0 bg-green-50 text-green-700">
                <CheckCircle2 size={15} />
                {contentText(content, "mission.completedWorld", "Đã khám phá")}
              </Pill>
            ) : world.unlocked ? (
              <Pill className="shrink-0">
                <Sparkles size={15} />
                {contentText(content, "mission.openWorld", "Đang mở")}
              </Pill>
            ) : (
              <Pill className="shrink-0">
                <LockKeyhole size={15} />
                {contentText(content, "mission.lockedWorld", "Chưa mở")}
              </Pill>
            )}
          </div>
          <div className="grid auto-rows-fr grid-cols-2 items-stretch gap-3">
            {world.missions.map((mission, missionIndex) => (
              <MissionCard
                key={mission.id}
                mission={mission}
                themeClassName={themes[world.theme] ?? themes.green}
                priority={worldIndex === 0 && missionIndex < 3}
                content={content}
              />
            ))}
          </div>
        </motion.section>
      ))}
    </div>
  );
}
