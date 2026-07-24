import { and, asc, desc, eq, inArray, isNull, lte, ne, sql } from "drizzle-orm";
import { db } from "@/db/client";
import type { AgeGroup } from "@/domain/age-groups";
import { missingWorldAgeGroups } from "@/domain/mission-publication";
import {
  auditLogs,
  badges,
  hints,
  missionAgeGroups,
  missionSecondarySkills,
  missionVersions,
  missionWorlds,
  mediaAssets,
  missions,
  questionAttempts,
  questionSkills,
  questions,
  reviewHistories,
  sessionQuestionStates,
  safetyChecklistEntries,
  skills,
  worldAgeGroups,
} from "@/db/schema";
import { adminMissionDraftSchema, safetyKeys, type AdminMissionDraft } from "@/modules/admin/schemas";
import { validateMissionTemplateVariables } from "@/modules/admin/mission-template-variables";
import { parseMissionSnapshot } from "@/modules/catalog/snapshot";
import { playableQuestionSchema } from "@/modules/gameplay/question";

export type AdminMissionFilters = {
  status?: string;
  worldId?: string;
  search?: string;
  page?: number;
  pageSize?: number;
};

export async function listAdminMissions(filters: AdminMissionFilters = {}) {
  const conditions = [];
  if (
    ["draft", "in_review", "rejected", "approved", "published", "archived"].includes(filters.status ?? "")
  ) {
    conditions.push(eq(missions.status, filters.status as typeof missions.$inferSelect.status));
  } else {
    conditions.push(ne(missions.status, "archived"));
  }
  if (filters.worldId) conditions.push(eq(missions.worldId, filters.worldId));
  if (filters.search?.trim()) {
    const search = filters.search.trim();
    conditions.push(
      sql`(${missions.title} ilike ${`%${search}%`} or ${missions.slug} ilike ${`%${search}%`})`,
    );
  }
  const where = conditions.length ? and(...conditions) : undefined;
  const pageSize = Math.min(50, Math.max(5, Math.trunc(filters.pageSize ?? 10)));
  const page = Math.max(1, Math.trunc(filters.page ?? 1));
  const [items, countRows] = await Promise.all([
    db
      .select({
        id: missions.id,
        slug: missions.slug,
        title: missions.title,
        subtitle: missions.subtitle,
        status: missions.status,
        difficulty: missions.difficulty,
        estimatedMinutes: missions.estimatedMinutes,
        coverUrl: missions.coverUrl,
        currentDraftVersion: missions.currentDraftVersion,
        publishedAt: missions.publishedAt,
        scheduledFor: missions.scheduledFor,
        archivedAt: missions.archivedAt,
        updatedAt: missions.updatedAt,
        worldId: missionWorlds.id,
        worldTitle: missionWorlds.title,
        primarySkillTitle: skills.title,
        questionCount: sql<number>`(select count(*)::int from questions q where q.mission_id = ${missions.id} and q.retired_at is null)`,
      })
      .from(missions)
      .innerJoin(missionWorlds, eq(missions.worldId, missionWorlds.id))
      .innerJoin(skills, eq(missions.primarySkillId, skills.id))
      .where(where)
      .orderBy(desc(missions.updatedAt))
      .limit(pageSize)
      .offset((page - 1) * pageSize),
    db
      .select({ count: sql<number>`count(*)::int` })
      .from(missions)
      .where(where),
  ]);
  const total = countRows[0]?.count ?? 0;
  return { items, total, page, pageSize, totalPages: Math.max(1, Math.ceil(total / pageSize)) };
}

export async function getAdminTaxonomy() {
  const [worldRows, skillRows, badgeRows] = await Promise.all([
    db.select().from(missionWorlds).orderBy(asc(missionWorlds.sortOrder)),
    db.select().from(skills).where(eq(skills.active, true)).orderBy(asc(skills.title)),
    db.select().from(badges).orderBy(asc(badges.name)),
  ]);
  return { worlds: worldRows, skills: skillRows, badges: badgeRows };
}

