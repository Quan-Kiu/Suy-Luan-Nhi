import { defineContent } from "@/content/define";

export const landingContentEntries = defineContent("landing", {
  "header.how": { value: "Bé bắt đầu ra sao?", description: "Liên kết tới phần ba bước bắt đầu." },
  "header.safe": { value: "Vì sao an toàn?", description: "Liên kết điều hướng tới phần an toàn." },
  "header.parent": { value: "Khu vực phụ huynh", description: "Liên kết tới khu vực phụ huynh." },
  "header.admin": {
    value: "Khu vực quản trị",
    description: "Tên khu vực quản trị trong các ngữ cảnh mô tả.",
  },
  "header.manageFamily": {
    value: "Quản lý gia đình",
    description: "Hành động mở phần quản lý gia đình cho tài khoản phụ huynh đã đăng nhập.",
  },
  "header.adminAction": {
    value: "Trang quản trị",
    description: "Hành động mở trang quản trị cho tài khoản nhân viên đã đăng nhập.",
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
    description: "Tên nút cũ được giữ để nội dung đã cấu hình tiếp tục hoạt động.",
  },
  "hero.manageFamily": {
    value: "Quản lý gia đình",
    description: "Hành động mở phần quản lý gia đình cho Parent Account đã đăng nhập.",
  },
  "hero.adminCta": {
    value: "Mở trang quản trị",
    description: "lối tắt cho nhân viên quản trị đã đăng nhập.",
  },
  "hero.secondaryCta": { value: "Xem 3 bước bắt đầu", description: "Nhãn lối tắt xem ba bước bắt đầu." },
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
  "how.eyebrow": { value: "Bắt đầu rất đơn giản", description: "Dòng giới thiệu ngắn cho ba bước bắt đầu." },
  "how.title": {
    value: "Ba bước để bé bắt đầu một nhiệm vụ",
    description: "Tiêu đề phần ba bước bắt đầu.",
  },
  "how.description": {
    value:
      "Ba mẹ tạo hồ sơ một lần. Sau đó bé chọn nhiệm vụ phù hợp, làm theo hướng dẫn và có thể nhận gợi ý bất cứ lúc nào.",
    description: "Mô tả tổng quan ba bước bắt đầu.",
  },
  "how.step1.title": { value: "Ba mẹ tạo hồ sơ cho bé", description: "Tiêu đề bước tạo hồ sơ." },
  "how.step1.description": {
    value: "Chỉ cần tên ở nhà, nhóm tuổi và một ảnh đại diện. Không cần thông tin nhạy cảm.",
    description: "Mô tả bước tạo hồ sơ.",
  },
  "how.step2.title": { value: "Bé chọn một nhiệm vụ ngắn", description: "Tiêu đề bước chọn nhiệm vụ." },
  "how.step2.description": {
    value: "Mỗi nhiệm vụ chỉ mất vài phút, có hướng dẫn rõ ràng và gợi ý khi bé cần.",
    description: "Mô tả bước bé làm nhiệm vụ.",
  },
  "how.step3.title": { value: "Ba mẹ xem bé đã luyện gì", description: "Tiêu đề bước xem kết quả." },
  "how.step3.description": {
    value: "Xem kỹ năng bé vừa dùng và gợi ý đồng hành, không có xếp hạng hay so sánh.",
    description: "Mô tả bước phụ huynh xem kết quả.",
  },
  "how.note": {
    value: "Bé được thử lại thoải mái. Hệ thống ghi nhận nỗ lực, không phạt khi bé trả lời chưa đúng.",
    description: "Lời nhắc về cách hệ thống khuyến khích bé.",
  },
  "companion.title": { value: "Đồng hành cùng bé", description: "Tiêu đề khối đồng hành cuối trang." },
  "companion.description": {
    value: "Theo dõi tiến bộ riêng tư để hiểu bé hơn và động viên đúng lúc.",
    description: "Mô tả lợi ích dành cho phụ huynh ở cuối landing page.",
  },
  "companion.note": {
    value: "Suy Luận Nhí được xây dựng với tình yêu thương và sự thấu hiểu trẻ em.",
    description: "Thông điệp thương hiệu ở cuối landing page.",
  },
});
