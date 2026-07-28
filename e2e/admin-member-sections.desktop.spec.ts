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

test("member management uses tabs and identifies Google accounts", async ({ page }) => {
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

  await page.goto("/admin/access-control?tab=members");

  const staffTab = page.getByRole("tab", { name: /Ban quản trị/ });
  const parentTab = page.getByRole("tab", { name: /Phụ huynh/ });
  await expect(staffTab).toHaveAttribute("aria-selected", "true");
  await expect(parentTab).toHaveAttribute("aria-selected", "false");

  const staffPanel = page.getByRole("tabpanel", { name: /Ban quản trị/ });
  const reviewerRow = staffPanel.locator("tr", { hasText: "reviewer@demo.local" });
  await expect(reviewerRow).toBeVisible();
  await expect(reviewerRow.getByText("Google", { exact: true })).toBeVisible();
  await expect(reviewerRow.getByText("Email & mật khẩu", { exact: true })).toHaveCount(0);
  await reviewerRow.getByText("Thao tác tài khoản", { exact: true }).click();
  await expect(reviewerRow.getByRole("button", { name: "Đặt lại mật khẩu" })).toBeDisabled();
  await expect(reviewerRow.getByText(/Google-only quản lý mật khẩu/)).toBeVisible();
  await expect(reviewerRow.getByRole("button", { name: "Đặt lại mã PIN" })).toBeDisabled();
  await expect(page.getByRole("tabpanel", { name: /Phụ huynh/ })).toHaveCount(0);

  await parentTab.click();
  await expect(parentTab).toHaveAttribute("aria-selected", "true");
  await expect(page.getByRole("tabpanel", { name: /Ban quản trị/ })).toHaveCount(0);

  const parentPanel = page.getByRole("tabpanel", { name: /Phụ huynh/ });
  const parentRow = parentPanel.locator("tr", { hasText: "parent@demo.local" });
  await expect(parentRow).toBeVisible();
  await expect(parentRow.getByText("Email & mật khẩu", { exact: true })).toBeVisible();
  await expect(parentRow.getByText("Google", { exact: true })).toHaveCount(0);
  await parentRow.getByText("Thao tác tài khoản", { exact: true }).click();
  await parentRow.getByRole("button", { name: "Đặt lại mật khẩu" }).click();
  await expect(page.getByRole("dialog", { name: /Đặt lại mật khẩu/ })).toBeVisible();
  await expect(page.getByText("Gửi liên kết qua email", { exact: true })).toBeVisible();
  await page.getByRole("button", { name: "Đóng hộp thoại" }).click();

  await page.screenshot({
    path: ".verification/browser/admin-member-tabs.png",
    fullPage: true,
  });
});
