import { apiRequest } from "@/lib/api/client";

export type ChildAvatarOption = {
  id: string;
  url: string;
  altText: string;
};

export const childAvatarsApi = {
  list() {
    return apiRequest<ChildAvatarOption[]>({ url: "/api/child-avatars", method: "GET" });
  },
};