export async function getAdminMission(missionId: string) {
  const mission = await db.query.missions.findFirst({ where: eq(missions.id, missionId) });
  if (!mission) return null;
  const [ageRows, secondaryRows, questionRows, safetyRows, versions, history] = await Promise.all([
    db.select().from(missionAgeGroups).where(eq(missionAgeGroups.missionId, missionId)),
    db.select().from(missionSecondarySkills).where(eq(missionSecondarySkills.missionId, missionId)),
    db
      .select()
      .from(questions)
      .where(and(eq(questions.missionId, missionId), isNull(questions.retiredAt)))
      .orderBy(asc(questions.sortOrder)),
    db.select().from(safetyChecklistEntries).where(eq(safetyChecklistEntries.missionId, missionId)),
    db
      .select()
      .from(missionVersions)
      .where(eq(missionVersions.missionId, missionId))
      .orderBy(desc(missionVersions.versionNumber)),
    db
      .select()
      .from(reviewHistories)
      .where(eq(reviewHistories.missionId, missionId))
      .orderBy(desc(reviewHistories.createdAt)),
  ]);
  const questionIds = questionRows.map((question) => question.id);
  const hintRows = questionIds.length
    ? await db.select().from(hints).where(inArray(hints.questionId, questionIds)).orderBy(asc(hints.level))
    : [];
  const draft: AdminMissionDraft = {
    slug: mission.slug,
    worldId: mission.worldId,
    title: mission.title,
    subtitle: mission.subtitle,
    shortDescription: mission.shortDescription,
    storyIntro: mission.storyIntro,
    estimatedMinutes: mission.estimatedMinutes,
    primarySkillId: mission.primarySkillId,
    secondarySkillIds: secondaryRows.map((row) => row.skillId),
    rewardBadgeId: mission.rewardBadgeId,
    coverUrl: mission.coverUrl,
    ageGroups: ageRows.map((row) => row.ageGroup),
    difficulty: mission.difficulty,
    allowReplay: mission.allowReplay,
    randomizeAnswers: mission.randomizeAnswers,
    questions: questionRows.map((question) =>
      playableQuestionSchema.parse({
        id: question.id,
        order: question.sortOrder,
        type: question.type,
        prompt: question.prompt,
        instruction: question.instruction,
        payload: question.payload,
        correctAnswer: question.correctAnswer,
        difficulty: question.difficulty,
        feedbackCorrect: question.feedbackCorrect,
        feedbackIncorrect: question.feedbackIncorrect,
        hints: hintRows
          .filter((hint) => hint.questionId === question.id)
          .map((hint) => ({ level: hint.level, text: hint.text })),
      }),
    ),
    safety: Object.fromEntries(
      safetyKeys.map((key) => [key, safetyRows.find((row) => row.key === key)?.passed ?? false]),
    ) as AdminMissionDraft["safety"],
  };
  return { mission, draft, versions, history };
}

