"use client";

import { useMutation } from "@tanstack/react-query";
import { Play } from "lucide-react";
import { gameplayApi } from "@/api/gameplay";
import { AsyncButton } from "@/components/async-button";
import { FormStatus } from "@/components/form";
import { contentText, useContent } from "@/content/client";
import { usePendingRouter } from "@/hooks/use-pending-router";

export function StartMissionButton({ childId, missionId }: { childId: string; missionId: string }) {
  const content = useContent("gameplay");
  const navigation = usePendingRouter();
  const mutation = useMutation({
    mutationFn: () => gameplayApi.startMission(childId, missionId),
    onSuccess: ({ session }) => navigation.push(`/play/${session.id}`),
  });

  return (
    <div className="space-y-3">
      <AsyncButton
        pending={mutation.isPending || navigation.isPending}
        pendingLabel={contentText(content, "mission.starting", "Bống đang chuẩn bị...")}
        onClick={() => mutation.mutate()}
        className="w-full"
      >
        <Play size={20} className="mr-2 inline" />
        {contentText(content, "mission.start", "Bắt đầu nhiệm vụ")}
      </AsyncButton>
      <FormStatus status={mutation.isError ? "error" : "idle"} message={mutation.error?.message} />
    </div>
  );
}
