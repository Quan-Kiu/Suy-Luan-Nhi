"use client";

import { useMutation } from "@tanstack/react-query";
import { Lightbulb, LoaderCircle, LogOut } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { gameplayApi } from "@/api/gameplay";
import { FormStatus } from "@/components/form";
import { Button } from "@/components/ui";
import { contentText, useContent } from "@/content/client";
import { FeedbackPanel } from "@/features/gameplay/feedback-panel";
import { HintPanel } from "@/features/gameplay/hint-panel";
import { QuestionPlayer } from "@/features/gameplay/question-player";
import { SessionProgress } from "@/features/gameplay/session-progress";
import type { SessionView } from "@/features/gameplay/session-types";
import { canSubmitQuestion, initialSubmission } from "@/features/gameplay/session-utils";
import type { QuestionSubmission } from "@/modules/gameplay/question";

export function SessionPlayer({ initialView }: { initialView: SessionView }) {
  const content = useContent("gameplay");
  const router = useRouter();
  const [view, setView] = useState(initialView);
  const [value, setValue] = useState<QuestionSubmission | null>(() =>
    initialSubmission(initialView.question),
  );
  const [feedback, setFeedback] = useState<{ correct: boolean; text: string } | null>(null);
  const [nextView, setNextView] = useState<SessionView | null>(null);
  const [hint, setHint] = useState<string | null>(null);
  const [startedAt, setStartedAt] = useState(() => Date.now());

  const answerMutation = useMutation({
    mutationFn: () => {
      if (value === null) throw new Error("Hãy chọn hoặc nhập đáp án trước");
      return gameplayApi.submitAnswer(view.session.id, view.question.id, {
        submission: value,
        responseTimeMs: Date.now() - startedAt,
        idempotencyKey: crypto.randomUUID(),
      });
    },
    onSuccess: (result) => {
      setFeedback({ correct: result.correct, text: result.feedback });
      if (result.correct) setNextView(result);
    },
  });
  const hintMutation = useMutation({
    mutationFn: () => gameplayApi.requestHint(view.session.id, view.question.id),
    onSuccess: (result) => setHint(result.hint.text),
  });
  const completeMutation = useMutation({
    mutationFn: () => gameplayApi.completeSession(view.session.id),
    onSuccess: () => router.push(`/complete/${view.session.id}`),
  });
  const exitMutation = useMutation({
    mutationFn: () => gameplayApi.exitSession(view.session.id),
    onSuccess: () => router.push("/missions"),
  });

  const mutationError =
    answerMutation.error ?? hintMutation.error ?? completeMutation.error ?? exitMutation.error;

  function continueNext() {
    if (!nextView) return;
    if (nextView.completeReady) {
      completeMutation.mutate();
      return;
    }
    setValue(initialSubmission(nextView.question));
    setStartedAt(Date.now());
    setHint(null);
    setView(nextView);
    setFeedback(null);
    setNextView(null);
  }

  function retryQuestion() {
    setFeedback(null);
    setValue(initialSubmission(view.question));
  }

  return (
    <main className="paper-texture min-h-[calc(100vh-4rem)] px-5 pt-5 pb-8">
      <SessionProgress current={view.progress.current} total={view.progress.total} />
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
            answerMutation.reset();
          }}
          disabled={answerMutation.isPending || feedback?.correct}
        />
      </div>

      <button
        type="button"
        onClick={() => hintMutation.mutate()}
        disabled={hintMutation.isPending || feedback?.correct}
        aria-busy={hintMutation.isPending}
        className="mt-5 flex min-h-12 w-full items-center justify-center gap-2 rounded-2xl border-2 border-[#ebc778] bg-[#fff5cf] font-black text-[#785b18] disabled:opacity-50"
      >
        {hintMutation.isPending ? (
          <LoaderCircle size={20} className="animate-spin" />
        ) : (
          <Lightbulb size={20} />
        )}
        {hintMutation.isPending
          ? contentText(content, "actions.loadingHint", "Đang lấy gợi ý...")
          : contentText(content, "actions.hint", "Cho con một gợi ý")}
      </button>

      {hint ? (
        <HintPanel text={hint} imageAlt={contentText(content, "hint.imageAlt", "Bống đang gợi ý")} />
      ) : null}

      {feedback ? (
        <FeedbackPanel
          correct={feedback.correct}
          text={feedback.text}
          completeReady={Boolean(nextView?.completeReady)}
          completing={completeMutation.isPending}
          content={content}
          onContinue={continueNext}
          onRetry={retryQuestion}
        />
      ) : (
        <Button
          type="button"
          onClick={() => answerMutation.mutate()}
          disabled={!canSubmitQuestion(view.question, value) || answerMutation.isPending}
          aria-busy={answerMutation.isPending}
          className="mt-5 w-full"
        >
          {answerMutation.isPending
            ? contentText(content, "actions.checking", "Đang kiểm tra...")
            : contentText(content, "actions.checkAnswer", "Kiểm tra đáp án")}
        </Button>
      )}

      <FormStatus
        status={mutationError ? "error" : "idle"}
        message={mutationError?.message}
        className="mt-4"
      />
      <button
        type="button"
        onClick={() => exitMutation.mutate()}
        disabled={exitMutation.isPending}
        aria-busy={exitMutation.isPending}
        className="mt-6 flex w-full items-center justify-center gap-2 text-sm font-bold text-[#806d54] disabled:opacity-50"
      >
        {exitMutation.isPending ? <LoaderCircle size={16} className="animate-spin" /> : <LogOut size={16} />}
        {exitMutation.isPending
          ? contentText(content, "actions.exiting", "Đang lưu tiến độ...")
          : contentText(content, "actions.exit", "Dừng và lưu tiến độ")}
      </button>
    </main>
  );
}
