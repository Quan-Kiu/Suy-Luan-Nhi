import type { PlayableQuestion } from "@/modules/gameplay/question";

export const skillSeeds = [
  ["observe", "Quan sát", "Nhìn kỹ chi tiết và nhận ra tín hiệu quan trọng.", "thinking"],
  ["pattern", "Nhận diện quy luật", "Tìm phần lặp lại và dự đoán bước tiếp theo.", "thinking"],
  ["retry", "Biết thử lại", "Thay đổi cách làm sau một lần chưa trúng.", "habit"],
  ["compare", "So sánh", "Tìm điểm giống và khác giữa các lựa chọn.", "thinking"],
  ["check", "Tự kiểm tra", "Dừng lại và kiểm tra lời giải của mình.", "habit"],
  ["cause", "Nguyên nhân – kết quả", "Hiểu điều gì xảy ra trước và điều gì xảy ra sau.", "thinking"],
  ["classify", "Phân loại", "Nhóm các đồ vật theo đặc điểm chung.", "thinking"],
  ["sequence", "Sắp xếp trình tự", "Đặt sự kiện theo một thứ tự hợp lý.", "thinking"],
  ["problem-solving", "Giải quyết vấn đề", "Thử nhiều manh mối để tìm một cách giải hợp lý.", "thinking"],
] as const;

export const worldSeeds = [
  {
    slug: "pattern-detective",
    title: "Thám tử Quy luật",
    subtitle: "Quan sát thật tinh",
    description: "Tìm nhịp lặp, hình còn thiếu và những manh mối nhỏ trong khu rừng.",
    sortOrder: 1,
    themeColor: "green",
    coverUrl: "/assets/cards/world-card-detective-rules.png",
    skillSlugs: ["observe", "pattern", "check"],
  },
  {
    slug: "cause-train",
    title: "Chuyến tàu Nguyên nhân",
    subtitle: "Điều gì xảy ra trước?",
    description: "Theo đoàn tàu khám phá nguyên nhân, kết quả và thứ tự của các sự kiện.",
    sortOrder: 2,
    themeColor: "blue",
    coverUrl: "/assets/cards/world-card-cause-train.png",
    skillSlugs: ["cause", "sequence", "compare"],
  },
  {
    slug: "space-crew",
    title: "Phi hành đoàn Không gian",
    subtitle: "Phân loại và khám phá",
    description: "Cùng phi hành đoàn sắp xếp hành tinh, giải mã tín hiệu và chuẩn bị chuyến bay.",
    sortOrder: 3,
    themeColor: "purple",
    coverUrl: "/assets/cards/world-card-space.png",
    skillSlugs: ["classify", "pattern", "problem-solving"],
  },
  {
    slug: "logic-laughs",
    title: "Truyện Cười Logic",
    subtitle: "Cười và nghĩ",
    description: "Chọn lời giải hợp lý cho những tình huống ngộ nghĩnh và bất ngờ.",
    sortOrder: 4,
    themeColor: "orange",
    coverUrl: "/assets/cards/world-card-logic-clown.png",
    skillSlugs: ["problem-solving", "cause", "sequence"],
  },
] as const;

const baseQuestion = (
  order: number,
  type: PlayableQuestion["type"],
  prompt: string,
  instruction: string,
) => ({
  order,
  type,
  prompt,
  instruction,
  difficulty: order,
  feedbackCorrect: "Tuyệt vời! Con đã tìm ra manh mối rồi.",
  feedbackIncorrect: "Chưa trúng thôi! Con thử nhìn lại từng chi tiết nhé.",
  hints: [
    { level: 1, text: "Con dừng lại và nhìn từng phần một nhé." },
    { level: 2, text: "Thử tìm điều đang lặp lại hoặc điều xảy ra trước." },
    { level: 3, text: "Loại những lựa chọn không khớp với manh mối rõ nhất." },
  ],
});

const option = (id: string, label: string, asset?: string) => ({ id, label, asset, altText: label });

export type MissionSeed = {
  slug: string;
  worldSlug: string;
  title: string;
  subtitle: string;
  shortDescription: string;
  storyIntro: string;
  estimatedMinutes: number;
  ageGroups: Array<"2-3" | "4-5" | "6-8">;
  primarySkill: string;
  secondarySkills: string[];
  coverUrl: string;
  rewardBadge: string;
  difficulty: number;
  questions: Array<Omit<PlayableQuestion, "id">>;
};

