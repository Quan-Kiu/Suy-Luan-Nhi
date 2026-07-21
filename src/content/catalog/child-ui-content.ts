import { defineContent } from "@/content/define";

export const childContentEntries = defineContent("child", {
  "header.home": { value: "Bản đồ nhiệm vụ", description: "Nhãn trang chính chế độ bé." },
  "header.profiles": { value: "Hồ sơ của bé", description: "Nhãn quản lý hồ sơ của bé." },
  "header.parent": { value: "Dành cho ba mẹ", description: "Nhãn mở khu vực phụ huynh." },
  "header.openMenu": { value: "Mở menu chế độ bé", description: "Nhãn mở menu mobile." },
  "header.closeMenu": { value: "Đóng menu chế độ bé", description: "Nhãn đóng menu mobile." },
  "header.back": { value: "Quay lại", description: "Nhãn nút quay lại." },
  "header.logout": { value: "Đăng xuất", description: "Nhãn đăng xuất." },
  "states.loading": { value: "Bống đang chuẩn bị...", description: "Loading state cho Child routes." },
  "mission.world": { value: "Chủ đề {order}", description: "Nhãn thứ tự nhiệm vụ World." },
  "mission.completedWorld": { value: "Đã khám phá", description: "Trạng thái World hoàn thành." },
  "mission.openWorld": { value: "Đang mở", description: "Trạng thái World đang mở." },
  "mission.lockedWorld": { value: "Chưa mở", description: "Trạng thái World khóa." },
  "mission.replay": { value: "Chơi lại", description: "Nhãn chơi lại nhiệm vụ." },
  "mission.recommended": { value: "Gợi ý hôm nay", description: "Nhãn nhiệm vụ được đề xuất." },
  "mission.start": { value: "Bắt đầu", description: "Nhãn bắt đầu nhiệm vụ." },
  "mission.locked": { value: "Hoàn thành nhiệm vụ phía trước để mở", description: "Nhãn nhiệm vụ bị khóa." },
  "journey.label": { value: "Hành trình của", description: "Nhãn hồ sơ đang khám phá nhiệm vụ Map." },
  "journey.description": {
    value: "Mỗi lần hoàn thành, bé sẽ mở thêm nhiệm vụ mới. Không có xếp hạng hay so sánh.",
    description: "Mô tả cách mở khóa nhiệm vụ.",
  },
  "completion.imageAlt": {
    value: "Bé và Bống ăn mừng hoàn thành nhiệm vụ",
    description: "Mô tả hình ảnh ảnh hoàn thành nhiệm vụ.",
  },
  "completion.label": { value: "Con đã hoàn thành!", description: "Nhãn trạng thái hoàn thành nhiệm vụ." },
  "completion.title": { value: "Tuyệt vời!", description: "Tiêu đề màn hình hoàn thành nhiệm vụ." },
  "completion.badgeAlt": { value: "Huy hiệu {badgeName}", description: "Mô tả hình ảnh huy hiệu vừa nhận." },
  "completion.newBadge": { value: "Huy hiệu mới", description: "Nhãn huy hiệu mới." },
  "completion.habitsTitle": {
    value: "Con vừa luyện được điều gì?",
    description: "Tiêu đề danh sách Thinking Habits.",
  },
  "completion.encouragement": {
    value: "Mỗi lần nhìn kỹ và thử lại, con sẽ tìm được thêm một cách nghĩ mới!",
    description: "Thông điệp khích lệ sau nhiệm vụ.",
  },
  "completion.backToMap": { value: "Quay lại bản đồ", description: "Nhãn trở về nhiệm vụ Map." },
});
