import { expect, test } from "@playwright/test";
import { Pool } from "pg";

const mailpitUrl = "http://127.0.0.1:8025";

const databaseUrl = process.env.E2E_DATABASE_URL ?? "postgresql://sln@127.0.0.1:54329/sln_e2e";
const pool = new Pool({ connectionString: databaseUrl });
let createdUserId: string | null = null;

test.afterEach(async () => {
  if (!createdUserId) return;
  await pool.query('DELETE FROM "user" WHERE "id" = $1', [createdUserId]);
  createdUserId = null;
});

test.afterAll(async () => {
  await pool.end();
});

async function readLatestPinResetUrl(page: import("@playwright/test").Page, email: string) {
  let messageId = "";
  await expect
    .poll(
      async () => {
        const response = await page.request.get(`${mailpitUrl}/api/v1/messages`);
        const body = (await response.json()) as {
          messages: Array<{ ID: string; Subject: string; To: Array<{ Address: string }> }>;
        };
        const message = body.messages.find(
          (item) =>
            item.Subject === "Đặt lại mã PIN phụ huynh" &&
            item.To.some((recipient) => recipient.Address === email),
        );
        messageId = message?.ID ?? "";
        return messageId;
      },
      { timeout: 10_000 },
    )
    .not.toBe("");

  const detailResponse = await page.request.get(`${mailpitUrl}/api/v1/message/${messageId}`);
  expect(detailResponse.ok()).toBe(true);
  const detail = (await detailResponse.json()) as { Text: string };
  const match = detail.Text.match(/https?:\/\/[^\s]+\/auth\/reset-pin\?token=[^\s]+/);
  expect(match?.[0]).toBeTruthy();
  return match![0];
}

test("parent can reset a forgotten PIN from a one-time email link", async ({ page }) => {
  const email = `forgot-pin-${Date.now()}@example.com`;
  const password = "LocalReset-2026!";
  const oldPin = "246824";
  const newPin = "135790";

  const signUp = await page.request.post("/api/auth/sign-up/email", {
    data: { name: "Phụ huynh quên PIN", email, password },
  });
  expect(signUp.ok()).toBe(true);

  const userResult = await pool.query<{ id: string }>(
    'UPDATE "user" SET "email_verified" = true WHERE "email" = $1 RETURNING "id"',
    [email],
  );
  createdUserId = userResult.rows[0]?.id ?? null;
  expect(createdUserId).toBeTruthy();

  await page.goto("/auth/sign-in?callbackUrl=%2Fprofiles");
  await page.getByLabel("Email").fill(email);
  await page.getByRole("textbox", { name: "Mật khẩu", exact: true }).fill(password);
  await page.getByRole("button", { name: "Đăng nhập", exact: true }).click();
  await expect(page).toHaveURL(/\/auth\/setup-pin/);

  const setup = await page.request.post("/api/parent/pin", { data: { pin: oldPin } });
  expect(setup.ok(), await setup.text()).toBe(true);
  await page.context().clearCookies({ name: "sln_parent_gate" });

  await page.goto("/parent");
  await page.getByRole("link", { name: "Quên mã PIN?" }).click();
  await expect(page).toHaveURL(/\/auth\/forgot-pin$/);
  await expect(page.getByText(/Hệ thống sẽ gửi liên kết bảo mật tới fo•••/)).toBeVisible();
  await page.getByRole("button", { name: "Gửi liên kết tạo PIN mới" }).click();
  await expect(page.getByText("Hãy kiểm tra hộp thư")).toBeVisible();

  const resetUrl = await readLatestPinResetUrl(page, email);
  await page.goto(resetUrl);
  await page.getByRole("textbox", { name: "Tạo mã PIN mới gồm 6 chữ số", exact: true }).fill(newPin);
  await page.getByRole("textbox", { name: "Nhập lại mã PIN mới", exact: true }).fill(newPin);
  await page.getByRole("button", { name: "Lưu mã PIN mới" }).click();

  await expect(page).toHaveURL(/\/parent$/);
  const pinInput = page.getByRole("textbox", { name: "Mã PIN phụ huynh", exact: true });
  await pinInput.fill(oldPin);
  await page.getByRole("button", { name: "Mở khu vực phụ huynh" }).click();
  await expect(page.getByText("Mã PIN chưa đúng, ba/mẹ thử lại nhé.")).toBeVisible();

  await pinInput.fill(newPin);
  await page.getByRole("button", { name: "Mở khu vực phụ huynh" }).click();
  await expect(page).toHaveURL(/\/onboarding$/);
});
