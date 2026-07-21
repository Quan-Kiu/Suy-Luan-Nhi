import { defineContent } from "@/content/define";

export const missionEditorContentEntries = defineContent("admin", {
  "missionEditor.modeCreate": { value: "Tạo nhiệm vụ mới", description: "Chế độ tạo nhiệm vụ." },
  "missionEditor.modeEdit": { value: "Đang chỉnh sửa nhiệm vụ", description: "Chế độ sửa nhiệm vụ." },
  "missionEditor.newTitle": { value: "Nhiệm vụ chưa đặt tên", description: "Tiêu đề nhiệm vụ mới." },
  "missionEditor.basicTitle": { value: "1. Nội dung bé sẽ thấy", description: "Tiêu đề phần nội dung." },
  "missionEditor.questionsTitle": {
    value: "2. Các câu hỏi",
    description: "Tiêu đề phần câu hỏi.",
  },
  "missionEditor.safetyTitle": {
    value: "3. Kiểm tra trước khi gửi",
    description: "Tiêu đề kiểm tra an toàn.",
  },
  "missionEditor.previewRules": { value: "Các bước tiếp theo", description: "Tiêu đề quy trình." },
  "missionEditor.saveDraft": { value: "Lưu và làm tiếp sau", description: "Nhãn lưu bản nháp." },
  "missionEditor.saving": { value: "Đang lưu...", description: "Nhãn khi lưu nhiệm vụ." },
  "missionEditor.submit": { value: "Gửi để kiểm tra", description: "Nhãn gửi kiểm tra nội dung." },
  "missionEditor.submitting": { value: "Đang gửi...", description: "Nhãn khi gửi kiểm tra nội dung." },
  "missionEditor.saved": { value: "Đã lưu bản nháp", description: "Thông báo lưu bản nháp." },
  "missionEditor.submitted": {
    value: "Đã gửi nhiệm vụ để kiểm tra",
    description: "Thông báo gửi kiểm tra nội dung.",
  },
  "missionEditor.addQuestion": { value: "Thêm câu hỏi", description: "Nhãn thêm câu hỏi." },
  "missionEditor.question": { value: "Câu", description: "Nhãn thứ tự câu hỏi." },
  "missionEditor.questionType": { value: "Bé sẽ trả lời bằng cách nào?", description: "Nhãn loại câu hỏi." },
  "missionEditor.difficulty": { value: "Mức độ", description: "Nhãn độ khó." },
  "missionEditor.prompt": { value: "Câu hỏi dành cho bé", description: "Nhãn prompt câu hỏi." },
  "missionEditor.instruction": { value: "Lời hướng dẫn", description: "Nhãn hướng dẫn câu hỏi." },
  "missionEditor.hints": { value: "Các gợi ý, mỗi dòng một gợi ý", description: "Nhãn gợi ý." },
  "missionEditor.correctFeedback": {
    value: "Lời khen khi bé trả lời đúng",
    description: "Nhãn phản hồi đúng.",
  },
  "missionEditor.incorrectFeedback": {
    value: "Lời nhắc khi bé chưa trả lời đúng",
    description: "Nhãn phản hồi chưa đúng.",
  },
  "missionEditor.type.singleChoice": {
    value: "Chọn một đáp án",
    description: "Tên loại câu hỏi single choice.",
  },
  "missionEditor.type.pattern": { value: "Tìm hình tiếp theo", description: "Tên loại câu hỏi pattern." },
  "missionEditor.type.dragDrop": { value: "Kéo vào đúng chỗ", description: "Tên loại câu hỏi drag drop." },
  "missionEditor.type.fillAnswer": {
    value: "Nhập câu trả lời",
    description: "Tên loại câu hỏi fill answer.",
  },
  "missionEditor.type.sorting": { value: "Xếp theo thứ tự", description: "Tên loại câu hỏi sorting." },
  "missionEditor.safety.ageAppropriate": {
    value: "Nội dung phù hợp nhóm tuổi đã chọn",
    description: "Tiêu chí độ tuổi.",
  },
  "missionEditor.safety.hintsSupportive": {
    value: "Gợi ý giúp bé tiếp tục suy nghĩ",
    description: "Tiêu chí gợi ý.",
  },
  "missionEditor.safety.feedbackPositive": {
    value: "Phản hồi tích cực, không gây áp lực",
    description: "Tiêu chí phản hồi.",
  },
  "missionEditor.safety.noProhibitedClaims": {
    value: "Không hứa hẹn quá mức hoặc gây hiểu lầm",
    description: "Tiêu chí tuyên bố.",
  },
  "missionEditor.safety.noExternalLinks": {
    value: "Không dẫn trẻ ra website bên ngoài",
    description: "Tiêu chí liên kết.",
  },
  "missionEditor.safety.languageAndImagesSafe": {
    value: "Ngôn ngữ và hình ảnh an toàn cho trẻ",
    description: "Tiêu chí nội dung an toàn.",
  },
  "missionEditor.title": { value: "Tên nhiệm vụ", description: "Nhãn tên nhiệm vụ." },
  "missionEditor.slug": { value: "Mã đường dẫn (nâng cao)", description: "Nhãn mã đường dẫn." },
  "missionEditor.subtitle": { value: "Câu giới thiệu ngắn", description: "Nhãn câu giới thiệu." },
  "missionEditor.shortDescription": { value: "Mô tả trên thẻ nhiệm vụ", description: "Nhãn mô tả nhiệm vụ." },
  "missionEditor.storyIntro": { value: "Câu chuyện mở đầu", description: "Nhãn câu chuyện mở đầu." },
  "missionEditor.world": { value: "Chủ đề nhiệm vụ", description: "Nhãn chọn chủ đề nhiệm vụ." },
  "missionEditor.primarySkill": { value: "Kỹ năng chính", description: "Nhãn kỹ năng chính." },
  "missionEditor.secondarySkills": { value: "Kỹ năng đi kèm", description: "Nhãn kỹ năng phụ." },
  "missionEditor.reward": { value: "Huy hiệu nhận được", description: "Nhãn phần thưởng." },
  "missionEditor.noReward": { value: "Không có huy hiệu", description: "Tùy chọn không huy hiệu." },
  "missionEditor.minutes": { value: "Thời gian dự kiến (phút)", description: "Nhãn thời lượng nhiệm vụ." },
  "missionEditor.cover": { value: "Ảnh hiển thị trên thẻ", description: "Nhãn tải ảnh bìa nhiệm vụ." },
  "missionEditor.ageGroups": { value: "Nhóm tuổi", description: "Nhãn nhóm tuổi nhiệm vụ." },
  "missionEditor.allowReplay": { value: "Cho phép chơi lại", description: "Nhãn chơi lại." },
  "missionEditor.randomize": {
    value: "Đổi vị trí đáp án mỗi lần chơi",
    description: "Nhãn đổi thứ tự đáp án.",
  },
  "missionEditor.previewAlt": {
    value: "Ảnh hiển thị trên thẻ",
    description: "Mô tả ảnh bìa trong phần xem trước.",
  },
  "missionVersions.title": { value: "Các lần đã gửi", description: "Tiêu đề lịch sử nhiệm vụ." },
  "missionVersions.description": {
    value: "Mỗi lần gửi đều được giữ lại. Bạn có thể dùng lại nội dung cũ để tạo một bản nháp mới.",
    description: "Mô tả lịch sử và cách khôi phục nhiệm vụ.",
  },
  "missionVersions.empty": {
    value: "Chưa có lần gửi nào. Danh sách này sẽ xuất hiện sau khi bạn gửi nhiệm vụ lần đầu.",
    description: "Trạng thái lịch sử nhiệm vụ trống.",
  },
  "missionVersions.version": { value: "Lần gửi {number}", description: "Nhãn số lần gửi nhiệm vụ." },
  "missionVersions.createdAt": { value: "Đã gửi {time}", description: "Thời điểm tạo lần gửi nhiệm vụ." },
  "missionVersions.reviewComment": { value: "Lời nhắn:", description: "Nhãn nhận xét lần gửi." },
  "missionVersions.restore": { value: "Dùng lại nội dung này", description: "Nhãn mở khôi phục lần gửi." },
  "missionVersions.restoreTitle": {
    value: "Dùng lại nội dung của lần gửi {number}?",
    description: "Tiêu đề xác nhận khôi phục nhiệm vụ.",
  },
  "missionVersions.unsavedWarning": {
    value: "Các thay đổi chưa lưu sẽ mất. ",
    description: "Cảnh báo thay đổi chưa lưu khi restore.",
  },
  "missionVersions.restoreDescription": {
    value:
      "Nội dung cũ vẫn được giữ nguyên. Hệ thống sẽ chép nội dung này thành bản nháp để bạn kiểm tra và gửi lại.",
    description: "Mô tả xác nhận khôi phục nhiệm vụ.",
  },
  "missionVersions.restoreConfirm": {
    value: "Dùng lại nội dung này",
    description: "Nhãn xác nhận khôi phục nhiệm vụ.",
  },
  "missionVersions.restoring": { value: "Đang tạo bản nháp...", description: "Trạng thái restore nhiệm vụ." },
  "missionVersions.restoreSuccess": {
    value: "Đã tạo bản nháp từ lần gửi {number}",
    description: "Thông báo restore nhiệm vụ thành công.",
  },
});