async function replaceMissionContent(
  tx: Parameters<Parameters<typeof db.transaction>[0]>[0],
  missionId: string,
  input: AdminMissionDraft,
  actorId: string,
) {
  const existingQuestions = await tx
    .select({ id: questions.id })
    .from(questions)
    .where(and(eq(questions.missionId, missionId), isNull(questions.retiredAt)));
  const existingIds = new Set(existingQuestions.map((question) => question.id));
  const retainedIds = new Set(input.questions.flatMap((question) => (question.id ? [question.id] : [])));
  const removedIds = [...existingIds].filter((id) => !retainedIds.has(id));

  if (removedIds.length) {
    const [attemptRows, stateRows] = await Promise.all([
      tx
        .select({ id: questionAttempts.questionId })
        .from(questionAttempts)
        .where(inArray(questionAttempts.questionId, removedIds)),
      tx
        .select({ id: sessionQuestionStates.questionId })
        .from(sessionQuestionStates)
        .where(inArray(sessionQuestionStates.questionId, removedIds)),
    ]);
    const referenced = new Set([...attemptRows, ...stateRows].map((row) => row.id));
    const deletable = removedIds.filter((id) => !referenced.has(id));
    const archived = removedIds.filter((id) => referenced.has(id));

    if (deletable.length) {
      await tx.delete(questionSkills).where(inArray(questionSkills.questionId, deletable));
      await tx.delete(hints).where(inArray(hints.questionId, deletable));
      await tx.delete(questions).where(inArray(questions.id, deletable));
    }
    if (archived.length) {
      await tx
        .update(questions)
        .set({ retiredAt: new Date(), updatedAt: new Date() })
        .where(inArray(questions.id, archived));
    }
  }

  await tx.delete(missionAgeGroups).where(eq(missionAgeGroups.missionId, missionId));
  await tx.insert(missionAgeGroups).values(input.ageGroups.map((ageGroup) => ({ missionId, ageGroup })));
  await tx.delete(missionSecondarySkills).where(eq(missionSecondarySkills.missionId, missionId));
  if (input.secondarySkillIds.length) {
    await tx
      .insert(missionSecondarySkills)
      .values(input.secondarySkillIds.map((skillId) => ({ missionId, skillId })));
  }

  if (retainedIds.size) {
    await tx
      .update(questions)
      .set({ sortOrder: sql`${questions.sortOrder} + 10000`, updatedAt: new Date() })
      .where(inArray(questions.id, [...retainedIds]));
  }

  for (const [index, questionInput] of input.questions.entries()) {
    const values = {
      missionId,
      sortOrder: index + 1,
      type: questionInput.type,
      prompt: questionInput.prompt,
      instruction: questionInput.instruction,
      payload: questionInput.payload,
      correctAnswer: questionInput.correctAnswer,
      difficulty: questionInput.difficulty,
      feedbackCorrect: questionInput.feedbackCorrect,
      feedbackIncorrect: questionInput.feedbackIncorrect,
      retiredAt: null,
      updatedAt: new Date(),
    };
    const questionId = questionInput.id && existingIds.has(questionInput.id) ? questionInput.id : null;
    const [question] = questionId
      ? await tx.update(questions).set(values).where(eq(questions.id, questionId)).returning()
      : await tx.insert(questions).values(values).returning();

    await tx.delete(hints).where(eq(hints.questionId, question.id));
    await tx.delete(questionSkills).where(eq(questionSkills.questionId, question.id));
    if (questionInput.hints.length) {
      await tx.insert(hints).values(
        questionInput.hints.map((hint) => ({
          questionId: question.id,
          level: hint.level,
          text: hint.text,
        })),
      );
    }
    await tx.insert(questionSkills).values({ questionId: question.id, skillId: input.primarySkillId });
  }

  await tx.delete(safetyChecklistEntries).where(eq(safetyChecklistEntries.missionId, missionId));
  await tx.insert(safetyChecklistEntries).values(
    safetyKeys.map((key) => ({
      missionId,
      key,
      passed: input.safety[key],
      updatedBy: actorId,
      updatedAt: new Date(),
    })),
  );
}

export async function createAdminMission(input: AdminMissionDraft, actorId: string) {
  return db.transaction(async (tx) => {
    const [mission] = await tx
      .insert(missions)
      .values({
        worldId: input.worldId,
        slug: input.slug,
        title: input.title,
        subtitle: input.subtitle,
        shortDescription: input.shortDescription,
        storyIntro: input.storyIntro,
        estimatedMinutes: input.estimatedMinutes,
        primarySkillId: input.primarySkillId,
        rewardBadgeId: input.rewardBadgeId,
        coverUrl: input.coverUrl,
        status: "draft",
        difficulty: input.difficulty,
        allowReplay: input.allowReplay,
        randomizeAnswers: input.randomizeAnswers,
        createdBy: actorId,
        updatedBy: actorId,
      })
      .returning();
    await replaceMissionContent(tx, mission.id, input, actorId);
    await tx
      .insert(reviewHistories)
      .values({ missionId: mission.id, action: "created", actorId, afterState: input });
    await tx.insert(auditLogs).values({
      actorId,
      action: "mission.created",
      resourceType: "mission",
      resourceId: mission.id,
      afterState: input,
    });
    return mission;
  });
}

export class MissionDraftConflictError extends Error {
  readonly currentDraftVersion: number;
  readonly currentUpdatedAt: Date;

  constructor(currentDraftVersion: number, currentUpdatedAt: Date) {
    super("Mission draft was updated by another editor");
    this.name = "MissionDraftConflictError";
    this.currentDraftVersion = currentDraftVersion;
    this.currentUpdatedAt = currentUpdatedAt;
  }
}

type UpdateMissionOptions = {
  historyComment?: string;
  auditAction?: string;
  auditMetadata?: Record<string, unknown>;
  expectedDraftVersion?: number;
  recordHistory?: boolean;
  recordAudit?: boolean;
};

