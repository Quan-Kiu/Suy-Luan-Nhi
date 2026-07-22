import { defineContent } from "@/content/define";

export const commonContentEntries = defineContent("common", {
  "brand.name": { value: "Suy Luận Nhí", description: "Tên thương hiệu hiển thị toàn hệ thống." },
  "brand.description": {
    value: "Các nhiệm vụ ngắn giúp bé quan sát, suy luận và tự tin thử lại.",
    description: "Mô tả mặc định cho metadata và landing page.",
  },
  "actions.save": { value: "Lưu thay đổi", description: "Nhãn nút lưu chung." },
  "actions.retry": { value: "Thử lại", description: "Nhãn thử lại thao tác." },
  "states.loading": { value: "Đang tải...", description: "Trạng thái tải dữ liệu chung." },
  "states.empty": { value: "Chưa có nội dung", description: "Trạng thái dữ liệu trống chung." },
  "errors.generic": { value: "Có chút trục trặc. Hãy thử lại.", description: "Thông báo lỗi chung." },
  "errors.network": {
    value: "Mạng đang không ổn định. Hãy kiểm tra kết nối rồi thử lại.",
    description: "Thông báo lỗi mạng chung.",
  },
  "feedback.open": { value: "Gửi góp ý về trang này", description: "Nhãn trợ năng mở góp ý nhanh." },
  "feedback.button": { value: "Góp ý", description: "Nhãn nút góp ý toàn cục." },
  "feedback.eyebrow": { value: "Góp ý nhanh", description: "Nhãn đầu hộp góp ý." },
  "feedback.title": {
    value: "Bạn muốn chúng tôi cải thiện điều gì?",
    description: "Tiêu đề hộp góp ý toàn cục.",
  },
  "feedback.contentLabel": { value: "Nội dung góp ý", description: "Nhãn ô nội dung góp ý." },
  "feedback.contentPlaceholder": {
    value: "Mô tả điều bạn gặp hoặc kết quả bạn mong muốn...",
    description: "Gợi ý nhập nội dung góp ý.",
  },
  "feedback.capturePrivacy": {
    value: "Nội dung đang nhập trong biểu mẫu và các vùng riêng tư sẽ được ẩn khỏi ảnh tự chụp.",
    description: "Giải thích cách bảo vệ dữ liệu khi tự chụp trang để gửi góp ý.",
  },
  "feedback.attachmentsDisabled": {
    value: "Ảnh đính kèm đang được tắt. Bạn vẫn có thể gửi nội dung góp ý.",
    description: "Thông báo khi quản trị viên tắt ảnh trong góp ý.",
  },
  "feedback.success": { value: "Đã gửi góp ý. Cảm ơn bạn!", description: "Thông báo gửi góp ý thành công." },
});

export const gameplayContentEntries = defineContent("gameplay", {
  "actions.checkAnswer": { value: "Xem con làm đúng chưa", description: "Nhãn nút kiểm tra đáp án." },
  "actions.hint": { value: "Gợi ý cho con", description: "Nhãn nút lấy gợi ý." },
  "feedback.correctTitle": { value: "Tuyệt vời!", description: "Tiêu đề phản hồi đúng." },
  "feedback.retryTitle": { value: "Chưa chính xác", description: "Tiêu đề khi câu trả lời chưa đúng." },
  "mission.start": { value: "Bắt đầu chơi", description: "Nhãn bắt đầu nhiệm vụ." },
  "mission.starting": { value: "Bống đang chuẩn bị...", description: "Nhãn khi bắt đầu nhiệm vụ." },
  "mission.startError": { value: "Chưa thể bắt đầu. Hãy thử lại.", description: "Lỗi bắt đầu nhiệm vụ." },
  "actions.checking": { value: "Đang kiểm tra...", description: "Nhãn khi kiểm tra đáp án." },
  "actions.loadingHint": { value: "Đang lấy gợi ý...", description: "Nhãn khi tải gợi ý." },
  "actions.nextQuestion": { value: "Câu tiếp theo →", description: "Nhãn sang câu tiếp theo." },
  "actions.claimBadge": { value: "Nhận huy hiệu", description: "Nhãn nhận huy hiệu." },
  "actions.retry": { value: "Thử lại", description: "Nhãn thử lại câu hỏi." },
  "actions.exit": { value: "Dừng và lưu tiến độ", description: "Nhãn dừng lượt chơi." },
  "actions.exiting": { value: "Đang lưu tiến độ...", description: "Nhãn khi dừng lượt chơi." },
  "errors.answer": { value: "Chưa lưu được câu trả lời. Hãy thử lại.", description: "Lỗi gửi đáp án." },
  "errors.hint": { value: "Chưa lấy được gợi ý. Hãy thử lại.", description: "Lỗi lấy gợi ý." },
  "errors.complete": {
    value: "Chưa hoàn tất được nhiệm vụ. Hãy thử lại.",
    description: "Lỗi hoàn thành nhiệm vụ.",
  },
  "errors.exit": { value: "Chưa lưu được tiến độ. Hãy thử lại.", description: "Lỗi dừng lượt chơi." },
  "hint.imageAlt": { value: "Bống đang gợi ý", description: "Mô tả hình ảnh linh vật gợi ý." },
});

