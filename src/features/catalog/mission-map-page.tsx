"use client";

import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { catalogApi } from "@/api/catalog";
import { Card } from "@/components/ui";
import { ErrorState, LoadingState } from "@/components/states";
import { contentText, useContent } from "@/content/client";
import { MissionMapView } from "@/features/catalog/mission-map-view";
import { useActiveChild } from "@/features/child/active-child-context";
import { queryKeys } from "@/lib/query/keys";

export function MissionMapPage() {
  const child = useActiveChild();
  const content = useContent("child");
  const router = useRouter();
  const missionMapQuery = useQuery({
    queryKey: child ? queryKeys.children.missionMap(child.id) : queryKeys.children.noActiveMissionMap,
    queryFn: () => catalogApi.getMissionMap(child!.id),
    enabled: Boolean(child),
    staleTime: 5 * 60_000,
    gcTime: 30 * 60_000,
  });

  useEffect(() => {
    if (!child) router.replace("/onboarding");
  }, [child, router]);

  if (!child) return null;

  return (
    <main className="paper-texture min-h-[calc(100svh-5rem)] px-5 pt-5 pb-8">
      <Card className="mb-6 p-4" data-testid="mission-map-intro">
        <p className="type-supporting text-[#806d54]" data-testid="mission-map-profile-label">
          {contentText(content, "journey.label", "Hành trình của")}
        </p>
        <h1
          className="type-child-page-title mt-2 max-w-full break-words"
          data-testid="mission-map-profile-name"
        >
          {child.displayName}
        </h1>
        <p className="type-supporting mt-2">
          {contentText(
            content,
            "journey.description",
            "Các nhiệm vụ mở dần theo cách bé khám phá, không có bảng xếp hạng.",
          )}
        </p>
      </Card>

      {missionMapQuery.isPending ? (
        <LoadingState label="Đang mở bản đồ nhiệm vụ..." />
      ) : missionMapQuery.isError ? (
        <ErrorState
          title="Chưa mở được bản đồ. Hãy thử lại."
          description={missionMapQuery.error.message}
          onRetry={() => void missionMapQuery.refetch()}
        />
      ) : (
        <MissionMapView data={missionMapQuery.data} content={content} />
      )}
    </main>
  );
}
