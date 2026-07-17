import type { TextareaHTMLAttributes } from "react";
import type { UseFormRegisterReturn } from "react-hook-form";
import { FieldShell } from "@/components/form/field-shell";
import { formControlClass } from "@/components/form/text-field";
import { cn } from "@/lib/utils";

type Props = Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, "name"> & {
  label: string;
  registration: UseFormRegisterReturn;
  error?: string;
  description?: string;
  containerClassName?: string;
};

export function TextareaField({
  label,
  registration,
  error,
  description,
  containerClassName,
  className,
  ...props
}: Props) {
  const id = props.id ?? registration.name;
  return (
    <FieldShell id={id} label={label} description={description} error={error} className={containerClassName}>
      <textarea
        {...props}
        {...registration}
        id={id}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? `${id}-error` : description ? `${id}-description` : undefined}
        className={cn(formControlClass, "py-3", className)}
      />
    </FieldShell>
  );
}
