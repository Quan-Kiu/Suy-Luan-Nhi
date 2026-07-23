import "dotenv/config";
import { and, eq, isNull } from "drizzle-orm";
import { auth } from "@/auth/auth";
import { db, pool } from "@/db/client";
import {
  ageGroups,
  badges,
  childProfiles,
  contentEntries,
  conversationSuggestions,
  hints,
  missionAgeGroups,
  missionSecondarySkills,
  missionVersions,
  missionWorlds,
  mediaAssets,
  missions,
  parentProfiles,
  parentResources,
  questionSkills,
  questions,
  safetyChecklistEntries,
  skills,
  user,
  worldAgeGroups,
  worldSkills,
} from "@/db/schema";
import { defaultContentEntries } from "@/content/defaults";
import { badgeSeeds, missionSeeds, skillSeeds, worldSeeds } from "@/content/catalog/game-content";
import { conversationSuggestionSeeds, parentResourceSeeds } from "@/content/catalog/parent-content";
import { ageGroupSeeds, safetyChecklistDefinitions } from "@/content/catalog/taxonomy-content";
import { hashPin } from "@/modules/family/pin";
import {
  CHILD_AVATAR_CATEGORY,
  DEFAULT_CHILD_AVATARS,
  DEFAULT_CHILD_AVATAR_ASSET_ID,
  DEFAULT_CHILD_AVATAR_URL,
} from "@/domain/child-avatar";

const seedPassword = process.env.SEED_PASSWORD ?? "LocalDemo-2026!";
const seedParentPin = process.env.SEED_PARENT_PIN ?? "246824";
const accountSeeds = [
  { email: "parent@demo.local", name: "Phụ huynh Demo", role: "parent" },
  { email: "privacy@demo.local", name: "Phụ huynh Privacy Test", role: "parent" },
  { email: "content@demo.local", name: "Biên tập viên Demo", role: "content_admin" },
  { email: "reviewer@demo.local", name: "Reviewer Demo", role: "reviewer" },
  { email: "admin@demo.local", name: "Super Admin Demo", role: "super_admin" },
] as const;

async function seedDefaultChildAvatar() {
  for (const avatar of DEFAULT_CHILD_AVATARS) {
    await db
      .insert(mediaAssets)
      .values({
        id: avatar.id,
        type: "image",
        storageProvider: "local",
        storageKey: avatar.storageKey,
        category: CHILD_AVATAR_CATEGORY,
        url: avatar.url,
        altText: avatar.altText,
        fileName: avatar.fileName,
        mimeType: "image/png",
        size: 0,
        safetyStatus: "approved",
      })
      .onConflictDoNothing();
  }

  const avatar = await db.query.mediaAssets.findFirst({
    where: eq(mediaAssets.id, DEFAULT_CHILD_AVATAR_ASSET_ID),
  });
  if (!avatar) throw new Error("Missing default child avatar");
  await db
    .update(childProfiles)
    .set({ avatarAssetId: avatar.id })
    .where(and(eq(childProfiles.avatarUrl, DEFAULT_CHILD_AVATAR_URL), isNull(childProfiles.avatarAssetId)));
  return avatar.id;
}

async function seedAccounts(defaultAvatarAssetId: string) {
  for (const accountSeed of accountSeeds) {
    let existing = await db.query.user.findFirst({ where: eq(user.email, accountSeed.email) });
    if (!existing) {
      await auth.api.signUpEmail({
        body: { email: accountSeed.email, name: accountSeed.name, password: seedPassword },
      });
      existing = await db.query.user.findFirst({ where: eq(user.email, accountSeed.email) });
    }
    if (!existing) throw new Error(`Could not seed ${accountSeed.email}`);
    await db
      .update(user)
      .set({ role: accountSeed.role, emailVerified: true, updatedAt: new Date() })
      .where(eq(user.id, existing.id));
    if (accountSeed.role !== "parent")
      await db.delete(parentProfiles).where(eq(parentProfiles.userId, existing.id));
  }

  const parentUser = await db.query.user.findFirst({ where: eq(user.email, "parent@demo.local") });
  if (!parentUser) throw new Error("Missing parent demo account");
  let parentProfile = await db.query.parentProfiles.findFirst({
    where: eq(parentProfiles.userId, parentUser.id),
  });
  if (!parentProfile) {
    [parentProfile] = await db
      .insert(parentProfiles)
      .values({ userId: parentUser.id, displayName: parentUser.name })
      .returning();
  }
  if (!parentProfile.pinHash) {
    const [updatedParent] = await db
      .update(parentProfiles)
      .set({ pinHash: await hashPin(seedParentPin), updatedAt: new Date() })
      .where(eq(parentProfiles.id, parentProfile.id))
      .returning();
    parentProfile = updatedParent;
  }
  const existingChild = await db.query.childProfiles.findFirst({
    where: and(eq(childProfiles.parentProfileId, parentProfile.id), eq(childProfiles.displayName, "Bống")),
  });
  if (!existingChild) {
    await db.insert(childProfiles).values({
      parentProfileId: parentProfile.id,
      displayName: "Bống",
      ageGroup: "6-8",
      avatarAssetId: defaultAvatarAssetId,
      avatarUrl: DEFAULT_CHILD_AVATAR_URL,
      mascotId: "bong",
    });
  }
}

