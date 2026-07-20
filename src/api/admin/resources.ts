import { apiRequest } from "@/lib/api/client";
import type { AgeGroup } from "@/domain/age-groups";
import type { ParentResourceCategory, ParentResourceType } from "@/domain/parent-resources";

export type AdminResourceStatus = "draft" | "published" | "archived";

export type AdminResourceItem = {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  resourceType: ParentResourceType;
  category: ParentResourceCategory;
  ageGroups: AgeGroup[];
  coverUrl: string | null;
  mediaUrl: string | null;
  status: AdminResourceStatus;
  sortOrder: number;
  publishedAt: string | Date | null;
  updatedAt: string | Date;
};

export type AdminResourceInput = Omit<AdminResourceItem, "id" | "publishedAt" | "updatedAt"> & {
  coverUrl: string;
};

export type AdminResourceFilters = {
  search?: string;
  status?: AdminResourceStatus;
  resourceType?: ParentResourceType;
  category?: ParentResourceCategory;
  ageGroup?: AgeGroup;
  page?: number;
  pageSize?: number;
};
export type AdminResourcePage = {
  items: AdminResourceItem[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
};

export const adminResourcesApi = {
  list(filters: AdminResourceFilters = {}) {
    return apiRequest<AdminResourcePage>({ url: "/api/admin/resources", method: "GET", params: filters });
  },
  create(input: AdminResourceInput) {
    return apiRequest<AdminResourceItem>({ url: "/api/admin/resources", method: "POST", data: input });
  },
  update(resourceId: string, input: AdminResourceInput) {
    return apiRequest<AdminResourceItem>({
      url: `/api/admin/resources/${resourceId}`,
      method: "PATCH",
      data: input,
    });
  },
  archive(resourceId: string) {
    return apiRequest<AdminResourceItem>({
      url: `/api/admin/resources/${resourceId}`,
      method: "DELETE",
    });
  },
};
