"use client";

import { useCallback, useState } from "react";
import { signOut } from "@/auth/client";
import { usePendingRouter } from "@/hooks/use-pending-router";

export function useSignOutNavigation(target: string) {
  const navigation = usePendingRouter();
  const [signingOut, setSigningOut] = useState(false);
  const pending = signingOut || navigation.isPending;

  const signOutAndNavigate = useCallback(async () => {
    if (pending) return;
    setSigningOut(true);
    try {
      await signOut();
      navigation.push(target);
    } catch {
      setSigningOut(false);
    }
  }, [navigation, pending, target]);

  return { pending, signOutAndNavigate };
}
