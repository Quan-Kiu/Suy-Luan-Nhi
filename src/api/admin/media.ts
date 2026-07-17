import { apiRequest } from "@/lib/api/client";

export type MediaItem = {
  id: string;
  type: "image" | "audio";
  url: string;
  altText: string;
  fileName: string;
  mimeType: string;
  size: number;
  safetyStatus: "pending" | "approved" | "rejected";
  createdAt: Date;
};

export const mediaApi = {
  upload(file: File, altText: string) {
    const data = new FormData();
    data.set("file", file);
    data.set("altText", altText);
    return apiRequest<MediaItem>({ url: "/api/admin/media", method: "POST", data });
  },
  review(mediaId: string, approved: boolean) {
    return apiRequest<MediaItem>({
      url: `/api/admin/media/${mediaId}`,
      method: "PATCH",
      data: { approved },
    });
  },
  remove(mediaId: string) {
    return apiRequest({ url: `/api/admin/media/${mediaId}`, method: "DELETE" });
  },
};
