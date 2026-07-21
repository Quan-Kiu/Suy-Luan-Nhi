import type { AdminMissionDraft } from "@/modules/admin/schemas";

export type MissionEditorTaxonomy = {
  worlds: Array<{ id: string; title: string }>;
  skills: Array<{ id: string; title: string; slug: string }>;
  badges: Array<{ id: string; name: string; iconUrl: string; active: boolean }>;
};

export type DraftQuestion = AdminMissionDraft["questions"][number];
export type QuestionType = DraftQuestion["type"];