export const adminContentEntries = defineContent("admin", {
  "content.title": { value: "Sửa câu chữ trong ứng dụng", description: "Tiêu đề trang chỉnh sửa câu chữ." },
  "content.description": {
    value: "Tìm và chỉnh sửa những câu chữ người dùng nhìn thấy mà không cần sửa mã nguồn.",
    description: "Mô tả trang chỉnh sửa câu chữ.",
  },
  "content.searchPlaceholder": {
    value: "Ví dụ: đăng nhập, lưu thay đổi, chưa có dữ liệu",
    description: "Gợi ý tìm kiếm câu chữ hiển thị.",
  },
  "content.valuePlaceholder": {
    value: "Nhập nội dung hiển thị",
    description: "Gợi ý trong ô chỉnh sửa câu chữ.",
  },
  "content.active": { value: "Đang dùng", description: "Nhãn cho nội dung đang được sản phẩm sử dụng." },
  "content.save": { value: "Lưu nội dung", description: "Nhãn nút lưu câu chữ." },
  "content.saving": { value: "Đang lưu thay đổi...", description: "Trạng thái đang lưu câu chữ." },
  "content.empty": {
    value: "Không tìm thấy câu chữ phù hợp.",
    description: "Thông báo khi tìm kiếm không có kết quả.",
  },
  "media.uploadTitle": {
    value: "Thêm hình ảnh, âm thanh hoặc video",
    description: "Tiêu đề form tải tệp.",
  },
  "media.uploadDescription": {
    value: "Tải tệp lên thư viện và viết mô tả ngắn để người dùng trình đọc màn hình hiểu nội dung.",
    description: "Hướng dẫn tải tệp.",
  },
  "media.altLabel": { value: "Mô tả cho người không xem được nội dung", description: "Nhãn mô tả tệp." },
  "media.altPlaceholder": {
    value: "Ví dụ: Bống cầm kính lúp bên cây",
    description: "Gợi ý trong ô nhập mô tả tệp.",
  },
  "media.upload": { value: "Tải lên", description: "Nhãn nút tải media." },
  "media.uploading": { value: "Đang tải...", description: "Nhãn khi tải media." },
  "media.uploadSuccess": {
    value: "Đã thêm vào thư viện",
    description: "Thông báo tải tệp thành công.",
  },
  "media.reviewOnly": {
    value:
      "Bạn có thể kiểm tra và đánh dấu tệp phù hợp. Chỉ người soạn nội dung hoặc quản trị viên mới được thêm tệp.",
    description: "Thông báo quyền tệp.",
  },
  "media.approve": { value: "Đánh dấu phù hợp", description: "Nhãn duyệt tệp." },
  "media.reject": { value: "Đánh dấu cần thay", description: "Nhãn từ chối tệp." },
  "media.copyLink": { value: "Sao chép liên kết", description: "Nhãn sao chép nhanh liên kết tệp." },
  "media.copySuccess": {
    value: "Đã sao chép liên kết",
    description: "Thông báo sao chép liên kết thành công.",
  },
  "media.copyError": {
    value: "Không thể sao chép liên kết",
    description: "Thông báo sao chép liên kết thất bại.",
  },
  "media.delete": { value: "Xóa tệp", description: "Nhãn xóa tệp." },
  "media.deleteSuccess": { value: "Đã xóa tệp", description: "Thông báo xóa tệp thành công." },
  "media.deleteConfirm": { value: "Xóa vĩnh viễn tệp này?", description: "Xác nhận xóa tệp." },
  "media.deleteFeedbackConfirm": {
    value: "Ảnh sẽ bị xóa khỏi góp ý đang đính kèm và không thể khôi phục.",
    description: "Xác nhận xóa ảnh đính kèm khỏi góp ý hệ thống.",
  },
  "settings.title": {
    value: "Cấu hình hệ thống",
    description: "Tiêu đề quản lý cấu hình vận hành hệ thống.",
  },
  "settings.jsonLabel": { value: "Nội dung cài đặt", description: "Nhãn giá trị cài đặt." },
  "settings.jsonPlaceholder": { value: "Nhập nội dung cài đặt", description: "Gợi ý nhập giá trị cài đặt." },
  "settings.save": { value: "Lưu", description: "Nhãn lưu cài đặt." },
  "settings.saving": { value: "Đang lưu...", description: "Nhãn khi lưu cài đặt." },
  "settings.saved": { value: "Đã lưu cài đặt", description: "Thông báo lưu cài đặt." },
  "settings.createTitle": { value: "Thêm cấu hình mới", description: "Tiêu đề thêm cài đặt." },
  "settings.keyLabel": { value: "Mã dành cho hệ thống", description: "Nhãn kỹ thuật của cài đặt." },
  "settings.keyPlaceholder": {
    value: "Ví dụ: feature.enabled",
    description: "Gợi ý trong ô nhập mã cài đặt.",
  },
  "settings.create": { value: "Thêm cấu hình", description: "Nhãn tạo cài đặt." },
  "world.createTitle": { value: "Thêm chủ đề nhiệm vụ", description: "Tiêu đề thêm chủ đề nhiệm vụ." },
  "world.slugLabel": { value: "Mã đường dẫn (nâng cao)", description: "Nhãn mã đường dẫn chủ đề nhiệm vụ." },
  "world.titleLabel": { value: "Tên chủ đề", description: "Nhãn tên chủ đề nhiệm vụ." },
  "world.subtitleLabel": { value: "Câu giới thiệu ngắn", description: "Nhãn câu giới thiệu chủ đề." },
  "world.descriptionLabel": {
    value: "Mô tả cho phụ huynh và bé",
    description: "Nhãn mô tả chủ đề nhiệm vụ.",
  },
  "world.coverLabel": { value: "Ảnh bìa chủ đề", description: "Nhãn tải ảnh bìa cho chủ đề nhiệm vụ." },
  "world.sortOrderLabel": { value: "Vị trí trên bản đồ", description: "Nhãn thứ tự chủ đề." },
  "world.themeLabel": { value: "Màu chủ đề", description: "Nhãn màu chủ đề." },
  "world.statusLabel": { value: "Có hiển thị cho bé không?", description: "Nhãn trạng thái chủ đề." },
  "world.create": { value: "Thêm chủ đề", description: "Nhãn thêm chủ đề nhiệm vụ." },
  "world.creating": { value: "Đang tạo...", description: "Trạng thái đang thêm chủ đề." },
  "world.update": { value: "Lưu thay đổi", description: "Nhãn lưu thay đổi chủ đề." },
  "world.updating": { value: "Đang lưu...", description: "Trạng thái đang lưu chủ đề." },
  "world.createSuccess": { value: "Đã thêm chủ đề nhiệm vụ", description: "Thông báo thêm chủ đề nhiệm vụ." },
  "world.updateSuccess": {
    value: "Đã cập nhật chủ đề nhiệm vụ",
    description: "Thông báo cập nhật chủ đề nhiệm vụ.",
  },
});
