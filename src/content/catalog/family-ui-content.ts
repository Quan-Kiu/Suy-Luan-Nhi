import { defineContent } from "@/content/define";

export const profileContentEntries = defineContent("profile", {
  "create.nameLabel": { value: "Tên thân mật của bé", description: "Nhãn tên hồ sơ bé." },
  "create.nameDescription": {
    value: "Có thể dùng tên ở nhà, không cần tên thật.",
    description: "Gợi ý tên hồ sơ bé.",
  },
  "create.namePlaceholder": {
    value: "Ví dụ: Bống, Mít...",
    description: "Gợi ý trong ô nhập tên thân mật của bé.",
  },
  "create.ageLabel": { value: "Bé thuộc nhóm tuổi nào?", description: "Nhãn chọn nhóm tuổi." },
  "create.ageDescription": {
    value: "Để ứng dụng gợi ý nhiệm vụ vừa sức với bé.",
    description: "Mô tả chọn nhóm tuổi.",
  },
  "create.age.6-8.title": { value: "6–8 tuổi", description: "Tên nhóm tuổi 6–8." },
  "create.age.6-8.note": {
    value: "Nhìn hình, tìm điểm giống khác và quy luật đơn giản",
    description: "Mô tả nhóm tuổi 6–8.",
  },
  "create.age.9-10.title": { value: "9–10 tuổi", description: "Tên nhóm tuổi 9–10." },
  "create.age.9-10.note": {
    value: "Kết nối nhiều manh mối để tìm câu trả lời",
    description: "Mô tả nhóm tuổi 9–10.",
  },
  "create.age.11-12.title": { value: "11–12 tuổi", description: "Tên nhóm tuổi 11–12." },
  "create.age.11-12.note": {
    value: "Giải thích vì sao và kiểm tra lại cách làm",
    description: "Mô tả nhóm tuổi 11–12.",
  },
  "create.privacyTitle": {
    value: "Chỉ lưu những thông tin cần thiết",
    description: "Tiêu đề cam kết riêng tư.",
  },
  "create.privacyDescription": {
    value: "Không cần email, tên thật hoặc ngày sinh đầy đủ của bé. Không quảng cáo, không mua hàng.",
    description: "Mô tả cam kết riêng tư.",
  },
  "create.submit": { value: "Tạo hồ sơ và bắt đầu →", description: "Nhãn nút tạo hồ sơ." },
  "create.submitting": { value: "Đang tạo hồ sơ...", description: "Nhãn khi đang tạo hồ sơ." },
  "create.success": { value: "Hồ sơ đã sẵn sàng!", description: "Thông báo tạo hồ sơ thành công." },
  "edit.nameLabel": { value: "Tên thân mật", description: "Nhãn chỉnh sửa tên hồ sơ." },
  "edit.namePlaceholder": {
    value: "Tên thân mật của bé",
    description: "Gợi ý trong ô nhập chỉnh sửa tên hồ sơ.",
  },
  "edit.ageLabel": { value: "Nhóm tuổi", description: "Nhãn chỉnh sửa nhóm tuổi." },
  "edit.submit": { value: "Lưu thay đổi", description: "Nhãn lưu hồ sơ." },
  "edit.submitting": { value: "Đang lưu...", description: "Nhãn khi đang lưu hồ sơ." },
  "edit.success": { value: "Đã cập nhật hồ sơ", description: "Thông báo cập nhật hồ sơ thành công." },
  "list.ageGroup": { value: "Nhóm tuổi", description: "Nhãn nhóm tuổi trong danh sách hồ sơ." },
  "list.edit": { value: "Chỉnh sửa", description: "Nhãn chỉnh sửa hồ sơ." },
  "list.delete": { value: "Xóa", description: "Nhãn xóa hồ sơ." },
  "list.enterMap": { value: "Vào bản đồ", description: "Nhãn vào bản đồ nhiệm vụ." },
  "list.createMore": { value: "+ Tạo thêm hồ sơ bé", description: "Nhãn tạo thêm hồ sơ." },
  "list.deleteConfirm": {
    value: "Bạn muốn xóa hồ sơ này? Yêu cầu sẽ được ghi nhận để xử lý an toàn.",
    description: "Xác nhận xóa mềm hồ sơ.",
  },
  "list.deleteSuccess": { value: "Đã ghi nhận yêu cầu xóa hồ sơ", description: "Thông báo xóa hồ sơ." },
  "list.selectError": { value: "Chưa chọn được hồ sơ. Hãy thử lại.", description: "Lỗi chọn hồ sơ." },
  "list.deleteError": { value: "Chưa xóa được hồ sơ. Hãy thử lại.", description: "Lỗi xóa hồ sơ." },
  "create.pageBadge": {
    value: "Chỉ lưu thông tin cần thiết",
    description: "Nhãn đầu trang tạo hồ sơ của bé.",
  },
  "create.firstProfileBadge": {
    value: "Bước 2/2 · Hồ sơ của bé",
    description: "Nhãn quy trình khi tạo hồ sơ bé đầu tiên.",
  },
  "create.firstProfileTitle": {
    value: "Tạo hồ sơ cho bé",
    description: "Tiêu đề khi tạo hồ sơ bé đầu tiên sau đăng ký.",
  },
  "create.firstProfileDescription": {
    value: "Tài khoản ba mẹ đã sẵn sàng. Chỉ cần tên ở nhà và nhóm tuổi để bắt đầu.",
    description: "Mô tả bước tạo hồ sơ bé đầu tiên.",
  },
  "create.pageTitle": { value: "Tạo hồ sơ cho bé", description: "Tiêu đề trang tạo hồ sơ của bé." },
  "create.pageDescription": {
    value: "Chỉ mất một phút để tạo hành trình phù hợp cho bé.",
    description: "Mô tả trang tạo hồ sơ của bé.",
  },
  "list.imageAlt": { value: "Bống bên nhà cây", description: "Mô tả hình ảnh ảnh trang chọn hồ sơ của bé." },
  "list.pageTitle": { value: "Chọn hồ sơ của bé", description: "Tiêu đề trang chọn hồ sơ của bé." },
  "list.pageDescription": {
    value: "Mỗi bé có hồ sơ và tiến độ riêng trong tài khoản của ba/mẹ.",
    description: "Mô tả trang chọn hồ sơ của bé.",
  },
  "list.emptyPageBadge": {
    value: "Bước 2/2 · Hồ sơ của bé",
    description: "Nhãn quy trình trên trang hồ sơ khi gia đình chưa có hồ sơ bé.",
  },
  "list.emptyPageTitle": {
    value: "Tạo hồ sơ cho bé",
    description: "Tiêu đề trang hồ sơ khi chưa có hồ sơ bé.",
  },
  "list.emptyPageDescription": {
    value: "Tài khoản ba mẹ đã sẵn sàng. Thêm hồ sơ đầu tiên để bé bắt đầu khám phá.",
    description: "Mô tả trang hồ sơ khi chưa có hồ sơ bé.",
  },
  "list.firstProfileTitle": {
    value: "Thêm hồ sơ đầu tiên",
    description: "Tiêu đề thẻ tạo hồ sơ bé đầu tiên.",
  },
  "list.emptyTitle": {
    value: "Gia đình chưa có hồ sơ bé",
    description: "Tiêu đề khi chưa có hồ sơ của bé.",
  },
  "list.emptyDescription": {
    value: "Chỉ cần tên ở nhà và nhóm tuổi; không cần ngày sinh đầy đủ.",
    description: "Mô tả trạng thái chưa có hồ sơ của bé.",
  },
  "list.emptyAction": { value: "Tạo hồ sơ đầu tiên", description: "lối tắt tạo hồ sơ của bé đầu tiên." },
  "edit.pageTitle": { value: "Chỉnh sửa hồ sơ", description: "Tiêu đề trang chỉnh sửa hồ sơ của bé." },
  "edit.pageDescription": {
    value: "Bạn chỉ cần cập nhật tên ở nhà hoặc nhóm tuổi của bé.",
    description: "Mô tả trang chỉnh sửa hồ sơ của bé.",
  },
});

