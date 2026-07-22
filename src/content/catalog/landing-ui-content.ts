import { defineContent } from "@/content/define";

export const landingContentEntries = defineContent("landing", {
  "header.how": { value: "Bé sẽ chơi thế nào?", description: "Liên kết điều hướng tới phần cách hoạt động." },
  "header.safe": { value: "Vì sao an toàn?", description: "Liên kết điều hướng tới phần an toàn." },
  "header.parent": { value: "Khu vực phụ huynh", description: "Liên kết tới khu vực phụ huynh." },
  "header.admin": {
    value: "Khu vực quản trị",
    description: "Liên kết tới khu vực quản trị cho tài khoản nhân viên quản trị.",
  },
  "header.signIn": { value: "Đăng nhập", description: "Liên kết đăng nhập khi chưa có lượt chơi." },
  "header.openMenu": { value: "Mở menu điều hướng", description: "Nhãn trợ năng nút mở menu mobile." },
  "header.closeMenu": { value: "Đóng menu điều hướng", description: "Nhãn trợ năng nút đóng menu mobile." },
  "hero.badge": {
    value: "Không quảng cáo · Không mua hàng trong chế độ bé",
    description: "Cam kết nổi bật ở hero.",
  },
  "hero.titleAccent": { value: "Nhiệm vụ vui", description: "Phần nhấn màu của tiêu đề hero." },
  "hero.titleRest": { value: "cho bé luyện cách nghĩ", description: "Phần còn lại của tiêu đề hero." },
  "hero.description": {
    value: "Mỗi ngày, bé cùng Bống giải một nhiệm vụ ngắn, nhìn kỹ các manh mối và tự tin thử lại.",
    description: "Mô tả chính của landing page.",
  },
  "hero.primaryCta": { value: "Tạo hồ sơ cho bé", description: "Nhãn lối tắt tạo tài khoản." },
  "hero.startCta": {
    value: "Bắt đầu cho bé",
    description: "Nhãn bắt đầu quy trình tạo tài khoản ba mẹ và hồ sơ cho bé.",
  },
  "hero.startHint": {
    value: "Ba mẹ tạo tài khoản trước, sau đó thêm hồ sơ cho bé.",
    description: "Giải thích bước tiếp theo khi khách bắt đầu sử dụng.",
  },
  "hero.parentCta": {
    value: "Vào khu vực phụ huynh",
    description: "lối tắt cho Parent Account đã đăng nhập.",
  },
  "hero.adminCta": {
    value: "Mở trang quản trị",
    description: "lối tắt cho nhân viên quản trị đã đăng nhập.",
  },
  "hero.secondaryCta": { value: "Xem bé sẽ chơi thế nào", description: "Nhãn lối tắt xem phần giới thiệu." },
  "hero.trust.publicRanking": {
    value: "Không xếp hạng hay so sánh",
    description: "Điểm tin cậy về bảng xếp hạng.",
  },
  "hero.trust.privacy": { value: "Chỉ lưu thông tin cần thiết", description: "Điểm tin cậy về riêng tư." },
  "hero.trust.positive": {
    value: "Khuyến khích bé thử lại",
    description: "Điểm tin cậy về nội dung.",
  },
  "safe.title": { value: "Ba mẹ an tâm, bé vui khám phá", description: "Tiêu đề phần an toàn." },
  "safe.privacy.title": { value: "Chỉ lưu thông tin cần thiết", description: "Tiêu đề thẻ riêng tư." },
  "safe.privacy.description": {
    value: "Chỉ cần tên ở nhà và nhóm tuổi để gợi ý nội dung phù hợp.",
    description: "Mô tả thẻ riêng tư.",
  },
  "safe.noAds.title": { value: "Không quảng cáo", description: "Tiêu đề thẻ không quảng cáo." },
  "safe.noAds.description": {
    value: "Bé không thấy quảng cáo, liên kết ngoài hay mua hàng.",
    description: "Mô tả thẻ không quảng cáo.",
  },
  "safe.play.title": { value: "Học qua chơi", description: "Tiêu đề thẻ học qua chơi." },
  "safe.play.description": {
    value: "Bé được gợi ý nhẹ nhàng và có thể thử lại.",
    description: "Mô tả thẻ học qua chơi.",
  },
  "how.title": {
    value: "Mỗi nhiệm vụ ngắn, thêm một cách nghĩ mới",
    description: "Tiêu đề phần cách hoạt động.",
  },
  "how.description": {
    value:
      "Bé chọn một chủ đề, quan sát câu hỏi, nhận gợi ý nhẹ nhàng và được chúc mừng sau mỗi lần cố gắng.",
    description: "Mô tả phần cách hoạt động.",
  },
});
