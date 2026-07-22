import { describe, expect, it } from "vitest";
import { DEFAULT_CHILD_AVATAR_ASSET_ID } from "@/domain/child-avatar";
import {
  createChildProfileSchema,
  missionEditorSchema,
  missionSchema,
  parentUnlockSchema,
  questionSchema,
} from "@/domain/schemas";
import { defaultSafetyChecklist, footprintMission } from "@/domain/content";

function validEditorInput() {
  const question = footprintMission.questions[0];
  return {
    title: footprintMission.title,
    subtitle: footprintMission.subtitle,
    shortDescription: footprintMission.shortDescription,
    storyIntro: footprintMission.storyIntro,
    estimatedMinutes: footprintMission.estimatedMinutes,
    primarySkill: footprintMission.primarySkill,
    ageGroup: "6-8" as const,
    coverImage: footprintMission.coverImage,
    rewardName: footprintMission.reward.name,
    prompt: question.prompt,
    instruction: question.instruction,
    sequence: question.sequence.map((item) => ({ ...item, asset: item.asset ?? "" })),
    options: question.options,
    correctAnswer: question.correctAnswer,
    hints: question.hints.map((text) => ({ text })),
    feedbackCorrect: question.feedbackCorrect,
    feedbackIncorrect: question.feedbackIncorrect,
    safety: { ...defaultSafetyChecklist },
  };
}

describe("Child Profile validation", () => {
  it("accepts a privacy-minimal nickname and age group", () => {
    expect(
      createChildProfileSchema.parse({
        displayName: "Bống",
        ageGroup: "6-8",
        avatarAssetId: DEFAULT_CHILD_AVATAR_ASSET_ID,
      }),
    ).toEqual({
      displayName: "Bống",
      ageGroup: "6-8",
      avatarAssetId: DEFAULT_CHILD_AVATAR_ASSET_ID,
    });
  });

  it("rejects an empty nickname and unsupported age group", () => {
    expect(createChildProfileSchema.safeParse({ displayName: "", ageGroup: "9-11" }).success).toBe(false);
  });
});

describe("Question validation", () => {
  it("requires the correct answer to exist in the options", () => {
    const question = { ...footprintMission.questions[0], correctAnswer: "missing-option" };
    expect(questionSchema.safeParse(question).success).toBe(false);
  });
});

describe("Mission validation", () => {
  it("requires a complete Safety Checklist for published missions", () => {
    const mission = {
      ...footprintMission,
      safety: { ...defaultSafetyChecklist, noExternalLinks: false },
    };
    expect(missionSchema.safeParse(mission).success).toBe(false);
  });
});

describe("Mission editor validation", () => {
  it("accepts a complete safe mission draft", () => {
    expect(missionEditorSchema.safeParse(validEditorInput()).success).toBe(true);
  });

  it("keeps an incomplete Safety Checklist valid as a draft", () => {
    const input = validEditorInput();
    input.safety.noExternalLinks = false;
    expect(missionEditorSchema.safeParse(input).success).toBe(true);
  });

  it("rejects unclear question copy", () => {
    const input = validEditorInput();
    input.prompt = "Ngắn";
    expect(missionEditorSchema.safeParse(input).success).toBe(false);
  });

  it("rejects an answer that was removed from the options", () => {
    const input = validEditorInput();
    input.options = input.options.filter((option) => option.id !== input.correctAnswer);
    expect(missionEditorSchema.safeParse(input).success).toBe(false);
  });
});

describe("Parent Gate validation", () => {
  it("accepts only the displayed answer", () => {
    expect(parentUnlockSchema.safeParse({ answer: "23" }).success).toBe(true);
    expect(parentUnlockSchema.safeParse({ answer: "1706" }).success).toBe(false);
  });
});
