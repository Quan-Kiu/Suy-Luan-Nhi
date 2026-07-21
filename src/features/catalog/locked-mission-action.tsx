"use client";

import { toast } from "sonner";
import { useSoundEffects } from "@/features/sound/sound-effects-provider";

export function LockedMissionAction({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  const sound = useSoundEffects();
  return (
    <button
      type="button"
      className="block h-full w-full text-left"
      onClick={() => {
        void sound.play("mission.locked");
        toast.error("Nhiệm vụ này chưa mở", {
          id: `locked-mission-${title}`,
          description,
          duration: 5000,
        });
      }}
      aria-label={`${title}. Nhiệm vụ này chưa mở. ${description}`}
    >
      {children}
    </button>
  );
}