export async function updateAdminMission(
  missionId: string,
  input: AdminMissionDraft,
  actorId: string,
  options: UpdateMissionOptions = {},
) {
  const current = await getAdminMission(missionId);
  if (!current) return null;
  const expectedDraftVersion = options.expectedDraftVersion;
  if (expectedDraftVersion !== undefined && !Number.isInteger(expectedDraftVersion)) {
    throw new MissionDraftConflictError(current.mission.currentDraftVersion, current.mission.updatedAt);
  }
  if (JSON.stringify(current.draft) === JSON.stringify(input)) {
    return current.mission;
  }

  return db.transaction(async (tx) => {
    const updatedAt = new Date();
    const updateCondition =
      expectedDraftVersion !== undefined
        ? and(eq(missions.id, missionId), eq(missions.currentDraftVersion, expectedDraftVersion))
        : eq(missions.id, missionId);
    const [updated] = await tx
      .update(missions)
      .set({
        worldId: input.worldId,
        slug: input.slug,
        title: input.title,
        subtitle: input.subtitle,
        shortDescription: input.shortDescription,
        storyIntro: input.storyIntro,
        estimatedMinutes: input.estimatedMinutes,
        primarySkillId: input.primarySkillId,
        rewardBadgeId: input.rewardBadgeId,
        coverUrl: input.coverUrl,
        status:
          current.mission.status === "published"
            ? "draft"
            : current.mission.status === "in_review"
              ? "draft"
              : current.mission.status,
        difficulty: input.difficulty,
        allowReplay: input.allowReplay,
        randomizeAnswers: input.randomizeAnswers,
        currentDraftVersion: sql`${missions.currentDraftVersion} + 1`,
        updatedBy: actorId,
        updatedAt,
      })
      .where(updateCondition)
      .returning();
    if (!updated) {
      const [latest] = await tx
        .select({
          currentDraftVersion: missions.currentDraftVersion,
          updatedAt: missions.updatedAt,
        })
        .from(missions)
        .where(eq(missions.id, missionId))
        .limit(1);
      throw new MissionDraftConflictError(
        latest?.currentDraftVersion ?? current.mission.currentDraftVersion,
        latest?.updatedAt ?? current.mission.updatedAt,
      );
    }

    await replaceMissionContent(tx, missionId, input, actorId);
    if (options.recordHistory !== false) {
      await tx.insert(reviewHistories).values({
        missionId,
        action: "updated",
        actorId,
        comment: options.historyComment,
        beforeState: current.draft,
        afterState: input,
      });
    }
    if (options.recordAudit !== false) {
      await tx.insert(auditLogs).values({
        actorId,
        action: options.auditAction ?? "mission.updated",
        resourceType: "mission",
        resourceId: missionId,
        beforeState: current.draft,
        afterState: input,
        metadata: options.auditMetadata ?? {},
      });
    }
    return updated;
  });
}

export async function autosaveAdminMission(
  missionId: string,
  input: AdminMissionDraft,
  actorId: string,
  expectedDraftVersion?: number,
) {
  return updateAdminMission(missionId, input, actorId, {
    expectedDraftVersion,
    recordHistory: false,
    recordAudit: false,
  });
}

export async function duplicateAdminMission(missionId: string, actorId: string) {
  const current = await getAdminMission(missionId);
  if (!current) return null;
  const suffix = Date.now().toString(36);
  const duplicateInput: AdminMissionDraft = {
    ...current.draft,
    slug: `${current.draft.slug}-copy-${suffix}`,
    title: `${current.draft.title} (Bản sao)`,
  };
  const created = await createAdminMission(duplicateInput, actorId);
  await db
    .insert(reviewHistories)
    .values({ missionId: created.id, action: "duplicated", actorId, comment: `Tạo từ ${missionId}` });
  return created;
}

