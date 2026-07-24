import { expect, test, type Page } from "@playwright/test";
import { unlockParentGate } from "./helpers";

const password = "LocalDemo-2026!";

type ApiEnvelope<T> = { success: true; data: T; meta: { requestId: string } };

async function apiData<T>(response: { json(): Promise<unknown>; ok(): boolean }) {
  expect(response.ok()).toBeTruthy();
  const body = (await response.json()) as ApiEnvelope<T>;
  expect(body.success).toBe(true);
  expect(body.meta.requestId).toBeTruthy();
  return body.data;
}

async function signIn(page: Page, email: string, callbackUrl = "/profiles") {
  await page.goto(`/auth/sign-in?callbackUrl=${encodeURIComponent(callbackUrl)}`);
  await page.getByLabel("Email").fill(email);
  await page.locator('input[name="password"]').fill(password);
  await page.getByRole("button", { name: "Đăng nhập", exact: true }).click();
  await page.waitForURL((url) => !url.pathname.startsWith("/auth/sign-in"));
}

async function signOutByClearingSession(page: Page) {
  await page.context().clearCookies();
  await page.goto("/");
}

test.describe.configure({ mode: "serial" });

test("protected areas redirect unauthenticated visitors", async ({ page }) => {
  await page.goto("/parent");
  await expect(page).toHaveURL(/\/auth\/sign-in/);
  await expect(page.getByRole("heading", { name: "Đăng nhập" })).toBeVisible();
});

test("parent selects a real Child Profile, completes a DB mission and sees progress", async ({ page }) => {
  await signIn(page, "parent@demo.local");

  const childrenResponse = await page.request.get("/api/children");
  const children = await apiData<Array<{ id: string; displayName: string }>>(childrenResponse);
  const child = children.find((item) => item.displayName === "Bống") ?? children[0];
  expect(child).toBeTruthy();

  const selectResponse = await page.request.post(`/api/children/${child.id}/select`);
  expect(selectResponse.ok()).toBeTruthy();

  await page.goto("/missions");
  await expect(page.getByRole("heading", { name: child.displayName, exact: true })).toBeVisible();
  await page.getByRole("link", { name: /Thám tử dấu chân/i }).click();
  await page.getByRole("button", { name: /Bắt đầu chơi/i }).click();

  await page.getByRole("button", { name: "Ngôi sao", exact: true }).click();
  await page.getByRole("button", { name: /Xem con làm đúng chưa/i }).click();
  await expect(page.getByText("Tuyệt vời!", { exact: true })).toBeVisible();
  await page.getByRole("button", { name: /Câu tiếp theo/i }).click();

  await page.getByRole("button", { name: "Dấu chân xanh", exact: true }).click();
  await page.getByRole("button", { name: /Xem con làm đúng chưa/i }).click();
  await page.getByRole("button", { name: /Nhận huy hiệu/i }).click();
  await expect(page.getByRole("heading", { name: "Tuyệt vời!" })).toBeVisible();
  await expect(page.getByText("Thám tử tinh mắt")).toBeVisible();

  await page.getByRole("button", { name: "Mở menu chế độ bé" }).click();
  await page.getByRole("link", { name: "Bộ sưu tập huy hiệu" }).click();
  await expect(page).toHaveURL(/\/badges$/);
  await expect(page.getByRole("button", { name: "Xem huy hiệu Thám tử tinh mắt" })).toBeVisible();

  await unlockParentGate(page);
  await expect(page.getByText("Thám tử dấu chân").first()).toBeVisible();
});

test("content admin submits an immutable version and reviewer publishes it", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name === "mobile-chromium", "CMS acceptance is desktop-only");

  await signIn(page, "content@demo.local", "/admin/missions");
  const listResponse = await page.request.get(
    "/api/admin/missions?search=Th%C3%A1m%20t%E1%BB%AD%20d%E1%BA%A5u%20ch%C3%A2n",
  );
  const missionPage = await apiData<{ items: Array<{ id: string; title: string }> }>(listResponse);
  const source = missionPage.items.find((mission) => mission.title === "Thám tử dấu chân");
  expect(source).toBeTruthy();

  const duplicateResponse = await page.request.post(`/api/admin/missions/${source!.id}/duplicate`);
  const duplicate = await apiData<{ id: string; title: string }>(duplicateResponse);
  const submitResponse = await page.request.post(`/api/admin/missions/${duplicate.id}/submit`);
  expect(submitResponse.ok()).toBeTruthy();

  await signOutByClearingSession(page);
  await signIn(page, "reviewer@demo.local", "/admin/reviews");
  const reviewLink = page.getByRole("link", { name: /Thám tử dấu chân \(Bản sao\)/i });
  const reviewHref = await reviewLink.getAttribute("href");
  expect(reviewHref).toMatch(/^\/admin\/reviews\//);
  await page.goto(reviewHref!);
  await expect(page.getByLabel("Lời nhắn cho người soạn")).toHaveValue("");
  await page.getByRole("button", { name: /Gửi lại để sửa/i }).click();
  await expect(page.getByText("Hãy ghi ít nhất 4 ký tự để người soạn biết cần sửa gì")).toBeVisible();
  await page.getByRole("button", { name: /Đạt yêu cầu/i }).click();
  await expect(page.getByText("Hãy ghi ít nhất 4 ký tự để người soạn biết cần sửa gì")).toHaveCount(0);
  await expect(page.getByRole("button", { name: /Cho bé xem ngay/i })).toBeVisible();
  await page.getByRole("button", { name: /Cho bé xem ngay/i }).click();
  await expect(page.getByText("Đang hiển thị", { exact: true })).toBeVisible();

  await signOutByClearingSession(page);
  await signIn(page, "content@demo.local", `/admin/missions/${duplicate.id}/edit`);
  await expect(page.getByRole("heading", { name: "Các lần đã gửi" })).toBeVisible();
  await expect(page.getByText(/Lần gửi \d+/).first()).toBeVisible();

  const titleField = page.getByRole("textbox", { name: /^Tên nhiệm vụ/ });
  await titleField.fill(`${duplicate.title} - thay đổi chưa lưu`);
  await page.getByRole("button", { name: "Dùng lại nội dung này" }).first().click();
  await expect(page.getByRole("alertdialog")).toContainText("Các thay đổi chưa lưu sẽ mất");
  await page.getByRole("alertdialog").getByRole("button", { name: "Dùng lại nội dung này" }).click();
  await expect(page.getByText(/Đã tạo bản nháp từ lần gửi \d+/)).toBeVisible();
  await expect(titleField).toHaveValue(duplicate.title);

  const archiveResponse = await page.request.post(`/api/admin/missions/${duplicate.id}/archive`);
  expect(archiveResponse.ok()).toBeTruthy();
});
