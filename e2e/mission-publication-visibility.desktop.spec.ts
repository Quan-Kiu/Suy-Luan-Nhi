import { expect, test } from "@playwright/test";
import { apiData, signIn } from "./helpers";

test("published missions are visible only after their world covers every mission age group", async ({
  page,
}) => {
  await signIn(page, "admin@demo.local", "/admin/missions");

  const suffix = Date.now().toString(36);
  const world = await apiData<{ id: string; slug: string }>(
    await page.request.post("/api/admin/worlds", {
      data: {
        slug: `publication-world-${suffix}`,
        title: `Publication world ${suffix}`,
        subtitle: "Audience coverage",
        description: "World created by the publication visibility browser test.",
        sortOrder: 999,
        themeColor: "green",
        coverUrl: "/assets/cards/world-card-detective-rules.png",
        ageGroups: ["6-8"],
      },
    }),
  );
  await apiData(
    await page.request.patch(`/api/admin/worlds/${world.id}`, {
      data: { status: "published" },
    }),
  );

  const missionPage = await apiData<{ items: Array<{ id: string }> }>(
    await page.request.get("/api/admin/missions?pageSize=1"),
  );
  const sourceId = missionPage.items[0]?.id;
  expect(sourceId).toBeTruthy();
  const source = await apiData<{ draft: Record<string, unknown> }>(
    await page.request.get(`/api/admin/missions/${sourceId}`),
  );
  const createdMission = await apiData<{ id: string }>(
    await page.request.post("/api/admin/missions", {
      data: {
        ...source.draft,
        slug: `publication-mission-${suffix}`,
        title: `Publication mission ${suffix}`,
        worldId: world.id,
        ageGroups: ["6-8", "9-10"],
      },
    }),
  );
  const submitted = await apiData<{ version: { id: string } }>(
    await page.request.post(`/api/admin/missions/${createdMission.id}/submit`),
  );
  await apiData(
    await page.request.post(
      `/api/admin/missions/${createdMission.id}/versions/${submitted.version.id}/approve`,
      { data: { comment: "Browser regression approval" } },
    ),
  );

  const rejectedPublication = await page.request.post(
    `/api/admin/missions/${createdMission.id}/versions/${submitted.version.id}/publish`,
  );
  expect(rejectedPublication.status()).toBe(409);
  expect(await rejectedPublication.json()).toMatchObject({
    success: false,
    error: {
      code: "world_age_groups_incomplete",
      details: { missingAgeGroups: ["9-10"] },
    },
  });

  await apiData(
    await page.request.patch(`/api/admin/worlds/${world.id}`, {
      data: { ageGroups: ["6-8", "9-10"] },
    }),
  );
  await apiData(
    await page.request.post(
      `/api/admin/missions/${createdMission.id}/versions/${submitted.version.id}/publish`,
    ),
  );

  const rejectedAudienceRemoval = await page.request.patch(`/api/admin/worlds/${world.id}`, {
    data: { ageGroups: ["6-8"] },
  });
  expect(rejectedAudienceRemoval.status()).toBe(409);
  expect(await rejectedAudienceRemoval.json()).toMatchObject({
    success: false,
    error: {
      code: "WORLD_AUDIENCE_CONFLICT",
      details: { missingAgeGroups: ["9-10"] },
    },
  });

  const rejectedWorldArchive = await page.request.patch(`/api/admin/worlds/${world.id}`, {
    data: { status: "archived" },
  });
  expect(rejectedWorldArchive.status()).toBe(409);
  expect(await rejectedWorldArchive.json()).toMatchObject({
    success: false,
    error: {
      code: "WORLD_HAS_PUBLISHED_MISSIONS",
      details: { publishedMissionCount: 1 },
    },
  });

  const visibleMissions = await apiData<Array<{ id: string; title: string }>>(
    await page.request.get(`/api/worlds/${world.id}/missions?ageGroup=9-10`),
  );
  expect(visibleMissions).toEqual(
    expect.arrayContaining([
      expect.objectContaining({ id: createdMission.id, title: `Publication mission ${suffix}` }),
    ]),
  );

  await apiData(await page.request.post(`/api/admin/missions/${createdMission.id}/archive`));
});
