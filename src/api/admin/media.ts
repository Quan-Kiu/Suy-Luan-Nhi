import { apiRequest } from "@/lib/api/client";
import type { MediaCategory } from "@/domain/media";

export type MediaItem = {
  id: string;
  type: "image" | "audio" | "video";
  storageProvider: "local" | "s3" | "cloudinary";
  category: string;
  url: string;
  altText: string;
  fileName: string;
  mimeType: string;
  size: number;
  safetyStatus: "pending" | "approved" | "rejected";
  createdAt: string;
};

export type MediaListFilters = {
  type?: "image" | "audio" | "video";
  category?: string;
  safetyStatus?: "pending" | "approved" | "rejected";
  storageProvider?: "local" | "s3" | "cloudinary";
  search?: string;
  page?: number;
  pageSize?: number;
};
export type MediaPage = {
  items: MediaItem[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
  facets: {
    types: string[];
    categories: string[];
    safetyStatuses: string[];
    storageProviders: string[];
  };
};

export const mediaApi = {
  list(filters: MediaListFilters = {}) {
    return apiRequest<MediaPage>({ url: "/api/admin/media", method: "GET", params: filters });
  },
  upload(file: File, altText: string, category: MediaCategory) {
    const data = new FormData();
    data.set("file", file);
    data.set("altText", altText);
    data.set("category", category);
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
