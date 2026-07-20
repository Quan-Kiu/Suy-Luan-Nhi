import { apiRequest } from "@/lib/api/client";
import type { ParentResourceCategory, ParentResourceType } from "@/domain/parent-resources";

export type ParentResourceItem = {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  resourceType: ParentResourceType;
  category: ParentResourceCategory;
  ageGroups: string[];
  coverUrl: string | null;
  mediaUrl: string | null;
};

export type ParentResourceFilters = {
  resourceType?: ParentResourceType;
  category?: ParentResourceCategory;
  search?: string;
  page?: number;
  pageSize?: number;
};

export type ParentResourcePage = {
  items: ParentResourceItem[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
  facets: { resourceTypes: string[]; categories: string[] };
};

export const parentResourcesApi = {
  list(filters: ParentResourceFilters = {}) {
    return apiRequest<ParentResourcePage>({ url: "/api/parent/resources", method: "GET", params: filters });
  },
};
