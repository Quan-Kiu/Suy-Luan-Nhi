export const missionStatusLabels: Record<string, string> = {
  draft: "Bản nháp",
  in_review: "Đang chờ kiểm tra",
  rejected: "Cần chỉnh sửa",
  approved: "Đạt yêu cầu",
  published: "Đang hiển thị",
  archived: "Đã lưu trữ",
};

export const questionTypeLabels: Record<string, string> = {
  single_choice: "Chọn một đáp án",
  pattern_sequence: "Tìm quy luật",
  drag_drop: "Kéo vào đúng chỗ",
  fill_answer: "Nhập câu trả lời",
  sorting: "Xếp theo thứ tự",
};

export const safetyChecklistLabels: Record<string, string> = {
  ageAppropriate: "Phù hợp nhóm tuổi",
  hintsSupportive: "Gợi ý giúp bé tự nghĩ tiếp",
  feedbackPositive: "Phản hồi tích cực",
  noProhibitedClaims: "Không có nội dung gây hiểu lầm",
  noExternalLinks: "Không có liên kết bên ngoài",
  languageAndImagesSafe: "Ngôn ngữ và hình ảnh an toàn",
};

export const sessionStatusLabels: Record<string, string> = {
  in_progress: "Đang chơi",
  completed: "Đã hoàn thành",
  exited: "Đã tạm dừng",
};

export const auditActionLabels: Record<string, string> = {
  "mission.created": "Tạo nhiệm vụ",
  "mission.updated": "Cập nhật nhiệm vụ",
  "mission.duplicated": "Nhân bản nhiệm vụ",
  "mission.submitted": "Gửi nhiệm vụ để kiểm tra",
  "mission.approved": "Xác nhận nhiệm vụ đạt yêu cầu",
  "mission.rejected": "Yêu cầu chỉnh sửa nhiệm vụ",
  "mission.published": "Cho bé xem nhiệm vụ",
  "mission.archived": "Lưu trữ nhiệm vụ",
  "mission.restored": "Khôi phục nhiệm vụ",
  "world.created": "Thêm chủ đề nhiệm vụ",
  "world.updated": "Cập nhật chủ đề nhiệm vụ",
  "badge.created": "Thêm huy hiệu",
  "badge.updated": "Cập nhật huy hiệu",
  "member.updated": "Cập nhật thành viên",
  "session.revoked_by_ban": "Thu hồi phiên đăng nhập khi tạm ngưng",
  "content.updated": "Sửa câu chữ trong ứng dụng",
  "media.uploaded": "Thêm tệp mới",
  "media.reviewed": "Kiểm tra hình ảnh hoặc âm thanh",
  "media.deleted": "Xóa tệp",
  "data.export_requested": "Yêu cầu tải xuống dữ liệu",
  "data.delete_requested": "Yêu cầu xóa dữ liệu",
  "data.delete_completed": "Hoàn thành xóa dữ liệu",
  "child.created": "Tạo hồ sơ bé",
  "child.updated": "Cập nhật hồ sơ bé",
  "child.deleted": "Xóa hồ sơ bé",
  "child.delete_requested": "Phụ huynh yêu cầu xóa hồ sơ bé",
  "child.progress_reset": "Đặt lại tiến độ của bé",
  "parent.settings_updated": "Cập nhật cài đặt phụ huynh",
  "mission.scheduled": "Lên lịch hiển thị nhiệm vụ",
  "age_group.updated": "Cập nhật nhóm tuổi",
  "skill.created": "Thêm kỹ năng",
  "skill.updated": "Cập nhật kỹ năng",
  "system_setting.updated": "Cập nhật cài đặt nâng cao",
};
export const resourceTypeLabels: Record<string, string> = {
  mission: "Nhiệm vụ",
  mission_version: "Lần gửi nhiệm vụ",
  mission_world: "Chủ đề nhiệm vụ",
  badge: "Huy hiệu",
  media_asset: "Hình ảnh, âm thanh hoặc video",
  content_entry: "Câu chữ trong ứng dụng",
  user: "Thành viên",
  user_session: "Phiên đăng nhập",
  system_setting: "Cài đặt nâng cao",
  data_request: "Xuất hoặc xóa dữ liệu",
  child_profile: "Hồ sơ bé",
  parent_profile: "Hồ sơ phụ huynh",
  family: "Gia đình",
};

export const analyticsEventLabels: Record<string, string> = {
  mission_started: "Bắt đầu nhiệm vụ",
  answer_submitted: "Gửi câu trả lời",
  answer_correct: "Trả lời đúng",
  answer_incorrect: "Thử lại câu trả lời",
  hint_requested: "Sử dụng gợi ý",
  mission_completed: "Hoàn thành nhiệm vụ",
  badge_unlocked: "Nhận huy hiệu",
};

export function friendlyLabel(labels: Record<string, string>, value: string) {
  return labels[value] ?? value.replaceAll("_", " ").replaceAll(".", " · ");
}
