"use client";

import { ArrowDown, ArrowUp, Plus, Trash2 } from "lucide-react";
import type { ContentVariableDefinition } from "@/domain/content-variables";
import { ContentTemplateField } from "@/features/admin/content-template-field";
import { MediaUploadField } from "@/features/admin/media-upload-field";

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
  templateVariables: ContentVariableDefinition[];
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
  templateVariables,
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
      <legend className="type-label px-1">{title}</legend>
      <div className="mt-2 grid gap-3 2xl:grid-cols-2">
        {items.map((item, index) => (
          <div key={item.id} className="rounded-xl border bg-white p-3">
            <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
              <div className="type-caption flex flex-wrap items-center gap-3 font-bold">
                <span className="rounded-full bg-[#f5f2ec] px-2.5 py-1 text-[#6f6558]">
                  {title} {index + 1}
                </span>
                {onCorrectChange ? (
                  <label className="flex min-h-9 items-center gap-2">
                    <input
                      type="radio"
                      name={`${title}-correct`}
                      checked={correctId === item.id}
                      onChange={() => onCorrectChange(item.id)}
                    />
                    Đáp án đúng
                  </label>
                ) : null}
                {onMissingChange ? (
                  <label className="flex min-h-9 items-center gap-2">
                    <input
                      type="radio"
                      name={`${title}-missing`}
                      checked={missingId === item.id}
                      onChange={() => onMissingChange(item.id)}
                    />
                    Ô trống
                  </label>
                ) : null}
              </div>
              <div className="flex shrink-0 items-center gap-1">
                {reorderable ? (
                  <>
                    <button
                      type="button"
                      aria-label={`Đưa ${title} ${index + 1} lên`}
                      disabled={index === 0}
                      onClick={() => move(index, -1)}
                      className="grid size-9 place-items-center rounded-lg border disabled:opacity-30"
                    >
                      <ArrowUp size={15} />
                    </button>
                    <button
                      type="button"
                      aria-label={`Đưa ${title} ${index + 1} xuống`}
                      disabled={index === items.length - 1}
                      onClick={() => move(index, 1)}
                      className="grid size-9 place-items-center rounded-lg border disabled:opacity-30"
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
                  className="grid size-9 place-items-center rounded-lg border border-red-200 bg-red-50 text-red-700 disabled:opacity-30"
                >
                  <Trash2 size={15} />
                </button>
              </div>
            </div>
            <div className="space-y-2">
              <ContentTemplateField
                label="Nội dung"
                value={item.label}
                onValueChange={(value) => update(index, { label: value, altText: value })}
                variables={templateVariables}
                placeholder="Nội dung hiển thị"
                showHint={false}
              />
              <MediaUploadField
                label="Hình minh họa"
                value={item.asset}
                onChange={(url) => update(index, { asset: url, altText: item.label })}
                category="question-asset"
                altText={item.label || `${title} ${index + 1}`}
                description="Không bắt buộc. Chọn ảnh đã có trong thư viện hoặc tải ảnh mới khi đáp án cần hình minh họa."
                compact
              />
            </div>
          </div>
        ))}
      </div>
      <button
        type="button"
        onClick={() => onChange([...items, { id: nextId(items), label: `${addLabel} ${items.length + 1}` }])}
        className="type-action mt-3 inline-flex min-h-10 items-center gap-2 rounded-xl border bg-white px-3"
      >
        <Plus size={16} /> {addLabel}
      </button>
    </fieldset>
  );
}
