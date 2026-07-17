import type { TextareaHTMLAttributes } from "react";
import { FieldShell } from "@/components/form/field-shell";
import { formControlClass } from "@/components/form/text-field";
import { cn } from "@/lib/utils";

type Props = Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, "value" | "onChange"> & {
  label: string;
  value: string;
  onValueChange: (value: string) => void;
  error?: string;
  description?: string;
  containerClassName?: string;
};

export function ControlledTextareaField({
  label,
  value,
  onValueChange,
  error,
  description,
  containerClassName,
  className,
  ...props
}: Props) {
  const id = props.id ?? label;
  return (
    <FieldShell id={id} label={label} description={description} error={error} className={containerClassName}>
      <textarea
        {...props}
        id={id}
        value={value}
        onChange={(event) => onValueChange(event.target.value)}
        aria-invalid={Boolean(error)}
        className={cn(formControlClass, "py-3", className)}
      />
    </FieldShell>
  );
}
