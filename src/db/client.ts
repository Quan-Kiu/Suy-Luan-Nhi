import { drizzle } from "drizzle-orm/node-postgres";
import { Pool, type PoolConfig } from "pg";
import { env } from "@/config/env";
import * as schema from "@/db/schema";

const globalForDb = globalThis as unknown as { slnPool?: Pool };

function isLoopbackDatabase(databaseUrl: string) {
  const hostname = new URL(databaseUrl).hostname;
  return hostname === "localhost" || hostname === "127.0.0.1" || hostname === "::1";
}

function databaseSsl(): PoolConfig["ssl"] {
  if (env.DATABASE_SSL_MODE === "disable") return false;
  if (env.DATABASE_SSL_MODE === "require") {
    return { rejectUnauthorized: env.DATABASE_SSL_REJECT_UNAUTHORIZED };
  }
  if (isLoopbackDatabase(env.DATABASE_URL)) return false;
  const sslMode = new URL(env.DATABASE_URL).searchParams.get("sslmode");
  if (sslMode === "disable") return false;
  return { rejectUnauthorized: env.DATABASE_SSL_REJECT_UNAUTHORIZED };
}

export const pool =
  globalForDb.slnPool ??
  new Pool({
    connectionString: env.DATABASE_URL,
    max: env.NODE_ENV === "production" ? 20 : 5,
    idleTimeoutMillis: 30_000,
    connectionTimeoutMillis: 5_000,
    ssl: databaseSsl(),
  });

if (env.NODE_ENV !== "production") globalForDb.slnPool = pool;

export const db = drizzle(pool, { schema });
export type Database = typeof db;
