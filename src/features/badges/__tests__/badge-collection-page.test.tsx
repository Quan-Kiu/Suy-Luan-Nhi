import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { childBadgesApi, type ChildBadgeCollectionResponse } from "@/api/child-badges";
import { BadgeCollectionPage } from "@/features/badges/badge-collection-page";
import { ActiveChildProvider } from "@/features/child/active-child-context";
import { queryKeys } from "@/lib/query/keys";

vi.mock("next/navigation", () => ({
  useRouter: () => ({ replace: vi.fn() }),
}));

vi.mock("@/content/client", () => ({
  useContent: () => ({}),
  contentText: (_content: unknown, _key: string, fallback: string) => fallback,
  contentTemplate: (
    _content: unknown,
    _key: string,
    fallback: string,
    variables: Record<string, string | number>,
  ) =>
    Object.entries(variables).reduce(
      (value, [key, replacement]) => value.replaceAll(`{${key}}`, String(replacement)),
      fallback,
    ),
}));

const child = {
  id: "585eb88b-c628-4a76-ae55-c60dcbb51234",
  displayName: "Bống",
  ageGroup: "6-8" as const,
};

const lockedCollection: ChildBadgeCollectionResponse = {
  child: { ...child, avatarUrl: "/assets/mascots/mascot-dog-bong-avatar.png" },
  items: [
    {
      id: "badge-1",
      name: "Thám tử tinh mắt",
      description: "Quan sát thật kỹ.",
      iconUrl: "/assets/props/badge-sharp-detective.png",
      skillTitle: "Quan sát",
      earned: false,
      unlockedAt: null,
      sourceMissionTitle: null,
    },
  ],
};

const earnedCollection: ChildBadgeCollectionResponse = {
  ...lockedCollection,
  items: [
    {
      ...lockedCollection.items[0],
      earned: true,
      unlockedAt: "2026-07-24T05:00:00.000Z",
      sourceMissionTitle: "Thám tử dấu chân",
    },
  ],
};

describe("BadgeCollectionPage", () => {
  it("replaces invalidated cached badge data without a browser reload", async () => {
    const queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false, staleTime: Number.POSITIVE_INFINITY } },
    });
    const queryKey = queryKeys.children.badges(child.id);
    queryClient.setQueryData(queryKey, lockedCollection);
    await queryClient.invalidateQueries({ queryKey });
    vi.spyOn(childBadgesApi, "getCollection").mockResolvedValue(earnedCollection);

    render(
      <QueryClientProvider client={queryClient}>
        <ActiveChildProvider child={child}>
          <BadgeCollectionPage />
        </ActiveChildProvider>
      </QueryClientProvider>,
    );

    expect(await screen.findByRole("button", { name: "Xem huy hiệu Thám tử tinh mắt" })).toBeVisible();
    expect(childBadgesApi.getCollection).toHaveBeenCalledWith(child.id);
  });
});
