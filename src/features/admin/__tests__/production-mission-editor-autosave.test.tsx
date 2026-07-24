import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { act, fireEvent, render, screen } from "@testing-library/react";
import type { ReactNode } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { ApiRequestError } from "@/lib/api/error";
import { adminMissionDraftSchema, safetyKeys, type AdminMissionDraft } from "@/modules/admin/schemas";

const apiMocks = vi.hoisted(() => ({
  autosaveDraft: vi.fn(),
  saveDraft: vi.fn(),
  submit: vi.fn(),
}));

vi.mock("@/api/admin/missions", () => ({
  adminMissionsApi: apiMocks,
}));

vi.mock("@/content/client", () => ({
  useContent: () => ({}),
  contentText: (_dictionary: unknown, _key: string, fallback: string) => fallback,
  contentTemplate: (
    _dictionary: unknown,
    _key: string,
    fallback: string,
    values: Record<string, string | number>,
  ) =>
    Object.entries(values).reduce(
      (text, [key, value]) => text.replaceAll(`{${key}}`, String(value)),
      fallback,
    ),
}));

vi.mock("sonner", () => ({
  toast: { success: vi.fn(), dismiss: vi.fn() },
}));
vi.mock("next/link", () => ({
  default: ({ children, ...props }: { children: ReactNode; href: string }) => <a {...props}>{children}</a>,
}));

vi.mock("@/hooks/use-pending-router", () => ({
  usePendingRouter: () => ({
    isPending: false,
    push: vi.fn(),
    refresh: vi.fn(),
  }),
}));

vi.mock("@/features/admin/mission-editor/basic-fields", async () => {
  const { useFormContext } = await import("react-hook-form");
  return {
    MissionBasicFields: () => {
      const form = useFormContext<AdminMissionDraft>();
      return <input aria-label="Tên nhiệm vụ" {...form.register("title")} />;
    },
  };
});

vi.mock("@/features/admin/mission-editor/questions-section", () => ({
  MissionQuestionsSection: () => null,
}));
vi.mock("@/features/admin/mission-editor/safety-section", () => ({
  MissionSafetySection: () => null,
}));
vi.mock("@/features/admin/mission-editor/preview", () => ({
  MissionEditorPreview: () => null,
}));
vi.mock("@/features/admin/mission-status-badge", () => ({
  MissionStatusBadge: ({ status }: { status: string }) => <span data-testid="mission-status">{status}</span>,
}));
vi.mock("@/features/admin/mission-version-history", () => ({
  MissionVersionHistory: () => null,
}));

import { ProductionMissionEditor } from "@/features/admin/production-mission-editor";

const initialDraft: AdminMissionDraft = {
  slug: "mission-demo",
  worldId: "550e8400-e29b-41d4-a716-446655440001",
  title: "Mission demo",
  subtitle: "Một nhiệm vụ thử nghiệm",
  shortDescription: "Một mô tả đủ dài cho nhiệm vụ thử nghiệm.",
  storyIntro: "Một câu chuyện đủ dài để trẻ hiểu nhiệm vụ đang diễn ra như thế nào.",
  estimatedMinutes: 5,
  primarySkillId: "550e8400-e29b-41d4-a716-446655440002",
  secondarySkillIds: [],
  rewardBadgeId: null,
  coverUrl: "/assets/demo.png",
  ageGroups: ["6-8"],
  difficulty: 1,
  allowReplay: true,
  randomizeAnswers: false,
  questions: [
    {
      type: "single_choice",
      order: 1,
      prompt: "Chọn đáp án đúng",
      instruction: "Hãy quan sát kỹ",
      payload: {
        options: [
          { id: "a", label: "A" },
          { id: "b", label: "B" },
        ],
      },
      correctAnswer: "a",
      difficulty: 1,
      feedbackCorrect: "Tuyệt vời",
      feedbackIncorrect: "Thử lại nhé",
      hints: [{ level: 1, text: "Nhìn kỹ lựa chọn đầu tiên" }],
    },
  ],
  safety: Object.fromEntries(safetyKeys.map((key) => [key, true])) as AdminMissionDraft["safety"],
};

function renderEditor() {
  expect(adminMissionDraftSchema.safeParse(initialDraft).success).toBe(true);
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  return render(
    <QueryClientProvider client={queryClient}>
      <ProductionMissionEditor
        initial={initialDraft}
        taxonomy={{ worlds: [], skills: [], badges: [] }}
        templateVariables={[]}
        missionId="550e8400-e29b-41d4-a716-446655440010"
        status="draft"
        updatedAt="2026-07-24T06:00:00.000Z"
        draftVersion={1}
      />
    </QueryClientProvider>,
  );
}

async function advanceAutosave() {
  await act(async () => {
    vi.advanceTimersByTime(1_500);
    await Promise.resolve();
  });
  await act(async () => {
    await Promise.resolve();
  });
}
describe("ProductionMissionEditor autosave", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    apiMocks.autosaveDraft.mockReset();
    apiMocks.saveDraft.mockReset();
    apiMocks.submit.mockReset();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("debounces changes and saves with the current draft version", async () => {
    apiMocks.autosaveDraft.mockResolvedValue({
      id: "550e8400-e29b-41d4-a716-446655440010",
      status: "draft",
      currentDraftVersion: 2,
      updatedAt: "2026-07-24T06:01:00.000Z",
    });
    renderEditor();

    fireEvent.change(screen.getByLabelText("Tên nhiệm vụ"), {
      target: { value: "Mission đã sửa" },
    });
    await act(async () => vi.advanceTimersByTime(1_000));
    fireEvent.change(screen.getByLabelText("Tên nhiệm vụ"), {
      target: { value: "Mission đã sửa lần hai" },
    });
    await act(async () => vi.advanceTimersByTime(1_499));

    expect(apiMocks.autosaveDraft).not.toHaveBeenCalled();
    await advanceAutosave();

    expect(apiMocks.autosaveDraft).toHaveBeenCalledTimes(1);
    expect(apiMocks.autosaveDraft).toHaveBeenCalledWith(
      "550e8400-e29b-41d4-a716-446655440010",
      expect.objectContaining({ title: "Mission đã sửa lần hai" }),
      1,
    );
    expect(screen.getByRole("status")).toHaveAttribute("data-state", "saved");
  });

  it("keeps invalid edits on screen without sending them to the server", async () => {
    renderEditor();

    fireEvent.change(screen.getByLabelText("Tên nhiệm vụ"), { target: { value: "" } });
    await advanceAutosave();

    expect(apiMocks.autosaveDraft).not.toHaveBeenCalled();
    expect(screen.getByRole("status")).toHaveAttribute("data-state", "invalid");
    expect(screen.getByLabelText("Tên nhiệm vụ")).toHaveValue("");
  });

  it("shows a conflict instead of retrying a stale save", async () => {
    apiMocks.autosaveDraft.mockRejectedValue(
      new ApiRequestError("Bản nháp đã được thay đổi ở nơi khác", "CONFLICT", undefined, undefined, 409),
    );
    renderEditor();

    fireEvent.change(screen.getByLabelText("Tên nhiệm vụ"), {
      target: { value: "Mission xung đột" },
    });
    await advanceAutosave();

    expect(apiMocks.autosaveDraft).toHaveBeenCalledTimes(1);
    expect(screen.getByRole("alert")).toHaveAttribute("data-state", "conflict");

    await act(async () => vi.advanceTimersByTime(5_000));
    expect(apiMocks.autosaveDraft).toHaveBeenCalledTimes(1);
  });
});
