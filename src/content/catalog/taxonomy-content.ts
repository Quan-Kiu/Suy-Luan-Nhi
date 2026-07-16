export const ageGroupSeeds = [
  {
    code: "2-3",
    label: "2–3 tuổi",
    description: "Nhận biết, ghép đôi và quy luật rất ngắn.",
    minAge: 2,
    maxAge: 3,
    sortOrder: 1,
  },
  {
    code: "4-5",
    label: "4–5 tuổi",
    description: "Quy luật đơn giản, so sánh và nguyên nhân gần gũi.",
    minAge: 4,
    maxAge: 5,
    sortOrder: 2,
  },
  {
    code: "6-8",
    label: "6–8 tuổi",
    description: "Suy luận nhiều bước, phân loại và giải quyết vấn đề.",
    minAge: 6,
    maxAge: 8,
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
