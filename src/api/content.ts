import { apiRequest } from "@/lib/api/client";
import type { ContentDictionary, ContentValue } from "@/content/types";

export const contentApi = {
  getNamespace(namespace: string, locale = "vi") {
    return apiRequest<ContentDictionary>({
      url: "/api/content",
      method: "GET",
      params: { namespace, locale },
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
};
