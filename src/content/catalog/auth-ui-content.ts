import { defineContent } from "@/content/define";

export const authContentEntries = defineContent("auth", {
  "signIn.title": { value: "Đăng nhập", description: "Tiêu đề màn hình đăng nhập." },
  "signIn.emailLabel": { value: "Email", description: "Nhãn email đăng nhập." },
  "signIn.emailPlaceholder": { value: "ba.me@example.com", description: "Placeholder email đăng nhập." },
  "signIn.passwordLabel": { value: "Mật khẩu", description: "Nhãn mật khẩu đăng nhập." },
  "signIn.passwordPlaceholder": { value: "Nhập mật khẩu", description: "Placeholder mật khẩu đăng nhập." },
  "signIn.rememberMe": {
    value: "Ghi nhớ đăng nhập trên thiết bị này",
    description: "Nhãn ghi nhớ đăng nhập.",
  },
  "signIn.submit": { value: "Đăng nhập", description: "Nhãn nút đăng nhập." },
  "signIn.submitting": { value: "Đang đăng nhập...", description: "Nhãn khi đang đăng nhập." },
  "signIn.forgot": { value: "Quên mật khẩu?", description: "Liên kết quên mật khẩu." },
  "signIn.createAccount": { value: "Tạo tài khoản", description: "Liên kết tạo tài khoản." },
  "signUp.parentNameLabel": { value: "Tên ba/mẹ", description: "Nhãn tên phụ huynh." },
  "signUp.parentNamePlaceholder": {
    value: "Ví dụ: Nguyễn Minh Anh",
    description: "Placeholder tên phụ huynh.",
  },
  "signUp.emailPlaceholder": { value: "ba.me@example.com", description: "Placeholder email đăng ký." },
  "signUp.passwordPlaceholder": {
    value: "Tạo mật khẩu ít nhất 10 ký tự",
    description: "Placeholder mật khẩu đăng ký.",
  },
  "signUp.confirmPasswordLabel": { value: "Nhập lại mật khẩu", description: "Nhãn xác nhận mật khẩu." },
  "signUp.confirmPasswordPlaceholder": {
    value: "Nhập lại mật khẩu",
    description: "Placeholder xác nhận mật khẩu.",
  },
  "signUp.privacyNote": {
    value: "Tài khoản này thuộc phụ huynh. Bé không cần email, ngày sinh đầy đủ hoặc thông tin định danh.",
    description: "Ghi chú riêng tư khi đăng ký.",
  },
  "signUp.submit": { value: "Tạo tài khoản phụ huynh", description: "Nhãn nút đăng ký." },
  "signUp.submitting": { value: "Đang tạo...", description: "Nhãn khi đang tạo tài khoản." },
  "signUp.success": { value: "Tài khoản đã được tạo", description: "Thông báo đăng ký thành công." },
  "signUp.hasAccount": { value: "Đã có tài khoản?", description: "Lời dẫn liên kết đăng nhập." },
  "forgot.emailLabel": { value: "Email tài khoản", description: "Nhãn email quên mật khẩu." },
  "forgot.submit": { value: "Gửi liên kết đặt lại", description: "Nhãn nút gửi đặt lại mật khẩu." },
  "forgot.submitting": { value: "Đang gửi...", description: "Nhãn khi đang gửi email." },
  "forgot.sentTitle": { value: "Hãy kiểm tra hộp thư", description: "Tiêu đề sau khi gửi email." },
  "forgot.sentDescription": {
    value: "Nếu email tồn tại, ba/mẹ sẽ nhận được liên kết đặt lại mật khẩu.",
    description: "Mô tả sau khi gửi email.",
  },
  "reset.passwordLabel": { value: "Mật khẩu mới", description: "Nhãn mật khẩu mới." },
  "reset.passwordPlaceholder": {
    value: "Mật khẩu mới ít nhất 10 ký tự",
    description: "Placeholder mật khẩu mới.",
  },
  "reset.confirmPlaceholder": {
    value: "Nhập lại mật khẩu mới",
    description: "Placeholder xác nhận mật khẩu mới.",
  },
  "reset.submit": { value: "Cập nhật mật khẩu", description: "Nhãn nút cập nhật mật khẩu." },
  "reset.submitting": { value: "Đang cập nhật...", description: "Nhãn khi đang cập nhật mật khẩu." },
  "reset.success": {
    value: "Mật khẩu đã được cập nhật",
    description: "Thông báo cập nhật mật khẩu thành công.",
  },
  "reset.invalidLink": {
    value: "Liên kết đặt lại mật khẩu không hợp lệ hoặc đã hết hạn.",
    description: "Thông báo liên kết đặt lại không hợp lệ.",
  },
  "verification.signUpTitle": {
    value: "Xác minh email để hoàn tất",
    description: "Tiêu đề xác minh sau đăng ký.",
  },
  "verification.signUpDescription": {
    value: "Tài khoản đã được tạo. Hãy mở email và nhấn nút xác minh trước khi bắt đầu.",
    description: "Mô tả bước xác minh sau đăng ký.",
  },
  "verification.signInTitle": { value: "Xác minh email để tiếp tục", description: "Tiêu đề modal xác minh." },
  "verification.signInDescription": {
    value: "Tài khoản này chưa xác minh email. Hãy hoàn tất bước bảo mật trước khi đăng nhập.",
    description: "Mô tả modal xác minh khi đăng nhập.",
  },
  "verification.spamHint": {
    value: "Chưa thấy email? Hãy kiểm tra mục Thư rác/Spam hoặc bấm gửi lại bên dưới.",
    description: "Gợi ý tìm email xác minh.",
  },
  "verification.stepOpenEmail": {
    value: "Mở email từ Suy Luận Nhí",
    description: "Bước mở email xác minh.",
  },
  "verification.stepConfirm": {
    value: "Nhấn “Xác minh email” trong thư",
    description: "Bước nhấn liên kết xác minh.",
  },
  "verification.stepReturn": {
    value: "Quay lại và tiếp tục hành trình",
    description: "Bước quay lại ứng dụng.",
  },
  "verification.sent": {
    value: "Email xác minh đã được gửi. Hãy kiểm tra cả thư rác nếu chưa thấy.",
    description: "Thông báo gửi lại email thành công.",
  },
  "verification.resend": { value: "Gửi lại email xác minh", description: "Nút gửi lại email xác minh." },
  "verification.resending": { value: "Đang gửi lại...", description: "Trạng thái gửi lại email." },
  "verification.changeEmail": { value: "Dùng email khác", description: "Nút đổi email đăng ký." },
  "verification.backToSignIn": { value: "Quay lại đăng nhập", description: "Liên kết quay lại đăng nhập." },
  "verification.retry": { value: "Đã xác minh, thử lại", description: "Nút thử đăng nhập lại." },
  "verification.later": { value: "Để sau", description: "Nút đóng modal xác minh." },
  "verification.close": { value: "Đóng", description: "Nhãn đóng modal xác minh." },
  "errors.invalidCredentials": {
    value: "Email hoặc mật khẩu chưa đúng.",
    description: "Lỗi sai thông tin đăng nhập.",
  },
  "errors.emailNotVerified": { value: "Email chưa được xác minh.", description: "Lỗi email chưa xác minh." },
  "errors.accountExists": { value: "Email này đã được sử dụng.", description: "Lỗi tài khoản đã tồn tại." },
  "errors.invalidEmail": { value: "Email chưa đúng định dạng.", description: "Lỗi email không hợp lệ." },
  "errors.invalidPassword": { value: "Mật khẩu không hợp lệ.", description: "Lỗi mật khẩu không hợp lệ." },
  "errors.passwordTooShort": {
    value: "Mật khẩu chưa đủ độ dài yêu cầu.",
    description: "Lỗi mật khẩu quá ngắn.",
  },
  "errors.passwordTooLong": {
    value: "Mật khẩu vượt quá độ dài cho phép.",
    description: "Lỗi mật khẩu quá dài.",
  },
  "errors.invalidToken": { value: "Liên kết không hợp lệ.", description: "Lỗi token không hợp lệ." },
  "errors.tokenExpired": { value: "Liên kết đã hết hạn.", description: "Lỗi token hết hạn." },
  "errors.emailAlreadyVerified": { value: "Email này đã được xác minh.", description: "Email đã xác minh." },
  "errors.rateLimited": {
    value: "Bạn thao tác quá nhanh. Vui lòng thử lại sau ít phút.",
    description: "Lỗi giới hạn tần suất.",
  },
  "errors.signIn": { value: "Không thể đăng nhập lúc này.", description: "Lỗi đăng nhập mặc định." },
  "errors.signUp": { value: "Không thể tạo tài khoản lúc này.", description: "Lỗi đăng ký mặc định." },
  "errors.forgot": {
    value: "Không thể gửi liên kết đặt lại lúc này.",
    description: "Lỗi gửi email đặt lại.",
  },
  "errors.reset": { value: "Không thể đổi mật khẩu lúc này.", description: "Lỗi đặt lại mật khẩu mặc định." },
  "errors.verificationSend": {
    value: "Không thể gửi email xác minh lúc này.",
    description: "Lỗi gửi email xác minh.",
  },
  "errors.generic": { value: "Có lỗi xảy ra. Vui lòng thử lại.", description: "Lỗi xác thực chung." },
});
