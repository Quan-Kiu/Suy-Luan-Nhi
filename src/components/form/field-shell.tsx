import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function FieldShell({
  id,
  label,
  description,
  error,
  required,
  className,
  children,
}: {
  id: string;
  label: string;
  description?: string;
  error?: string;
  required?: boolean;
  className?: string;
  children: ReactNode;
}) {
  const descriptionId = description ? `${id}-description` : undefined;
  const errorId = error ? `${id}-error` : undefined;
  return (
    <label htmlFor={id} className={cn("block font-bold", className)}>
      <span>
        {label}
        {required ? <span aria-hidden="true"> *</span> : null}
      </span>
      {description ? (
        <span id={descriptionId} className="mt-1 block text-sm font-normal text-[#806d54]">
          {description}
        </span>
      ) : null}
      <span className="mt-2 block">{children}</span>
      {error ? (
        <span id={errorId} role="alert" className="mt-1 block text-sm font-bold text-red-700">
          {error}
        </span>
      ) : null}
    </label>
  );
}
