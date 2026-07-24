import { expect, test } from "@playwright/test";
import { Pool } from "pg";
import { signIn } from "./helpers";

const databaseUrl = process.env.E2E_DATABASE_URL ?? "postgresql://sln@127.0.0.1:54329/sln_e2e";
const pool = new Pool({ connectionString: databaseUrl });

type AccountSnapshot = {
  id: string;
  accountId: string;
  password: string | null;
  providerId: string;
};

let reviewerAccount: AccountSnapshot | null = null;

test.afterEach(async () => {
  if (!reviewerAccount) return;
  await pool.query(
    'UPDATE "account" SET "account_id" = $1, "password" = $2, "provider_id" = $3 WHERE "id" = $4',
    [reviewerAccount.accountId, reviewerAccount.password, reviewerAccount.providerId, reviewerAccount.id],
  );
  reviewerAccount = null;
});

test.afterAll(async () => {
  await pool.end();
});

test("member management separates staff and parents and identifies Google accounts", async ({ page }) => {
  await signIn(page, "admin@demo.local", "/admin");

  const result = await pool.query<AccountSnapshot>(
    `SELECT a."id", a."account_id" AS "accountId", a."password", a."provider_id" AS "providerId"
     FROM "account" a
     JOIN "user" u ON u."id" = a."user_id"
     WHERE u."email" = $1
     LIMIT 1`,
    ["reviewer@demo.local"],
  );
  reviewerAccount = result.rows[0] ?? null;
  expect(reviewerAccount).not.toBeNull();

  await pool.query(
    'UPDATE "account" SET "account_id" = $1, "password" = NULL, "provider_id" = $2 WHERE "id" = $3',
    ["google-reviewer-member-ui", "google", reviewerAccount!.id],
  );

  await page.goto("/admin/members");

  const staffSection = page.getByRole("region", { name: "Ban quản trị" });
  const parentSection = page.getByRole("region", { name: "Phụ huynh" });
  await expect(staffSection).toBeVisible();
  await expect(parentSection).toBeVisible();

  const reviewerRow = staffSection.locator("tr", { hasText: "reviewer@demo.local" });
  await expect(reviewerRow).toBeVisible();
  await expect(reviewerRow.getByText("Google", { exact: true })).toBeVisible();
  await expect(reviewerRow.getByText("Email & mật khẩu", { exact: true })).toHaveCount(0);

  const parentRow = parentSection.locator("tr", { hasText: "parent@demo.local" });
  await expect(parentRow).toBeVisible();
  await expect(parentRow.getByText("Email & mật khẩu", { exact: true })).toBeVisible();
  await expect(parentRow.getByText("Google", { exact: true })).toHaveCount(0);

  await page.screenshot({
    path: ".verification/browser/admin-member-sections.png",
    fullPage: true,
  });
});
