"use client";

import type { KeyboardEvent, ReactNode } from "react";
import { useRef } from "react";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export type AdminTabItem<Value extends string> = {
  value: Value;
  label: string;
  icon: LucideIcon;
  count?: number;
  ariaLabel?: string;
};

export function AdminTabs<Value extends string>({
  items,
  value,
  onValueChange,
  ariaLabel,
  idPrefix,
  className,
}: {
  items: AdminTabItem<Value>[];
  value: Value;
  onValueChange: (value: Value) => void;
  ariaLabel: string;
  idPrefix: string;
  className?: string;
}) {
  const tabRefs = useRef<Array<HTMLButtonElement | null>>([]);

  function selectTab(index: number, focus = false) {
    const item = items[index];
    if (!item) return;
    onValueChange(item.value);
    if (focus) tabRefs.current[index]?.focus();
  }

  function handleKeyDown(event: KeyboardEvent<HTMLButtonElement>, currentIndex: number) {
    let nextIndex: number | null = null;
    if (event.key === "ArrowRight") nextIndex = (currentIndex + 1) % items.length;
    if (event.key === "ArrowLeft") nextIndex = (currentIndex - 1 + items.length) % items.length;
    if (event.key === "Home") nextIndex = 0;
    if (event.key === "End") nextIndex = items.length - 1;
    if (nextIndex === null) return;
    event.preventDefault();
    selectTab(nextIndex, true);
  }

  return (
    <div
      role="tablist"
      aria-label={ariaLabel}
      className={cn("flex w-fit max-w-full flex-wrap gap-1 rounded-xl border bg-white p-1", className)}
    >
      {items.map((item, index) => {
        const selected = item.value === value;
        const Icon = item.icon;
        return (
          <button
            key={item.value}
            ref={(element) => {
              tabRefs.current[index] = element;
            }}
            id={`${idPrefix}-tab-${item.value}`}
            type="button"
            role="tab"
            aria-selected={selected}
            aria-controls={`${idPrefix}-panel-${item.value}`}
            aria-label={item.ariaLabel ?? item.label}
            tabIndex={selected ? 0 : -1}
            onClick={() => selectTab(index)}
            onKeyDown={(event) => handleKeyDown(event, index)}
            className={cn(
              "type-action inline-flex min-h-10 min-w-0 items-center justify-center gap-2 rounded-lg px-3 py-2 font-black transition",
              selected ? "bg-[#3f392f] text-white" : "text-[#62594e] hover:bg-[#f7f3eb]",
            )}
          >
            <Icon aria-hidden="true" className="shrink-0" size={17} />
            <span className="truncate">{item.label}</span>
            {typeof item.count === "number" ? (
              <span
                aria-hidden="true"
                className={cn(
                  "type-caption shrink-0 rounded-full px-2 py-0.5 font-black",
                  selected ? "bg-white/15 text-white" : "bg-[#f7f3eb] text-[#62594e]",
                )}
              >
                {item.count}
              </span>
            ) : null}
          </button>
        );
      })}
    </div>
  );
}

export function AdminTabPanel({
  idPrefix,
  value,
  children,
  className,
}: {
  idPrefix: string;
  value: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section
      id={`${idPrefix}-panel-${value}`}
      role="tabpanel"
      aria-labelledby={`${idPrefix}-tab-${value}`}
      tabIndex={0}
      className={cn(
        "outline-none focus-visible:ring-2 focus-visible:ring-[#c45a16] focus-visible:ring-offset-2",
        className,
      )}
    >
      {children}
    </section>
  );
}
