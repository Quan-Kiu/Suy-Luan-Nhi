import type { ContentDictionary } from "@/content/types";
import { contentText } from "@/content/resolve";

type AuthErrorLike = { code?: unknown; message?: unknown; status?: unknown };
type ErrorCopy = { key: string; fallback: string };

const errorCopy: Record<string, ErrorCopy> = {
  INVALID_EMAIL_OR_PASSWORD: { key: "errors.invalidCredentials", fallback: "Email hoặc mật khẩu chưa đúng." },
  EMAIL_NOT_VERIFIED: { key: "errors.emailNotVerified", fallback: "Email chưa được xác minh." },
  USER_ALREADY_EXISTS: { key: "errors.accountExists", fallback: "Email này đã được sử dụng." },
  USER_ALREADY_EXISTS_USE_ANOTHER_EMAIL: {
    key: "errors.accountExists",
    fallback: "Email này đã được sử dụng.",
  },
  INVALID_EMAIL: { key: "errors.invalidEmail", fallback: "Email chưa đúng định dạng." },
  INVALID_PASSWORD: { key: "errors.invalidPassword", fallback: "Mật khẩu không hợp lệ." },
  PASSWORD_TOO_SHORT: { key: "errors.passwordTooShort", fallback: "Mật khẩu chưa đủ độ dài yêu cầu." },
  PASSWORD_TOO_LONG: { key: "errors.passwordTooLong", fallback: "Mật khẩu vượt quá độ dài cho phép." },
  INVALID_TOKEN: { key: "errors.invalidToken", fallback: "Liên kết không hợp lệ." },
  TOKEN_EXPIRED: { key: "errors.tokenExpired", fallback: "Liên kết đã hết hạn." },
  EMAIL_ALREADY_VERIFIED: { key: "errors.emailAlreadyVerified", fallback: "Email này đã được xác minh." },
  TOO_MANY_REQUESTS: {
    key: "errors.rateLimited",
    fallback: "Bạn thao tác quá nhanh. Vui lòng thử lại sau ít phút.",
  },
  SIGN_IN_FAILED: { key: "errors.signIn", fallback: "Không thể đăng nhập lúc này." },
  SIGN_UP_FAILED: { key: "errors.signUp", fallback: "Không thể tạo tài khoản lúc này." },
  OAUTH_ERROR: { key: "errors.oauth", fallback: "Chưa thể kết nối với Google." },
  ACCESS_DENIED: { key: "errors.oauthDenied", fallback: "Bạn đã hủy đăng nhập Google." },
  ACCOUNT_NOT_LINKED: {
    key: "errors.accountNotLinked",
    fallback: "Tài khoản Google này chưa được liên kết.",
  },
  SIGNUP_DISABLED: { key: "errors.signupDisabled", fallback: "Hệ thống đang tạm dừng tạo tài khoản mới." },
  SOCIAL_LOGIN_DISABLED: {
    key: "errors.socialLoginDisabled",
    fallback: "Đăng nhập bằng Google đang tạm tắt. Vui lòng dùng email.",
  },
  PASSWORD_RESET_REQUEST_FAILED: {
    key: "errors.forgot",
    fallback: "Không thể gửi liên kết đặt lại lúc này.",
  },
  PASSWORD_RESET_FAILED: { key: "errors.reset", fallback: "Không thể đổi mật khẩu lúc này." },
  VERIFICATION_SEND_FAILED: {
    key: "errors.verificationSend",
    fallback: "Không thể gửi email xác minh lúc này.",
  },
};

export class AuthFlowError extends Error {
  constructor(
    readonly code: string,
    readonly status?: number,
  ) {
    super(code);
    this.name = "AuthFlowError";
  }
}

function errorField(error: unknown, field: keyof AuthErrorLike) {
  return error && typeof error === "object" && field in error ? (error as AuthErrorLike)[field] : undefined;
}

export function getAuthErrorCode(error: unknown, fallbackCode = "AUTH_ERROR") {
  const code = error instanceof AuthFlowError ? error.code : errorField(error, "code");
  if (typeof code === "string" && code.trim()) return code.trim().toUpperCase();

  const status = error instanceof AuthFlowError ? error.status : errorField(error, "status");
  if (status === 429) return "TOO_MANY_REQUESTS";

  const message = errorField(error, "message");
  if (typeof message === "string") {
    if (/email.*not.*verif/i.test(message)) return "EMAIL_NOT_VERIFIED";
    if (/invalid email or password/i.test(message)) return "INVALID_EMAIL_OR_PASSWORD";
  }
  return fallbackCode;
}

export function toAuthFlowError(error: unknown, fallbackCode: string) {
  const status = errorField(error, "status");
  return new AuthFlowError(
    getAuthErrorCode(error, fallbackCode),
    typeof status === "number" ? status : undefined,
  );
}

export function isAuthError(error: unknown, code: string) {
  return getAuthErrorCode(error) === code;
}

export function getAuthErrorMessage(content: ContentDictionary, error: unknown, fallbackCode: string) {
  const copy = errorCopy[getAuthErrorCode(error, fallbackCode)] ??
    errorCopy[fallbackCode] ?? {
      key: "errors.generic",
      fallback: "Có lỗi xảy ra. Vui lòng thử lại.",
    };
  return contentText(content, copy.key, copy.fallback);
}