export const missionSeeds: MissionSeed[] = [
  {
    slug: "footprint-detective",
    worldSlug: "pattern-detective",
    title: "Thám tử dấu chân",
    subtitle: "Mảnh nối nào xuất hiện tiếp theo?",
    shortDescription: "Quan sát chuỗi hình và tìm mảnh còn thiếu.",
    storyIntro:
      "Các bạn thú để lại một dãy dấu chân bí mật. Bống cần con tìm quy luật để mở chiếc rương nhỏ!",
    estimatedMinutes: 5,
    ageGroups: ["4-5", "6-8"],
    primarySkill: "pattern",
    secondarySkills: ["observe", "retry", "check"],
    coverUrl: "/assets/cards/mission-thumb-footprint-detective.png",
    rewardBadge: "sharp-detective",
    difficulty: 1,
    questions: [
      {
        ...baseQuestion(
          1,
          "pattern_sequence",
          "Hình nào xuất hiện tiếp theo?",
          "Quan sát thứ tự cây, sao và trăng.",
        ),
        type: "pattern_sequence",
        payload: {
          sequence: [
            option("tree-1", "Cây", "/assets/gameplay/puzzle-item-tree.png"),
            option("star-1", "Sao", "/assets/gameplay/puzzle-item-blue-star.png"),
            option("moon-1", "Trăng", "/assets/gameplay/puzzle-item-moon.png"),
            option("tree-2", "Cây", "/assets/gameplay/puzzle-item-tree.png"),
            { ...option("missing", "Ô còn thiếu"), missing: true },
          ],
          options: [
            option("moon", "Mặt trăng", "/assets/gameplay/puzzle-item-moon.png"),
            option("tree", "Cây xanh", "/assets/gameplay/puzzle-item-tree.png"),
            option("star", "Ngôi sao", "/assets/gameplay/puzzle-item-blue-star.png"),
            option("sun", "Mặt trời", "/assets/gameplay/puzzle-item-sun.png"),
          ],
        },
        correctAnswer: "star",
      },
      {
        ...baseQuestion(2, "single_choice", "Dấu chân nào giống mẫu nhất?", "So sánh màu và hình dáng."),
        type: "single_choice",
        payload: {
          options: [
            option("blue", "Dấu chân xanh", "/assets/gameplay/puzzle-paw-blue.png"),
            option("green", "Dấu chân lá", "/assets/gameplay/puzzle-paw-green.png"),
            option("orange", "Dấu chân cam", "/assets/gameplay/puzzle-paw-orange.png"),
          ],
        },
        correctAnswer: "blue",
      },
    ],
  },
  {
    slug: "lantern-rhythm",
    worldSlug: "pattern-detective",
    title: "Nhịp đèn lồng",
    subtitle: "Ánh sáng đang nhấp nháy theo nhịp nào?",
    shortDescription: "Tìm quy luật màu của những chiếc đèn trong lều.",
    storyIntro: "Đêm xuống, đèn lồng bên lều nhấp nháy thành một mật mã. Con giúp Bống đọc nhịp sáng nhé!",
    estimatedMinutes: 5,
    ageGroups: ["2-3", "4-5"],
    primarySkill: "pattern",
    secondarySkills: ["observe", "compare"],
    coverUrl: "/assets/scenes/hero-landing-detective-camp.png",
    rewardBadge: "pattern-finder",
    difficulty: 1,
    questions: [
      {
        ...baseQuestion(
          1,
          "pattern_sequence",
          "Màu nào sáng tiếp theo?",
          "Nhìn nhịp vàng, xanh, vàng, xanh.",
        ),
        type: "pattern_sequence",
        payload: {
          sequence: [
            option("yellow-1", "Vàng", "/assets/props/prop-lantern.png"),
            option("green-1", "Xanh", "/assets/gameplay/puzzle-paw-green.png"),
            option("yellow-2", "Vàng", "/assets/props/prop-lantern.png"),
            { ...option("missing", "Ô còn thiếu"), missing: true },
          ],
          options: [
            option("yellow", "Vàng", "/assets/props/prop-lantern.png"),
            option("green", "Xanh", "/assets/gameplay/puzzle-paw-green.png"),
            option("blue", "Xanh dương", "/assets/gameplay/puzzle-paw-blue.png"),
          ],
        },
        correctAnswer: "green",
      },
      {
        ...baseQuestion(2, "fill_answer", "Có bao nhiêu chiếc đèn trong nhịp đầu?", "Nhập một số đơn giản."),
        type: "fill_answer",
        payload: { placeholder: "Nhập số", inputMode: "numeric" },
        correctAnswer: ["2", "hai"],
      },
    ],
  },
  {
    slug: "forest-shelves",
    worldSlug: "pattern-detective",
    title: "Kệ đồ trong rừng",
    subtitle: "Xếp các đồ vật theo kích thước",
    shortDescription: "So sánh và sắp xếp những món đồ thám tử.",
    storyIntro: "Căn nhà cây cần được dọn gọn trước khi mưa tới. Con xếp đồ cùng nhím phụ tá nhé!",
    estimatedMinutes: 6,
    ageGroups: ["4-5", "6-8"],
    primarySkill: "compare",
    secondarySkills: ["sequence", "check"],
    coverUrl: "/assets/scenes/scene-profile-dog-treehouse.png",
    rewardBadge: "careful-observer",
    difficulty: 2,
    questions: [
      {
        ...baseQuestion(
          1,
          "sorting",
          "Xếp đồ từ nhỏ đến lớn",
          "Kéo để đặt kính lúp, ba lô và nhà cây đúng thứ tự.",
        ),
        type: "sorting",
        payload: {
          items: [
            option("treehouse", "Nhà cây", "/assets/props/prop-treehouse.png"),
            option("magnifier", "Kính lúp", "/assets/props/prop-magnifier.png"),
            option("backpack", "Ba lô", "/assets/props/prop-backpack.png"),
          ],
        },
        correctAnswer: ["magnifier", "backpack", "treehouse"],
      },
      {
        ...baseQuestion(2, "drag_drop", "Đặt đồ vào đúng nhóm", "Đồ đọc sách và đồ khám phá có nơi riêng."),
        type: "drag_drop",
        payload: {
          items: [
            option("books", "Sách", "/assets/props/prop-books-stack.png"),
            option("compass", "La bàn", "/assets/props/prop-compass.png"),
          ],
          slots: [
            { id: "reading", label: "Góc đọc sách" },
            { id: "explore", label: "Túi khám phá" },
          ],
        },
        correctAnswer: { reading: "books", explore: "compass" },
      },
    ],
  },
  {
    slug: "seed-to-tree",
    worldSlug: "cause-train",
    title: "Từ hạt thành cây",
    subtitle: "Điều gì xảy ra trước?",
    shortDescription: "Sắp xếp hành trình một hạt mầm lớn lên.",
    storyIntro: "Đoàn tàu chở một hạt mầm bé xíu. Mỗi ga là một bước để hạt trở thành cây xanh.",
    estimatedMinutes: 6,
    ageGroups: ["4-5", "6-8"],
    primarySkill: "cause",
    secondarySkills: ["sequence", "observe"],
    coverUrl: "/assets/cards/world-card-cause-train.png",
    rewardBadge: "cause-explorer",
    difficulty: 2,
    questions: [
      {
        ...baseQuestion(1, "sorting", "Xếp hành trình của hạt", "Đặt hạt, mầm và cây theo thứ tự."),
        type: "sorting",
        payload: {
          items: [
            option("tree", "Cây", "/assets/gameplay/puzzle-item-tree.png"),
            option("seed", "Hạt"),
            option("sprout", "Mầm", "/assets/props/prop-plant-pot.png"),
          ],
        },
        correctAnswer: ["seed", "sprout", "tree"],
      },
      {
        ...baseQuestion(
          2,
          "drag_drop",
          "Ghép nguyên nhân với kết quả",
          "Đặt nước và ánh nắng vào điều chúng giúp tạo ra.",
        ),
        type: "drag_drop",
        payload: {
          items: [
            option("water", "Tưới nước"),
            option("sun", "Ánh nắng", "/assets/gameplay/puzzle-item-sun.png"),
          ],
          slots: [
            { id: "roots", label: "Rễ hút nước" },
            { id: "leaves", label: "Lá nhận ánh sáng" },
          ],
        },
        correctAnswer: { roots: "water", leaves: "sun" },
      },
    ],
  },
  {
    slug: "rainy-picnic",
    worldSlug: "cause-train",
    title: "Buổi picnic có mưa",
    subtitle: "Vì sao mọi người mở ô?",
    shortDescription: "Tìm nguyên nhân và kết quả trong một buổi dã ngoại.",
    storyIntro: "Mây kéo đến khi cả nhóm đang picnic. Con giúp đoàn tàu nối đúng những điều xảy ra nhé.",
    estimatedMinutes: 5,
    ageGroups: ["2-3", "4-5"],
    primarySkill: "cause",
    secondarySkills: ["compare", "sequence"],
    coverUrl: "/assets/cards/parent-talk-suggestion.png",
    rewardBadge: "cause-explorer",
    difficulty: 1,
    questions: [
      {
        ...baseQuestion(1, "single_choice", "Vì sao các bạn mở ô?", "Chọn nguyên nhân hợp lý nhất."),
        type: "single_choice",
        payload: {
          options: [
            option("rain", "Trời mưa"),
            option("sun", "Trời nắng", "/assets/gameplay/puzzle-item-sun.png"),
            option("books", "Có sách", "/assets/props/prop-books-stack.png"),
          ],
        },
        correctAnswer: "rain",
      },
      {
        ...baseQuestion(2, "sorting", "Điều gì xảy ra theo thứ tự?", "Xếp mây đến, mưa rơi, rồi mở ô."),
        type: "sorting",
        payload: {
          items: [option("umbrella", "Mở ô"), option("cloud", "Mây đến"), option("rain", "Mưa rơi")],
        },
        correctAnswer: ["cloud", "rain", "umbrella"],
      },
    ],
  },
  {
    slug: "train-clues",
    worldSlug: "cause-train",
    title: "Manh mối trên toa tàu",
    subtitle: "Tìm ga tiếp theo từ các dấu hiệu",
    shortDescription: "Đọc dấu hiệu và suy luận nơi đoàn tàu sắp đến.",
    storyIntro: "Mỗi toa tàu có một manh mối: lá cây, sách và ngôi sao. Chúng đang dẫn cả nhóm đến đâu?",
    estimatedMinutes: 7,
    ageGroups: ["6-8"],
    primarySkill: "problem-solving",
    secondarySkills: ["cause", "check"],
    coverUrl: "/assets/cards/banner-daily-mission-hedgehog.png",
    rewardBadge: "problem-solver",
    difficulty: 3,
    questions: [
      {
        ...baseQuestion(1, "fill_answer", "Ga nào có nhiều cây?", "Nhập từ còn thiếu: khu ___."),
        type: "fill_answer",
        payload: { placeholder: "khu...", inputMode: "text" },
        correctAnswer: ["rừng", "khu rừng"],
      },
      {
        ...baseQuestion(2, "single_choice", "Manh mối sách dẫn đến đâu?", "Chọn nơi phù hợp nhất."),
        type: "single_choice",
        payload: {
          options: [
            option("library", "Thư viện", "/assets/props/prop-books-stack.png"),
            option("space", "Không gian", "/assets/cards/world-card-space.png"),
            option("forest", "Khu rừng", "/assets/gameplay/puzzle-item-tree.png"),
          ],
        },
        correctAnswer: "library",
      },
    ],
  },
  {
    slug: "planet-groups",
    worldSlug: "space-crew",
    title: "Nhóm hành tinh",
    subtitle: "Phân loại các vật thể không gian",
    shortDescription: "Nhóm các vật thể theo màu và hình dáng.",
    storyIntro: "Máy tính trên tàu cần con sắp xếp các hành tinh trước khi cất cánh.",
    estimatedMinutes: 6,
    ageGroups: ["4-5", "6-8"],
    primarySkill: "classify",
    secondarySkills: ["compare", "observe"],
    coverUrl: "/assets/cards/world-card-space.png",
    rewardBadge: "space-classifier",
    difficulty: 2,
    questions: [
      {
        ...baseQuestion(1, "drag_drop", "Đặt vật thể vào đúng nhóm", "Ngôi sao và mặt trăng có nhóm riêng."),
        type: "drag_drop",
        payload: {
          items: [
            option("star", "Ngôi sao", "/assets/gameplay/puzzle-item-blue-star.png"),
            option("moon", "Mặt trăng", "/assets/gameplay/puzzle-item-moon.png"),
          ],
          slots: [
            { id: "stars", label: "Nhóm sao" },
            { id: "moons", label: "Nhóm trăng" },
          ],
        },
        correctAnswer: { stars: "star", moons: "moon" },
      },
      {
        ...baseQuestion(2, "single_choice", "Vật nào phát sáng như một ngôi sao?", "Chọn hình có tia sáng."),
        type: "single_choice",
        payload: {
          options: [
            option("star", "Ngôi sao", "/assets/gameplay/puzzle-item-blue-star.png"),
            option("moon", "Mặt trăng", "/assets/gameplay/puzzle-item-moon.png"),
            option("tree", "Cây", "/assets/gameplay/puzzle-item-tree.png"),
          ],
        },
        correctAnswer: "star",
      },
    ],
  },
  {
    slug: "rocket-countdown",
    worldSlug: "space-crew",
    title: "Đếm ngược tên lửa",
    subtitle: "Sắp xếp trước giờ cất cánh",
    shortDescription: "Điền số và sắp xếp các bước chuẩn bị tên lửa.",
    storyIntro: "Phi hành đoàn chỉ còn vài phút. Con giúp kiểm tra mọi bước theo đúng thứ tự nhé!",
    estimatedMinutes: 6,
    ageGroups: ["4-5", "6-8"],
    primarySkill: "sequence",
    secondarySkills: ["check", "problem-solving"],
    coverUrl: "/assets/scenes/scene-mission-map-background.png",
    rewardBadge: "space-classifier",
    difficulty: 2,
    questions: [
      {
        ...baseQuestion(1, "fill_answer", "Số nào đứng trước số 3 khi đếm ngược?", "Nhập một số."),
        type: "fill_answer",
        payload: { placeholder: "Số", inputMode: "numeric" },
        correctAnswer: ["4", "bốn"],
      },
      {
        ...baseQuestion(2, "sorting", "Xếp các bước trước khi bay", "Kiểm tra, thắt dây và cất cánh."),
        type: "sorting",
        payload: {
          items: [
            option("launch", "Cất cánh"),
            option("belt", "Thắt dây an toàn"),
            option("check", "Kiểm tra tàu"),
          ],
        },
        correctAnswer: ["check", "belt", "launch"],
      },
    ],
  },
  {
    slug: "alien-signal",
    worldSlug: "space-crew",
    title: "Tín hiệu bạn ngoài hành tinh",
    subtitle: "Giải mã chuỗi ánh sáng",
    shortDescription: "Tìm quy luật và ghép tín hiệu đúng vị trí.",
    storyIntro: "Một người bạn tím gửi tín hiệu vui từ xa. Con giải mã để gửi lời chào lại nhé.",
    estimatedMinutes: 7,
    ageGroups: ["6-8"],
    primarySkill: "pattern",
    secondarySkills: ["retry", "problem-solving"],
    coverUrl: "/assets/cards/world-card-space.png",
    rewardBadge: "pattern-finder",
    difficulty: 3,
    questions: [
      {
        ...baseQuestion(1, "pattern_sequence", "Tín hiệu nào tiếp theo?", "Sao, trăng, sao, trăng..."),
        type: "pattern_sequence",
        payload: {
          sequence: [
            option("star-1", "Sao", "/assets/gameplay/puzzle-item-blue-star.png"),
            option("moon-1", "Trăng", "/assets/gameplay/puzzle-item-moon.png"),
            option("star-2", "Sao", "/assets/gameplay/puzzle-item-blue-star.png"),
            { ...option("missing", "Ô trống"), missing: true },
          ],
          options: [
            option("star", "Sao", "/assets/gameplay/puzzle-item-blue-star.png"),
            option("moon", "Trăng", "/assets/gameplay/puzzle-item-moon.png"),
            option("sun", "Mặt trời", "/assets/gameplay/puzzle-item-sun.png"),
          ],
        },
        correctAnswer: "moon",
      },
      {
        ...baseQuestion(
          2,
          "drag_drop",
          "Ghép tín hiệu với ý nghĩa",
          "Đặt sao vào lời chào và trăng vào lời chúc ngủ ngon.",
        ),
        type: "drag_drop",
        payload: {
          items: [
            option("star", "Sao", "/assets/gameplay/puzzle-item-blue-star.png"),
            option("moon", "Trăng", "/assets/gameplay/puzzle-item-moon.png"),
          ],
          slots: [
            { id: "hello", label: "Xin chào" },
            { id: "goodnight", label: "Chúc ngủ ngon" },
          ],
        },
        correctAnswer: { hello: "star", goodnight: "moon" },
      },
    ],
  },
  {
    slug: "clown-umbrella",
    worldSlug: "logic-laughs",
    title: "Chú hề và chiếc ô",
    subtitle: "Lời giải nào hợp lý nhất?",
    shortDescription: "Suy luận vui từ một tình huống bất ngờ.",
    storyIntro: "Chú hề mang ô vào nhà dù trời không mưa. Có thể chú đang dùng nó làm gì nhỉ?",
    estimatedMinutes: 5,
    ageGroups: ["4-5", "6-8"],
    primarySkill: "problem-solving",
    secondarySkills: ["cause", "compare"],
    coverUrl: "/assets/cards/world-card-logic-clown.png",
    rewardBadge: "logic-laugher",
    difficulty: 2,
    questions: [
      {
        ...baseQuestion(
          1,
          "single_choice",
          "Vì sao chú hề mở ô trong nhà?",
          "Chọn lời giải vừa vui vừa hợp lý.",
        ),
        type: "single_choice",
        payload: {
          options: [
            option("show", "Đang biểu diễn"),
            option("rain", "Mưa trong nhà"),
            option("sleep", "Đang ngủ"),
          ],
        },
        correctAnswer: "show",
      },
      {
        ...baseQuestion(2, "fill_answer", "Đồ vật nào che mưa?", "Nhập tên đồ vật."),
        type: "fill_answer",
        payload: { placeholder: "Đồ vật", inputMode: "text" },
        correctAnswer: ["ô", "cái ô", "chiếc ô"],
      },
    ],
  },
  {
    slug: "picnic-order",
    worldSlug: "logic-laughs",
    title: "Bữa picnic lộn xộn",
    subtitle: "Xếp lại câu chuyện cho hợp lý",
    shortDescription: "Sắp xếp và tìm hành động phù hợp trong bữa picnic.",
    storyIntro: "Bống đã đặt chiếc bánh lên khăn trước khi trải khăn. Cả nhóm cười và nhờ con xếp lại nhé!",
    estimatedMinutes: 6,
    ageGroups: ["4-5", "6-8"],
    primarySkill: "sequence",
    secondarySkills: ["problem-solving", "check"],
    coverUrl: "/assets/cards/parent-talk-suggestion.png",
    rewardBadge: "logic-laugher",
    difficulty: 2,
    questions: [
      {
        ...baseQuestion(1, "sorting", "Xếp các bước picnic", "Trải khăn, đặt đồ ăn, rồi cùng ăn."),
        type: "sorting",
        payload: {
          items: [option("eat", "Cùng ăn"), option("food", "Đặt đồ ăn"), option("blanket", "Trải khăn")],
        },
        correctAnswer: ["blanket", "food", "eat"],
      },
      {
        ...baseQuestion(
          2,
          "single_choice",
          "Nếu gió thổi khăn bay, nên làm gì?",
          "Chọn hành động an toàn và hợp lý.",
        ),
        type: "single_choice",
        payload: {
          options: [
            option("hold", "Giữ khăn lại"),
            option("ignore", "Không nhìn"),
            option("throw", "Ném thêm đồ"),
          ],
        },
        correctAnswer: "hold",
      },
    ],
  },
  {
    slug: "missing-punchline",
    worldSlug: "logic-laughs",
    title: "Câu nói vui còn thiếu",
    subtitle: "Điền từ để câu chuyện có ý nghĩa",
    shortDescription: "Dùng ngữ cảnh để tìm từ và hình còn thiếu.",
    storyIntro: "Nhím phụ tá kể chuyện nhưng quên mất một từ quan trọng. Con giúp câu chuyện trọn vẹn nhé!",
    estimatedMinutes: 6,
    ageGroups: ["6-8"],
    primarySkill: "problem-solving",
    secondarySkills: ["pattern", "compare"],
    coverUrl: "/assets/cards/banner-daily-mission-hedgehog.png",
    rewardBadge: "problem-solver",
    difficulty: 3,
    questions: [
      {
        ...baseQuestion(1, "fill_answer", "Nhím dùng kính lúp để nhìn thật ___.", "Điền một từ phù hợp."),
        type: "fill_answer",
        payload: { placeholder: "Từ còn thiếu", inputMode: "text" },
        correctAnswer: ["kỹ", "rõ"],
      },
      {
        ...baseQuestion(2, "pattern_sequence", "Nhân vật nào kể tiếp?", "Bống, Nhím, Bống, Nhím..."),
        type: "pattern_sequence",
        payload: {
          sequence: [
            option("dog-1", "Bống", "/assets/mascots/mascot-dog-bong-avatar.png"),
            option("hedgehog-1", "Nhím", "/assets/mascots/mascot-hedgehog-speaking.png"),
            option("dog-2", "Bống", "/assets/mascots/mascot-dog-bong-avatar.png"),
            { ...option("missing", "Ô trống"), missing: true },
          ],
          options: [
            option("dog", "Bống", "/assets/mascots/mascot-dog-bong-avatar.png"),
            option("hedgehog", "Nhím", "/assets/mascots/mascot-hedgehog-speaking.png"),
          ],
        },
        correctAnswer: "hedgehog",
      },
    ],
  },
];

