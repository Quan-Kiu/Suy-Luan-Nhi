import { expect, test, type Page } from "@playwright/test";

const password = "LocalDemo-2026!";

async function signIn(page: Page, email: string, callbackUrl = "/profiles") {
  await page.goto(`/auth/sign-in?callbackUrl=${encodeURIComponent(callbackUrl)}`);
  await page.getByLabel("Email").fill(email);
  await page.getByLabel("Mật khẩu").fill(password);
  await page.getByRole("button", { name: "Đăng nhập", exact: true }).click();
  await page.waitForURL((url) => !url.pathname.startsWith("/auth/sign-in"));
}

test.describe.configure({ mode: "serial" });

test("login accepts the browser origin and custom APIs use one envelope", async ({ page }) => {
  await page.goto("/auth/sign-in");
  await expect(page.getByLabel("Email")).toHaveAttribute("placeholder", "ba.me@example.com");
  await expect(page.getByLabel("Mật khẩu")).toHaveAttribute("placeholder", "Nhập mật khẩu");

  await signIn(page, "parent@demo.local");
  await expect(page).toHaveURL(/\/profiles$/);

  const response = await page.request.get("/api/children");
  const body = await response.json();
  expect(response.status()).toBe(200);
  expect(body).toMatchObject({ success: true, data: expect.any(Array) });
  expect(body.meta.requestId).toBe(response.headers()["x-request-id"]);
});
test("cross-origin mutations are rejected with the shared error envelope", async ({ page }) => {
  const response = await page.request.post("/api/parent/delete-data-request", {
    headers: { origin: "https://attacker.example" },
  });
  const body = await response.json();

  expect(response.status()).toBe(403);
  expect(body).toMatchObject({
    success: false,
    error: { code: "INVALID_ORIGIN", message: "Cross-origin mutation is not allowed" },
  });
  expect(body.meta.requestId).toBeTruthy();
});

test("content admin can edit and restore plain-language interface copy", async ({ page }) => {
  await signIn(page, "content@demo.local", "/admin/content");
  await expect(page.getByRole("heading", { name: "Sửa câu chữ trong ứng dụng", exact: true })).toBeVisible();
  await expect(page.getByText("Chọn nơi cần sửa câu chữ")).toBeVisible();

  await page.goto("/admin/content?namespace=auth&search=signIn.emailPlaceholder");
  await expect(page.getByLabel("Khu vực hiển thị")).toHaveValue("auth");
  const row = page.locator("article").first();
  await expect(row).toBeVisible();
  await expect(row.getByText("Người dùng đang nhìn thấy")).toBeVisible();
  await row.locator("summary").filter({ hasText: "Chỉnh sửa câu chữ" }).click();
  await row.getByLabel("Câu chữ người dùng sẽ nhìn thấy").fill("email-e2e@example.com");
  await row.getByRole("button", { name: "Lưu nội dung" }).click();
  await expect(page.getByText("Đã lưu câu chữ mới")).toBeVisible();

  await page.context().clearCookies();
  await page.goto("/auth/sign-in");
  await expect(page.getByLabel("Email")).toHaveAttribute("placeholder", "email-e2e@example.com");

  await signIn(page, "content@demo.local", "/admin/content?namespace=auth&search=signIn.emailPlaceholder");
  const customized = page.locator("article").first();
  await customized.locator("summary").filter({ hasText: "Chỉnh sửa câu chữ" }).click();
  await customized.getByRole("button", { name: "Dùng lại câu chữ ban đầu" }).click();
  await page.getByRole("button", { name: "Dùng lại câu chữ ban đầu", exact: true }).last().click();
  await expect(page.getByText("Đã dùng lại câu chữ ban đầu")).toBeVisible();

  await page.context().clearCookies();
  await page.goto("/auth/sign-in");
  await expect(page.getByLabel("Email")).toHaveAttribute("placeholder", "ba.me@example.com");
});
