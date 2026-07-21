import { describe, expect, it } from "vitest";
import { createBadgeSchema, updateBadgeSchema } from "@/modules/admin/badge-admin";
import { adminResourceSchema } from "@/modules/admin/resource-admin";
import {
  adminMissionDraftSchema,
  reviewApprovalSchema,
  reviewRejectionSchema,
  safetyKeys,
} from "@/modules/admin/schemas";

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

  it("returns clear Vietnamese messages for mission fields", () => {
    const result = adminMissionDraftSchema.safeParse({
      ...base,
      subtitle: "a",
      questions: [{ ...base.questions[0], prompt: "a" }],
    });
    expect(result.success).toBe(false);
    if (result.success) return;

    const messages = new Map(result.error.issues.map((issue) => [issue.path.join("."), issue.message]));
    expect(messages.get("subtitle")).toBe("Câu giới thiệu cần ít nhất 3 ký tự");
    expect(messages.get("questions.0.prompt")).toBe("Câu hỏi cần ít nhất 4 ký tự");
  });
});

describe("review decision schemas", () => {
  it("allows approval without a comment", () => {
    expect(reviewApprovalSchema.parse({ comment: "" })).toEqual({ comment: "" });
    expect(reviewApprovalSchema.parse({})).toEqual({ comment: "" });
  });

  it("requires a useful comment when requesting changes", () => {
    expect(reviewRejectionSchema.safeParse({ comment: "" }).success).toBe(false);
    expect(reviewRejectionSchema.safeParse({ comment: "abc" }).success).toBe(false);
    expect(reviewRejectionSchema.safeParse({ comment: "Cần sửa phần gợi ý" }).success).toBe(true);
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

describe("badge schemas", () => {
  const badge = {
    slug: "nguoi-ban-khu-pho-xanh",
    name: "Người bạn Khu phố Xanh",
    description: "Hoàn thành nhiệm vụ và cùng chăm sóc khu phố.",
    iconUrl: "/assets/badge.png",
    skillId: null,
  };

  it("accepts a complete badge and keeps the technical code safe", () => {
    expect(createBadgeSchema.safeParse(badge).success).toBe(true);
    expect(createBadgeSchema.safeParse({ ...badge, slug: "Huy hiệu mới" }).success).toBe(false);
  });

  it("allows an existing badge to be hidden without deleting it", () => {
    expect(updateBadgeSchema.safeParse({ ...badge, active: false, slug: undefined }).success).toBe(true);
  });
});
