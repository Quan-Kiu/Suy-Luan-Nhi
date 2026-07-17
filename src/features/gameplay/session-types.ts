import type { PublicPlayableQuestion, QuestionSubmission } from "@/modules/gameplay/question";

export type SessionView = {
  session: { id: string; currentQuestionIndex: number; totalQuestions: number; status: string };
  mission: { id: string; slug: string; title: string; rewardBadge?: string; coverUrl: string };
  question: PublicPlayableQuestion;
  questionState: { hintLevel: number; attempts: number } | null;
  progress: { current: number; total: number };
  completeReady: boolean;
};

export type AnswerResponse = SessionView & {
  correct: boolean;
  feedback: string;
  duplicate?: boolean;
};

export type AnswerInput = {
  submission: QuestionSubmission;
  responseTimeMs: number;
  idempotencyKey: string;
};

export type HintResponse = { hint: { text: string }; exhausted: boolean };
