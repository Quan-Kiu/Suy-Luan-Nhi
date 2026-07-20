import { describe, expect, it } from "vitest";
import { adminResourceSchema } from "@/modules/admin/resource-admin";
import { adminMissionDraftSchema, safetyKeys } from "@/modules/admin/schemas";

const base = {
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
  ageGroups: ["6-8"] as const,
  difficulty: 1,
  allowReplay: true,
  randomizeAnswers: false,
  questions: [
    {
      type: "single_choice" as const,
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
  safety: Object.fromEntries(safetyKeys.map((key) => [key, true])),
};

describe("adminMissionDraftSchema", () => {
  it("accepts a complete multi-question mission draft", () => {
    expect(adminMissionDraftSchema.safeParse(base).success).toBe(true);
  });
  it("rejects an invalid slug", () => {
    expect(adminMissionDraftSchema.safeParse({ ...base, slug: "Mission Demo" }).success).toBe(false);
  });
});

const resourceBase = {
  slug: "video-huong-dan-demo",
  title: "Video hướng dẫn demo",
  excerpt: "Một phần giới thiệu đủ dài cho tài nguyên video.",
  content: "Nội dung hướng dẫn chi tiết dành cho phụ huynh và trẻ trong gia đình.",
  resourceType: "video" as const,
  category: "companionship" as const,
  ageGroups: ["6-8"] as const,
  coverUrl: "/assets/demo.png",
  mediaUrl: "/uploads/video-demo.webm",
  sortOrder: 1,
  status: "draft" as const,
};

describe("adminResourceSchema", () => {
  it("requires an uploaded video URL for video resources", () => {
    expect(adminResourceSchema.safeParse({ ...resourceBase, mediaUrl: null }).success).toBe(false);
    expect(adminResourceSchema.safeParse(resourceBase).success).toBe(true);
  });
});
