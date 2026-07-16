import Image from "next/image";
import Link from "next/link";
import { CheckCircle2, LockKeyhole, Sparkles } from "lucide-react";
import { Card, Pill } from "@/components/ui";

type MapData = Awaited<ReturnType<typeof import("@/modules/catalog/catalog").getMissionMap>>;
const themes: Record<string, string> = {
  green: "border-[#8eb273] bg-[#f0f6e9]",
  blue: "border-[#77a7bc] bg-[#eaf5f8]",
  purple: "border-[#9b83bd] bg-[#f1ecf8]",
  orange: "border-[#e6a35e] bg-[#fff0df]",
};

export function MissionMapView({ data }: { data: MapData }) {
  return (
    <div className="space-y-7">
      {data.worlds.map((world, worldIndex) => (
        <section key={world.id} className={`${!world.unlocked ? "opacity-70" : ""}`}>
          <div className="mb-3 flex items-end justify-between">
            <div>
              <p className="text-xs font-black tracking-widest text-[#d17c14] uppercase">
                Thế giới {world.order}
              </p>
              <h2 className="text-2xl font-black">{world.title}</h2>
              <p className="text-sm text-[#806d54]">{world.subtitle}</p>
            </div>
            {world.completed ? (
              <Pill className="bg-green-50 text-green-700">
                <CheckCircle2 size={15} />
                Đã khám phá
              </Pill>
            ) : world.unlocked ? (
              <Pill>
                <Sparkles size={15} />
                Đang mở
              </Pill>
            ) : (
              <Pill>
                <LockKeyhole size={15} />
                Chưa mở
              </Pill>
            )}
          </div>
          <div className="grid grid-cols-2 gap-3">
            {world.missions.map((mission, missionIndex) => {
              const card = (
                <Card
                  className={`relative overflow-hidden border-2 p-2 ${themes[world.theme] ?? themes.green} ${!mission.unlocked ? "grayscale-[.4]" : "transition hover:-translate-y-1"}`}
                >
                  <div className="relative h-36 overflow-hidden rounded-[20px]">
                    <Image
                      src={mission.coverUrl}
                      fill
                      alt={mission.title}
                      className="object-cover"
                      sizes="220px"
                      priority={worldIndex === 0 && missionIndex < 3}
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
                  <div className="p-2 text-center">
                    <h3 className="leading-tight font-black">{mission.title}</h3>
                    <p className="mt-1 text-xs text-[#6f604b]">
                      {mission.estimatedMinutes} phút · Mức {mission.difficulty}
                    </p>
                    <span className="mt-2 inline-block rounded-full bg-white/80 px-2 py-1 text-[10px] font-black">
                      {mission.completed
                        ? "Chơi lại"
                        : mission.recommended
                          ? "Gợi ý hôm nay"
                          : mission.unlocked
                            ? "Bắt đầu"
                            : "Hoàn thành nhiệm vụ trước"}
                    </span>
                  </div>
                </Card>
              );
              return mission.unlocked ? (
                <Link key={mission.id} href={`/missions/${mission.slug}`}>
                  {card}
                </Link>
              ) : (
                <div key={mission.id}>{card}</div>
              );
            })}
          </div>
        </section>
      ))}
    </div>
  );
}
