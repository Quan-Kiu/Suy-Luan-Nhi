"use client";

import Image from "next/image";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Lightbulb, LogOut, Trophy } from "lucide-react";
import { toast } from "sonner";
import { QuestionPlayer } from "@/features/gameplay/question-player";
import { Button, Card, Pill } from "@/components/ui";
import type { PublicPlayableQuestion, QuestionSubmission } from "@/modules/gameplay/question";
import { requestJson } from "@/lib/http";
import { contentText, useContent } from "@/content/client";

type View = {
  session: { id: string; currentQuestionIndex: number; totalQuestions: number; status: string };
  mission: { id: string; slug: string; title: string; rewardBadge?: string; coverUrl: string };
  question: PublicPlayableQuestion;
  questionState: { hintLevel: number; attempts: number } | null;
  progress: { current: number; total: number };
  completeReady: boolean;
};
type AnswerResponse = View & { correct: boolean; feedback: string; duplicate?: boolean };

function initialValue(question: PublicPlayableQuestion): QuestionSubmission | null {
  if (question.type === "sorting") return question.payload.items.map((item) => item.id);
  if (question.type === "drag_drop") return {};
  return null;
}
function canSubmit(question: PublicPlayableQuestion, value: QuestionSubmission | null) {
  if (value === null) return false;
  switch (question.type) {
    case "single_choice":
    case "pattern_sequence":
    case "fill_answer":
      return typeof value === "string" && value.trim().length > 0;
    case "sorting":
      return Array.isArray(value) && value.length === question.payload.items.length;
    case "drag_drop":
      return (
        !Array.isArray(value) &&
        typeof value === "object" &&
        Object.keys(value).length === question.payload.slots.length
      );
  }
}

