import * as motion from "motion/react-client";
import Image from "next/image";
import Link from "next/link";
import { CheckCircle2, LockKeyhole } from "lucide-react";
import { Card } from "@/components/ui";
import { contentText } from "@/content/resolve";
import type { ContentDictionary } from "@/content/types";
import { LockedMissionAction } from "@/features/catalog/locked-mission-action";
import type { MissionMapMission } from "@/features/catalog/mission-map-types";

export function MissionCard({
  mission,
  themeClassName,
  priority,
  index,
  content,
}: {
  mission: MissionMapMission;
  themeClassName: string;
  priority: boolean;
  index: number;
  content: ContentDictionary;
}) {
  const actionLabel = mission.completed
    ? contentText(content, "mission.replay", "Chơi lại")
    : mission.recommended
      ? contentText(content, "mission.recommended", "Gợi ý hôm nay")
      : mission.unlocked
        ? contentText(content, "mission.start", "Bắt đầu")
        : contentText(content, "mission.locked", "Hoàn thành nhiệm vụ trước");

  const card = (
    <motion.div
      data-mission-card
      className="h-full"
      initial={{ opacity: 0, y: 14 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ delay: Math.min(index * 0.05, 0.2) }}
      whileHover={mission.unlocked ? { y: -4 } : undefined}
    >
      <Card
        className={`relative flex h-full min-h-[284px] flex-col overflow-hidden border-2 p-2 ${themeClassName} ${!mission.unlocked ? "grayscale-[.4]" : ""}`}
      >
        <div className="relative h-36 shrink-0 overflow-hidden rounded-[20px]">
          <Image
            src={mission.coverUrl}
            fill
            alt={mission.title}
            className="object-cover"
            sizes="220px"
            priority={priority}
          />
          {mission.completed ? (
            <span className="absolute top-2 right-2 grid size-9 place-items-center rounded-full bg-white text-green-700">
              <CheckCircle2 size={20} />
            </span>
          ) : !mission.unlocked ? (
            <span className="absolute top-2 right-2 grid size-9 place-items-center rounded-full bg-white">
              <LockKeyhole size={18} />
            </span>
          ) : null}
        </div>
        <div className="flex flex-1 flex-col p-2 text-center">
          <h3 className="type-card-title min-h-10">{mission.title}</h3>
          <p className="type-caption mt-1 text-[#6f604b]">
            {mission.estimatedMinutes} phút · Mức {mission.difficulty}
          </p>
          <span className="type-action mt-auto inline-flex min-h-8 items-center justify-center self-center rounded-full bg-white/85 px-3 py-1">
            {actionLabel}
          </span>
        </div>
      </Card>
    </motion.div>
  );

  return mission.unlocked ? (
    <Link className="block h-full" href={`/missions/${mission.slug}`} prefetch={true}>
      {card}
    </Link>
  ) : (
    <LockedMissionAction
      title={mission.title}
      description={mission.unlockMessage ?? "Hoàn thành nhiệm vụ trước để tiếp tục."}
    >
      {card}
    </LockedMissionAction>
  );
}
