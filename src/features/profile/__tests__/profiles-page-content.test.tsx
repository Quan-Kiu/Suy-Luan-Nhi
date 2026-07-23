import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import type { ChildProfile } from "@/api/children";
import { ActiveChildProvider } from "@/features/child/active-child-context";
import { ProfilesPageContent } from "@/features/profile/profiles-page-content";
import { queryKeys } from "@/lib/query/keys";

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn(), replace: vi.fn(), refresh: vi.fn(), prefetch: vi.fn() }),
}));

const createdProfile: ChildProfile = {
  id: "585eb88b-c628-4a76-ae55-c60dcbb51234",
  displayName: "Mít Đầu Tiên",
  ageGroup: "6-8",
  avatarAssetId: "b071b5d0-1f48-4f1b-8b32-66537e17c001",
  avatarUrl: "/assets/mascots/mascot-dog-bong-avatar.png",
  currentRank: "Nhà thám hiểm nhí",
  status: "active",
  deletionRequestedAt: null,
};

describe("ProfilesPageContent", () => {
  it("prefers the mutation cache over stale empty server props", () => {
    const queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false, staleTime: Number.POSITIVE_INFINITY },
        mutations: { retry: false },
      },
    });
    queryClient.setQueryData<ChildProfile[]>(queryKeys.children.list, [createdProfile]);

    render(
      <QueryClientProvider client={queryClient}>
        <ActiveChildProvider child={createdProfile}>
          <ProfilesPageContent profiles={[]} deletedProfiles={[]} maxProfiles={5} />
        </ActiveChildProvider>
      </QueryClientProvider>,
    );

    expect(screen.getByRole("heading", { name: "Chọn hồ sơ của bé" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Mít Đầu Tiên" })).toBeInTheDocument();
    expect(screen.queryByRole("link", { name: "Tạo hồ sơ đầu tiên" })).not.toBeInTheDocument();
  });
});
