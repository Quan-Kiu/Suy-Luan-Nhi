"use client";

import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { childBadgesApi } from "@/api/child-badges";
import { ErrorState, LoadingState } from "@/components/states";
import { BadgeCollection } from "@/features/badges/badge-collection";
import { useActiveChild } from "@/features/child/active-child-context";
import { queryKeys } from "@/lib/query/keys";

export function BadgeCollectionPage() {
  const child = useActiveChild();
  const router = useRouter();
  const collectionQuery = useQuery({
    queryKey: child ? queryKeys.children.badges(child.id) : queryKeys.children.noActiveBadges,
    queryFn: () => childBadgesApi.getCollection(child!.id),
    enabled: Boolean(child),
    staleTime: 5 * 60_000,
    refetchOnMount: "always",
    gcTime: 30 * 60_000,
  });

  useEffect(() => {
    if (!child) router.replace("/onboarding");
  }, [child, router]);

  if (!child) return null;

  return (
    <main
      data-child-layout="wide"
      className="paper-texture min-h-[calc(100svh-5rem)] px-4 py-5 pb-10 sm:px-6 sm:py-7"
    >
      {collectionQuery.isPending ? (
        <div className="mx-auto max-w-5xl">
          <LoadingState label="Đang mở bộ sưu tập huy hiệu..." />
        </div>
      ) : collectionQuery.isError ? (
        <div className="mx-auto max-w-5xl">
          <ErrorState
            title="Chưa mở được bộ sưu tập huy hiệu."
            description={collectionQuery.error.message}
            onRetry={() => void collectionQuery.refetch()}
          />
        </div>
      ) : (
        <BadgeCollection
          childName={collectionQuery.data.child.displayName}
          childAvatarUrl={collectionQuery.data.child.avatarUrl}
          items={collectionQuery.data.items}
        />
      )}
    </main>
  );
}
