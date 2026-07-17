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
  "errors.signIn": { value: "Không thể đăng nhập", description: "Lỗi đăng nhập mặc định." },
  "errors.signUp": { value: "Không thể tạo tài khoản", description: "Lỗi đăng ký mặc định." },
  "errors.reset": { value: "Không thể đổi mật khẩu", description: "Lỗi đặt lại mật khẩu mặc định." },
});
