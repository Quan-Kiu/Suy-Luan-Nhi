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
    <div className={cn("grid content-start gap-2 font-bold", className)}>
      <label htmlFor={id}>
        {label}
        {required ? <span aria-hidden="true"> *</span> : null}
      </label>
      <div>{children}</div>
      {message ? (
        <span
          id={messageId}
          role={error ? "alert" : undefined}
          className={cn(
            "block text-sm leading-5 font-normal",
            error ? "font-bold text-red-700" : "text-[#806d54]",
          )}
        >
          {message}
        </span>
      ) : null}
    </div>
  );
}
