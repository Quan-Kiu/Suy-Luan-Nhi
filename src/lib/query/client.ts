import { QueryClient } from "@tanstack/react-query";
import { ApiRequestError } from "@/lib/api/error";

const QUERY_STALE_TIME_MS = 5 * 60_000;
const QUERY_GC_TIME_MS = 30 * 60_000;

function shouldRetry(failureCount: number, error: unknown) {
  if (error instanceof ApiRequestError && error.status && error.status < 500) return false;
  return failureCount < 2;
}

export function createAppQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: QUERY_STALE_TIME_MS,
        gcTime: QUERY_GC_TIME_MS,
        retry: shouldRetry,
        refetchOnWindowFocus: false,
      },
      mutations: { retry: false },
    },
  });
}
