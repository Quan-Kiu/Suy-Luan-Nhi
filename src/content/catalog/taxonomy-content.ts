export const ageGroupSeeds = [
  {
    code: "6-8",
    label: "6–8 tuổi",
    description: "Quan sát, quy luật, phân loại và suy luận trực quan.",
    minAge: 6,
    maxAge: 8,
    sortOrder: 1,
  },
  {
    code: "9-10",
    label: "9–10 tuổi",
    description: "Suy luận nhiều bước, nguyên nhân – kết quả và chiến lược giải quyết vấn đề.",
    minAge: 9,
    maxAge: 10,
    sortOrder: 2,
  },
  {
    code: "11-12",
    label: "11–12 tuổi",
    description: "Logic nâng cao, kiểm chứng giả thuyết và giải quyết tình huống phức hợp.",
    minAge: 11,
    maxAge: 12,
    sortOrder: 3,
  },
] as const;
export const safetyChecklistDefinitions = [
  {
    key: "ageAppropriate",
    label: "Phù hợp độ tuổi",
    defaultNote: "Nội dung, độ khó và ngôn ngữ phù hợp nhóm tuổi đã chọn.",
  },
  {
    key: "hintsSupportive",
    label: "Gợi ý có tính hỗ trợ",
    defaultNote: "Gợi ý giúp bé quan sát và thử lại, không tiết lộ đáp án ngay.",
  },
  {
    key: "feedbackPositive",
    label: "Phản hồi tích cực",
    defaultNote: "Phản hồi không chê trách, gây áp lực hoặc so sánh trẻ.",
  },
  {
    key: "noProhibitedClaims",
    label: "Không có tuyên bố bị cấm",
    defaultNote: "Không có nội dung y tế, chẩn đoán hoặc cam kết phát triển quá mức.",
  },
  {
    key: "noExternalLinks",
    label: "Không có liên kết ngoài",
    defaultNote: "Trải nghiệm của trẻ không dẫn sang website hoặc dịch vụ bên ngoài.",
  },
  {
    key: "languageAndImagesSafe",
    label: "Ngôn ngữ và hình ảnh an toàn",
    defaultNote: "Hình ảnh, âm thanh và từ ngữ đã được kiểm tra an toàn.",
  },
] as const;
