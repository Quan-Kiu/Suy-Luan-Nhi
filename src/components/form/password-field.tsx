"use client";

import { Eye, EyeOff } from "lucide-react";
import { useRef, useState } from "react";
import type { InputHTMLAttributes } from "react";
import type { UseFormRegisterReturn } from "react-hook-form";
import { FieldShell } from "@/components/form/field-shell";
import { formControlClass } from "@/components/form/text-field";
import { cn } from "@/lib/utils";

type Props = Omit<InputHTMLAttributes<HTMLInputElement>, "name" | "type"> & {
  label: string;
  registration: UseFormRegisterReturn;
  error?: string;
  description?: string;
  containerClassName?: string;
  toggleLabel?: string;
  showTitle?: string;
  hideTitle?: string;
};

type Selection = { start: number | null; end: number | null };

export function PasswordField({
  label,
  registration,
  error,
  description,
  containerClassName,
  className,
  required,
  autoComplete = "current-password",
  autoCapitalize = "none",
  autoCorrect = "off",
  spellCheck = false,
  disabled,
  toggleLabel,
  showTitle = "Hiện mật khẩu",
  hideTitle = "Ẩn mật khẩu",
  ...props
}: Props) {
  const [visible, setVisible] = useState(false);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const restoreAfterPointer = useRef(false);
  const selection = useRef<Selection | null>(null);
  const id = props.id ?? registration.name;
  const resolvedToggleLabel = toggleLabel ?? `Hiện hoặc ẩn ${label.toLocaleLowerCase("vi-VN")}`;
  const { ref: registrationRef, ...registrationProps } = registration;

  function rememberPointerSelection() {
    const input = inputRef.current;
    restoreAfterPointer.current = true;
    selection.current = input ? { start: input.selectionStart, end: input.selectionEnd } : null;
  }

  function toggleVisibility() {
    setVisible((current) => !current);

    if (!restoreAfterPointer.current) return;
    restoreAfterPointer.current = false;
    const savedSelection = selection.current;

    requestAnimationFrame(() => {
      const input = inputRef.current;
      if (!input) return;
      input.focus({ preventScroll: true });
      if (savedSelection && savedSelection.start !== null && savedSelection.end !== null) {
        input.setSelectionRange(savedSelection.start, savedSelection.end);
      }
    });
  }

  return (
    <FieldShell
      id={id}
      label={label}
      description={description}
      error={error}
      required={required}
      className={containerClassName}
    >
      <div className="relative">
        <input
          {...props}
          {...registrationProps}
          ref={(node) => {
            inputRef.current = node;
            registrationRef(node);
          }}
          id={id}
          type={visible ? "text" : "password"}
          required={required}
          disabled={disabled}
          autoComplete={autoComplete}
          autoCapitalize={autoCapitalize}
          autoCorrect={autoCorrect}
          spellCheck={spellCheck}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? `${id}-error` : description ? `${id}-description` : undefined}
          className={cn(formControlClass, "pr-14", className)}
        />
        <button
          type="button"
          disabled={disabled}
          aria-label={resolvedToggleLabel}
          aria-controls={id}
          aria-pressed={visible}
          title={visible ? hideTitle : showTitle}
          onPointerDown={rememberPointerSelection}
          onPointerCancel={() => {
            restoreAfterPointer.current = false;
          }}
          onClick={toggleVisibility}
          className="absolute top-1/2 right-0.5 flex size-11 -translate-y-1/2 items-center justify-center rounded-xl text-[#806d54] transition hover:bg-[#f5ead8] hover:text-[#c55312] focus-visible:ring-2 focus-visible:ring-[#e9641a] focus-visible:ring-offset-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50"
        >
          {visible ? <EyeOff aria-hidden="true" size={20} /> : <Eye aria-hidden="true" size={20} />}
        </button>
      </div>
    </FieldShell>
  );
}
