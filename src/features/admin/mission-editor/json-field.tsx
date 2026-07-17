"use client";

import { useState } from "react";
import { FieldShell } from "@/components/form/field-shell";
import { formControlClass } from "@/components/form/text-field";
import { cn } from "@/lib/utils";

export function MissionJsonField({
  label,
  value,
  rows,
  placeholder,
  onValidChange,
}: {
  label: string;
  value: unknown;
  rows: number;
  placeholder?: string;
  onValidChange: (value: unknown) => void;
}) {
  const [text, setText] = useState(() => JSON.stringify(value, null, 2));
  const [error, setError] = useState<string>();

  return (
    <FieldShell id={label} label={label} error={error}>
      <textarea
        rows={rows}
        value={text}
        placeholder={placeholder}
        aria-invalid={Boolean(error)}
        className={cn(formControlClass, "py-3 font-mono text-xs")}
        onChange={(event) => {
          const next = event.target.value;
          setText(next);
          try {
            onValidChange(JSON.parse(next) as unknown);
            setError(undefined);
          } catch {
            setError("JSON chưa hợp lệ. Hãy kiểm tra dấu ngoặc và dấu phẩy.");
          }
        }}
      />
    </FieldShell>
  );
}
