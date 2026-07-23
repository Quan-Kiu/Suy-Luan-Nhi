import { createHmac } from "node:crypto";
import { expect, test } from "@playwright/test";
import { Pool } from "pg";
import { signIn } from "./helpers";

const databaseUrl = process.env.E2E_DATABASE_URL ?? "postgresql://sln@127.0.0.1:54329/sln_e2e";
const pool = new Pool({ connectionString: databaseUrl });
const base32Alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";

type CredentialSnapshot = {
  id: string;
  accountId: string;
  password: string | null;
  userId: string;
};

function decodeBase32(value: string) {
  const bits = [...value.replace(/=+$/g, "").toUpperCase()]
    .map((character) => base32Alphabet.indexOf(character).toString(2).padStart(5, "0"))
    .join("");
  const bytes: number[] = [];
  for (let index = 0; index + 8 <= bits.length; index += 8) {
    bytes.push(Number.parseInt(bits.slice(index, index + 8), 2));
  }
  return Buffer.from(bytes);
}

function currentTotp(secret: string, now = Date.now()) {
  const counter = Buffer.alloc(8);
  counter.writeBigUInt64BE(BigInt(Math.floor(now / 30_000)));
  const digest = createHmac("sha1", decodeBase32(secret)).update(counter).digest();
  const offset = (digest.at(-1) ?? 0) & 0x0f;
  const binary =
    (((digest[offset] ?? 0) & 0x7f) << 24) |
    ((digest[offset + 1] ?? 0) << 16) |
    ((digest[offset + 2] ?? 0) << 8) |
    (digest[offset + 3] ?? 0);
  return (binary % 1_000_000).toString().padStart(6, "0");
}

let credential: CredentialSnapshot | null = null;

test.afterEach(async () => {
  if (!credential) return;
  await pool.query('DELETE FROM "two_factor" WHERE "user_id" = $1', [credential.userId]);
  await pool.query('DELETE FROM "session" WHERE "user_id" = $1', [credential.userId]);
  await pool.query('UPDATE "user" SET "two_factor_enabled" = false WHERE "id" = $1', [credential.userId]);
  await pool.query(
    'UPDATE "account" SET "provider_id" = $1, "account_id" = $2, "password" = $3 WHERE "id" = $4',
    ["credential", credential.accountId, credential.password, credential.id],
  );
  credential = null;
});

test.afterAll(async () => {
  await pool.end();
});

test("Google-only admin completes TOTP setup and cannot bypass the per-session challenge", async ({
  page,
}) => {
  await signIn(page, "admin@demo.local", "/admin");
  await expect(page).toHaveURL(/\/auth\/mfa\/setup$/);

  const result = await pool.query<CredentialSnapshot>(
    `SELECT a."id", a."account_id" AS "accountId", a."password", a."user_id" AS "userId"
     FROM "account" a
     JOIN "user" u ON u."id" = a."user_id"
     WHERE u."email" = $1 AND a."provider_id" = 'credential'
     LIMIT 1`,
    ["admin@demo.local"],
  );
  credential = result.rows[0] ?? null;
  expect(credential).not.toBeNull();

  await pool.query(
    'UPDATE "account" SET "provider_id" = $1, "account_id" = $2, "password" = NULL WHERE "id" = $3',
    ["google", "google-admin-e2e", credential!.id],
  );

  await page.reload();
  await expect(page.getByLabel("Mật khẩu hiện tại")).toHaveCount(0);
  await expect(page.getByText(/đăng nhập bằng Google và không có mật khẩu riêng/)).toBeVisible();
  await page.getByRole("button", { name: "Bắt đầu thiết lập" }).click();
  await expect(page.getByRole("heading", { name: "Quét mã bằng Authenticator" })).toBeVisible();

  const secret = (await page.locator("code").first().textContent())?.trim();
  expect(secret).toBeTruthy();
  await page.getByLabel("Nhập mã 6 chữ số để hoàn tất").fill(currentTotp(secret!));
  await page.getByRole("button", { name: "Xác minh và tiếp tục" }).click();
  await expect(page).toHaveURL(/\/admin$/);

  const markedAfterSetup = await pool.query<{ mfaVerifiedAt: Date | null }>(
    'SELECT "mfa_verified_at" AS "mfaVerifiedAt" FROM "session" WHERE "user_id" = $1 ORDER BY "created_at" DESC LIMIT 1',
    [credential!.userId],
  );
  expect(markedAfterSetup.rows[0]?.mfaVerifiedAt).not.toBeNull();

  await pool.query('UPDATE "session" SET "mfa_verified_at" = NULL WHERE "user_id" = $1', [
    credential!.userId,
  ]);
  await page.goto("/admin");
  await expect(page).toHaveURL(/\/auth\/two-factor$/);

  await page.getByLabel("Mã xác thực").fill(currentTotp(secret!));
  await page.getByRole("button", { name: "Xác minh", exact: true }).click();
  await expect(page).toHaveURL(/\/admin$/);

  const markedAfterChallenge = await pool.query<{ mfaVerifiedAt: Date | null }>(
    'SELECT "mfa_verified_at" AS "mfaVerifiedAt" FROM "session" WHERE "user_id" = $1 ORDER BY "created_at" DESC LIMIT 1',
    [credential!.userId],
  );
  expect(markedAfterChallenge.rows[0]?.mfaVerifiedAt).not.toBeNull();
});
