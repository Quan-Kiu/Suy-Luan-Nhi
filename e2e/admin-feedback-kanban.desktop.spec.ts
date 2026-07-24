import { expect, test } from "@playwright/test";
import { Pool } from "pg";
import { apiData, signIn } from "./helpers";

const e2eDatabaseUrl = process.env.E2E_DATABASE_URL ?? "postgresql://sln@127.0.0.1:54329/sln_e2e";

async function insertFeedbackFixtures(titles: string[]) {
  const pool = new Pool({ connectionString: e2eDatabaseUrl });
  try {
    await pool.query(
      `
        insert into system_feedback (
          content,
          page_path,
          page_title,
          context,
          status,
          created_at,
          updated_at
        )
        select
          'Kiểm tra tải thêm độc lập trong cột Kanban.',
          '/missions/infinite-column-test',
          fixture.title,
          '{"viewportWidth":1440,"viewportHeight":900,"captureMode":"none"}'::jsonb,
          'new',
          now() - ((array_length($1::text[], 1) - fixture.position) * interval '1 second'),
          now() - ((array_length($1::text[], 1) - fixture.position) * interval '1 second')
        from unnest($1::text[]) with ordinality as fixture(title, position)
      `,
      [titles],
    );
  } finally {
    await pool.end();
  }
}

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

test("each Kanban column scrolls and loads its own next page", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await signIn(page, "admin@demo.local", "/admin/feedback");

  const prefix = `Infinite column ${Date.now()}`;
  const titles = Array.from({ length: 12 }, (_, index) => `${prefix} ${index}`);
  await insertFeedbackFixtures(titles);

  await page.goto("/admin/feedback");
  const main = page.locator("#admin-main-content");
  const newColumn = page.getByRole("region", { name: /Mới nhận, \d+ góp ý/ });
  const columnScroll = page.getByTestId("feedback-column-scroll-new");
  await expect(newColumn.getByRole("article", { name: `Góp ý: ${titles[11]}` })).toBeVisible();
  await expect(newColumn.getByRole("article", { name: `Góp ý: ${titles[0]}` })).toHaveCount(0);

  const mainMetricsBefore = await main.evaluate((element) => ({
    clientHeight: element.clientHeight,
    scrollHeight: element.scrollHeight,
    scrollTop: element.scrollTop,
  }));
  expect(mainMetricsBefore.scrollHeight).toBeLessThanOrEqual(mainMetricsBefore.clientHeight + 1);
  const nextPageResponse = page.waitForResponse((response) => {
    const url = new URL(response.url());
    return (
      url.pathname === "/api/admin/feedback" &&
      url.searchParams.get("status") === "new" &&
      url.searchParams.get("page") === "2"
    );
  });

  await columnScroll.evaluate((element) => {
    element.scrollTop = element.scrollHeight;
    element.dispatchEvent(new Event("scroll", { bubbles: true }));
  });
  await nextPageResponse;

  await expect(newColumn.getByRole("article", { name: `Góp ý: ${titles[0]}` })).toBeVisible();
  const scrollMetrics = await columnScroll.evaluate((element) => ({
    clientHeight: element.clientHeight,
    scrollHeight: element.scrollHeight,
    scrollTop: element.scrollTop,
  }));
  expect(scrollMetrics.scrollHeight).toBeGreaterThan(scrollMetrics.clientHeight);
  expect(scrollMetrics.scrollTop).toBeGreaterThan(0);
  expect(await main.evaluate((element) => element.scrollTop)).toBe(mainMetricsBefore.scrollTop);

  await page.screenshot({
    path: ".verification/browser/admin-feedback-column-infinite-scroll.png",
    fullPage: true,
  });
});
