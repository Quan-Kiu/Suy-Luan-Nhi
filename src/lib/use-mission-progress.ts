"use client";

import { useMemo, useSyncExternalStore } from "react";
import { getProgressServerSnapshot, getProgressSnapshot, subscribeToProgress } from "@/lib/progress-store";

export function useCompletedMissionIds() {
  const rawProgress = useSyncExternalStore(
    subscribeToProgress,
    getProgressSnapshot,
    getProgressServerSnapshot,
  );
  return useMemo(() => {
    try {
      const value: unknown = JSON.parse(rawProgress);
      return Array.isArray(value) ? value.filter((item): item is string => typeof item === "string") : [];
    } catch {
      return [];
    }
  }, [rawProgress]);
}
