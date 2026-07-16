"use client";

import { useMemo, useSyncExternalStore } from "react";
import { childProfileSchema, type ChildProfile } from "@/domain/schemas";
import { getProfileServerSnapshot, getProfileSnapshot, subscribeToProfile } from "@/lib/profile-store";

export function useChildProfile(): ChildProfile | null {
  const rawProfile = useSyncExternalStore(subscribeToProfile, getProfileSnapshot, getProfileServerSnapshot);
  return useMemo(() => {
    if (!rawProfile) return null;
    try {
      const result = childProfileSchema.safeParse(JSON.parse(rawProfile));
      return result.success ? result.data : null;
    } catch {
      return null;
    }
  }, [rawProfile]);
}
