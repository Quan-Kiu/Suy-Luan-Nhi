import { createHash } from "node:crypto";
import { z } from "zod";

const booleanString = z.enum(["true", "false"]).transform((value) => value === "true");
const csv = z.string().transform((value) =>
  value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean),
);

const baseSchema = z.object({
  MCP_ACTOR_EMAIL: z.string().email().default("admin@demo.local"),
  MCP_READ_ONLY: booleanString.default(false),
  MCP_MAX_REMOTE_BYTES: z.coerce.number().int().min(1024).max(25_000_000).default(10_000_000),
  MCP_REMOTE_TIMEOUT_MS: z.coerce.number().int().min(1000).max(30_000).default(10_000),
});

const httpSchema = baseSchema.extend({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  BETTER_AUTH_SECRET: z.string().min(32),
  MCP_AUTH_MODE: z.enum(["token", "none"]).default("token"),
  MCP_API_TOKEN: z.string().min(32).optional(),
  MCP_HOST: z.string().default("127.0.0.1"),
  MCP_PORT: z.coerce.number().int().min(1).max(65_535).default(8787),
  MCP_ALLOWED_HOSTS: csv.default(["localhost", "127.0.0.1"]),
  MCP_CORS_ORIGINS: csv.default([]),
  MCP_RATE_LIMIT_PER_MINUTE: z.coerce.number().int().min(10).max(1000).default(120),
});

function parse<T>(schema: z.ZodType<T>): T {
  const result = schema.safeParse(process.env);
  if (result.success) return result.data;
  const details = result.error.issues.map((issue) => `${issue.path.join(".")}: ${issue.message}`).join("\n");
  throw new Error(`Invalid MCP configuration:\n${details}`);
}

export type McpBaseConfig = z.infer<typeof baseSchema>;
export type McpHttpConfig = Omit<z.infer<typeof httpSchema>, "MCP_API_TOKEN"> & {
  MCP_API_TOKEN: string;
};

export function getMcpBaseConfig(): McpBaseConfig {
  return parse(baseSchema);
}

export function getMcpHttpConfig(): McpHttpConfig {
  const parsed = parse(httpSchema);
  if ((parsed.MCP_HOST === "0.0.0.0" || parsed.MCP_HOST === "::") && !parsed.MCP_ALLOWED_HOSTS.length) {
    throw new Error("MCP_ALLOWED_HOSTS is required when MCP_HOST is public");
  }
  const loopbackHosts = new Set(["127.0.0.1", "localhost", "::1"]);
  if (parsed.MCP_AUTH_MODE === "none" && !loopbackHosts.has(parsed.MCP_HOST)) {
    throw new Error("MCP_AUTH_MODE=none is only allowed on a loopback host");
  }
  if (parsed.NODE_ENV === "production" && parsed.MCP_AUTH_MODE === "token" && !parsed.MCP_API_TOKEN) {
    throw new Error("MCP_API_TOKEN is required for token auth in production");
  }
  const token =
    parsed.MCP_API_TOKEN ?? createHash("sha256").update(`${parsed.BETTER_AUTH_SECRET}:sln-mcp`).digest("hex");
  return { ...parsed, MCP_API_TOKEN: token };
}
