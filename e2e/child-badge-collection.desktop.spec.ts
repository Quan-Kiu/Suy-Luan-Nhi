import { expect, test } from "@playwright/test";
import { Client } from "pg";
import { signIn } from "./helpers";

const databaseUrl = process.env.E2E_DATABASE_URL ?? "postgresql://sln@127.0.0.1:54329/sln_e2e";

test("child can browse earned and upcoming badges", async ({ page }) => {
  await signIn(page, "parent@demo.local", "/badges");

  const database = new Client({ connectionString: databaseUrl });
  await database.connect();
  const childResult = await database.query<{ id: string; display_name: string }>(
    `select id, display_name from child_profiles where display_name = 'Bống' limit 1`,
  );
  const child = childResult.rows[0];
  expect(child).toBeTruthy();
  await page.context().addCookies([
    {
      name: "sln_active_child",
      value: child.id,
      url: "http://127.0.0.1:3100",
    },
  ]);
  await database.query(
    `insert into child_badges (child_profile_id, badge_id, source_mission_id)
     select $1, badges.id, missions.id
     from badges
     left join missions on missions.reward_badge_id = badges.id
     where badges.active = true
     order by missions.id nulls last, badges.name
     limit 1
     on conflict (child_profile_id, badge_id) do nothing`,
    [child.id],
  );
  await database.end();

  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/badges");
  await expect(page.getByRole("heading", { name: `Huy hiệu của ${child.display_name}` })).toBeVisible();
  await expect(page.getByText(/Đã nhận 1\/\d+ huy hiệu/)).toBeVisible();
  await expect(page.getByRole("button", { name: /Xem huy hiệu/ }).first()).toBeVisible();
  await expect(page.getByRole("button", { name: /Xem cách mở huy hiệu/ }).first()).toBeVisible();
  await page.screenshot({ path: ".verification/browser/child-badges-mobile.png", fullPage: true });

  await page
    .getByRole("button", { name: /Xem huy hiệu/ })
    .first()
    .click();
  const dialog = page.getByRole("dialog");
  await expect(dialog).toBeVisible();
  await expect(dialog.getByText("Đã nhận", { exact: true })).toBeVisible();
  await expect(dialog.getByText(/Nhận ngày/)).toBeVisible();
  await page.screenshot({ path: ".verification/browser/child-badge-detail-mobile.png", fullPage: true });
  await dialog.getByRole("button", { name: "Đóng chi tiết huy hiệu" }).click();

  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.reload();
  await expect(page.getByRole("heading", { name: `Huy hiệu của ${child.display_name}` })).toBeVisible();
  await page.screenshot({ path: ".verification/browser/child-badges-desktop.png", fullPage: true });
});
