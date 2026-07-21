"use client";

import { Braces } from "lucide-react";
import { useId, useMemo, useRef, useState } from "react";
import {
  contentVariableTag,
  findUnavailableContentVariableKeys,
  type ContentVariableDefinition,
} from "@/domain/content-variables";
import { cn } from "@/lib/utils";

type TemplateFieldProps = {
  id?: string;
  label: string;
  value: string;
  onValueChange: (value: string) => void;
  onBlur?: () => void;
  variables: readonly ContentVariableDefinition[];
  multiline?: boolean;
  rows?: number;
  placeholder?: string;
  description?: string;
  error?: string;
  containerClassName?: string;
  showHint?: boolean;
};

type Trigger = { start: number; query: string };

function findTrigger(value: string, caret: number): Trigger | null {
  const before = value.slice(0, caret);
  const start = before.lastIndexOf("{{");
  if (start < 0) return null;
  const query = before.slice(start + 2);
  if (query.includes("}}") || !/^[a-z0-9_]*$/i.test(query)) return null;
  return { start, query: query.toLowerCase() };
}

export function ContentTemplateField({
  id,
  label,
  value,
  onValueChange,
  onBlur,
  variables,
  multiline = false,
  rows = 4,
  placeholder,
  description,
  error,
  containerClassName,
  showHint = true,
}: TemplateFieldProps) {
  const generatedId = useId();
  const fieldId = id ?? `content-template-${generatedId.replace(/:/g, "")}`;
  const inputRef = useRef<HTMLInputElement | HTMLTextAreaElement | null>(null);
  const [open, setOpen] = useState(false);
  const [trigger, setTrigger] = useState<Trigger | null>(null);
  const enabledVariables = useMemo(() => variables.filter((item) => item.enabled), [variables]);
  const filtered = useMemo(() => {
    if (!trigger?.query) return enabledVariables;
    return enabledVariables.filter(
      (item) => item.key.includes(trigger.query) || item.label.toLowerCase().includes(trigger.query),
    );
  }, [enabledVariables, trigger]);
  const unavailable = findUnavailableContentVariableKeys(value, variables);

  function refreshTrigger(nextValue = value) {
    const element = inputRef.current;
    const nextTrigger = findTrigger(nextValue, element?.selectionStart ?? nextValue.length);
    setTrigger(nextTrigger);
    setOpen(Boolean(nextTrigger));
  }

  function insertVariable(key: string) {
    const element = inputRef.current;
    const caret = element?.selectionStart ?? value.length;
    const activeTrigger = trigger ?? findTrigger(value, caret);
    const start = activeTrigger?.start ?? caret;
    const end = activeTrigger ? caret : start;
    const tag = contentVariableTag(key);
    const nextValue = `${value.slice(0, start)}${tag}${value.slice(end)}`;
    onValueChange(nextValue);
    setOpen(false);
    setTrigger(null);
    requestAnimationFrame(() => {
      element?.focus();
      const nextCaret = start + tag.length;
      element?.setSelectionRange(nextCaret, nextCaret);
    });
  }

  const sharedProps = {
    id: fieldId,
    value,
    placeholder,
    onBlur,
    onFocus: () => refreshTrigger(),
    onClick: () => refreshTrigger(),
    onKeyUp: () => refreshTrigger(),
    onChange: (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      const nextValue = event.target.value;
      onValueChange(nextValue);
      requestAnimationFrame(() => refreshTrigger(nextValue));
    },
    className: cn(
      "w-full rounded-xl border bg-white px-3 py-2.5 text-sm outline-none transition focus:border-[#df6d24] focus:ring-4 focus:ring-[#f3b77f]/25",
      error && "border-red-400",
    ),
  };

  return (
    <div className={cn("relative space-y-1.5", containerClassName)}>
      <div className="flex items-center justify-between gap-3">
        <label htmlFor={fieldId} className="text-sm font-black text-[#3f382f]">
          {label}
        </label>
        <button
          type="button"
          onClick={() => {
            inputRef.current?.focus();
            setTrigger(null);
            setOpen((current) => !current);
          }}
          className="inline-flex items-center gap-1.5 rounded-lg border bg-[#fffaf0] px-2.5 py-1.5 text-xs font-black text-[#9b5615]"
        >
          <Braces size={14} /> Chèn biến
        </button>
      </div>
      {multiline ? (
        <textarea
          ref={(node) => {
            inputRef.current = node;
          }}
          rows={rows}
          {...sharedProps}
        />
      ) : (
        <input
          ref={(node) => {
            inputRef.current = node;
          }}
          type="text"
          {...sharedProps}
        />
      )}
      {showHint ? (
        <p className="text-xs leading-5 text-[#756b60]">
          {description ? `${description} ` : ""}Gõ <strong>{"{{"}</strong> để xem gợi ý tag.
        </p>
      ) : description ? (
        <p className="text-xs leading-5 text-[#756b60]">{description}</p>
      ) : null}
      {error ? (
        <p role="alert" className="text-sm font-bold text-red-700">
          {error}
        </p>
      ) : null}
      {unavailable.length ? (
        <p role="alert" className="rounded-lg bg-amber-50 px-2.5 py-2 text-xs font-bold text-amber-900">
          Tag chưa được bật hoặc không tồn tại: {unavailable.map((key) => `{{${key}}}`).join(", ")}
        </p>
      ) : null}
      {open ? (
        <div className="absolute right-0 z-30 mt-1 w-full max-w-md overflow-hidden rounded-2xl border bg-white shadow-xl">
          <div className="border-b bg-[#fffaf0] px-3 py-2 text-xs font-black text-[#756b60]">
            Chọn tag để chèn
          </div>
          <div className="max-h-64 overflow-y-auto p-1.5">
            {filtered.length ? (
              filtered.map((item) => (
                <button
                  key={item.key}
                  type="button"
                  onMouseDown={(event) => event.preventDefault()}
                  onClick={() => insertVariable(item.key)}
                  className="flex w-full items-start gap-3 rounded-xl px-3 py-2 text-left hover:bg-[#fff5e7]"
                >
                  <code className="shrink-0 rounded-md bg-[#f2eee7] px-2 py-1 text-xs font-black text-[#9b5615]">
                    {contentVariableTag(item.key)}
                  </code>
                  <span className="min-w-0">
                    <strong className="block text-sm">{item.label}</strong>
                    <span className="block text-xs leading-5 text-[#756b60]">
                      {item.description} Ví dụ: {item.example}
                    </span>
                  </span>
                </button>
              ))
            ) : (
              <p className="px-3 py-4 text-sm text-[#756b60]">Không có tag phù hợp.</p>
            )}
          </div>
        </div>
      ) : null}
    </div>
  );
}
