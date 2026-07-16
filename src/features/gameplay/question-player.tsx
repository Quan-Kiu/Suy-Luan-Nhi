"use client";

import Image from "next/image";
import { ArrowDown, ArrowUp, Check, GripVertical } from "lucide-react";
import { useState } from "react";
import type { PublicPlayableQuestion, QuestionSubmission } from "@/modules/gameplay/question";
import { cn } from "@/lib/utils";

type Props = {
  question: PublicPlayableQuestion;
  value: QuestionSubmission | null;
  onChange: (value: QuestionSubmission) => void;
  disabled?: boolean;
};

function Media({
  asset,
  label,
  decorative = false,
}: {
  asset?: string;
  label: string;
  decorative?: boolean;
}) {
  return asset ? (
    <Image
      src={asset}
      width={72}
      height={72}
      alt={decorative ? "" : label}
      className="mx-auto h-16 w-16 object-contain"
    />
  ) : (
    <span aria-hidden className="grid h-16 place-items-center text-2xl">
      🧩
    </span>
  );
}

export function QuestionPlayer({ question, value, onChange, disabled = false }: Props) {
  const [dragged, setDragged] = useState<string | null>(null);

  if (question.type === "single_choice" || question.type === "pattern_sequence") {
    const options = question.payload.options;
    return (
      <div className="space-y-4">
        {question.type === "pattern_sequence" ? (
          <div className="grid grid-cols-5 gap-2 rounded-[24px] border border-[#e2d2b5] bg-[#fff4d8] p-3">
            {question.payload.sequence.map((item) => (
              <div key={item.id} className="grid aspect-square place-items-center rounded-xl bg-white/75 p-1">
                {item.missing ? (
                  <span aria-label="Ô còn thiếu" className="text-3xl font-black">
                    ?
                  </span>
                ) : (
                  <Media asset={item.asset} label={item.label} />
                )}
              </div>
            ))}
          </div>
        ) : null}
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {options.map((option) => (
            <button
              key={option.id}
              type="button"
              disabled={disabled}
              onClick={() => onChange(option.id)}
              aria-pressed={value === option.id}
              className={cn(
                "min-h-28 rounded-[22px] border-2 border-[#eadfc9] bg-white p-3 font-black transition hover:-translate-y-1",
                value === option.id && "border-[#e9641a] bg-[#fff2df] ring-4 ring-[#f5b557]/30",
              )}
            >
              <Media asset={option.asset} label={option.label} decorative />
              {option.label}
            </button>
          ))}
        </div>
      </div>
    );
  }

  if (question.type === "fill_answer") {
    return (
      <input
        disabled={disabled}
        inputMode={question.payload.inputMode}
        placeholder={question.payload.placeholder ?? "Nhập câu trả lời"}
        aria-label="Câu trả lời"
        value={typeof value === "string" ? value : ""}
        onChange={(event) => onChange(event.target.value)}
        className="min-h-16 w-full rounded-2xl border-2 border-[#eadfc9] bg-white px-5 text-center text-xl font-black focus:border-[#e9641a]"
      />
    );
  }

  if (question.type === "sorting") {
    const order = Array.isArray(value) ? value : question.payload.items.map((item) => item.id);
    const itemById = new Map(question.payload.items.map((item) => [item.id, item]));
    const move = (index: number, delta: number) => {
      const target = index + delta;
      if (target < 0 || target >= order.length) return;
      const next = [...order];
      [next[index], next[target]] = [next[target], next[index]];
      onChange(next);
    };
    return (
      <div className="space-y-3">
        {order.map((id, index) => {
          const item = itemById.get(id);
          if (!item) return null;
          return (
            <div
              key={id}
              className="flex items-center gap-3 rounded-2xl border-2 border-[#eadfc9] bg-white p-3"
            >
              <span className="grid size-8 place-items-center rounded-full bg-[#edf4df] font-black">
                {index + 1}
              </span>
              <GripVertical aria-hidden className="text-[#9a876d]" />
              <Media asset={item.asset} label={item.label} decorative />
              <strong className="flex-1">{item.label}</strong>
              <button
                type="button"
                aria-label={`Đưa ${item.label} lên`}
                disabled={disabled || index === 0}
                onClick={() => move(index, -1)}
                className="rounded-lg border p-2 disabled:opacity-30"
              >
                <ArrowUp size={18} />
              </button>
              <button
                type="button"
                aria-label={`Đưa ${item.label} xuống`}
                disabled={disabled || index === order.length - 1}
                onClick={() => move(index, 1)}
                className="rounded-lg border p-2 disabled:opacity-30"
              >
                <ArrowDown size={18} />
              </button>
            </div>
          );
        })}
      </div>
    );
  }

  const assignments = !Array.isArray(value) && typeof value === "object" && value ? value : {};
  const assignedIds = new Set(Object.values(assignments));
  const assignToSlot = (slotId: string) => {
    if (!dragged || disabled) return;
    onChange({ ...assignments, [slotId]: dragged });
    setDragged(null);
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        {question.payload.items.map((item) => (
          <button
            key={item.id}
            type="button"
            draggable={!disabled}
            onDragStart={() => setDragged(item.id)}
            onClick={() => setDragged(item.id)}
            disabled={disabled || assignedIds.has(item.id)}
            aria-pressed={dragged === item.id}
            className={cn(
              "rounded-2xl border-2 border-[#eadfc9] bg-white p-3 font-black",
              dragged === item.id && "border-[#e9641a] bg-[#fff2df]",
              assignedIds.has(item.id) && "opacity-40",
            )}
          >
            <Media asset={item.asset} label={item.label} decorative />
            {item.label}
          </button>
        ))}
      </div>
      <div className="space-y-3">
        {question.payload.slots.map((slot) => {
          const itemId = assignments[slot.id];
          const item = question.payload.items.find((entry) => entry.id === itemId);
          return (
            <div
              key={slot.id}
              role="button"
              tabIndex={disabled ? -1 : 0}
              aria-disabled={disabled}
              onDragOver={(event) => event.preventDefault()}
              onDrop={() => assignToSlot(slot.id)}
              onClick={() => assignToSlot(slot.id)}
              onKeyDown={(event) => {
                if (event.key === "Enter" || event.key === " ") {
                  event.preventDefault();
                  assignToSlot(slot.id);
                }
              }}
              className="flex min-h-20 w-full items-center gap-3 rounded-2xl border-2 border-dashed border-[#cbb58d] bg-[#fff8e9] p-3 text-left focus-visible:outline-4 focus-visible:outline-[#f5b557]"
            >
              <span className="grid size-10 place-items-center rounded-full bg-white">
                <Check size={18} />
              </span>
              <span className="flex-1">
                <strong className="block">{slot.label}</strong>
                <small>{item ? item.label : "Chọn một mảnh rồi chạm vào đây"}</small>
              </span>
              {item ? (
                <button
                  type="button"
                  onClick={(event) => {
                    event.stopPropagation();
                    const next = { ...assignments };
                    delete next[slot.id];
                    onChange(next);
                  }}
                  className="rounded-lg border px-2 py-1 text-xs"
                >
                  Đổi
                </button>
              ) : null}
            </div>
          );
        })}
      </div>
    </div>
  );
}
