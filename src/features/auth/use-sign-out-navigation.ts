"use client";

import { useCallback, useState } from "react";
import { signOut } from "@/auth/client";

export function useSignOutNavigation(target: string) {
  const [pending, setPending] = useState(false);

  const signOutAndNavigate = useCallback(async () => {
    if (pending) return;
    setPending(true);
    try {
      await signOut();
      window.location.replace(target);
    } catch {
      setPending(false);
    }
  }, [pending, target]);

  return { pending, signOutAndNavigate };
}