export async function buildMissionSnapshot(missionId: string) {
  const current = await getAdminMission(missionId);
  if (!current) return null;
  const taxonomy = await getAdminTaxonomy();
  const world = taxonomy.worlds.find((item) => item.id === current.draft.worldId);
  const primarySkill = taxonomy.skills.find((item) => item.id === current.draft.primarySkillId);
  const secondarySkills = current.draft.secondarySkillIds
    .map((id) => taxonomy.skills.find((item) => item.id === id)?.slug)
    .filter((value): value is string => Boolean(value));
  const badge = taxonomy.badges.find((item) => item.id === current.draft.rewardBadgeId);
  if (!world || !primarySkill) throw new Error("Mission taxonomy is incomplete");
  return {
    id: current.mission.id,
    worldId: world.id,
    slug: current.draft.slug,
    worldSlug: world.slug,
    title: current.draft.title,
    subtitle: current.draft.subtitle,
    shortDescription: current.draft.shortDescription,
    storyIntro: current.draft.storyIntro,
    estimatedMinutes: current.draft.estimatedMinutes,
    ageGroups: current.draft.ageGroups,
    primarySkill: primarySkill.slug,
    secondarySkills,
    coverUrl: current.draft.coverUrl,
    rewardBadge: badge?.slug,
    difficulty: current.draft.difficulty,
    allowReplay: current.draft.allowReplay,
    randomizeAnswers: current.draft.randomizeAnswers,
    questions: current.draft.questions.map((question, index) => ({
      ...question,
      id: question.id ?? crypto.randomUUID(),
      order: index + 1,
    })),
    safetyChecklist: current.draft.safety,
  };
}

export async function restoreMissionVersion(missionId: string, versionId: string, actorId: string) {
  const current = await getAdminMission(missionId);
  if (!current) return { error: "not_found" } as const;
  const version = current.versions.find((item) => item.id === versionId);
  if (!version) return { error: "not_found" } as const;

  const snapshotResult = (() => {
    try {
      return { snapshot: parseMissionSnapshot(version.snapshot) } as const;
    } catch {
      return { error: "invalid_snapshot" } as const;
    }
  })();
  if ("error" in snapshotResult) return snapshotResult;
  const snapshot = snapshotResult.snapshot;

  const [worldRows, skillRows, badgeRows] = await Promise.all([
    db.select().from(missionWorlds),
    db.select().from(skills),
    db.select().from(badges),
  ]);
  const world = snapshot.worldId
    ? worldRows.find((item) => item.id === snapshot.worldId)
    : worldRows.find((item) => item.slug === snapshot.worldSlug);
  const primarySkill = skillRows.find((item) => item.slug === snapshot.primarySkill);
  const secondarySkillIds = snapshot.secondarySkills.map(
    (slug) => skillRows.find((item) => item.slug === slug)?.id,
  );
  const rewardBadgeId = snapshot.rewardBadge
    ? badgeRows.find((item) => item.slug === snapshot.rewardBadge)?.id
    : null;

  if (
    !world ||
    !primarySkill ||
    secondarySkillIds.some((id) => !id) ||
    (snapshot.rewardBadge && !rewardBadgeId)
  ) {
    return { error: "taxonomy_missing" } as const;
  }

  const draftResult = adminMissionDraftSchema.safeParse({
    slug: snapshot.slug,
    worldId: world.id,
    title: snapshot.title,
    subtitle: snapshot.subtitle,
    shortDescription: snapshot.shortDescription,
    storyIntro: snapshot.storyIntro,
    estimatedMinutes: snapshot.estimatedMinutes,
    primarySkillId: primarySkill.id,
    secondarySkillIds,
    rewardBadgeId,
    coverUrl: snapshot.coverUrl,
    ageGroups: snapshot.ageGroups,
    difficulty: snapshot.difficulty,
    allowReplay: snapshot.allowReplay ?? current.draft.allowReplay,
    randomizeAnswers: snapshot.randomizeAnswers ?? current.draft.randomizeAnswers,
    questions: snapshot.questions,
    safety: Object.fromEntries(safetyKeys.map((key) => [key, snapshot.safetyChecklist[key] ?? false])),
  });
  if (!draftResult.success) return { error: "invalid_snapshot" } as const;

  const restored = await updateAdminMission(missionId, draftResult.data, actorId, {
    historyComment: `Khôi phục từ lần gửi ${version.versionNumber}`,
    auditAction: "mission.version_restored",
    auditMetadata: {
      sourceVersionId: version.id,
      sourceVersionNumber: version.versionNumber,
    },
  });
  if (!restored) return { error: "not_found" } as const;
  return { mission: restored, draft: draftResult.data, versionNumber: version.versionNumber } as const;
}

function collectReferencedUrls(value: unknown, urls = new Set<string>()) {
  if (typeof value === "string") {
    if (value.startsWith("/uploads/") || value.startsWith("http://") || value.startsWith("https://")) {
      urls.add(value);
    }
    return urls;
  }
  if (Array.isArray(value)) {
    for (const item of value) collectReferencedUrls(item, urls);
    return urls;
  }
  if (value && typeof value === "object") {
    for (const item of Object.values(value)) collectReferencedUrls(item, urls);
  }
  return urls;
}

