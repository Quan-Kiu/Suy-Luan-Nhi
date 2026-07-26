import { drizzleAdapter } from "@better-auth/drizzle-adapter";
import { i18n } from "@better-auth/i18n";
import { betterAuth } from "better-auth";
import { APIError, createAuthMiddleware } from "better-auth/api";
import { nextCookies } from "better-auth/next-js";
import { twoFactor } from "better-auth/plugins";
import { eq } from "drizzle-orm";
import { isActiveBan } from "@/auth/access-policy";
import { staffMfaSessionMarker } from "@/auth/staff-mfa-session-marker";
import { authTranslations, resolveAuthLocale } from "@/auth/translations";
import { googleAuthConfigured } from "@/config/auth-providers";
import { env } from "@/config/env";
import { db } from "@/db/client";
import * as schema from "@/db/schema";
import { user as userTable } from "@/db/schema";
import { sendTransactionalEmail } from "@/email/mailer";

const rateLimitEnabled =
  process.env["AUTH_RATE_LIMIT_ENABLED"] === undefined
    ? env.AUTH_RATE_LIMIT_ENABLED
    : process.env["AUTH_RATE_LIMIT_ENABLED"] !== "false";

const trustedOrigins = [
  new URL(env.BETTER_AUTH_URL).origin,
  ...(env.BETTER_AUTH_TRUSTED_ORIGINS ?? []),
  ...(env.NODE_ENV === "development" ? ["http://localhost:*", "http://127.0.0.1:*", "http://[::1]:*"] : []),
];

export const auth = betterAuth({
  appName: "Suy Luận Nhí",
  baseURL: env.BETTER_AUTH_URL,
  trustedOrigins,
  secret: env.BETTER_AUTH_SECRET,
  database: drizzleAdapter(db, {
    provider: "pg",
    schema,
    transaction: true,
  }),
  socialProviders: googleAuthConfigured
    ? {
        google: {
          clientId: env.GOOGLE_CLIENT_ID!,
          clientSecret: env.GOOGLE_CLIENT_SECRET!,
          disableImplicitSignUp: true,
          prompt: "select_account",
        },
      }
    : {},
  account: {
    encryptOAuthTokens: true,
    accountLinking: {
      enabled: true,
      disableImplicitLinking: false,
    },
  },
  databaseHooks: {
    session: {
      create: {
        before: async (session) => {
          const sessionUser = await db.query.user.findFirst({
            where: eq(userTable.id, session.userId),
          });
          if (sessionUser && isActiveBan(sessionUser)) {
            throw new APIError("FORBIDDEN", {
              message: "Tài khoản đã bị tạm ngưng. Vui lòng liên hệ quản trị viên.",
            });
          }
        },
      },
    },
  },
  emailAndPassword: {
    enabled: true,
    minPasswordLength: 10,
    requireEmailVerification: env.AUTH_REQUIRE_EMAIL_VERIFICATION,
    revokeSessionsOnPasswordReset: true,
    onPasswordReset: async ({ user }) => {
      await db
        .update(userTable)
        .set({ mustChangePassword: false, updatedAt: new Date() })
        .where(eq(userTable.id, user.id));
    },
    sendResetPassword: async ({ user, url }) => {
      await sendTransactionalEmail({
        to: user.email,
        subject: "Đặt lại mật khẩu Suy Luận Nhí",
        heading: "Đặt lại mật khẩu",
        body: "Ba/mẹ đã yêu cầu đặt lại mật khẩu. Liên kết này có thời hạn và chỉ dùng được một lần.",
        actionLabel: "Đặt lại mật khẩu",
        actionUrl: url,
      });
    },
  },
  emailVerification: {
    sendOnSignUp: env.AUTH_REQUIRE_EMAIL_VERIFICATION,
    sendOnSignIn: false,
    autoSignInAfterVerification: true,
    expiresIn: 60 * 60 * 24,
    sendVerificationEmail: async ({ user, url }) => {
      await sendTransactionalEmail({
        to: user.email,
        subject: "Xác minh tài khoản Suy Luận Nhí",
        heading: "Xác minh email của ba/mẹ",
        body: "Xác minh email để bảo vệ hồ sơ gia đình và đồng bộ tiến độ giữa các thiết bị.",
        actionLabel: "Xác minh email",
        actionUrl: url,
      });
    },
  },
  user: {
    additionalFields: {
      role: { type: "string", required: false, defaultValue: "parent", input: false },
      banned: { type: "boolean", required: false, defaultValue: false, input: false },
      banReason: { type: "string", required: false, input: false },
      banExpires: { type: "date", required: false, input: false },
      mustChangePassword: { type: "boolean", required: false, defaultValue: false, input: false },
    },
  },
  session: {
    additionalFields: {
      impersonatedBy: { type: "string", required: false, input: false },
      mfaVerifiedAt: { type: "date", required: false, input: false },
    },
    expiresIn: 60 * 60 * 24 * 30,
    updateAge: 60 * 60 * 24,
  },
  rateLimit: {
    enabled: rateLimitEnabled,
    storage: "database",
    window: 60,
    max: 100,
    customRules: {
      "/sign-in/email": { window: 60, max: 8 },
      "/sign-up/email": { window: 60 * 10, max: 5 },
      "/sign-in/social": { window: 60, max: 12 },
      "/forget-password": { window: 60 * 15, max: 5 },
      "/reset-password": { window: 60 * 15, max: 5 },
    },
  },
  plugins: [
    {
      id: "banned-user-guard",
      hooks: {
        before: [
          {
            matcher: (context) => context.path === "/sign-in/email",
            handler: createAuthMiddleware(async (context) => {
              const email =
                typeof context.body?.email === "string" ? context.body.email.trim().toLowerCase() : null;
              if (!email) return;
              const signInUser = await db.query.user.findFirst({
                where: eq(userTable.email, email),
              });
              if (signInUser && isActiveBan(signInUser)) {
                throw new APIError("FORBIDDEN", {
                  message: "Tài khoản đã bị tạm ngưng. Vui lòng liên hệ quản trị viên.",
                });
              }
            }),
          },
        ],
      },
    },
    twoFactor({
      issuer: "Suy Luận Nhí",
      allowPasswordless: true,
      accountLockout: { enabled: true, maxFailedAttempts: 8, durationSeconds: 15 * 60 },
      twoFactorCookieMaxAge: 10 * 60,
      trustDeviceMaxAge: 30 * 24 * 60 * 60,
    }),
    staffMfaSessionMarker,
    i18n({
      translations: authTranslations,
      defaultLocale: "vi",
      detection: ["callback", "header"],
      getLocale: (context) => resolveAuthLocale(context.headers?.get("x-app-locale")),
    }),
    nextCookies(),
  ],
});

export type AuthSession = typeof auth.$Infer.Session;
