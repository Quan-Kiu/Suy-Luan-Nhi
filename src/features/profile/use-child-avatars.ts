"use client";

import { useQuery } from "@tanstack/react-query";
import { childAvatarsApi } from "@/api/child-avatars";
import { queryKeys } from "@/lib/query/keys";

export function useChildAvatars() {
  return useQuery({
    queryKey: queryKeys.children.avatars,
    queryFn: childAvatarsApi.list,
    staleTime: 60 * 1000,
  });
}
