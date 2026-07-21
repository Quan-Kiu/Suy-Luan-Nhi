import type { TranslationDictionary } from "@better-auth/i18n";

export const viAuthTranslations = {
  USER_NOT_FOUND: "Không tìm thấy tài khoản.",
  FAILED_TO_CREATE_USER: "Chưa thể tạo tài khoản. Vui lòng thử lại.",
  FAILED_TO_CREATE_SESSION: "Chưa thể bắt đầu phiên đăng nhập. Vui lòng thử lại.",
  FAILED_TO_UPDATE_USER: "Chưa thể cập nhật tài khoản.",
  FAILED_TO_GET_SESSION: "Phiên đăng nhập không còn hợp lệ.",
  INVALID_PASSWORD: "Mật khẩu không hợp lệ.",
  INVALID_EMAIL: "Email chưa đúng định dạng.",
  INVALID_EMAIL_OR_PASSWORD: "Email hoặc mật khẩu chưa đúng.",
  INVALID_USER: "Tài khoản không hợp lệ.",
  INVALID_TOKEN: "Liên kết xác minh không hợp lệ.",
  TOKEN_EXPIRED: "Liên kết xác minh đã hết hạn.",
  EMAIL_NOT_VERIFIED: "Email chưa được xác minh.",
  PASSWORD_TOO_SHORT: "Mật khẩu chưa đủ độ dài yêu cầu.",
  PASSWORD_TOO_LONG: "Mật khẩu vượt quá độ dài cho phép.",
  USER_ALREADY_EXISTS: "Tài khoản với email này đã tồn tại.",
  USER_ALREADY_EXISTS_USE_ANOTHER_EMAIL: "Email này đã được sử dụng. Hãy dùng email khác.",
  SESSION_EXPIRED: "Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.",
  VERIFICATION_EMAIL_NOT_ENABLED: "Tính năng gửi email xác minh chưa sẵn sàng.",
  EMAIL_ALREADY_VERIFIED: "Email này đã được xác minh.",
  EMAIL_MISMATCH: "Email không khớp với tài khoản hiện tại.",
  INVALID_ORIGIN: "Yêu cầu không hợp lệ. Vui lòng tải lại trang.",
  INVALID_CALLBACK_URL: "Đường dẫn quay lại không hợp lệ.",
  MISSING_OR_NULL_ORIGIN: "Không xác định được nguồn gửi yêu cầu.",
  FAILED_TO_CREATE_VERIFICATION: "Chưa thể tạo liên kết xác minh.",
  VALIDATION_ERROR: "Thông tin gửi lên chưa hợp lệ.",
  MISSING_FIELD: "Vui lòng điền đầy đủ thông tin bắt buộc.",
  TOO_MANY_REQUESTS: "Bạn thao tác quá nhanh. Vui lòng thử lại sau ít phút.",
  INTERNAL_SERVER_ERROR: "Hệ thống đang bận. Vui lòng thử lại sau.",
} satisfies TranslationDictionary;

export const enAuthTranslations = {
  USER_NOT_FOUND: "Account not found.",
  FAILED_TO_CREATE_USER: "We could not create the account. Please try again.",
  FAILED_TO_CREATE_SESSION: "We could not start your session. Please try again.",
  FAILED_TO_UPDATE_USER: "We could not update the account.",
  FAILED_TO_GET_SESSION: "Your session is no longer valid.",
  INVALID_PASSWORD: "The password is invalid.",
  INVALID_EMAIL: "Enter a valid email address.",
  INVALID_EMAIL_OR_PASSWORD: "The email or password is incorrect.",
  INVALID_USER: "The account is invalid.",
  INVALID_TOKEN: "The verification link is invalid.",
  TOKEN_EXPIRED: "The verification link has expired.",
  EMAIL_NOT_VERIFIED: "The email address has not been verified.",
  PASSWORD_TOO_SHORT: "The password is too short.",
  PASSWORD_TOO_LONG: "The password is too long.",
  USER_ALREADY_EXISTS: "An account already exists for this email.",
  USER_ALREADY_EXISTS_USE_ANOTHER_EMAIL: "This email is already in use. Try another email.",
  SESSION_EXPIRED: "Your session has expired. Please sign in again.",
  VERIFICATION_EMAIL_NOT_ENABLED: "Email verification is not available yet.",
  EMAIL_ALREADY_VERIFIED: "This email has already been verified.",
  EMAIL_MISMATCH: "The email does not match the current account.",
  INVALID_ORIGIN: "The request is invalid. Refresh the page and try again.",
  INVALID_CALLBACK_URL: "The return URL is invalid.",
  MISSING_OR_NULL_ORIGIN: "The request origin could not be determined.",
  FAILED_TO_CREATE_VERIFICATION: "We could not create a verification link.",
  VALIDATION_ERROR: "The submitted information is invalid.",
  MISSING_FIELD: "Complete all required fields.",
  TOO_MANY_REQUESTS: "Too many attempts. Please try again in a few minutes.",
  INTERNAL_SERVER_ERROR: "The service is busy. Please try again later.",
} satisfies TranslationDictionary;

export const authTranslations = { vi: viAuthTranslations, en: enAuthTranslations } as const;
export type AuthLocale = keyof typeof authTranslations;

export function resolveAuthLocale(value: string | null | undefined): AuthLocale | null {
  const locale = value?.trim().toLowerCase().split(",")[0]?.split("-")[0];
  return locale === "vi" || locale === "en" ? locale : null;
}
