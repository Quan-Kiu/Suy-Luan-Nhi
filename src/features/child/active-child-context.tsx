"use client";

import { createContext, useContext, useState, type Dispatch, type SetStateAction } from "react";
import type { ChildSummary } from "@/api/children";

type ActiveChildContextValue = ChildSummary | null;
type ActiveChildSetter = Dispatch<SetStateAction<ActiveChildContextValue>>;

const ActiveChildContext = createContext<ActiveChildContextValue>(null);
const ActiveChildSetterContext = createContext<ActiveChildSetter | null>(null);

export function ActiveChildProvider({
  child,
  children,
}: {
  child: ActiveChildContextValue;
  children: React.ReactNode;
}) {
  const [activeChild, setActiveChild] = useState(child);
  return (
    <ActiveChildSetterContext.Provider value={setActiveChild}>
      <ActiveChildContext.Provider value={activeChild}>{children}</ActiveChildContext.Provider>
    </ActiveChildSetterContext.Provider>
  );
}

export function useActiveChild() {
  return useContext(ActiveChildContext);
}

export function useSetActiveChild() {
  const setActiveChild = useContext(ActiveChildSetterContext);
  if (!setActiveChild) throw new Error("useSetActiveChild must be used inside ActiveChildProvider");
  return setActiveChild;
}
