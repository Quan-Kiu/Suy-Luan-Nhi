"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Play } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui";
import { requestJson } from "@/lib/http";
export function StartMissionButton({ childId, missionId }: { childId: string; missionId: string }) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  return (
    <Button
      type="button"
      className="w-full"
      disabled={pending}
      onClick={async () => {
        setPending(true);
        try {
          const result = await requestJson<{ session: { id: string } }>(
            `/api/children/${childId}/missions/${missionId}/start`,
            { method: "POST" },
          );
          router.push(`/play/${result.session.id}`);
        } catch (e) {
          toast.error(e instanceof Error ? e.message : "Không thể bắt đầu nhiệm vụ");
          setPending(false);
        }
      }}
    >
      <Play size={20} className="mr-2 inline" />
      {pending ? "Bống đang chuẩn bị..." : "Bắt đầu nhiệm vụ"}
    </Button>
  );
}
