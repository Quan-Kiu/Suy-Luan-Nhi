import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type FieldShellProps = {
  id: string;
  label: string;
  description?: string;
  error?: string;
  required?: boolean;
  className?: string;
  children: ReactNode;
};

export function FieldShell({
  id,
  label,
  description,
  error,
  required,
  className,
  children,
}: FieldShellProps) {
  const message = error ?? description;
  const messageId = error ? `${id}-error` : description ? `${id}-description` : undefined;

  return (
    <label htmlFor={id} className={cn("grid content-start gap-2 font-bold", className)}>
      <span>
        {label}
        {required ? <span aria-hidden="true"> *</span> : null}
      </span>
      <span className="block">{children}</span>
      <span
        id={messageId}
        role={error ? "alert" : undefined}
        aria-hidden={message ? undefined : true}
        className={cn(
          "block min-h-5 text-sm leading-5 font-normal",
          error ? "font-bold text-red-700" : "text-[#806d54]",
        )}
      >
        {message ?? "\u00a0"}
      </span>
    </label>
  );
}
