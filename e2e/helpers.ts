import { expect, type APIResponse, type Page } from "@playwright/test";

export const demoPassword = "LocalDemo-2026!";

export async function signIn(page: Page, email: string, callbackUrl = "/profiles") {
  await page.goto(`/auth/sign-in?callbackUrl=${encodeURIComponent(callbackUrl)}`);
  await page.getByLabel("Email").fill(email);
  await page.getByLabel("Mật khẩu").fill(demoPassword);
  await page.getByRole("button", { name: "Đăng nhập", exact: true }).click();
  await page.waitForURL((url) => !url.pathname.startsWith("/auth/sign-in"));
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

export async function unlockParentGate(page: Page, answer?: string) {
  await page.goto("/parent");
  const dashboard = page.getByRole("heading", { name: /Tuần của/i });
  const input = page.getByLabel(/Kết quả phép tính|PIN phụ huynh/);
  const gateVisible = await input
    .waitFor({ state: "visible", timeout: 5_000 })
    .then(() => true)
    .catch(() => false);

  if (gateVisible) {
    const placeholder = await input.getAttribute("placeholder");
    let gateAnswer = answer;
    if (!gateAnswer && placeholder?.includes("PIN")) gateAnswer = "2468";
    if (!gateAnswer) {
      const prompt = await page
        .locator("p")
        .filter({ hasText: /\d+\s*[+-]\s*\d+\s*=\s*\?/ })
        .first()
        .textContent();
      const match = prompt?.match(/(\d+)\s*([+-])\s*(\d+)/);
      if (!match) throw new Error("Không đọc được phép toán Parent Gate");
      const left = Number(match[1]);
      const right = Number(match[3]);
      gateAnswer = String(match[2] === "+" ? left + right : left - right);
    }
    await input.fill(gateAnswer);
    await page.getByRole("button", { name: /Mở khu vực phụ huynh/i }).click();
  }
  await expect(dashboard).toBeVisible();
}

export async function clearAuth(page: Page) {
  await page.context().clearCookies();
  await page.goto("/");
}
