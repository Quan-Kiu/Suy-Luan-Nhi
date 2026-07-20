"use client";

import Image from "next/image";
import type { PublicPlayableQuestion, QuestionSubmission } from "@/modules/gameplay/question";
import { cn } from "@/lib/utils";
import { DragDropQuestion } from "@/features/gameplay/drag-drop-question";
import { SortingQuestion } from "@/features/gameplay/sorting-question";
import { useSoundEffects } from "@/features/sound/sound-effects-provider";

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
  const sound = useSoundEffects();
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
        <div
          className={cn(
            "mx-auto grid w-full justify-center gap-3",
            options.length === 2 && "max-w-[280px] grid-cols-2",
            options.length === 3 && "max-w-[360px] grid-cols-3",
            options.length >= 4 && "max-w-[440px] grid-cols-2 sm:grid-cols-4",
          )}
        >
          {options.map((option) => (
            <button
              key={option.id}
              type="button"
              disabled={disabled}
              onClick={() => {
                void sound.play("ui.select");
                onChange(option.id);
              }}
              aria-pressed={value === option.id}
              className={cn(
                "flex min-h-28 flex-col items-center justify-center rounded-[22px] border-2 border-[#eadfc9] bg-white p-3 text-center font-black transition hover:-translate-y-1",
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
    return (
      <SortingQuestion
        question={question}
        value={value}
        onChange={onChange}
        disabled={disabled}
        renderMedia={(asset, label) => <Media asset={asset} label={label} decorative />}
      />
    );
  }

  return (
    <DragDropQuestion
      question={question}
      value={value}
      onChange={onChange}
      disabled={disabled}
      renderMedia={(asset, label) => <Media asset={asset} label={label} decorative />}
    />
  );
}
