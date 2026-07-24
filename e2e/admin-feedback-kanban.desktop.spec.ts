import { expect, test } from "@playwright/test";
import { apiData, signIn } from "./helpers";

test("staff can move a feedback card between Kanban columns", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 1000 });
  await signIn(page, "admin@demo.local", "/admin/feedback");

  const title = `Kanban test ${Date.now()}`;
  await apiData(
    await page.request.post("/api/feedback", {
      multipart: {
        content: "Kiểm tra thao tác kéo thả trạng thái góp ý trên bảng quản trị.",
        pagePath: "/missions/kanban-test",
        pageTitle: title,
        viewportWidth: "1440",
        viewportHeight: "1000",
        devicePixelRatio: "1",
        captureMode: "none",
      },
    }),
  );

  await page.goto("/admin/feedback");
  const card = page.getByRole("article", { name: `Góp ý: ${title}` });
  const sourceColumn = page.getByRole("region", { name: /Mới nhận, \d+ góp ý/ });
  const targetColumn = page.getByRole("region", { name: /Đang xử lý, \d+ góp ý/ });
  await expect(card).toBeVisible();
  await expect(sourceColumn.getByRole("article", { name: `Góp ý: ${title}` })).toBeVisible();

  const handle = card.getByRole("button", { name: `Kéo góp ý ${title}` });
  const handleBox = await handle.boundingBox();
  const targetBox = await targetColumn.boundingBox();
  expect(handleBox).not.toBeNull();
  expect(targetBox).not.toBeNull();

  await page.mouse.move(handleBox!.x + handleBox!.width / 2, handleBox!.y + handleBox!.height / 2);
  await page.mouse.down();
  await page.mouse.move(handleBox!.x + 24, handleBox!.y + handleBox!.height / 2, { steps: 4 });
  await page.mouse.move(targetBox!.x + targetBox!.width / 2, targetBox!.y + 140, { steps: 12 });
  await page.mouse.up();

  await expect(page.getByText("Đã chuyển góp ý sang trạng thái mới")).toBeVisible();
  await expect(targetColumn.getByRole("article", { name: `Góp ý: ${title}` })).toBeVisible();

  await page.screenshot({
    path: ".verification/browser/admin-feedback-kanban.png",
    fullPage: true,
  });

  await targetColumn.getByRole("button", { name: "Chi tiết" }).first().click();
  await expect(page.getByRole("dialog", { name: title })).toBeVisible();
  await expect(page.getByLabel("Trạng thái xử lý")).toHaveValue("in_progress");

  await page.screenshot({
    path: ".verification/browser/admin-feedback-details.png",
    fullPage: true,
  });
});

test("Kanban board stays contained on tablet", async ({ page }) => {
  await page.setViewportSize({ width: 820, height: 1180 });
  await signIn(page, "admin@demo.local", "/admin/feedback");

  const title = `Tablet Kanban ${Date.now()}`;
  await apiData(
    await page.request.post("/api/feedback", {
      multipart: {
        content: "Kiểm tra bảng Kanban không làm tràn toàn bộ trang trên màn hình tablet.",
        pagePath: "/missions/tablet-kanban-test",
        pageTitle: title,
        viewportWidth: "820",
        viewportHeight: "1180",
        devicePixelRatio: "1",
        captureMode: "none",
      },
    }),
  );

  await page.goto("/admin/feedback");
  await expect(page.getByRole("article", { name: `Góp ý: ${title}` })).toBeVisible();
  const boardScroll = page.getByTestId("feedback-board-scroll");
  await expect(boardScroll).toBeVisible();

  const pageMetrics = await page.evaluate(() => ({
    clientWidth: document.documentElement.clientWidth,
    scrollWidth: document.documentElement.scrollWidth,
  }));
  expect(pageMetrics.scrollWidth).toBeLessThanOrEqual(pageMetrics.clientWidth + 1);

  const boardMetrics = await boardScroll.evaluate((element) => ({
    clientWidth: element.clientWidth,
    scrollWidth: element.scrollWidth,
  }));
  expect(boardMetrics.scrollWidth).toBeGreaterThan(boardMetrics.clientWidth);

  await page.screenshot({
    path: ".verification/browser/admin-feedback-tablet.png",
    fullPage: true,
  });

  await page
    .getByRole("article", { name: `Góp ý: ${title}` })
    .getByRole("button", { name: "Chi tiết" })
    .click();
  const dialog = page.getByRole("dialog", { name: title });
  await expect(dialog).toBeVisible();
  const dialogBox = await dialog.boundingBox();
  expect(dialogBox).not.toBeNull();
  expect(dialogBox!.width).toBeLessThanOrEqual(820);

  await page.waitForTimeout(350);
  await page.screenshot({
    path: ".verification/browser/admin-feedback-tablet-details.png",
    fullPage: true,
  });
});
