export const conversationSuggestionSeeds = [
  {
    title: "Kể lại cách con quan sát",
    questionText: "Con đã nhìn phần nào trước để tìm ra manh mối?",
    purpose: "Giúp bé diễn đạt chiến lược quan sát.",
    ageGroup: "6-8" as const,
    relatedMissionSlug: "footprint-detective",
    skillSlug: "observe",
  },
  {
    title: "Biến thử lại thành sức mạnh",
    questionText: "Lần thử sau con muốn thay đổi điều gì?",
    purpose: "Bình thường hóa việc thử lại và tự điều chỉnh.",
    skillSlug: "retry",
  },
  {
    title: "Tìm nguyên nhân",
    questionText: "Điều gì xảy ra trước, và vì sao điều sau lại xảy ra?",
    purpose: "Luyện kể chuỗi nguyên nhân – kết quả.",
    ageGroup: "6-8" as const,
    relatedMissionSlug: "seed-to-tree",
    skillSlug: "cause",
  },
  {
    title: "So sánh nhẹ nhàng",
    questionText: "Hai hình này giống nhau ở đâu và khác nhau ở đâu?",
    purpose: "Khuyến khích bé mô tả thay vì đoán nhanh.",
    ageGroup: "6-8" as const,
    skillSlug: "compare",
  },
] as const;

export const parentResourceSeeds = [
  {
    slug: "dong-hanh-khi-be-chua-trung",
    title: "Đồng hành khi bé chưa trúng",
    excerpt: "Ba cách phản hồi giúp bé tiếp tục suy nghĩ mà không thấy bị chê.",
    content:
      "Hãy mô tả điều bé đã làm tốt trước. Sau đó đặt một câu hỏi nhỏ như ‘Con muốn nhìn lại phần nào?’. Tránh nói đáp án ngay; cho bé thời gian thử một cách khác.",
    resourceType: "guide" as const,
    category: "companionship",
    ageGroups: ["6-8", "9-10", "11-12"] as const,
    coverUrl: "/assets/scenes/scene-parent-guidance.png",
    sortOrder: 1,
  },
  {
    slug: "cau-hoi-mo-cho-tre",
    title: "Đặt câu hỏi mở cho trẻ",
    excerpt: "Những câu hỏi ngắn giúp bé kể lại cách nghĩ thay vì chỉ nói đáp án.",
    content:
      "Dùng các câu bắt đầu bằng ‘Con nhận thấy…’, ‘Điều gì khiến con nghĩ vậy?’ và ‘Có cách nào khác không?’. Chỉ hỏi một câu mỗi lần và chờ bé trả lời.",
    resourceType: "guide" as const,
    category: "conversation",
    ageGroups: ["6-8", "9-10", "11-12"] as const,
    coverUrl: "/assets/cards/parent-talk-suggestion.png",
    sortOrder: 2,
  },
  {
    slug: "khong-tao-ap-luc-thanh-tich",
    title: "Khuyến khích mà không tạo áp lực",
    excerpt: "Tập trung vào quan sát, nỗ lực và thử lại thay vì điểm số.",
    content:
      "Khen hành vi cụ thể: ‘Con đã nhìn rất kỹ’ hoặc ‘Con thử cách mới hay lắm’. Không so sánh bé với bạn khác và không dùng phần thưởng để gây áp lực phải hoàn thành mỗi ngày.",
    resourceType: "guide" as const,
    category: "emotional-safety",
    ageGroups: ["6-8", "9-10", "11-12"] as const,
    coverUrl: "/assets/props/parent-value-family-support.png",
    sortOrder: 3,
  },
] as const;
