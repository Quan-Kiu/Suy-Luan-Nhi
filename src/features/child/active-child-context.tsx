"use client";

import { createContext, useContext } from "react";
import type { ChildSummary } from "@/api/children";

type ActiveChildContextValue = ChildSummary | null;

const ActiveChildContext = createContext<ActiveChildContextValue>(null);

export function ActiveChildProvider({
  child,
  children,
}: {
  child: ActiveChildContextValue;
  children: React.ReactNode;
}) {
  return <ActiveChildContext.Provider value={child}>{children}</ActiveChildContext.Provider>;
}

export function useActiveChild() {
  return useContext(ActiveChildContext);
}
