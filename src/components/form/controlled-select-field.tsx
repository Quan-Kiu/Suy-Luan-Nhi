import type { SelectHTMLAttributes } from "react";
import { FieldShell } from "@/components/form/field-shell";
import { formControlClass } from "@/components/form/text-field";
import { cn } from "@/lib/utils";

type Option = { value: string; label: string; disabled?: boolean };
type Props = Omit<SelectHTMLAttributes<HTMLSelectElement>, "value" | "onChange"> & {
  label: string;
  value: string;
  onValueChange: (value: string) => void;
  options: readonly Option[];
  error?: string;
  description?: string;
  containerClassName?: string;
};

export function ControlledSelectField({
  label,
  value,
  onValueChange,
  options,
  error,
  description,
  containerClassName,
  className,
  ...props
}: Props) {
  const id = props.id ?? label;
  return (
    <FieldShell id={id} label={label} description={description} error={error} className={containerClassName}>
      <select
        {...props}
        id={id}
        value={value}
        onChange={(event) => onValueChange(event.target.value)}
        aria-invalid={Boolean(error)}
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
