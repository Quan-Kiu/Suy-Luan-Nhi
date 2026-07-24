import { apiRequest } from "@/lib/api/client";

export type ChildBadgeCollectionItem = {
  id: string;
  name: string;
  description: string;
  iconUrl: string;
  skillTitle: string | null;
  earned: boolean;
  unlockedAt: string | null;
  sourceMissionTitle: string | null;
};

export type ChildBadgeCollectionResponse = {
  child: {
    id: string;
    displayName: string;
    avatarUrl: string;
  };
  items: ChildBadgeCollectionItem[];
};

export const childBadgesApi = {
  getCollection(childId: string) {
    return apiRequest<ChildBadgeCollectionResponse>({
      url: `/api/children/${childId}/badges`,
      method: "GET",
    });
  },
};