export function SessionPlayer({ initialView }: { initialView: View }) {
  const content = useContent("gameplay");
  const router = useRouter();
  const [view, setView] = useState(initialView);
  const [value, setValue] = useState<QuestionSubmission | null>(() => initialValue(initialView.question));
  const [feedback, setFeedback] = useState<{ correct: boolean; text: string } | null>(null);
  const [nextView, setNextView] = useState<View | null>(null);
  const [hint, setHint] = useState<string | null>(null);
  const [startedAt, setStartedAt] = useState(() => Date.now());
  const answer = useMutation({
    mutationFn: () =>
      requestJson<AnswerResponse>(`/api/sessions/${view.session.id}/questions/${view.question.id}/answer`, {
        method: "POST",
        body: JSON.stringify({
          submission: value,
          responseTimeMs: Date.now() - startedAt,
          idempotencyKey: crypto.randomUUID(),
        }),
      }),
    onSuccess: (result) => {
      setFeedback({ correct: result.correct, text: result.feedback });
      if (result.correct) setNextView(result);
    },
    onError: (error) => toast.error(error.message),
  });
  const hintMutation = useMutation({
    mutationFn: () =>
      requestJson<{ hint: { text: string }; exhausted: boolean }>(
        `/api/sessions/${view.session.id}/questions/${view.question.id}/hint`,
        { method: "POST" },
      ),
    onSuccess: (result) => setHint(result.hint.text),
    onError: (error) => toast.error(error.message),
  });
  const complete = useMutation({
    mutationFn: () => requestJson(`/api/sessions/${view.session.id}/complete`, { method: "POST" }),
    onSuccess: () => router.push(`/complete/${view.session.id}`),
    onError: (error) => toast.error(error.message),
  });
  const progress = Math.round((view.progress.current / view.progress.total) * 100);
  const continueNext = () => {
    if (!nextView) return;
    if (nextView.completeReady) {
      complete.mutate();
      return;
    }
    setValue(initialValue(nextView.question));
    setStartedAt(Date.now());
    setHint(null);
    setView(nextView);
    setFeedback(null);
    setNextView(null);
  };
  return (
    <main className="paper-texture min-h-[calc(100vh-4rem)] px-5 pt-5 pb-8">
      <div className="mb-4 flex items-center gap-3">
        <span className="grid size-9 place-items-center rounded-full bg-[#6f9e50] font-black text-white">
          {view.progress.current}
        </span>
        <div className="h-3 flex-1 overflow-hidden rounded-full bg-[#eadfc9]">
          <div className="h-full rounded-full bg-[#6f9e50]" style={{ width: `${progress}%` }} />
        </div>
        <Pill>
          {view.progress.current}/{view.progress.total}
        </Pill>
      </div>
      <div className="text-center">
        <p className="text-xs font-black tracking-[.16em] text-[#d78517] uppercase">{view.mission.title}</p>
        <h1 className="mt-2 text-3xl leading-tight font-black">{view.question.prompt}</h1>
        <p className="mt-2 text-[#806d54]">{view.question.instruction}</p>
      </div>
      <div className="mt-5">
        <QuestionPlayer
          question={view.question}
          value={value}
          onChange={(next) => {
            setValue(next);
            setFeedback(null);
          }}
          disabled={answer.isPending || feedback?.correct}
        />
      </div>
      <button
        type="button"
        onClick={() => hintMutation.mutate()}
        disabled={hintMutation.isPending || feedback?.correct}
        className="mt-5 flex min-h-12 w-full items-center justify-center gap-2 rounded-2xl border-2 border-[#ebc778] bg-[#fff5cf] font-black text-[#785b18] disabled:opacity-50"
      >
        <Lightbulb size={20} />
        {contentText(content, "actions.hint", "Cho con một gợi ý")}
      </button>
      {hint ? (
        <Card className="mt-4 flex gap-3 bg-[#fff6d8] p-4">
          <Image
            src="/assets/mascots/mascot-dog-detective.png"
            width={64}
            height={64}
            alt="Bống đang gợi ý"
            className="size-16 object-contain"
          />
          <p className="self-center font-bold">{hint}</p>
        </Card>
      ) : null}
      {feedback ? (
        <Card
          className={`mt-4 p-4 ${feedback.correct ? "border-green-200 bg-[#edf6e6]" : "border-amber-200 bg-[#fff6df]"}`}
        >
          <p className={`text-xl font-black ${feedback.correct ? "text-green-700" : "text-[#b75e13]"}`}>
            {feedback.correct
              ? contentText(content, "feedback.correctTitle", "Tuyệt vời!")
              : contentText(content, "feedback.retryTitle", "Chưa trúng thôi!")}
          </p>
          <p className="mt-1">{feedback.text}</p>
          {feedback.correct ? (
            <Button type="button" onClick={continueNext} className="mt-4 w-full">
              {nextView?.completeReady ? (
                <>
                  <Trophy size={19} className="mr-2 inline" />
                  Nhận huy hiệu
                </>
              ) : (
                "Câu tiếp theo →"
              )}
            </Button>
          ) : (
            <button
              type="button"
              onClick={() => {
                setFeedback(null);
                setValue(initialValue(view.question));
              }}
              className="mt-4 min-h-12 w-full rounded-2xl bg-[#6c9951] font-black text-white"
            >
              Thử lại
            </button>
          )}
        </Card>
      ) : (
        <Button
          type="button"
          onClick={() => answer.mutate()}
          disabled={!canSubmit(view.question, value) || answer.isPending}
          className="mt-5 w-full"
        >
          {answer.isPending
            ? "Đang kiểm tra..."
            : contentText(content, "actions.checkAnswer", "Kiểm tra đáp án")}
        </Button>
      )}
      <button
        type="button"
        onClick={async () => {
          await requestJson(`/api/sessions/${view.session.id}/exit`, { method: "POST" });
          router.push("/missions");
        }}
        className="mt-6 flex w-full items-center justify-center gap-2 text-sm font-bold text-[#806d54]"
      >
        <LogOut size={16} />
        Dừng và lưu tiến độ
      </button>
    </main>
  );
}
