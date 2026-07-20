import { z } from "zod";

const booleanString = z.enum(["true", "false"]).transform((value) => value === "true");
const emptyToUndefined = (value: unknown) => (value === "" ? undefined : value);
const optionalString = z.preprocess(emptyToUndefined, z.string().min(1).optional());
const optionalUrl = z.preprocess(emptyToUndefined, z.string().url().optional());
const optionalSecret = z.preprocess(emptyToUndefined, z.string().min(24).optional());
const csvOrigins = z.preprocess(
  emptyToUndefined,
  z
    .string()
    .transform((value) =>
      value
        .split(",")
        .map((entry) => entry.trim())
        .filter(Boolean),
    )
    .optional(),
);
const developmentDefaults = {
  DATABASE_URL: "postgresql://sln@127.0.0.1:54329/sln",
  BETTER_AUTH_URL: "http://localhost:3000",
  BETTER_AUTH_SECRET: "development-placeholder-change-before-production",
  SMTP_HOST: "127.0.0.1",
};

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  DATABASE_URL: z.string().startsWith("postgresql://").default(developmentDefaults.DATABASE_URL),
  DATABASE_SSL_MODE: z.enum(["auto", "disable", "require"]).default("auto"),
  DATABASE_SSL_REJECT_UNAUTHORIZED: booleanString.default(false),
  BETTER_AUTH_URL: z.string().url().default(developmentDefaults.BETTER_AUTH_URL),
  BETTER_AUTH_SECRET: z.string().min(32).default(developmentDefaults.BETTER_AUTH_SECRET),
  BETTER_AUTH_TRUSTED_ORIGINS: csvOrigins,
  AUTH_REQUIRE_EMAIL_VERIFICATION: booleanString.default(false),
  AUTH_RATE_LIMIT_ENABLED: booleanString.default(true),
  SMTP_HOST: z.string().min(1).default(developmentDefaults.SMTP_HOST),
  SMTP_PORT: z.coerce.number().int().positive().default(1025),
  SMTP_SECURE: booleanString.default(false),
  SMTP_USER: optionalString,
  SMTP_PASSWORD: optionalString,
  SMTP_FROM: z.string().min(3).default("Suy Luận Nhí <no-reply@suyluannhi.local>"),
  STORAGE_DRIVER: z.enum(["local", "s3", "cloudinary"]).default("local"),
  LOCAL_UPLOAD_DIR: z.string().default("public/uploads"),
  PUBLIC_UPLOAD_BASE_URL: z
    .string()
    .regex(/^\/uploads(?:\/[A-Za-z0-9._-]+)*$/)
    .default("/uploads"),
  S3_REGION: optionalString,
  S3_BUCKET: optionalString,
  S3_ENDPOINT: optionalUrl,
  S3_ACCESS_KEY_ID: optionalString,
  S3_SECRET_ACCESS_KEY: optionalString,
  S3_PUBLIC_BASE_URL: optionalUrl,
  CLOUDINARY_CLOUD_NAME: optionalString,
  CLOUDINARY_API_KEY: optionalString,
  CLOUDINARY_API_SECRET: optionalString,
  CLOUDINARY_FOLDER: z.string().min(1).default("sln-gpt"),
  CLOUDINARY_UPLOAD_PRESET: optionalString,
  PARENT_GATE_TTL_MINUTES: z.coerce.number().int().min(5).max(120).default(30),
  PARENT_GATE_MAX_ATTEMPTS: z.coerce.number().int().min(3).max(20).default(5),
  PARENT_GATE_LOCK_MINUTES: z.coerce.number().int().min(1).max(60).default(5),
  CRON_SECRET: optionalSecret,
});
const parsed = envSchema.safeParse(process.env);
if (!parsed.success) {
  const details = parsed.error.issues.map((issue) => `${issue.path.join(".")}: ${issue.message}`).join("\n");
  throw new Error(`Invalid environment configuration:\n${details}`);
}

const isProductionBuild = process.env.NEXT_PHASE === "phase-production-build";
const isProductionRuntime = parsed.data.NODE_ENV === "production" && !isProductionBuild;

if (isProductionRuntime && parsed.data.BETTER_AUTH_SECRET === developmentDefaults.BETTER_AUTH_SECRET) {
  throw new Error("BETTER_AUTH_SECRET must be replaced in production");
}
if (isProductionRuntime && !parsed.data.AUTH_REQUIRE_EMAIL_VERIFICATION) {
  throw new Error("AUTH_REQUIRE_EMAIL_VERIFICATION must be true in production");
}
if (parsed.data.STORAGE_DRIVER === "s3") {
  for (const key of [
    "S3_REGION",
    "S3_BUCKET",
    "S3_ACCESS_KEY_ID",
    "S3_SECRET_ACCESS_KEY",
    "S3_PUBLIC_BASE_URL",
  ] as const) {
    if (!parsed.data[key]) throw new Error(`${key} is required when STORAGE_DRIVER=s3`);
  }
}
if (parsed.data.STORAGE_DRIVER === "cloudinary") {
  for (const key of ["CLOUDINARY_CLOUD_NAME", "CLOUDINARY_API_KEY", "CLOUDINARY_API_SECRET"] as const) {
    if (!parsed.data[key]) throw new Error(`${key} is required when STORAGE_DRIVER=cloudinary`);
  }
}

export const env = parsed.data;
