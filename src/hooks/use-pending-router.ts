"use client";

import { useRouter } from "next/navigation";
import { useCallback, useTransition } from "react";

export function usePendingRouter() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const push = useCallback(
    (href: string) => {
      startTransition(() => router.push(href));
    },
    [router],
  );

  const replace = useCallback(
    (href: string) => {
      startTransition(() => router.replace(href));
    },
    [router],
  );

  const refresh = useCallback(() => {
    startTransition(() => router.refresh());
  }, [router]);

  return {
    push,
    replace,
    refresh,
    prefetch: router.prefetch,
    isPending,
  };
}