export const badgeSeeds = [
  {
    slug: "sharp-detective",
    name: "Thám tử tinh mắt",
    description: "Hoàn thành nhiệm vụ dấu chân đầu tiên.",
    iconUrl: "/assets/props/badge-sharp-detective.png",
    skillSlug: "observe",
    unlockRule: { type: "mission", missionSlug: "footprint-detective" },
  },
  {
    slug: "pattern-finder",
    name: "Người tìm quy luật",
    description: "Hoàn thành một nhiệm vụ quy luật.",
    iconUrl: "/assets/props/badge-detective-shield-star.png",
    skillSlug: "pattern",
    unlockRule: { type: "skill_completion", skill: "pattern" },
  },
  {
    slug: "careful-observer",
    name: "Nhà quan sát nhỏ",
    description: "Kiểm tra kỹ trước khi trả lời.",
    iconUrl: "/assets/props/badge-safe-heart.png",
    skillSlug: "observe",
    unlockRule: { type: "skill_completion", skill: "observe" },
  },
  {
    slug: "cause-explorer",
    name: "Nhà khám phá nguyên nhân",
    description: "Hiểu điều xảy ra trước và sau.",
    iconUrl: "/assets/props/reward-star-coin.png",
    skillSlug: "cause",
    unlockRule: { type: "skill_completion", skill: "cause" },
  },
  {
    slug: "space-classifier",
    name: "Phi hành gia phân loại",
    description: "Phân loại các vật thể không gian.",
    iconUrl: "/assets/props/reward-trophy-star.png",
    skillSlug: "classify",
    unlockRule: { type: "skill_completion", skill: "classify" },
  },
  {
    slug: "logic-laugher",
    name: "Bạn nhỏ logic vui",
    description: "Tìm lời giải hợp lý cho chuyện vui.",
    iconUrl: "/assets/props/reward-treasure-chest.png",
    skillSlug: "problem-solving",
    unlockRule: { type: "skill_completion", skill: "problem-solving" },
  },
  {
    slug: "problem-solver",
    name: "Người giải mã nhí",
    description: "Kiên trì giải một manh mối khó.",
    iconUrl: "/assets/props/badge-dog-name-tag.png",
    skillSlug: "retry",
    unlockRule: { type: "retry_and_complete" },
  },
] as const;
