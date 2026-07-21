import { expect, test } from "@playwright/test";
import { apiData, getDemoChild, selectChild, signIn } from "./helpers";

test("switching child profiles updates the persistent child layout without a reload", async ({ page }) => {
  await signIn(page, "parent@demo.local");
  const firstChild = await getDemoChild(page);
  await selectChild(page, firstChild.id);

  await page.goto("/onboarding");
  await page.getByLabel("Tên thân mật của bé").fill("Na Audit");
  await page.getByText("6–8 tuổi", { exact: true }).click();
  await page.getByRole("button", { name: /Tạo hồ sơ và bắt đầu/i }).click();
  await expect(page).toHaveURL(/\/profiles$/);

  const profileCard = page
    .getByRole("heading", { name: "Na Audit" })
    .locator("..")
    .locator("..")
    .locator("..");
  await profileCard.getByRole("button", { name: /Vào bản đồ/i }).click();

  await expect(page).toHaveURL(/\/missions$/);
  await expect(page.getByRole("heading", { name: "Na Audit" })).toBeVisible();

  await page.goto("/profiles");
  await page.getByLabel("Chỉnh sửa Na Audit").click();
  await page.getByLabel("Tên thân mật").fill("Na Đã Sửa");
  await page.getByRole("button", { name: "Lưu thay đổi" }).click();
  await expect(page).toHaveURL(/\/profiles$/);
  await page.getByRole("link", { name: "Bản đồ nhiệm vụ" }).first().click();
  await expect(page).toHaveURL(/\/missions$/);
  await expect(page.getByRole("heading", { name: "Na Đã Sửa" })).toBeVisible();
});

test("taxonomy updates invalidate the cached child mission map immediately", async ({ browser }) => {
  const contextOptions = {
    baseURL: "http://127.0.0.1:3100",
    extraHTTPHeaders: { origin: "http://127.0.0.1:3100" },
  };
  const parentContext = await browser.newContext(contextOptions);
  const adminContext = await browser.newContext(contextOptions);
  const parentPage = await parentContext.newPage();
  const adminPage = await adminContext.newPage();

  try {
    await signIn(parentPage, "parent@demo.local");
    const child = await getDemoChild(parentPage);
    await selectChild(parentPage, child.id);
    const firstMap = await apiData<{ worlds: Array<{ id: string; title: string }> }>(
      await parentPage.request.get(`/api/children/${child.id}/mission-map`),
    );
    const world = firstMap.worlds[0];
    expect(world).toBeTruthy();

    await signIn(adminPage, "admin@demo.local", "/admin/worlds");
    const changedTitle = `${world.title} Audit`;
    await apiData(
      await adminPage.request.patch(`/api/admin/worlds/${world.id}`, { data: { title: changedTitle } }),
    );

    const refreshedMap = await apiData<{ worlds: Array<{ id: string; title: string }> }>(
      await parentPage.request.get(`/api/children/${child.id}/mission-map`),
    );
    expect(refreshedMap.worlds.find((item) => item.id === world.id)?.title).toBe(changedTitle);

    await apiData(
      await adminPage.request.patch(`/api/admin/worlds/${world.id}`, { data: { title: world.title } }),
    );
  } finally {
    await parentContext.close();
    await adminContext.close();
  }
});

test("archiving a published mission removes it from the cached child map immediately", async ({
  browser,
}) => {
  const contextOptions = {
    baseURL: "http://127.0.0.1:3100",
    extraHTTPHeaders: { origin: "http://127.0.0.1:3100" },
  };
  const parentContext = await browser.newContext(contextOptions);
  const adminContext = await browser.newContext(contextOptions);
  const parentPage = await parentContext.newPage();
  const adminPage = await adminContext.newPage();

  try {
    await signIn(parentPage, "parent@demo.local");
    const child = await getDemoChild(parentPage);
    const firstMap = await apiData<{
      worlds: Array<{ missions: Array<{ id: string; title: string }> }>;
    }>(await parentPage.request.get(`/api/children/${child.id}/mission-map`));
    const mission = firstMap.worlds.flatMap((world) => world.missions)[0];
    expect(mission).toBeTruthy();

    await signIn(adminPage, "admin@demo.local", "/admin/missions");
    await apiData(await adminPage.request.post(`/api/admin/missions/${mission.id}/archive`));

    const refreshedMap = await apiData<{
      worlds: Array<{ missions: Array<{ id: string }> }>;
    }>(await parentPage.request.get(`/api/children/${child.id}/mission-map`));
    expect(
      refreshedMap.worlds.flatMap((world) => world.missions).some((item) => item.id === mission.id),
    ).toBe(false);
  } finally {
    await parentContext.close();
    await adminContext.close();
  }
});
