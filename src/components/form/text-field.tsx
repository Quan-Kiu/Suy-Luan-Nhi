import type { InputHTMLAttributes } from "react";
import type { UseFormRegisterReturn } from "react-hook-form";
import { FieldShell } from "@/components/form/field-shell";
import { cn } from "@/lib/utils";

export const formControlClass =
  "type-body min-h-12 w-full rounded-2xl border-2 border-[#eadfc9] bg-[#fffdf8] px-4 outline-none transition focus:border-[#e9641a] disabled:cursor-not-allowed disabled:bg-[#f5f2ec]";

type Props = Omit<InputHTMLAttributes<HTMLInputElement>, "name"> & {
  label: string;
  registration: UseFormRegisterReturn;
  error?: string;
  description?: string;
  containerClassName?: string;
};

export function TextField({
  label,
  registration,
  error,
  description,
  containerClassName,
  className,
  required,
  autoComplete = "off",
  ...props
}: Props) {
  const id = props.id ?? registration.name;
  return (
    <FieldShell
      id={id}
      label={label}
      description={description}
      error={error}
      required={required}
      className={containerClassName}
    >
      <input
        {...props}
        {...registration}
        id={id}
        required={required}
        autoComplete={autoComplete}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? `${id}-error` : description ? `${id}-description` : undefined}
        className={cn(formControlClass, className)}
      />
    </FieldShell>
  );
}
