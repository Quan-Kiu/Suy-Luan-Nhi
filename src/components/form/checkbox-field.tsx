import type { InputHTMLAttributes, ReactNode } from "react";
import type { UseFormRegisterReturn } from "react-hook-form";
import { cn } from "@/lib/utils";

type Props = Omit<InputHTMLAttributes<HTMLInputElement>, "name" | "type"> & {
  label: ReactNode;
  registration: UseFormRegisterReturn;
  error?: string;
  description?: string;
};

export function CheckboxField({ label, registration, error, description, className, ...props }: Props) {
  const id = props.id ?? registration.name;
  return (
    <div>
      <label htmlFor={id} className="flex items-start gap-3 text-sm font-bold">
        <input
          {...props}
          {...registration}
          id={id}
          type="checkbox"
          aria-invalid={Boolean(error)}
          className={cn("mt-0.5 size-5 shrink-0 accent-[#e9641a]", className)}
        />
        <span>
          {label}
          {description ? (
            <small className="mt-1 block font-normal text-[#806d54]">{description}</small>
          ) : null}
        </span>
      </label>
      {error ? (
        <p role="alert" className="mt-1 text-sm font-bold text-red-700">
          {error}
        </p>
      ) : null}
    </div>
  );
}
