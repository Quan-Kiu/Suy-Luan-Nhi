"use client";

import { ArrowDown, ArrowUp, Plus, Trash2 } from "lucide-react";
import { formControlClass } from "@/components/form/text-field";
import { MediaUploadField } from "@/features/admin/media-upload-field";
import { cn } from "@/lib/utils";

export type EditorOption = {
  id: string;
  label: string;
  asset?: string;
  altText?: string;
  missing?: boolean;
};

type Props = {
  title: string;
  items: EditorOption[];
  minItems: number;
  addLabel: string;
  correctId?: string;
  missingId?: string;
  reorderable?: boolean;
  onChange: (items: EditorOption[]) => void;
  onCorrectChange?: (id: string) => void;
  onMissingChange?: (id: string) => void;
};

function nextId(items: EditorOption[]) {
  let index = items.length + 1;
  while (items.some((item) => item.id === `item-${index}`)) index += 1;
  return `item-${index}`;
}
export function QuestionOptionList({
  title,
  items,
  minItems,
  addLabel,
  correctId,
  missingId,
  reorderable = false,
  onChange,
  onCorrectChange,
  onMissingChange,
}: Props) {
  function update(index: number, patch: Partial<EditorOption>) {
    onChange(items.map((item, itemIndex) => (itemIndex === index ? { ...item, ...patch } : item)));
  }

  function remove(index: number) {
    if (items.length <= minItems) return;
    onChange(items.filter((_, itemIndex) => itemIndex !== index));
  }

  function move(index: number, direction: -1 | 1) {
    const target = index + direction;
    if (target < 0 || target >= items.length) return;
    const next = [...items];
    [next[index], next[target]] = [next[target], next[index]];
    onChange(next);
  }

  return (
    <fieldset className="rounded-2xl border bg-[#fffdf8] p-4">
      <legend className="px-1 text-sm font-black">{title}</legend>
      <div className="mt-2 space-y-3">
        {items.map((item, index) => (
          <div key={item.id} className="rounded-xl border bg-white p-3">
            <div className="flex items-start gap-3">
              {onCorrectChange ? (
                <label className="mt-3 flex shrink-0 items-center gap-2 text-xs font-bold">
                  <input
                    type="radio"
                    name={`${title}-correct`}
                    checked={correctId === item.id}
                    onChange={() => onCorrectChange(item.id)}
                  />
                  Đúng
                </label>
              ) : null}
              {onMissingChange ? (
                <label className="mt-3 flex shrink-0 items-center gap-2 text-xs font-bold">
                  <input
                    type="radio"
                    name={`${title}-missing`}
                    checked={missingId === item.id}
                    onChange={() => onMissingChange(item.id)}
                  />
                  Ô trống
                </label>
              ) : null}
              <div className="min-w-0 flex-1 space-y-2">
                <input
                  aria-label={`${title} ${index + 1}`}
                  value={item.label}
                  onChange={(event) =>
                    update(index, { label: event.target.value, altText: event.target.value })
                  }
                  placeholder="Nội dung hiển thị"
                  className={cn(formControlClass, "min-h-10 rounded-xl px-3")}
                />
                <MediaUploadField
                  label={`Hình minh họa ${index + 1}`}
                  value={item.asset}
                  onChange={(url) => update(index, { asset: url, altText: item.label })}
                  category="question-asset"
                  altText={item.label || `${title} ${index + 1}`}
                  description="Không bắt buộc. Chọn ảnh từ máy để hệ thống tải lên và tự gắn URL."
                  compact
                />
              </div>
              <div className="flex shrink-0 flex-col gap-1">
                {reorderable ? (
                  <>
                    <button
                      type="button"
                      aria-label={`Đưa ${title} ${index + 1} lên`}
                      disabled={index === 0}
                      onClick={() => move(index, -1)}
                      className="rounded-lg border p-2 disabled:opacity-30"
                    >
                      <ArrowUp size={15} />
                    </button>
                    <button
                      type="button"
                      aria-label={`Đưa ${title} ${index + 1} xuống`}
                      disabled={index === items.length - 1}
                      onClick={() => move(index, 1)}
                      className="rounded-lg border p-2 disabled:opacity-30"
                    >
                      <ArrowDown size={15} />
                    </button>
                  </>
                ) : null}
                <button
                  type="button"
                  aria-label={`Xóa ${title} ${index + 1}`}
                  disabled={items.length <= minItems}
                  onClick={() => remove(index)}
                  className="rounded-lg border border-red-200 bg-red-50 p-2 text-red-700 disabled:opacity-30"
                >
                  <Trash2 size={15} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
      <button
        type="button"
        onClick={() => onChange([...items, { id: nextId(items), label: `${addLabel} ${items.length + 1}` }])}
        className="mt-3 inline-flex items-center gap-2 rounded-xl border bg-white px-3 py-2 text-sm font-black"
      >
        <Plus size={16} /> {addLabel}
      </button>
    </fieldset>
  );
}