async function findUnapprovedReferencedMedia(snapshot: unknown, extraUrls: string[] = []) {
  const referencedUrls = collectReferencedUrls(snapshot);
  for (const url of extraUrls) collectReferencedUrls(url, referencedUrls);
  const urls = [...referencedUrls];
  if (!urls.length) return [];
  const registered = await db.query.mediaAssets.findMany({
    where: inArray(mediaAssets.url, urls),
  });
  const registeredByUrl = new Map(registered.map((asset) => [asset.url, asset]));
  return urls.filter((url) => {
    const asset = registeredByUrl.get(url);
    return !asset || asset.safetyStatus !== "approved" || Boolean(asset.deletedAt);
  });
}

export async function submitMissionForReview(missionId: string, actorId: string) {
  const current = await getAdminMission(missionId);
  if (!current) return { error: "not_found" } as const;
  if (!safetyKeys.every((key) => current.draft.safety[key])) return { error: "safety_incomplete" } as const;
  const templateValidation = await validateMissionTemplateVariables(current.draft);
  if (templateValidation.issues.length) {
    return { error: "template_variables_invalid", issues: templateValidation.issues } as const;
  }
  const snapshot = await buildMissionSnapshot(missionId);
  if (!snapshot) return { error: "not_found" } as const;
  const rewardBadge = snapshot.rewardBadge
    ? await db.query.badges.findFirst({ where: eq(badges.slug, snapshot.rewardBadge) })
    : null;
  const unapprovedMedia = await findUnapprovedReferencedMedia(
    snapshot,
    rewardBadge ? [rewardBadge.iconUrl] : [],
  );
  if (unapprovedMedia.length) {
    return { error: "media_unapproved", media: unapprovedMedia } as const;
  }
  const versionNumber = current.mission.currentDraftVersion + 1;
  return db.transaction(async (tx) => {
    const [version] = await tx
      .insert(missionVersions)
      .values({ missionId, versionNumber, status: "in_review", snapshot, createdBy: actorId })
      .returning();
    await tx
      .update(missions)
      .set({
        status: "in_review",
        currentDraftVersion: versionNumber,
        updatedBy: actorId,
        updatedAt: new Date(),
      })
      .where(eq(missions.id, missionId));
    await tx.insert(reviewHistories).values({
      missionId,
      missionVersionId: version.id,
      action: "submitted",
      actorId,
      afterState: snapshot,
    });
    await tx.insert(auditLogs).values({
      actorId,
      action: "mission.submitted",
      resourceType: "mission",
      resourceId: missionId,
      afterState: { versionId: version.id, versionNumber },
    });
    return { version } as const;
  });
}

export async function archiveMission(missionId: string, actorId: string) {
  const current = await db.query.missions.findFirst({ where: eq(missions.id, missionId) });
  if (!current) return null;
  if (current.status === "archived") return current;

  return db.transaction(async (tx) => {
    const archivedAt = new Date();
    const [updated] = await tx
      .update(missions)
      .set({ status: "archived", archivedAt, updatedBy: actorId, updatedAt: archivedAt })
      .where(eq(missions.id, missionId))
      .returning();
    await tx.insert(reviewHistories).values({
      missionId,
      action: "archived",
      actorId,
      beforeState: { status: current.status },
      afterState: { status: "archived" },
    });
    await tx.insert(auditLogs).values({
      actorId,
      action: "mission.archived",
      resourceType: "mission",
      resourceId: missionId,
      beforeState: { status: current.status },
      afterState: { status: "archived" },
    });
    return updated;
  });
}

export async function restoreArchivedMission(missionId: string, actorId: string) {
  const current = await db.query.missions.findFirst({ where: eq(missions.id, missionId) });
  if (!current) return null;
  if (current.status !== "archived") return current;

  return db.transaction(async (tx) => {
    const restoredAt = new Date();
    const [updated] = await tx
      .update(missions)
      .set({
        status: "draft",
        archivedAt: null,
        scheduledFor: null,
        updatedBy: actorId,
        updatedAt: restoredAt,
      })
      .where(eq(missions.id, missionId))
      .returning();
    await tx.insert(reviewHistories).values({
      missionId,
      action: "updated",
      actorId,
      comment: "Khôi phục từ kho lưu trữ",
      beforeState: { status: "archived" },
      afterState: { status: "draft" },
    });
    await tx.insert(auditLogs).values({
      actorId,
      action: "mission.restored",
      resourceType: "mission",
      resourceId: missionId,
      beforeState: { status: "archived" },
      afterState: { status: "draft" },
    });
    return updated;
  });
}

