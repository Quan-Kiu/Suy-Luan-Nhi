import { defineContent } from "@/content/define";

export const childContentEntries = defineContent("child", {
  "header.home": { value: "Bản đồ nhiệm vụ", description: "Nhãn trang chính chế độ bé." },
  "header.profiles": { value: "Hồ sơ bé", description: "Nhãn quản lý Child Profile." },
  "header.parent": { value: "Khu vực phụ huynh", description: "Nhãn mở Parent Workspace." },
  "header.openMenu": { value: "Mở menu chế độ bé", description: "Nhãn mở menu mobile." },
  "header.closeMenu": { value: "Đóng menu chế độ bé", description: "Nhãn đóng menu mobile." },
  "header.back": { value: "Quay lại", description: "Nhãn nút quay lại." },
  "header.logout": { value: "Đăng xuất", description: "Nhãn đăng xuất." },
  "states.loading": { value: "Đang chuẩn bị hành trình...", description: "Loading state cho Child routes." },
  "mission.world": { value: "Thế giới {order}", description: "Nhãn thứ tự Mission World." },
  "mission.completedWorld": { value: "Đã khám phá", description: "Trạng thái World hoàn thành." },
  "mission.openWorld": { value: "Đang mở", description: "Trạng thái World đang mở." },
  "mission.lockedWorld": { value: "Chưa mở", description: "Trạng thái World khóa." },
  "mission.replay": { value: "Chơi lại", description: "Nhãn chơi lại Mission." },
  "mission.recommended": { value: "Gợi ý hôm nay", description: "Nhãn Mission được đề xuất." },
  "mission.start": { value: "Bắt đầu", description: "Nhãn bắt đầu Mission." },
  "mission.locked": { value: "Hoàn thành nhiệm vụ trước", description: "Nhãn Mission bị khóa." },
  "journey.label": { value: "Hành trình của", description: "Nhãn hồ sơ đang khám phá Mission Map." },
  "journey.description": {
    value: "Các nhiệm vụ mở dần theo cách bé khám phá, không có bảng xếp hạng.",
    description: "Mô tả cách mở khóa nhiệm vụ.",
  },
  "completion.imageAlt": {
    value: "Bé và Bống ăn mừng hoàn thành nhiệm vụ",
    description: "Alt text ảnh hoàn thành Mission.",
  },
  "completion.label": { value: "Nhiệm vụ hoàn thành", description: "Nhãn trạng thái hoàn thành Mission." },
  "completion.title": { value: "Tuyệt vời!", description: "Tiêu đề màn hình hoàn thành Mission." },
  "completion.badgeAlt": { value: "Huy hiệu {badgeName}", description: "Alt text huy hiệu vừa nhận." },
  "completion.newBadge": { value: "Huy hiệu mới", description: "Nhãn huy hiệu mới." },
  "completion.habitsTitle": {
    value: "Con đã luyện những thói quen nào?",
    description: "Tiêu đề danh sách Thinking Habits.",
  },
  "completion.encouragement": {
    value: "Mỗi lần nhìn kỹ và thử lại là một lần bộ não khỏe hơn một chút!",
    description: "Thông điệp khích lệ sau Mission.",
  },
  "completion.backToMap": { value: "Về bản đồ nhiệm vụ", description: "Nhãn trở về Mission Map." },
});
