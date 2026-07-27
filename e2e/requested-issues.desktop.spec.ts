import { expect, test } from "@playwright/test";
import { apiData, getDemoChild, selectChild, signIn, unlockParentGate } from "./helpers";

test.describe("requested issue regressions", () => {
  test("editing the reported mission saves without a 500", async ({ page }) => {
    await signIn(page, "content@demo.local", "/admin/missions");
    const missionPage = await apiData<{ items: Array<{ id: string; slug: string }> }>(
      await page.request.get("/api/admin/missions?search=footprint-detective&pageSize=50"),
    );
    const mission = missionPage.items.find((item) => item.slug === "footprint-detective");
    expect(mission).toBeTruthy();
    const reportedMissionId = mission!.id;
    await page.goto(`/admin/missions/${reportedMissionId}/edit`);
    await page.getByText("Thiết lập nâng cao", { exact: true }).click();
    const randomize = page.getByLabel("Đổi vị trí đáp án mỗi lần chơi");
    await expect(randomize).toBeVisible();
    const before = await randomize.isChecked();
    await randomize.setChecked(!before);
    const responsePromise = page.waitForResponse(
      (response) =>
        response.request().method() === "PATCH" &&
        response.url().includes(`/api/admin/missions/${reportedMissionId}`),
    );
    await page.getByRole("button", { name: "Lưu và làm tiếp sau" }).first().click();
    const response = await responsePromise;
    expect(response.status()).toBe(200);
    await expect(page.getByText("Đã lưu bản nháp")).toBeVisible();
    const publishedResponse = await page.request.get(`/api/missions/${reportedMissionId}`);
    expect(publishedResponse.status()).toBe(200);
  });
  test("mission filters keep the admin shell visible and use local loading", async ({ page }) => {
    await signIn(page, "content@demo.local", "/admin/missions");
    await page.goto("/admin/missions");
    await page.route("**/api/admin/missions?**", async (route) => {
      await new Promise((resolve) => setTimeout(resolve, 700));
      await route.continue();
    });
    await page.getByPlaceholder("Tìm tên nhiệm vụ").fill("thám");
    await page.getByRole("button", { name: "Lọc", exact: true }).click();
    await expect(page.getByRole("heading", { name: "Danh sách nhiệm vụ" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Đang lọc..." })).toBeVisible();
    await expect(page.getByText("Đang tải dữ liệu quản trị...")).toHaveCount(0);
    await expect(page.getByRole("button", { name: "Lọc", exact: true })).toBeVisible();
  });

  test("archive uses the custom confirmation modal", async ({ page }) => {
    await signIn(page, "content@demo.local", "/admin/missions");
    await page.goto("/admin/missions");
    await page.getByRole("button", { name: "Lưu trữ nhiệm vụ" }).first().click();
    const dialog = page.getByRole("alertdialog");
    await expect(dialog).toBeVisible();
    await expect(dialog.getByRole("heading", { name: "Chuyển nhiệm vụ vào Kho lưu trữ?" })).toBeVisible();
    await dialog.getByRole("button", { name: "Hủy" }).click();
    await expect(dialog).toBeHidden();
  });
  test("parent gate uses PIN and locks again after leaving parent area", async ({ page }) => {
    await signIn(page, "parent@demo.local", "/profiles");
    const child = await getDemoChild(page);
    await selectChild(page, child.id);
    await unlockParentGate(page);
    await page.getByRole("link", { name: "Khu vực của bé" }).first().click();
    await page.waitForURL(/\/missions/);
    await page.waitForLoadState("domcontentloaded");
    await page.goto("/parent", { waitUntil: "domcontentloaded" });
    await expect(page.getByRole("heading", { name: "Khu vực phụ huynh" })).toBeVisible();
    await expect(page.getByRole("textbox", { name: "Mã PIN phụ huynh", exact: true })).toBeVisible();
  });

  test("resource management is available in admin", async ({ page }) => {
    await signIn(page, "content@demo.local", "/admin/resources");
    await page.goto("/admin/resources");
    await expect(page.getByRole("heading", { name: "Bài viết cho phụ huynh" })).toBeVisible();
    await expect(page.getByRole("link", { name: "Viết bài mới" })).toBeVisible();
    await expect(page.getByText(/^\d+ tài nguyên$/)).toBeVisible();
    await page.getByRole("link", { name: "Viết bài mới" }).click();
    const select = page.getByLabel("Loại tài nguyên");
    const style = await select.evaluate((element) => {
      const computed = getComputedStyle(element);
      return {
        appearance: computed.appearance,
        backgroundImage: computed.backgroundImage,
        paddingRight: Number.parseFloat(computed.paddingRight),
      };
    });
    expect(style.appearance).toBe("none");
    expect(style.backgroundImage).toContain("svg");
    expect(style.paddingRight).toBeGreaterThanOrEqual(44);
  });
});