export async function getReviewWorkspaceItems() {
  return db
    .select({
      version: missionVersions,
      missionId: missions.id,
      title: missions.title,
      slug: missions.slug,
      coverUrl: missions.coverUrl,
      worldTitle: missionWorlds.title,
      scheduledFor: missions.scheduledFor,
    })
    .from(missionVersions)
    .innerJoin(missions, eq(missionVersions.missionId, missions.id))
    .innerJoin(missionWorlds, eq(missions.worldId, missionWorlds.id))
    .where(
      and(
        inArray(missionVersions.status, ["in_review", "approved"]),
        sql`${missions.status} = ${missionVersions.status}`,
        sql`${missionVersions.versionNumber} = ${missions.currentDraftVersion}`,
      ),
    )
    .orderBy(asc(missionVersions.createdAt));
}

export async function approveMissionVersion(
  missionId: string,
  versionId: string,
  reviewerId: string,
  comment: string,
) {
  const normalizedComment = comment.trim() || null;
  const version = await db.query.missionVersions.findFirst({
    where: and(
      eq(missionVersions.id, versionId),
      eq(missionVersions.missionId, missionId),
      eq(missionVersions.status, "in_review"),
    ),
  });
  if (!version) return null;
  return db.transaction(async (tx) => {
    const [approved] = await tx
      .update(missionVersions)
      .set({
        status: "approved",
        reviewedBy: reviewerId,
        reviewComment: normalizedComment,
        reviewedAt: new Date(),
      })
      .where(eq(missionVersions.id, versionId))
      .returning();
    await tx
      .update(missions)
      .set({ status: "approved", updatedBy: reviewerId, updatedAt: new Date() })
      .where(eq(missions.id, missionId));
    await tx.insert(reviewHistories).values({
      missionId,
      missionVersionId: versionId,
      action: "approved",
      actorId: reviewerId,
      comment: normalizedComment,
    });
    await tx.insert(auditLogs).values({
      actorId: reviewerId,
      action: "mission.approved",
      resourceType: "mission_version",
      resourceId: versionId,
      afterState: { comment: normalizedComment },
    });
    return approved;
  });
}

export async function rejectMissionVersion(
  missionId: string,
  versionId: string,
  reviewerId: string,
  comment: string,
) {
  const version = await db.query.missionVersions.findFirst({
    where: and(
      eq(missionVersions.id, versionId),
      eq(missionVersions.missionId, missionId),
      eq(missionVersions.status, "in_review"),
    ),
  });
  if (!version) return null;
  return db.transaction(async (tx) => {
    const [rejected] = await tx
      .update(missionVersions)
      .set({ status: "rejected", reviewedBy: reviewerId, reviewComment: comment, reviewedAt: new Date() })
      .where(eq(missionVersions.id, versionId))
      .returning();
    await tx
      .update(missions)
      .set({ status: "rejected", updatedBy: reviewerId, updatedAt: new Date() })
      .where(eq(missions.id, missionId));
    await tx
      .insert(reviewHistories)
      .values({ missionId, missionVersionId: versionId, action: "rejected", actorId: reviewerId, comment });
    await tx.insert(auditLogs).values({
      actorId: reviewerId,
      action: "mission.rejected",
      resourceType: "mission_version",
      resourceId: versionId,
      afterState: { comment },
    });
    return rejected;
  });
}

export type MissionPublicationFailure =
  | { error: "not_approved" }
  | { error: "invalid_snapshot" }
  | { error: "world_not_published" }
  | { error: "world_age_groups_incomplete"; missingAgeGroups: AgeGroup[] }
  | { error: "invalid_schedule" };

type MissionPublicationContext = {
  version: typeof missionVersions.$inferSelect;
};