async function seedTaxonomy() {
  await db
    .insert(ageGroups)
    .values([...ageGroupSeeds])
    .onConflictDoNothing();

  for (const [slug, title, description, category] of skillSeeds) {
    await db.insert(skills).values({ slug, title, description, category }).onConflictDoNothing();
  }
}

async function seedSystemContent() {
  for (const entry of defaultContentEntries) {
    await db
      .insert(contentEntries)
      .values({
        namespace: entry.namespace,
        key: entry.key,
        locale: entry.locale,
        category: entry.category,
        valueType: entry.valueType,
        value: entry.value,
        description: entry.description,
      })
      .onConflictDoNothing();
    await db
      .update(contentEntries)
      .set({
        category: entry.category,
        valueType: entry.valueType,
        value: entry.value,
        description: entry.description,
        updatedAt: new Date(),
      })
      .where(
        and(
          eq(contentEntries.namespace, entry.namespace),
          eq(contentEntries.key, entry.key),
          eq(contentEntries.locale, entry.locale),
          isNull(contentEntries.updatedBy),
        ),
      );
  }
}

async function seedBadges() {
  const skillRows = await db.select().from(skills);
  const skillBySlug = new Map(skillRows.map((skill) => [skill.slug, skill]));
  for (const badge of badgeSeeds) {
    await db
      .insert(badges)
      .values({
        slug: badge.slug,
        name: badge.name,
        description: badge.description,
        iconUrl: badge.iconUrl,
        skillId: skillBySlug.get(badge.skillSlug)?.id,
        unlockRule: badge.unlockRule,
      })
      .onConflictDoNothing();
  }
}

