import { Client } from "pg";

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) throw new Error("DATABASE_URL is required");
const databaseName = new URL(databaseUrl).pathname.slice(1);
const explicitlyAllowed = process.env.ALLOW_DB_RESET === "true";
if (!explicitlyAllowed && !/(_e2e|_test)$/.test(databaseName)) {
  throw new Error(
    `Refusing to reset database “${databaseName}”. Use a *_test/*_e2e database or set ALLOW_DB_RESET=true.`,
  );
}
const client = new Client({ connectionString: databaseUrl });
await client.connect();
await client.query(
  "drop schema if exists public cascade; drop schema if exists drizzle cascade; create schema public",
);
await client.end();
console.log(`Reset database schema: ${databaseName}`);
