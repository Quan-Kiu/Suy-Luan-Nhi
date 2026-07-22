import type { Mission, MissionWorld, SafetyChecklist } from "./schemas";

export const assets = {
  logo: "/assets/mascots/brand-logo-horizontal.png",
  logoHead: "/assets/mascots/brand-logo-detective-head.png",
  hero: "/assets/scenes/hero-landing-detective-camp.png",
  profile: "/assets/scenes/scene-profile-dog-treehouse.png",
  missionDetail: "/assets/cards/mission-thumb-footprint-detective.png",
  complete: "/assets/scenes/scene-mission-complete-celebration.png",
  parent: "/assets/scenes/scene-parent-guidance.png",
  hedgehog: "/assets/mascots/mascot-hedgehog-speaking.png",
  hedgehogMap: "/assets/mascots/mascot-hedgehog-map.png",
  hedgehogThumb: "/assets/mascots/mascot-hedgehog-thumbs-up.png",
  dogAvatar: "/assets/mascots/mascot-dog-bong-avatar.png",
  badge: "/assets/props/badge-sharp-detective.png",
  privacy: "/assets/props/badge-privacy-shield-lock.png",
  growth: "/assets/props/parent-value-growth.png",
  family: "/assets/props/parent-value-family-support.png",
  treasure: "/assets/props/reward-treasure-chest.png",
};

export const missionWorlds: MissionWorld[] = [
  {
    id: "pattern-detective",
    order: 1,
    title: "Thám tử Quy luật",
    subtitle: "Quan sát thật tinh",
    description: "Tìm quy luật trong màu sắc và hình ảnh.",
    coverImage: "/assets/cards/world-card-detective-rules.png",
    theme: "green",
    status: "recommended",
  },
  {
    id: "cause-train",
    order: 2,
    title: "Chuyến tàu Nguyên nhân",
    subtitle: "Điều gì xảy ra trước?",
    description: "Khám phá nguyên nhân và kết quả.",
    coverImage: "/assets/cards/world-card-cause-train.png",
    theme: "blue",
    status: "locked",
  },
  {
    id: "space-crew",
    order: 3,
    title: "Phi hành đoàn Không gian",
    subtitle: "Phân loại và khám phá",
    description: "Suy luận qua những chuyến bay vui nhộn.",
    coverImage: "/assets/cards/world-card-space.png",
    theme: "purple",
    status: "locked",
  },
  {
    id: "logic-laughs",
    order: 4,
    title: "Truyện Cười Logic",
    subtitle: "Cười và nghĩ",
    description: "Chọn lời giải hợp lý cho tình huống vui.",
    coverImage: "/assets/cards/world-card-logic-clown.png",
    theme: "orange",
    status: "locked",
  },
];

export const defaultSafetyChecklist: SafetyChecklist = {
  ageAppropriate: true,
  hintsSupportive: true,
  feedbackPositive: true,
  noProhibitedClaims: true,
  noExternalLinks: true,
  languageAndImagesSafe: true,
};

export const footprintMission: Mission = {
  id: "footprint-detective",
  worldId: "pattern-detective",
  title: "Thám tử dấu chân",
  subtitle: "Mảnh nối nào xuất hiện tiếp theo?",
  shortDescription: "Quan sát chuỗi hình và tìm mảnh còn thiếu.",
  storyIntro:
    "Các bạn thú trong rừng để lại một dãy dấu chân bí mật. Bống cần con giúp tìm ra quy luật để mở chiếc rương nhỏ!",
  estimatedMinutes: 5,
  targetAgeGroups: ["6-8", "6-8"],
  primarySkill: "Quan sát quy luật",
  secondarySkills: ["Nhìn kỹ", "Thử lại", "So sánh", "Kiểm tra"],
  reward: { name: "Thám tử tinh mắt", asset: assets.badge },
  coverImage: assets.missionDetail,
  status: "published",
  safety: defaultSafetyChecklist,
  questions: [
    {
      id: "q-pattern-01",
      type: "pattern_sequence",
      prompt: "Mảnh nối nào xuất hiện tiếp theo?",
      instruction: "Quan sát quy luật và chọn đáp án đúng nhé!",
      sequence: [
        { id: "tree-1", label: "Cây xanh", asset: "/assets/gameplay/puzzle-item-tree.png" },
        { id: "star-1", label: "Ngôi sao", asset: "/assets/gameplay/puzzle-item-blue-star.png" },
        { id: "moon-1", label: "Mặt trăng", asset: "/assets/gameplay/puzzle-item-moon.png" },
        { id: "tree-2", label: "Cây xanh", asset: "/assets/gameplay/puzzle-item-tree.png" },
        { id: "missing", label: "Ô còn thiếu", asset: null },
      ],
      options: [
        { id: "moon", label: "Mặt trăng", asset: "/assets/gameplay/puzzle-item-moon.png" },
        { id: "tree", label: "Cây xanh", asset: "/assets/gameplay/puzzle-item-tree.png" },
        { id: "star", label: "Ngôi sao", asset: "/assets/gameplay/puzzle-item-blue-star.png" },
        { id: "sun", label: "Mặt trời", asset: "/assets/gameplay/puzzle-item-sun.png" },
      ],
      correctAnswer: "star",
      hints: [
        "Con thử nhìn ba hình đầu tiên xem chúng lặp lại thế nào nhé.",
        "Sau cây xanh là ngôi sao, rồi đến mặt trăng.",
        "Dãy mới đã bắt đầu bằng cây xanh, vậy tiếp theo là ngôi sao.",
      ],
      feedbackCorrect: "Bé quan sát rất kỹ! Mảnh tiếp theo đúng là ngôi sao.",
      feedbackIncorrect: "Chưa chính xác. Con nhìn lại thứ tự ba hình đầu nhé.",
    },
  ],
};