async function seedWorldsAndMissions() {
  const skillRows = await db.select().from(skills);
  const badgeRows = await db.select().from(badges);
  const skillBySlug = new Map(skillRows.map((skill) => [skill.slug, skill]));
  const badgeBySlug = new Map(badgeRows.map((badge) => [badge.slug, badge]));

  for (const world of worldSeeds) {
    const [createdWorld] = await db
      .insert(missionWorlds)
      .values({
        slug: world.slug,
        title: world.title,
        subtitle: world.subtitle,
        description: world.description,
        sortOrder: world.sortOrder,
        themeColor: world.themeColor,
        coverUrl: world.coverUrl,
        status: "published",
        unlockRule:
          world.sortOrder === 1
            ? { type: "always" }
            : { type: "previous_world_completed", order: world.sortOrder - 1 },
      })
      .onConflictDoNothing()
      .returning();
    const worldRow =
      createdWorld ?? (await db.query.missionWorlds.findFirst({ where: eq(missionWorlds.slug, world.slug) }));
    if (!worldRow) throw new Error(`Could not seed world ${world.slug}`);

    await db
      .insert(worldAgeGroups)
      .values(
        ["6-8", "9-10", "11-12"].map((ageGroup) => ({
          worldId: worldRow.id,
          ageGroup: ageGroup as "6-8" | "9-10" | "11-12",
        })),
      )
      .onConflictDoNothing();
    await db
      .insert(worldSkills)
      .values(world.skillSlugs.map((slug) => ({ worldId: worldRow.id, skillId: skillBySlug.get(slug)!.id })))
      .onConflictDoNothing();
  }

  const worldRows = await db.select().from(missionWorlds);
  const worldBySlug = new Map(worldRows.map((world) => [world.slug, world]));

  for (const missionSeed of missionSeeds) {
    const world = worldBySlug.get(missionSeed.worldSlug);
    const primarySkill = skillBySlug.get(missionSeed.primarySkill);
    const rewardBadge = badgeBySlug.get(missionSeed.rewardBadge);
    if (!world || !primarySkill) throw new Error(`Invalid mission seed ${missionSeed.slug}`);

    const [mission] = await db
      .insert(missions)
      .values({
        worldId: world.id,
        slug: missionSeed.slug,
        title: missionSeed.title,
        subtitle: missionSeed.subtitle,
        shortDescription: missionSeed.shortDescription,
        storyIntro: missionSeed.storyIntro,
        estimatedMinutes: missionSeed.estimatedMinutes,
        primarySkillId: primarySkill.id,
        rewardBadgeId: rewardBadge?.id,
        coverUrl: missionSeed.coverUrl,
        status: "published",
        difficulty: missionSeed.difficulty,
        unlockRule: { type: "previous_mission_completed" },
        publishedAt: new Date(),
      })
      .onConflictDoNothing()
      .returning();

    // Existing missions may already be referenced by immutable sessions and attempts.
    // Seed defaults never rewrite or delete those production records.
    if (!mission) continue;

    await db
      .insert(missionAgeGroups)
      .values(missionSeed.ageGroups.map((ageGroup) => ({ missionId: mission.id, ageGroup })))
      .onConflictDoNothing();
    await db
      .insert(missionSecondarySkills)
      .values(
        missionSeed.secondarySkills.map((slug) => ({
          missionId: mission.id,
          skillId: skillBySlug.get(slug)!.id,
        })),
      )
      .onConflictDoNothing();

    const insertedQuestions = [];
    for (const questionSeed of missionSeed.questions) {
      const [question] = await db
        .insert(questions)
        .values({
          missionId: mission.id,
          sortOrder: questionSeed.order,
          type: questionSeed.type,
          prompt: questionSeed.prompt,
          instruction: questionSeed.instruction,
          payload: questionSeed.payload,
          correctAnswer: questionSeed.correctAnswer,
          difficulty: questionSeed.difficulty,
          feedbackCorrect: questionSeed.feedbackCorrect,
          feedbackIncorrect: questionSeed.feedbackIncorrect,
        })
        .returning();
      await db
        .insert(hints)
        .values(
          questionSeed.hints.map((hint) => ({ questionId: question.id, level: hint.level, text: hint.text })),
        );
      await db.insert(questionSkills).values([{ questionId: question.id, skillId: primarySkill.id }]);
      insertedQuestions.push({ ...questionSeed, id: question.id });
    }

    await db.insert(safetyChecklistEntries).values(
      safetyChecklistDefinitions.map((item) => ({
        missionId: mission.id,
        key: item.key,
        passed: true,
        note: item.defaultNote,
      })),
    );
    const [version] = await db
      .insert(missionVersions)
      .values({
        missionId: mission.id,
        versionNumber: 1,
        status: "published",
        snapshot: {
          ...missionSeed,
          id: mission.id,
          worldId: world.id,
          questions: insertedQuestions,
          safetyChecklist: Object.fromEntries(safetyChecklistDefinitions.map((item) => [item.key, true])),
        },
        publishedAt: new Date(),
      })
      .returning();
    await db
      .update(missions)
      .set({ publishedVersionId: version.id, currentDraftVersion: 1 })
      .where(eq(missions.id, mission.id));
  }
}

async function seedParentContent() {
  const missionRows = await db.select().from(missions);
  const skillRows = await db.select().from(skills);
  const missionBySlug = new Map(missionRows.map((mission) => [mission.slug, mission]));
  const skillBySlug = new Map(skillRows.map((skill) => [skill.slug, skill]));

  const existingSuggestion = await db.query.conversationSuggestions.findFirst();
  if (!existingSuggestion) {
    await db.insert(conversationSuggestions).values(
      conversationSuggestionSeeds.map((item) => ({
        title: item.title,
        questionText: item.questionText,
        purpose: item.purpose,
        ageGroup: "ageGroup" in item ? item.ageGroup : undefined,
        relatedMissionId:
          "relatedMissionSlug" in item ? missionBySlug.get(item.relatedMissionSlug)?.id : undefined,
        skillId: skillBySlug.get(item.skillSlug)?.id,
      })),
    );
  }

  for (const item of parentResourceSeeds) {
    await db
      .insert(parentResources)
      .values({
        ...item,
        ageGroups: [...item.ageGroups],
        status: "published" as const,
        publishedAt: new Date(),
      })
      .onConflictDoNothing();
  }
}

async function main() {
  const defaultAvatarAssetId = await seedDefaultChildAvatar();
  await seedAccounts(defaultAvatarAssetId);
  await seedTaxonomy();
  await seedSystemContent();
  await seedBadges();
  await seedWorldsAndMissions();
  await seedParentContent();
  console.log(
    `Seeded ${accountSeeds.length} accounts, ${worldSeeds.length} worlds and ${missionSeeds.length} missions.`,
  );
  console.log(`Demo password: ${seedPassword}`);
  console.log(`Demo parent PIN: ${seedParentPin}`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await pool.end();
  });
