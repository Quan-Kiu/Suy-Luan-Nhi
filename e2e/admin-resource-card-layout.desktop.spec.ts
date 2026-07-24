import { expect, test } from "@playwright/test";
import { signIn } from "./helpers";

test("admin resource cards keep actions aligned at the bottom", async ({ page }) => {
  await signIn(page, "content@demo.local", "/admin/resources");

  const editLinks = page.getByRole("link", { name: "Chỉnh sửa" });
  await expect(editLinks.first()).toBeVisible();
  expect(await editLinks.count()).toBeGreaterThanOrEqual(3);

  const metrics = await editLinks.evaluateAll((links) =>
    links.slice(0, 3).map((link) => {
      const card = link.closest("article");
      const actions = link.parentElement;
      if (!card || !actions) throw new Error("Resource card structure is incomplete");

      const cardRect = card.getBoundingClientRect();
      const actionsRect = actions.getBoundingClientRect();
      return {
        actionTop: actionsRect.top,
        bottomInset: cardRect.bottom - actionsRect.bottom,
      };
    }),
  );

  const actionTops = metrics.map(({ actionTop }) => actionTop);
  const bottomInsets = metrics.map(({ bottomInset }) => bottomInset);
  expect(Math.max(...actionTops) - Math.min(...actionTops)).toBeLessThanOrEqual(1);
  expect(Math.max(...bottomInsets) - Math.min(...bottomInsets)).toBeLessThanOrEqual(1);
});
