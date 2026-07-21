import type { SelectHTMLAttributes } from "react";
import type { UseFormRegisterReturn } from "react-hook-form";
import { FieldShell } from "@/components/form/field-shell";
import { formControlClass } from "@/components/form/text-field";
import { cn } from "@/lib/utils";

type Option = { value: string; label: string; disabled?: boolean };
type Props = Omit<SelectHTMLAttributes<HTMLSelectElement>, "name"> & {
  label: string;
  options: readonly Option[];
  registration: UseFormRegisterReturn;
  error?: string;
  description?: string;
  containerClassName?: string;
};

export function SelectField({
  label,
  options,
  registration,
  error,
  description,
  containerClassName,
  className,
  required,
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
      <select
        {...props}
        {...registration}
        id={id}
        required={required}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? `${id}-error` : description ? `${id}-description` : undefined}
        className={cn(formControlClass, className)}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value} disabled={option.disabled}>
            {option.label}
          </option>
        ))}
      </select>
    </FieldShell>
  );
}
