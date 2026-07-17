import { QueryClient } from "@tanstack/react-query";
import { ApiRequestError } from "@/lib/api/error";

function shouldRetry(failureCount: number, error: unknown) {
  if (error instanceof ApiRequestError && error.status && error.status < 500) return false;
  return failureCount < 2;
}

export function createAppQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 60_000,
        gcTime: 10 * 60_000,
        retry: shouldRetry,
        refetchOnWindowFocus: false,
      },
      mutations: { retry: false },
    },
  });
}
