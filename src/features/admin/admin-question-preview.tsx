"use client";

import { useState } from "react";
import { QuestionPlayer } from "@/features/gameplay/question-player";
import {
  playableQuestionSchema,
  type PlayableQuestion,
  type QuestionSubmission,
} from "@/modules/gameplay/question";

function initialValue(question: PlayableQuestion): QuestionSubmission | null {
  if (question.type === "sorting") return question.payload.items.map((item) => item.id);
  if (question.type === "drag_drop") return {};
  return null;
}

function ValidQuestionPreview({ question }: { question: PlayableQuestion }) {
  const [value, setValue] = useState<QuestionSubmission | null>(() => initialValue(question));
  return (
    <div className="rounded-[28px] bg-[#fffaf0] p-4">
      <p className="text-center text-xs font-black tracking-widest text-[#9f600b] uppercase">
        Xem thử như bé sẽ thấy
      </p>
      <h3 className="mt-2 text-center text-xl font-black">{question.prompt}</h3>
      <p className="mt-1 mb-4 text-center text-xs text-[#806d54]">{question.instruction}</p>
      <QuestionPlayer question={question} value={value} onChange={setValue} />
    </div>
  );
}

export function AdminQuestionPreview({ question }: { question: unknown }) {
  const result = playableQuestionSchema.safeParse(question);
  if (!result.success) {
    return (
      <div className="rounded-2xl border border-amber-300 bg-amber-50 p-4 text-sm text-amber-900">
        <p className="font-black">Chưa thể xem thử vì câu hỏi còn thiếu hoặc chưa đúng</p>
        <ul className="mt-2 list-disc space-y-1 pl-5">
          {result.error.issues.slice(0, 5).map((issue, index) => (
            <li key={`${issue.path.join(".")}-${index}`}>{issue.message}</li>
          ))}
        </ul>
      </div>
    );
  }
  return <ValidQuestionPreview key={JSON.stringify(result.data)} question={result.data} />;
}
