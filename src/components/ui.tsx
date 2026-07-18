import type { ButtonHTMLAttributes, HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export function Card({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "rounded-[28px] border border-[#eadfc9] bg-white/90 shadow-[0_18px_45px_rgba(92,62,26,0.10)]",
        className,
      )}
      {...props}
    />
  );
}

export function Button({ className, ...props }: ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      className={cn(
        "min-h-12 rounded-2xl bg-[#b9470d] px-5 py-3 font-extrabold text-white shadow-[0_8px_0_#7f2e05] transition hover:-translate-y-0.5 hover:brightness-105 active:translate-y-1 active:shadow-none disabled:cursor-not-allowed disabled:opacity-50",
        className,
      )}
      {...props}
    />
  );
}

export function Pill({ className, ...props }: HTMLAttributes<HTMLSpanElement>) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-2 rounded-full border border-[#eadfc9] bg-[#fff9ed] px-3 py-1.5 text-sm font-bold text-[#5b472e]",
        className,
      )}
      {...props}
    />
  );
}
