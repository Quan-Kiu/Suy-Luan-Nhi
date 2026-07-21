import { drizzleAdapter } from "@better-auth/drizzle-adapter";
import { i18n } from "@better-auth/i18n";
import { betterAuth } from "better-auth";
import { nextCookies } from "better-auth/next-js";
import { eq } from "drizzle-orm";
import { env } from "@/config/env";
import { db } from "@/db/client";
import * as schema from "@/db/schema";
import { parentProfiles } from "@/db/schema";
import { sendTransactionalEmail } from "@/email/mailer";
import { authTranslations, resolveAuthLocale } from "@/auth/translations";

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
  emailAndPassword: {
    enabled: true,
    minPasswordLength: 10,
    requireEmailVerification: env.AUTH_REQUIRE_EMAIL_VERIFICATION,
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
    },
  },
  session: {
    additionalFields: {
      impersonatedBy: { type: "string", required: false, input: false },
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
      "/forget-password": { window: 60 * 15, max: 5 },
      "/reset-password": { window: 60 * 15, max: 5 },
    },
  },
  databaseHooks: {
    user: {
      create: {
        after: async (createdUser) => {
          const role = typeof createdUser.role === "string" ? createdUser.role : "parent";
          if (role !== "parent") return;
          const existing = await db.query.parentProfiles.findFirst({
            where: eq(parentProfiles.userId, createdUser.id),
          });
          if (!existing) {
            await db.insert(parentProfiles).values({ userId: createdUser.id, displayName: createdUser.name });
          }
        },
      },
    },
  },
  plugins: [
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
