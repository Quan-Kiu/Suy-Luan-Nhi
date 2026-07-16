"use client";

import Image from "next/image";
import type { Question } from "@/domain/schemas";
import { cn } from "@/lib/utils";

export function QuestionRenderer({
  question,
  selected,
  onSelect,
  disabled = false,
  compact = false,
}: {
  question: Question;
  selected?: string | null;
  onSelect?: (id: string) => void;
  disabled?: boolean;
  compact?: boolean;
}) {
  return (
    <div className={cn("space-y-5", compact && "space-y-3 text-sm")}>
      <div className="rounded-[26px] border border-[#e2d2b5] bg-[url('/assets/scenes/bg-parchment-card.png')] bg-cover p-4 shadow-inner">
        <div className="grid grid-cols-5 items-center gap-2">
          {question.sequence.map((item) => (
            <div key={item.id} className="grid aspect-square place-items-center rounded-2xl bg-white/65 p-1">
              {item.asset ? (
                <Image
                  src={item.asset}
                  width={80}
                  height={80}
                  alt={item.label}
                  className="h-full w-full object-contain"
                />
              ) : (
                <span className="text-4xl font-black text-[#7b674b]">?</span>
              )}
            </div>
          ))}
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {question.options.map((option) => (
          <button
            key={option.id}
            type="button"
            disabled={disabled}
            onClick={() => onSelect?.(option.id)}
            className={cn(
              "rounded-[22px] border-2 border-[#eadfc9] bg-white p-3 text-center font-extrabold text-[#4c3b27] transition hover:-translate-y-1 hover:border-[#e9641a] focus-visible:outline focus-visible:outline-4 focus-visible:outline-[#f5b557]",
              selected === option.id && "border-[#e9641a] bg-[#fff2df] ring-4 ring-[#f5b557]/30",
              compact && "p-2",
            )}
          >
            <Image
              src={option.asset}
              width={76}
              height={76}
              alt=""
              className={cn("mx-auto h-16 w-16 object-contain", compact && "h-10 w-10")}
            />
            <span>{option.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
