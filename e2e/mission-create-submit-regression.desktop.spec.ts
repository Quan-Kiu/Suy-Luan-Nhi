import { expect, test } from "@playwright/test";
import { apiData, signIn } from "./helpers";

test("content admin can create and immediately submit a mission", async ({ page }) => {
  await signIn(page, "admin@demo.local", "/admin/missions");

  const missionPage = await apiData<{ items: Array<{ id: string }> }>(
    await page.request.get("/api/admin/missions?pageSize=5"),
  );
  const sourceId = missionPage.items[0]?.id;
  expect(sourceId).toBeTruthy();

  const source = await apiData<{ draft: Record<string, unknown> }>(
    await page.request.get(`/api/admin/missions/${sourceId}`),
  );
  const suffix = Date.now().toString(36);
  const draft = {
    ...source.draft,
    slug: `create-submit-${suffix}`,
    title: `Create submit ${suffix}`,
  };

  const created = await apiData<{ id: string }>(
    await page.request.post("/api/admin/missions", { data: draft }),
  );
  expect(created.id).toBeTruthy();

  await apiData(await page.request.post(`/api/admin/missions/${created.id}/submit`));
  const detail = await apiData<{ mission: { status: string } }>(
    await page.request.get(`/api/admin/missions/${created.id}`),
  );
  expect(detail.mission.status).toBe("in_review");

  await apiData(await page.request.post(`/api/admin/missions/${created.id}/archive`));
});
