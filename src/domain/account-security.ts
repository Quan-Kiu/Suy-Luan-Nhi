export const accountSessionErrorCodes = {
  notFound: "ACCOUNT_SESSION_NOT_FOUND",
  currentSession: "ACCOUNT_CURRENT_SESSION_REVOKE_FORBIDDEN",
  accountNotFound: "ACCOUNT_NOT_FOUND",
} as const;

export const accountSessionAudit = {
  actions: {
    revoked: "account_session.revoked",
    revokedOthers: "account_session.revoked_others",
  },
  resourceType: "user_session",
  source: "account_security_center",
} as const;

export const accountSessionErrorMessages = {
  notFound: "Không tìm thấy phiên đăng nhập hoặc phiên này không thuộc tài khoản hiện tại.",
  currentSession: "Không thể đăng xuất phiên đang dùng từ danh sách thiết bị.",
  accountNotFound: "Không tìm thấy tài khoản hiện tại.",
} as const;

export type AccountSignInMethod = {
  id: string;
  label: string;
};

export type AccountSecuritySession = {
  id: string;
  current: boolean;
  browser: string;
  operatingSystem: string;
  deviceType: "desktop" | "mobile" | "tablet" | "unknown";
  ipAddress: string | null;
  createdAt: string;
  updatedAt: string;
  expiresAt: string;
};

export type AccountSecurityOverview = {
  account: {
    name: string;
    email: string;
    emailVerified: boolean;
    twoFactorEnabled: boolean;
    createdAt: string;
    signInMethods: AccountSignInMethod[];
  };
  sessions: AccountSecuritySession[];
};
