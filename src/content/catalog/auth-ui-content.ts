import { defineContent } from "@/content/define";

export const authContentEntries = defineContent("auth", {
  "signIn.title": { value: "Đăng nhập", description: "Tiêu đề màn hình đăng nhập." },
  "signIn.emailLabel": { value: "Email", description: "Nhãn email đăng nhập." },
  "signIn.emailPlaceholder": {
    value: "ba.me@example.com",
    description: "Gợi ý trong ô nhập email đăng nhập.",
  },
  "signIn.passwordLabel": { value: "Mật khẩu", description: "Nhãn mật khẩu đăng nhập." },
  "signIn.passwordPlaceholder": {
    value: "Nhập mật khẩu",
    description: "Gợi ý trong ô nhập mật khẩu đăng nhập.",
  },
  "signIn.rememberMe": {
    value: "Giữ đăng nhập trên thiết bị này",
    description: "Nhãn ghi nhớ đăng nhập.",
  },
  "signIn.submit": { value: "Đăng nhập", description: "Nhãn nút đăng nhập." },
  "signIn.submitting": { value: "Đang đăng nhập...", description: "Nhãn khi đang đăng nhập." },
  "signIn.forgot": { value: "Quên mật khẩu?", description: "Liên kết quên mật khẩu." },
  "signIn.createAccount": { value: "Tạo tài khoản", description: "Liên kết tạo tài khoản." },
  "social.googleSignIn": { value: "Đăng nhập bằng Google", description: "Nhãn nút đăng nhập Google." },
  "social.googleSignUp": { value: "Đăng ký bằng Google", description: "Nhãn nút đăng ký Google." },
  "social.googlePending": { value: "Đang kết nối Google...", description: "Trạng thái kết nối Google." },
  "social.emailDivider": {
    value: "hoặc tiếp tục bằng email",
    description: "Nhãn phân cách phương thức đăng nhập.",
  },
  "signUp.pageTitle": {
    value: "Bước 1: Tạo tài khoản ba mẹ",
    description: "Tiêu đề trang đăng ký trong quy trình thiết lập gia đình.",
  },
  "signUp.pageSubtitle": {
    value: "Sau khi xác minh email, ba mẹ sẽ tạo mã PIN rồi thiết lập hồ sơ cho bé.",
    description: "Mô tả rõ các bước tiếp theo sau khi tạo tài khoản.",
  },
  "signUp.stepAccount": { value: "Tài khoản", description: "Tên bước tạo tài khoản ba mẹ." },
  "signUp.stepPin": { value: "Mã PIN", description: "Tên bước tạo mã PIN phụ huynh." },
  "signUp.stepProfile": { value: "Hồ sơ bé", description: "Tên bước tạo hồ sơ cho bé." },
  "signUp.parentNameLabel": { value: "Tên ba/mẹ", description: "Nhãn tên phụ huynh." },
  "signUp.parentNamePlaceholder": {
    value: "Ví dụ: Nguyễn Minh Anh",
    description: "Gợi ý trong ô nhập tên phụ huynh.",
  },
  "signUp.emailPlaceholder": { value: "ba.me@example.com", description: "Gợi ý trong ô nhập email đăng ký." },
  "signUp.passwordPlaceholder": {
    value: "Tạo mật khẩu ít nhất 10 ký tự",
    description: "Gợi ý trong ô nhập mật khẩu đăng ký.",
  },
  "signUp.confirmPasswordLabel": { value: "Nhập lại mật khẩu", description: "Nhãn xác nhận mật khẩu." },
  "signUp.confirmPasswordPlaceholder": {
    value: "Nhập lại mật khẩu",
    description: "Gợi ý trong ô nhập xác nhận mật khẩu.",
  },
  "signUp.privacyNote": {
    value: "Chỉ ba/mẹ cần tài khoản. Hồ sơ của bé không cần email, tên thật hoặc ngày sinh đầy đủ.",
    description: "Ghi chú riêng tư khi đăng ký.",
  },
  "signUp.flowPrivacyNote": {
    value: "Chỉ ba mẹ cần tài khoản. Bé không cần email, tên thật hoặc ngày sinh đầy đủ.",
    description: "Ghi chú riêng tư trong quy trình tạo tài khoản và hồ sơ bé.",
  },
  "signUp.submit": { value: "Tạo tài khoản phụ huynh", description: "Nhãn nút đăng ký." },
  "signUp.flowSubmit": {
    value: "Tạo tài khoản ba mẹ",
    description: "Nhãn nút đăng ký trong quy trình thiết lập gia đình.",
  },
  "signUp.submitting": { value: "Đang tạo...", description: "Nhãn khi đang tạo tài khoản." },
  "signUp.success": {
    value: "Đã tạo tài khoản. Hãy kiểm tra email để xác minh.",
    description: "Thông báo đăng ký thành công.",
  },
  "signUp.hasAccount": { value: "Đã có tài khoản?", description: "Lời dẫn liên kết đăng nhập." },
  "pinSetup.title": { value: "Tạo mã PIN phụ huynh", description: "Tiêu đề bước thiết lập mã PIN." },
  "pinSetup.subtitle": {
    value: "Đây là bước bảo vệ riêng trước khi tạo hồ sơ hoặc xem thông tin của bé.",
    description: "Mô tả bước thiết lập mã PIN phụ huynh.",
  },
  "pinSetup.whyTitle": { value: "Bảo vệ phần dành cho ba mẹ", description: "Lý do cần mã PIN." },
  "pinSetup.whyDescription": {
    value: "Mã PIN giúp bé không vô tình mở tiến độ, cài đặt và dữ liệu gia đình.",
    description: "Giải thích ngắn về tác dụng của mã PIN.",
  },
  "pinSetup.pinLabel": { value: "Tạo mã PIN 6 chữ số", description: "Nhãn ô tạo mã PIN." },
  "pinSetup.pinDescription": {
    value: "Tránh dùng 123456, ngày sinh hoặc một chữ số lặp lại.",
    description: "Hướng dẫn chọn mã PIN khó đoán.",
  },
  "pinSetup.pinPlaceholder": { value: "Nhập 6 chữ số", description: "Gợi ý ô tạo mã PIN." },
  "pinSetup.confirmLabel": { value: "Nhập lại mã PIN", description: "Nhãn xác nhận mã PIN." },
  "pinSetup.confirmPlaceholder": {
    value: "Nhập lại 6 chữ số",
    description: "Gợi ý ô xác nhận mã PIN.",
  },
  "pinSetup.changeHint": {
    value: "Ba mẹ có thể đổi mã PIN sau trong phần Cài đặt gia đình.",
    description: "Gợi ý cách đổi mã PIN sau này.",
  },
  "pinSetup.submit": { value: "Lưu mã PIN và tiếp tục", description: "Nhãn nút lưu mã PIN." },
  "pinSetup.submitting": {
    value: "Đang bảo vệ khu vực phụ huynh...",
    description: "Trạng thái đang lưu mã PIN.",
  },
  "pinSetup.success": {
    value: "Mã PIN phụ huynh đã được thiết lập",
    description: "Thông báo thiết lập mã PIN thành công.",
  },
  "pinReset.requestTitle": { value: "Quên mã PIN phụ huynh", description: "Tiêu đề yêu cầu khôi phục PIN." },
  "pinReset.requestSubtitle": {
    value: "Xác nhận qua email để tạo mã PIN mới an toàn.",
    description: "Mô tả bước yêu cầu khôi phục PIN.",
  },
  "pinReset.requestDescription": {
    value: "Hệ thống sẽ gửi liên kết bảo mật tới {email}.",
    description: "Giải thích email nhận liên kết khôi phục PIN.",
  },
  "pinReset.requestSubmit": { value: "Gửi liên kết tạo PIN mới", description: "Nút yêu cầu khôi phục PIN." },
  "pinReset.requesting": { value: "Đang gửi...", description: "Trạng thái gửi liên kết khôi phục PIN." },
  "pinReset.sentTitle": { value: "Hãy kiểm tra hộp thư", description: "Tiêu đề sau khi gửi liên kết PIN." },
  "pinReset.sentDescription": {
    value: "Liên kết tạo mã PIN mới đã được gửi và có hiệu lực trong 15 phút.",
    description: "Thông báo gửi liên kết PIN thành công.",
  },
  "pinReset.backToGate": { value: "Quay lại nhập mã PIN", description: "Liên kết quay lại bước nhập PIN." },
  "pinReset.resetTitle": { value: "Tạo mã PIN mới", description: "Tiêu đề đặt lại PIN." },
  "pinReset.resetSubtitle": {
    value: "Chọn mã PIN 6 chữ số khó đoán và chỉ ba/mẹ biết.",
    description: "Mô tả bước đặt lại PIN.",
  },
  "pinReset.pinLabel": { value: "Tạo mã PIN mới gồm 6 chữ số", description: "Nhãn PIN mới." },
  "pinReset.confirmLabel": { value: "Nhập lại mã PIN mới", description: "Nhãn xác nhận PIN mới." },
  "pinReset.resetSubmit": { value: "Lưu mã PIN mới", description: "Nút lưu PIN mới." },
  "pinReset.resetting": { value: "Đang cập nhật...", description: "Trạng thái lưu PIN mới." },
  "pinReset.success": {
    value: "Mã PIN phụ huynh đã được cập nhật",
    description: "Thông báo đổi PIN thành công.",
  },
  "pinReset.invalidLink": {
    value: "Liên kết đặt lại mã PIN không hợp lệ hoặc đã hết hạn.",
    description: "Lỗi liên kết đặt lại PIN.",
  },
  "forgot.emailLabel": { value: "Email tài khoản", description: "Nhãn email quên mật khẩu." },
  "forgot.submit": { value: "Gửi liên kết đặt lại", description: "Nhãn nút gửi đặt lại mật khẩu." },
  "forgot.submitting": { value: "Đang gửi...", description: "Nhãn khi đang gửi email." },
  "forgot.sentTitle": { value: "Hãy kiểm tra hộp thư", description: "Tiêu đề sau khi gửi email." },
  "forgot.sentDescription": {
    value: "Nếu email này đã đăng ký, ba/mẹ sẽ nhận được liên kết đặt lại mật khẩu.",
    description: "Mô tả sau khi gửi email.",
  },
  "reset.passwordLabel": { value: "Mật khẩu mới", description: "Nhãn mật khẩu mới." },
  "reset.passwordPlaceholder": {
    value: "Mật khẩu mới ít nhất 10 ký tự",
    description: "Gợi ý trong ô nhập mật khẩu mới.",
  },
  "reset.confirmPlaceholder": {
    value: "Nhập lại mật khẩu mới",
    description: "Gợi ý trong ô nhập xác nhận mật khẩu mới.",
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
    value: "Kiểm tra email để hoàn tất đăng ký",
    description: "Tiêu đề xác minh sau đăng ký.",
  },
  "verification.signUpFlowTitle": {
    value: "Kiểm tra email để tiếp tục thiết lập",
    description: "Tiêu đề xác minh email trong quy trình tạo tài khoản và hồ sơ bé.",
  },
  "verification.signUpFlowDescription": {
    value: "Tài khoản đã được tạo. Hãy xác minh email, sau đó quay lại để tạo mã PIN và hồ sơ cho bé.",
    description: "Mô tả bước xác minh và bước tạo hồ sơ tiếp theo.",
  },
  "verification.signUpFlowReturn": {
    value: "Quay lại Suy Luận Nhí và tiếp tục thiết lập",
    description: "Bước cuối trong hướng dẫn xác minh email sau đăng ký.",
  },
  "verification.signUpDescription": {
    value: "Mở email từ Suy Luận Nhí và bấm “Xác minh email” để bắt đầu.",
    description: "Mô tả bước xác minh sau đăng ký.",
  },
  "verification.signInTitle": {
    value: "Cần xác minh email trước khi đăng nhập",
    description: "Tiêu đề modal xác minh.",
  },
  "verification.signInDescription": {
    value: "Email này chưa được xác minh. Hãy mở thư xác minh rồi quay lại đăng nhập.",
    description: "Mô tả modal xác minh khi đăng nhập.",
  },
  "verification.spamHint": {
    value: "Không thấy thư? Hãy kiểm tra mục Thư rác hoặc bấm gửi lại bên dưới.",
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
    value: "Quay lại Suy Luận Nhí và đăng nhập",
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
  "verification.retry": { value: "Tôi đã xác minh, đăng nhập lại", description: "Nút thử đăng nhập lại." },
  "verification.later": { value: "Để sau", description: "Nút đóng modal xác minh." },
  "verification.close": { value: "Đóng", description: "Nhãn đóng modal xác minh." },
  "verification.successTitle": {
    value: "Xác minh email thành công",
    description: "Tiêu đề modal khi xác minh email thành công.",
  },
  "verification.successDescription": {
    value: "Email của ba/mẹ đã được xác minh. Tài khoản đã sẵn sàng để sử dụng.",
    description: "Mô tả modal khi xác minh email thành công.",
  },
  "verification.expiredTitle": {
    value: "Liên kết xác minh đã hết hạn",
    description: "Tiêu đề modal khi liên kết xác minh hết hạn.",
  },
  "verification.expiredDescription": {
    value: "Liên kết này đã quá thời hạn. Hãy đăng nhập để yêu cầu một email xác minh mới.",
    description: "Mô tả modal khi liên kết xác minh hết hạn.",
  },
  "verification.invalidTitle": {
    value: "Liên kết xác minh không hợp lệ",
    description: "Tiêu đề modal khi liên kết xác minh không hợp lệ.",
  },
  "verification.invalidDescription": {
    value: "Liên kết này không còn dùng được. Hãy đăng nhập để gửi lại email xác minh.",
    description: "Mô tả modal khi liên kết xác minh không dùng được.",
  },
  "verification.errorTitle": {
    value: "Chưa thể xác minh email",
    description: "Tiêu đề modal khi xác minh email gặp lỗi khác.",
  },
  "verification.errorDescription": {
    value: "Hệ thống chưa thể hoàn tất xác minh. Hãy đăng nhập và thử gửi lại email xác minh.",
    description: "Mô tả modal khi xác minh email gặp lỗi khác.",
  },
  "verification.continue": { value: "Tiếp tục", description: "Nút tiếp tục sau khi xác minh email." },
  "verification.signInAgain": {
    value: "Đăng nhập để gửi lại",
    description: "Nút đăng nhập để yêu cầu email xác minh mới.",
  },
  "verification.home": { value: "Về trang chủ", description: "Nút về trang chủ trong modal xác minh." },
  "errors.invalidCredentials": {
    value: "Email hoặc mật khẩu chưa đúng. Hãy kiểm tra và thử lại.",
    description: "Lỗi sai thông tin đăng nhập.",
  },
  "errors.emailNotVerified": { value: "Email chưa được xác minh.", description: "Lỗi email chưa xác minh." },
  "errors.accountExists": {
    value: "Email này đã có tài khoản. Hãy đăng nhập hoặc đặt lại mật khẩu.",
    description: "Lỗi tài khoản đã tồn tại.",
  },
  "errors.invalidEmail": {
    value: "Email chưa đúng. Ví dụ: ba.me@example.com.",
    description: "Lỗi email không hợp lệ.",
  },
  "errors.invalidPassword": {
    value: "Mật khẩu chưa đúng yêu cầu.",
    description: "Lỗi mật khẩu không hợp lệ.",
  },
  "errors.passwordTooShort": {
    value: "Mật khẩu cần có ít nhất 10 ký tự.",
    description: "Lỗi mật khẩu quá ngắn.",
  },
  "errors.passwordTooLong": {
    value: "Mật khẩu quá dài. Hãy dùng mật khẩu ngắn hơn.",
    description: "Lỗi mật khẩu quá dài.",
  },
  "errors.invalidToken": {
    value: "Liên kết này không còn dùng được.",
    description: "Lỗi token không hợp lệ.",
  },
  "errors.tokenExpired": {
    value: "Liên kết đã hết hạn. Hãy yêu cầu một liên kết mới.",
    description: "Lỗi token hết hạn.",
  },
  "errors.emailAlreadyVerified": { value: "Email này đã được xác minh.", description: "Email đã xác minh." },
  "errors.rateLimited": {
    value: "Bạn vừa thử nhiều lần. Hãy chờ vài phút rồi thử lại.",
    description: "Lỗi giới hạn tần suất.",
  },
  "errors.signIn": { value: "Không thể đăng nhập lúc này.", description: "Lỗi đăng nhập mặc định." },
  "errors.signUp": { value: "Không thể tạo tài khoản lúc này.", description: "Lỗi đăng ký mặc định." },
  "errors.oauth": {
    value: "Chưa thể kết nối với Google. Hãy thử lại hoặc dùng email.",
    description: "Lỗi chung khi xác thực Google.",
  },
  "errors.oauthDenied": {
    value: "Bạn đã đóng hoặc từ chối đăng nhập Google.",
    description: "Lỗi khi người dùng hủy cấp quyền Google.",
  },
  "errors.accountNotLinked": {
    value: "Tài khoản Google này chưa được liên kết. Hãy đăng nhập bằng cách đã dùng trước đó.",
    description: "Lỗi tài khoản Google chưa liên kết.",
  },
  "errors.signupDisabled": {
    value: "Hệ thống đang tạm dừng tạo tài khoản mới.",
    description: "Lỗi đăng ký Google khi tắt đăng ký.",
  },
  "errors.forgot": {
    value: "Không thể gửi liên kết đặt lại lúc này.",
    description: "Lỗi gửi email đặt lại.",
  },
  "errors.reset": { value: "Không thể đổi mật khẩu lúc này.", description: "Lỗi đặt lại mật khẩu mặc định." },
  "errors.verificationSend": {
    value: "Không thể gửi email xác minh lúc này.",
    description: "Lỗi gửi email xác minh.",
  },
  "errors.generic": { value: "Có chút trục trặc. Hãy thử lại.", description: "Lỗi xác thực chung." },
});
