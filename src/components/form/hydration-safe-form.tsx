"use client";

import type { FormHTMLAttributes, ReactNode } from "react";
import { useHydrated } from "@/hooks/use-hydrated";
import { cn } from "@/lib/utils";

type Props = Omit<FormHTMLAttributes<HTMLFormElement>, "children"> & {
  children: ReactNode;
  busy?: boolean;
  fieldsetClassName?: string;
};

export function HydrationSafeForm({ children, busy = false, fieldsetClassName, ...props }: Props) {
  const hydrated = useHydrated();
  const inactive = !hydrated || busy;

  return (
    <form {...props} aria-busy={inactive || undefined}>
      <fieldset
        disabled={inactive}
        className={cn("min-w-0 border-0 p-0 disabled:cursor-wait", fieldsetClassName)}
      >
        {children}
      </fieldset>
    </form>
  );
}
