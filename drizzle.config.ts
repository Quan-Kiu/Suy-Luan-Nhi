import { existsSync, readFileSync } from "node:fs";
import { parse } from "dotenv";
import { defineConfig } from "drizzle-kit";

const nodeEnv = process.env.NODE_ENV ?? "development";
const envFiles = [
  `.env.${nodeEnv}.local`,
  ...(nodeEnv === "test" ? [] : [".env.local"]),
  `.env.${nodeEnv}`,
  ".env",
];

function readDatabaseUrl(path: string) {
  if (!existsSync(path)) return undefined;
  return parse(readFileSync(path)).DATABASE_URL;
}

// Drizzle Kit loads `.env` before evaluating this file. Resolve the database URL
// explicitly so the CLI follows the same local-file priority as the Next.js app.
const databaseUrl =
  process.env.DRIZZLE_DATABASE_URL ??
  envFiles.map(readDatabaseUrl).find(Boolean) ??
  process.env.DATABASE_URL ??
  "postgresql://sln@127.0.0.1:54329/sln";

export default defineConfig({
  dialect: "postgresql",
  schema: "./src/db/schema/index.ts",
  out: "./drizzle",
  dbCredentials: { url: databaseUrl },
  strict: true,
  verbose: true,
});