async function getMissionPublicationContext(
  missionId: string,
  versionId: string,
): Promise<MissionPublicationContext | MissionPublicationFailure> {
  const version = await db.query.missionVersions.findFirst({
    where: and(
      eq(missionVersions.id, versionId),
      eq(missionVersions.missionId, missionId),
      eq(missionVersions.status, "approved"),
    ),
  });
  if (!version) return { error: "not_approved" };

  let snapshot: ReturnType<typeof parseMissionSnapshot>;
  try {
    snapshot = parseMissionSnapshot(version.snapshot);
  } catch {
    return { error: "invalid_snapshot" };
  }

  const world = snapshot.worldId
    ? await db.query.missionWorlds.findFirst({ where: eq(missionWorlds.id, snapshot.worldId) })
    : snapshot.worldSlug
      ? await db.query.missionWorlds.findFirst({ where: eq(missionWorlds.slug, snapshot.worldSlug) })
      : null;
  if (!world || world.status !== "published") return { error: "world_not_published" };

  const ageRows = await db
    .select({ ageGroup: worldAgeGroups.ageGroup })
    .from(worldAgeGroups)
    .where(eq(worldAgeGroups.worldId, world.id));
  const missingAgeGroups = missingWorldAgeGroups(
    snapshot.ageGroups,
    ageRows.map((row) => row.ageGroup),
  );
  if (missingAgeGroups.length) {
    return { error: "world_age_groups_incomplete", missingAgeGroups };
  }

  return { version };
}

export async function publishMissionVersion(missionId: string, versionId: string, publisherId: string) {
  const context = await getMissionPublicationContext(missionId, versionId);
  if ("error" in context) return context;
  const now = new Date();
  const published = await db.transaction(async (tx) => {
    await tx
      .update(missionVersions)
      .set({ status: "archived" })
      .where(
        and(
          eq(missionVersions.missionId, missionId),
          eq(missionVersions.status, "published"),
          ne(missionVersions.id, versionId),
        ),
      );
    const [publishedVersion] = await tx
      .update(missionVersions)
      .set({ status: "published", publishedAt: now })
      .where(eq(missionVersions.id, versionId))
      .returning();
    await tx
      .update(missions)
      .set({
        status: "published",
        publishedVersionId: versionId,
        publishedAt: now,
        updatedBy: publisherId,
        updatedAt: now,
      })
      .where(eq(missions.id, missionId));
    await tx
      .insert(reviewHistories)
      .values({ missionId, missionVersionId: versionId, action: "published", actorId: publisherId });
    await tx.insert(auditLogs).values({
      actorId: publisherId,
      action: "mission.published",
      resourceType: "mission_version",
      resourceId: versionId,
    });
    return publishedVersion;
  });
  return { version: published } as const;
}

export async function scheduleMissionVersion(
  missionId: string,
  versionId: string,
  publisherId: string,
  scheduledFor: Date,
) {
  if (scheduledFor.getTime() <= Date.now()) return { error: "invalid_schedule" } as const;
  const context = await getMissionPublicationContext(missionId, versionId);
  if ("error" in context) return context;

  const [mission] = await db
    .update(missions)
    .set({ scheduledFor, updatedBy: publisherId, updatedAt: new Date() })
    .where(and(eq(missions.id, missionId), eq(missions.status, "approved")))
    .returning();
  if (!mission) return { error: "not_approved" } as const;
  await db.insert(reviewHistories).values({
    missionId,
    missionVersionId: versionId,
    action: "scheduled",
    actorId: publisherId,
    comment: scheduledFor.toISOString(),
  });
  await db.insert(auditLogs).values({
    actorId: publisherId,
    action: "mission.scheduled",
    resourceType: "mission_version",
    resourceId: versionId,
    afterState: { scheduledFor: scheduledFor.toISOString() },
  });
  return { mission } as const;
}

export async function publishDueScheduledMissions(actorId: string | null = null) {
  const due = await db
    .select({ missionId: missions.id, versionId: missionVersions.id })
    .from(missions)
    .innerJoin(
      missionVersions,
      and(eq(missionVersions.missionId, missions.id), eq(missionVersions.status, "approved")),
    )
    .where(
      and(
        eq(missions.status, "approved"),
        sql`${missions.scheduledFor} is not null`,
        lte(missions.scheduledFor, new Date()),
      ),
    );
  const published: string[] = [];
  for (const item of due) {
    const result = await publishMissionVersion(item.missionId, item.versionId, actorId ?? "system");
    if ("version" in result) {
      await db.update(missions).set({ scheduledFor: null }).where(eq(missions.id, item.missionId));
      published.push(item.missionId);
    }
  }
  return published;
}
