export const ageGroupSeeds = [
  {
    code: "6-8",
    label: "6–8 tuổi",
    description: "Nhìn hình, tìm quy luật đơn giản, phân nhóm và nối các manh mối gần gũi.",
    minAge: 6,
    maxAge: 8,
    sortOrder: 1,
  },
  {
    code: "9-10",
    label: "9–10 tuổi",
    description: "Kết nối nhiều manh mối, hiểu vì sao một việc xảy ra và thử nhiều cách giải.",
    minAge: 9,
    maxAge: 10,
    sortOrder: 2,
  },
  {
    code: "11-12",
    label: "11–12 tuổi",
    description: "Giải thích cách nghĩ, kiểm tra lại điều mình đoán và xử lý tình huống có nhiều bước.",
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
    label: "Gợi ý giúp bé tự nghĩ tiếp",
    defaultNote: "Gợi ý cho bé một bước nhỏ để tự tìm tiếp, không nói đáp án ngay.",
  },
  {
    key: "feedbackPositive",
    label: "Phản hồi tích cực",
    defaultNote: "Phản hồi không chê trách, gây áp lực hoặc so sánh trẻ.",
  },
  {
    key: "noProhibitedClaims",
    label: "Không hứa hẹn quá mức",
    defaultNote:
      "Không nói nội dung có thể chẩn đoán, chữa bệnh hoặc bảo đảm bé sẽ phát triển theo một mức cụ thể.",
  },
  {
    key: "noExternalLinks",
    label: "Không đưa bé sang trang khác",
    defaultNote: "Khu vực của bé không mở website hoặc dịch vụ bên ngoài.",
  },
  {
    key: "languageAndImagesSafe",
    label: "Từ ngữ, hình ảnh và âm thanh phù hợp",
    defaultNote: "Từ ngữ, hình ảnh và âm thanh đều phù hợp với trẻ.",
  },
] as const;
