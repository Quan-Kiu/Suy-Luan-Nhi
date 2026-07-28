import { spawnSync } from "node:child_process";
import { rm } from "node:fs/promises";
import { Client } from "pg";

const databaseUrl = process.env.E2E_DATABASE_URL ?? "postgresql://sln@127.0.0.1:54329/sln_e2e";
const parsed = new URL(databaseUrl);
const databaseName = parsed.pathname.slice(1);
const databaseConnectAttempts = 40;
const databaseConnectDelayMs = 500;

if (!/(_e2e|_test)$/.test(databaseName)) {
  throw new Error(`Refusing to reset non-test database: ${databaseName}`);
}

function sleep(milliseconds: number) {
  return new Promise((resolve) => setTimeout(resolve, milliseconds));
}

async function connectWithRetry(connectionString: string) {
  let lastError: unknown;
  for (let attempt = 1; attempt <= databaseConnectAttempts; attempt += 1) {
    const client = new Client({ connectionString });
    try {
      await client.connect();
      return client;
    } catch (error) {
      lastError = error;
      await client.end().catch(() => undefined);
      if (attempt < databaseConnectAttempts) await sleep(databaseConnectDelayMs);
    }
  }
  throw lastError instanceof Error ? lastError : new Error("PostgreSQL did not become ready");
}

function run(command: string, args: string[]) {
  const result = spawnSync(command, args, {
    cwd: process.cwd(),
    env: { ...process.env, DATABASE_URL: databaseUrl, DRIZZLE_DATABASE_URL: databaseUrl },
    stdio: "inherit",
  });
  if (result.status !== 0) process.exit(result.status ?? 1);
}

async function main() {
  const adminUrl = new URL(databaseUrl);
  adminUrl.pathname = "/postgres";
  const admin = await connectWithRetry(adminUrl.toString());
  const exists = await admin.query("select 1 from pg_database where datname = $1", [databaseName]);
  if (!exists.rowCount) {
    const safeName = `"${databaseName.replaceAll('"', '""')}"`;
    await admin.query(`create database ${safeName}`);
  }
  await admin.end();

  const target = await connectWithRetry(databaseUrl);
  await target.query(
    "drop schema if exists public cascade; drop schema if exists drizzle cascade; create schema public",
  );
  await target.end();

  await rm("public/uploads/e2e", { recursive: true, force: true });
  run("npm", ["run", "db:migrate"]);
  run("npm", ["run", "db:seed"]);
  console.log(`Prepared isolated E2E database: ${databaseName}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
