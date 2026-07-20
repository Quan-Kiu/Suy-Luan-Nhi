import { apiRequest } from "@/lib/api/client";
import type { ContentDictionary, ContentValue } from "@/content/types";

export type ContentEntryListFilters = {
  locale?: string;
  namespace?: string;
  category?: string;
  valueType?: "text" | "number" | "boolean" | "json";
  search?: string;
  page?: number;
  pageSize?: number;
};

export type ContentEntryListItem = {
  namespace: string;
  key: string;
  locale: string;
  category: string;
  valueType: "text" | "number" | "boolean" | "json";
  value: ContentValue;
  defaultValue: ContentValue;
  hasDefault: boolean;
  description: string;
  active: boolean;
  source: "default" | "database";
};

export type ContentEntryPage = {
  items: ContentEntryListItem[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
  facets: { namespaces: string[]; categories: string[]; valueTypes: string[] };
};
export const contentApi = {
  getNamespace(namespace: string, locale = "vi") {
    return apiRequest<ContentDictionary>({
      url: "/api/content",
      method: "GET",
      params: { namespace, locale },
    });
  },
  listAdmin(filters: ContentEntryListFilters = {}) {
    return apiRequest<ContentEntryPage>({
      url: "/api/admin/content",
      method: "GET",
      params: filters,
    });
  },
  update(input: {
    namespace: string;
    key: string;
    locale: string;
    value: ContentValue;
    description?: string;
    active?: boolean;
  }) {
    return apiRequest({ url: "/api/admin/content", method: "PATCH", data: input });
  },
  reset(input: { namespace: string; key: string; locale: string }) {
    return apiRequest({ url: "/api/admin/content", method: "DELETE", data: input });
  },
};