export const parentContentEntries = defineContent("parent", {
  "shell.title": { value: "Khu vực phụ huynh", description: "Tiêu đề khu vực phụ huynh." },
  "shell.viewing": { value: "Đang xem hồ sơ: {childName}", description: "Hồ sơ bé đang xem." },
  "shell.changeChild": { value: "Đổi bé", description: "Nhãn đổi hồ sơ của bé." },
  "nav.overview": { value: "Tổng quan", description: "Điều hướng tổng quan phụ huynh." },
  "nav.activity": { value: "Hoạt động", description: "Điều hướng hoạt động." },
  "nav.suggestions": { value: "Gợi ý", description: "Điều hướng gợi ý." },
  "nav.resources": { value: "Hướng dẫn cho ba mẹ", description: "Điều hướng tài nguyên." },
  "nav.settings": { value: "Cài đặt", description: "Điều hướng cài đặt." },
  "nav.notifications": { value: "Thông báo", description: "Nhãn thông báo." },
  "nav.logout": { value: "Đăng xuất", description: "Nhãn đăng xuất." },
  "nav.openMenu": { value: "Mở menu phụ huynh", description: "Nhãn mở menu khu vực phụ huynh." },
  "nav.closeMenu": { value: "Đóng menu phụ huynh", description: "Nhãn đóng menu khu vực phụ huynh." },
  "dashboard.greeting": { value: "Xin chào, {parentName}", description: "Lời chào Parent Dashboard." },
  "dashboard.weekTitle": { value: "Tuần của {childName}", description: "Tiêu đề tuần của bé." },
  "dashboard.unread": { value: "{count} chưa đọc", description: "Số thông báo chưa đọc." },
  "dashboard.metricMissions": { value: "Nhiệm vụ", description: "Metric nhiệm vụ." },
  "dashboard.metricQuestions": { value: "Câu đã trả lời", description: "Metric câu hoàn thành." },
  "dashboard.metricMinutes": { value: "Phút chơi", description: "Metric phút chơi." },
  "dashboard.metricBadges": { value: "Huy hiệu", description: "Metric huy hiệu." },
  "dashboard.recentTitle": { value: "Bé vừa làm gì?", description: "Tiêu đề hoạt động gần đây." },
  "dashboard.viewAll": { value: "Xem tất cả", description: "Nhãn xem tất cả." },
  "dashboard.completed": {
    value: "Hoàn thành · {stars} sao",
    description: "Trạng thái hoàn thành lượt chơi.",
  },
  "dashboard.inProgress": { value: "Đang làm dở", description: "Trạng thái lượt chơi đang chơi." },
  "dashboard.exited": { value: "Đã tạm dừng", description: "Trạng thái lượt chơi đã dừng." },
  "dashboard.emptyActivity": {
    value: "Bé chưa bắt đầu nhiệm vụ nào. Một nhiệm vụ ngắn là đủ để bắt đầu.",
    description: "Trạng thái hoạt động trống.",
  },
  "dashboard.suggestionLabel": {
    value: "Gợi ý để trò chuyện cùng bé",
    description: "Nhãn gợi ý trò chuyện.",
  },
  "dashboard.suggestionDefaultTitle": {
    value: "Hỏi về cách bé nghĩ",
    description: "Tiêu đề gợi ý mặc định.",
  },
  "dashboard.suggestionDefaultQuestion": {
    value: "Con đã thử cách nào trước?",
    description: "Câu hỏi gợi ý mặc định.",
  },
  "dashboard.viewSuggestions": { value: "Xem thêm gợi ý", description: "Nhãn xem gợi ý." },
  "dashboard.skillsTitle": { value: "Những cách nghĩ bé hay dùng", description: "Tiêu đề kỹ năng nổi bật." },
  "dashboard.noSkills": {
    value: "Bé cần hoàn thành thêm vài nhiệm vụ để có gợi ý.",
    description: "Trạng thái kỹ năng trống.",
  },
  "gate.title": { value: "Khu vực phụ huynh", description: "Tiêu đề bước xác nhận phụ huynh." },
  "gate.description": {
    value: "Hãy xác nhận bạn là người lớn trước khi xem tiến độ và cài đặt của gia đình.",
    description: "Mô tả bước xác nhận phụ huynh.",
  },
  "gate.imageAlt": {
    value: "Hình chiếc khiên bảo vệ khu vực phụ huynh",
    description: "Mô tả hình ảnh bước xác nhận phụ huynh.",
  },

  "gate.mathQuestion": {
    value: "17 + 6 = ?",
    description: "Phép tính mặc định của bước xác nhận phụ huynh.",
  },
  "gate.answerPlaceholder": {
    value: "Nhập kết quả",
    description: "Gợi ý trong ô nhập câu trả lời bước xác nhận phụ huynh.",
  },
  "gate.confirmTitle": {
    value: "Ba/mẹ xác nhận để tiếp tục",
    description: "Tiêu đề form bước xác nhận phụ huynh.",
  },
  "gate.pinPrompt": { value: "Nhập PIN phụ huynh", description: "Yêu cầu nhập PIN bước xác nhận phụ huynh." },
  "gate.pinPlaceholder": {
    value: "Nhập PIN 4–8 chữ số",
    description: "Gợi ý trong ô nhập PIN bước xác nhận phụ huynh.",
  },
  "gate.submit": { value: "Mở khu vực phụ huynh", description: "Nhãn nút mở bước xác nhận phụ huynh." },
  "gate.submitting": { value: "Đang kiểm tra...", description: "Nhãn khi kiểm tra bước xác nhận phụ huynh." },
  "gate.error": {
    value: "Chưa xác nhận được. Hãy kiểm tra và thử lại.",
    description: "Lỗi bước xác nhận phụ huynh mặc định.",
  },
  "settings.audioTitle": { value: "Âm thanh trong ứng dụng", description: "Tiêu đề nhóm âm thanh." },
  "settings.soundEnabled": {
    value: "Âm thanh khi bấm và trả lời",
    description: "Bật âm thanh thao tác và phản hồi.",
  },
  "settings.effectsEnabled": {
    value: "Âm thanh khi hoàn thành",
    description: "Bật jingle hoàn thành và nhận thưởng.",
  },
  "settings.notificationsTitle": {
    value: "Thông báo dành cho ba/mẹ",
    description: "Tiêu đề nhóm thông báo.",
  },
  "settings.missionCompleted": {
    value: "Khi bé hoàn thành nhiệm vụ",
    description: "Nhãn thông báo hoàn thành nhiệm vụ.",
  },
  "settings.suggestions": { value: "Khi có gợi ý trò chuyện mới", description: "Nhãn thông báo gợi ý." },
  "settings.weeklySummary": { value: "Tóm tắt tuần", description: "Nhãn thông báo tóm tắt tuần." },
  "settings.privacyTitle": { value: "Quyền riêng tư", description: "Tiêu đề nhóm quyền riêng tư." },
  "settings.analyticsTitle": {
    value: "Dữ liệu giúp cải thiện ứng dụng",
    description: "Nhãn phân tích tối giản.",
  },
  "settings.analyticsDescription": {
    value:
      "Chỉ ghi nhận cách tính năng được sử dụng; không quảng cáo, không định vị và không tạo hồ sơ riêng của bé.",
    description: "Mô tả phân tích tối giản.",
  },
  "settings.pinTitle": { value: "PIN phụ huynh", description: "Tiêu đề nhóm PIN." },
  "settings.pinDescription": {
    value: "Đặt mã 4–8 chữ số để mở khu vực phụ huynh thay cho câu hỏi tính.",
    description: "Mô tả cài đặt PIN.",
  },
  "settings.pinPlaceholder": { value: "PIN mới", description: "Gợi ý trong ô nhập PIN mới." },
  "settings.save": { value: "Lưu cài đặt", description: "Nhãn lưu cài đặt." },
  "settings.saving": { value: "Đang lưu...", description: "Nhãn khi đang lưu cài đặt." },
  "settings.saved": { value: "Đã lưu cài đặt", description: "Thông báo lưu cài đặt thành công." },
  "settings.dataTitle": { value: "Dữ liệu gia đình", description: "Tiêu đề nhóm dữ liệu gia đình." },
  "settings.export": { value: "Tạo bản sao dữ liệu", description: "Nhãn xuất dữ liệu." },
  "settings.exportReady": {
    value: "Bản sao dữ liệu đã sẵn sàng",
    description: "Thông báo gói xuất sẵn sàng.",
  },
  "settings.resetProgress": { value: "Xóa tiến độ và bắt đầu lại", description: "Nhãn đặt lại tiến độ." },
  "settings.resetConfirm": {
    value: "Xóa toàn bộ tiến độ của hồ sơ đang chọn và cho bé bắt đầu lại?",
    description: "Xác nhận đặt lại tiến độ.",
  },
  "settings.resetSuccess": {
    value: "Đã xóa tiến độ. Bé có thể bắt đầu lại.",
    description: "Thông báo đặt lại tiến độ thành công.",
  },
  "settings.deleteRequest": { value: "Xóa dữ liệu gia đình", description: "Nhãn yêu cầu xóa dữ liệu." },
  "settings.deleteConfirm": {
    value: "Gửi yêu cầu xóa toàn bộ dữ liệu gia đình? Sau khi xử lý xong, dữ liệu sẽ không thể khôi phục.",
    description: "Xác nhận yêu cầu xóa dữ liệu.",
  },
  "settings.deleteSuccess": {
    value: "Đã nhận yêu cầu xóa dữ liệu",
    description: "Thông báo yêu cầu xóa được ghi nhận.",
  },
  "activity.title": { value: "Những hoạt động đã làm", description: "Tiêu đề lịch sử hoạt động của bé." },
  "activity.description": {
    value: "Xem bé đã làm gì theo thời gian. Không so sánh với trẻ khác.",
    description: "Mô tả lịch sử hoạt động.",
  },
  "activity.allStatuses": { value: "Tất cả trạng thái", description: "Lựa chọn mọi trạng thái lượt chơi." },
  "activity.completed": { value: "Đã hoàn thành", description: "Trạng thái lượt chơi hoàn thành." },
  "activity.inProgress": { value: "Đang làm dở", description: "Trạng thái lượt chơi đang tiếp tục." },
  "activity.exited": { value: "Đã tạm dừng", description: "Trạng thái lượt chơi đã dừng." },
  "activity.filter": { value: "Xem kết quả", description: "Nhãn nút lọc hoạt động." },
  "activity.questions": {
    value: "{correct}/{total} câu",
    description: "Số câu đúng trên tổng số câu.",
  },
  "activity.hints": { value: "{count} gợi ý", description: "Số gợi ý đã dùng." },
  "activity.retries": { value: "{count} lần thử lại", description: "Số lần thử lại." },
  "activity.empty": {
    value: "Không có hoạt động nào khớp với lựa chọn này.",
    description: "Trạng thái lịch sử hoạt động trống.",
  },
});
