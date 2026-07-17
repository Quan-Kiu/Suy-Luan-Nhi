export const missionStatusLabels: Record<string, string> = {
  draft: "Bản nháp",
  in_review: "Đang chờ kiểm duyệt",
  rejected: "Cần chỉnh sửa",
  approved: "Đã được duyệt",
  published: "Đang hiển thị",
  archived: "Đã lưu trữ",
};

export const questionTypeLabels: Record<string, string> = {
  single_choice: "Chọn một đáp án",
  pattern_sequence: "Tìm quy luật",
  drag_drop: "Kéo thả vào vị trí",
  fill_answer: "Điền câu trả lời",
  sorting: "Sắp xếp thứ tự",
};

export const safetyChecklistLabels: Record<string, string> = {
  ageAppropriate: "Phù hợp nhóm tuổi",
  hintsSupportive: "Gợi ý mang tính hỗ trợ",
  feedbackPositive: "Phản hồi tích cực",
  noProhibitedClaims: "Không có nội dung gây hiểu lầm",
  noExternalLinks: "Không có liên kết bên ngoài",
  languageAndImagesSafe: "Ngôn ngữ và hình ảnh an toàn",
};

export const sessionStatusLabels: Record<string, string> = {
  in_progress: "Đang chơi",
  completed: "Đã hoàn thành",
  exited: "Đã thoát giữa chừng",
};

export const auditActionLabels: Record<string, string> = {
  "mission.created": "Tạo nhiệm vụ",
  "mission.updated": "Cập nhật nhiệm vụ",
  "mission.duplicated": "Nhân bản nhiệm vụ",
  "mission.submitted": "Gửi nhiệm vụ để kiểm duyệt",
  "mission.approved": "Duyệt nhiệm vụ",
  "mission.rejected": "Yêu cầu chỉnh sửa nhiệm vụ",
  "mission.published": "Xuất bản nhiệm vụ",
  "mission.archived": "Lưu trữ nhiệm vụ",
  "world.created": "Tạo thế giới nhiệm vụ",
  "world.updated": "Cập nhật thế giới nhiệm vụ",
  "member.updated": "Cập nhật thành viên",
  "content.updated": "Cập nhật nội dung giao diện",
  "media.uploaded": "Tải tư liệu mới",
  "media.reviewed": "Kiểm tra tư liệu",
  "media.deleted": "Xóa tư liệu",
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
  "skill.created": "Tạo kỹ năng",
  "skill.updated": "Cập nhật kỹ năng",
  "system_setting.updated": "Cập nhật cài đặt nâng cao",
};
export const resourceTypeLabels: Record<string, string> = {
  mission: "Nhiệm vụ",
  mission_version: "Phiên bản nhiệm vụ",
  mission_world: "Thế giới nhiệm vụ",
  media_asset: "Tư liệu",
  content_entry: "Nội dung giao diện",
  user: "Thành viên",
  system_setting: "Cài đặt",
  data_request: "Yêu cầu dữ liệu",
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
