import type { AdminMissionDraft } from "@/modules/admin/schemas";
import type { QuestionType } from "@/features/admin/mission-editor/types";

export const safetyKeys = [
  "ageAppropriate",
  "hintsSupportive",
  "feedbackPositive",
  "noProhibitedClaims",
  "noExternalLinks",
  "languageAndImagesSafe",
] as const satisfies ReadonlyArray<keyof AdminMissionDraft["safety"]>;

export const safetyLabelKeys: Record<(typeof safetyKeys)[number], string> = {
  ageAppropriate: "missionEditor.safety.ageAppropriate",
  hintsSupportive: "missionEditor.safety.hintsSupportive",
  feedbackPositive: "missionEditor.safety.feedbackPositive",
  noProhibitedClaims: "missionEditor.safety.noProhibitedClaims",
  noExternalLinks: "missionEditor.safety.noExternalLinks",
  languageAndImagesSafe: "missionEditor.safety.languageAndImagesSafe",
};

export const questionTypes: QuestionType[] = [
  "single_choice",
  "pattern_sequence",
  "drag_drop",
  "fill_answer",
  "sorting",
];

export const questionTypeLabelKeys: Record<QuestionType, string> = {
  single_choice: "missionEditor.type.singleChoice",
  pattern_sequence: "missionEditor.type.pattern",
  drag_drop: "missionEditor.type.dragDrop",
  fill_answer: "missionEditor.type.fillAnswer",
  sorting: "missionEditor.type.sorting",
};
