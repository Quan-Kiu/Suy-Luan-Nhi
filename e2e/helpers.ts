import { expect, type APIResponse, type Page } from "@playwright/test";

export const demoPassword = "LocalDemo-2026!";
export const demoParentPin = "246824";

export async function signIn(page: Page, email: string, callbackUrl = "/profiles") {
  await page.goto(`/auth/sign-in?callbackUrl=${encodeURIComponent(callbackUrl)}`);
  await page.getByLabel("Email").fill(email);
  await page.locator('input[name="password"]').fill(demoPassword);
  await page.getByRole("button", { name: "Đăng nhập", exact: true }).click();
  const expectedPathname = new URL(callbackUrl, "http://127.0.0.1:3100").pathname;
  await page.waitForURL((url) =>
    [expectedPathname, "/auth/mfa/setup", "/auth/two-factor"].includes(url.pathname),
  );
  await page.waitForLoadState("domcontentloaded");
}

export async function apiData<T>(response: APIResponse): Promise<T> {
  const body = (await response.json()) as {
    success: boolean;
    data?: T;
    error?: { code: string; message: string };
    meta?: { requestId: string };
  };
  expect(response.ok(), body.error?.message).toBeTruthy();
  expect(body.success).toBe(true);
  expect(body.meta?.requestId).toBeTruthy();
  return body.data as T;
}
export async function getDemoChild(page: Page) {
  const children = await apiData<Array<{ id: string; displayName: string; ageGroup: string }>>(
    await page.request.get("/api/children"),
  );
  const child = children.find((item) => item.displayName === "Bống") ?? children[0];
  expect(child).toBeTruthy();
  return child;
}

export async function selectChild(page: Page, childId: string) {
  await apiData(await page.request.post(`/api/children/${childId}/select`));
}

export async function unlockParentGate(page: Page, pin = demoParentPin) {
  await page.goto("/parent");
  const dashboard = page.getByRole("heading", { name: /Tuần(?: này)? của/i });
  const input = page.getByRole("textbox", { name: "Mã PIN phụ huynh", exact: true });
  const gateVisible = await input
    .waitFor({ state: "visible", timeout: 5_000 })
    .then(() => true)
    .catch(() => false);

  if (gateVisible) {
    await input.fill(pin);
    await page.getByRole("button", { name: /Mở khu vực phụ huynh/i }).click();
  }
  await expect(dashboard).toBeVisible();
}

export async function clearAuth(page: Page) {
  await page.context().clearCookies();
  await page.goto("/");
}
