import { ProductionMissionEditor } from "@/features/admin/production-mission-editor";
import { getAdminTaxonomy } from "@/modules/admin/mission-admin";
import type { AdminMissionDraft } from "@/modules/admin/schemas";

export default async function Page() {
  const taxonomy = await getAdminTaxonomy();
  const initial: AdminMissionDraft = {
    slug: "",
    worldId: taxonomy.worlds[0].id,
    title: "",
    subtitle: "Một chuyến khám phá ngắn và tích cực",
    shortDescription: "Mô tả ngắn mục tiêu của nhiệm vụ dành cho trẻ.",
    storyIntro:
      "Bống vừa tìm thấy một manh mối mới trong khu rừng. Con cùng Bống quan sát và tìm lời giải nhé!",
    estimatedMinutes: 5,
    primarySkillId: taxonomy.skills[0].id,
    secondarySkillIds: [],
    rewardBadgeId: taxonomy.badges[0]?.id ?? null,
    coverUrl: "/assets/cards/mission-thumb-footprint-detective.png",
    ageGroups: ["4-5"],
    difficulty: 1,
    allowReplay: true,
    randomizeAnswers: false,
    questions: [
      {
        type: "single_choice",
        order: 1,
        prompt: "Con chọn manh mối nào?",
        instruction: "Hãy nhìn kỹ rồi chọn một đáp án.",
        payload: {
          options: [
            { id: "a", label: "Manh mối A" },
            { id: "b", label: "Manh mối B" },
          ],
        },
        correctAnswer: "a",
        difficulty: 1,
        feedbackCorrect: "Tuyệt vời! Con đã quan sát rất kỹ.",
        feedbackIncorrect: "Chưa trúng thôi! Con thử nhìn lại nhé.",
        hints: [{ level: 1, text: "Con thử so sánh hai lựa chọn." }],
      },
    ],
    safety: {
      ageAppropriate: false,
      hintsSupportive: false,
      feedbackPositive: false,
      noProhibitedClaims: false,
      noExternalLinks: false,
      languageAndImagesSafe: false,
    },
  };
  return <ProductionMissionEditor initial={initial} taxonomy={taxonomy} />;
}
