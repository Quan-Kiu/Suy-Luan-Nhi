import { and, eq, sql } from "drizzle-orm";
import { db } from "@/db/client";
import { renderContentTemplate } from "@/domain/content-variables";
import {
  activitySummaries,
  analyticsEvents,
  badges,
  childBadges,
  childProfiles,
  missionSessions,
  missions,
  notifications,
  parentProfiles,
  questionAttempts,
  sessionQuestionStates,
} from "@/db/schema";
import { getMissionMap, getPublishedMission } from "@/modules/catalog/catalog";
import { parseMissionSnapshot } from "@/modules/catalog/snapshot";
import { resolveSkillLabels } from "@/modules/catalog/skill-labels";
import { renderQuestionTemplate } from "@/lib/content/render-question-template";
import { getOwnedChild } from "@/modules/family/family";
import { getContentVariableDefinitions } from "@/modules/content/content-variables";
import { evaluateQuestion, type QuestionSubmission } from "@/modules/gameplay/question";

type SnapshotQuestion = ReturnType<typeof parseMissionSnapshot>["questions"][number];

function sanitizeQuestion(question: SnapshotQuestion) {
  const { correctAnswer, ...safeQuestion } = question;
  void correctAnswer;
  return safeQuestion;
}

async function getOwnedSession(userId: string, sessionId: string) {
  const rows = await db
    .select({ session: missionSessions, parent: parentProfiles, mission: missions, child: childProfiles })
    .from(missionSessions)
    .innerJoin(missions, eq(missionSessions.missionId, missions.id))
    .innerJoin(childProfiles, eq(missionSessions.childProfileId, childProfiles.id))
    .innerJoin(parentProfiles, eq(childProfiles.parentProfileId, parentProfiles.id))
    .where(and(eq(missionSessions.id, sessionId), eq(parentProfiles.userId, userId)))
    .limit(1);
  return rows[0] ?? null;
}

export async function getSessionCacheContext(userId: string, sessionId: string) {
  const owned = await getOwnedSession(userId, sessionId);
  return owned ? { childId: owned.session.childProfileId, parentProfileId: owned.parent.id } : null;
}

export async function startMission(userId: string, childId: string, missionIdentifier: string) {
  const owned = await getOwnedChild(userId, childId);
  if (!owned) return { error: "not_found" } as const;
  const published = await getPublishedMission(missionIdentifier);
  if (!published) return { error: "mission_not_found" } as const;
  const map = await getMissionMap(owned.child);
  const mapMission = map.worlds
    .flatMap((world) => world.missions)
    .find((mission) => mission.id === published.mission.id);
  if (!mapMission?.unlocked) return { error: "locked" } as const;
  const snapshot = parseMissionSnapshot(published.version.snapshot);
  const existing = await db.query.missionSessions.findFirst({
    where: and(
      eq(missionSessions.childProfileId, childId),
      eq(missionSessions.missionId, published.mission.id),
      eq(missionSessions.missionVersionId, published.version.id),
      eq(missionSessions.status, "in_progress"),
    ),
  });
  if (existing) return getSessionView(userId, existing.id);

  const created = await db.transaction(async (tx) => {
    const sessions = await tx
      .insert(missionSessions)
      .values({
        childProfileId: childId,
        missionId: published.mission.id,
        missionVersionId: published.version.id,
        totalQuestions: snapshot.questions.length,
      })
      .onConflictDoNothing()
      .returning();
    const session = sessions[0];
    if (!session) return null;
    await tx
      .insert(sessionQuestionStates)
      .values(snapshot.questions.map((question) => ({ sessionId: session.id, questionId: question.id })));
    await tx.insert(analyticsEvents).values({
      eventName: "mission_started",
      userId,
      childProfileId: childId,
      missionId: published.mission.id,
      sessionId: session.id,
      properties: { version: published.version.versionNumber },
    });
    return session;
  });
  if (!created) {
    const concurrent = await db.query.missionSessions.findFirst({
      where: and(
        eq(missionSessions.childProfileId, childId),
        eq(missionSessions.missionId, published.mission.id),
        eq(missionSessions.missionVersionId, published.version.id),
        eq(missionSessions.status, "in_progress"),
      ),
    });
    if (!concurrent) return { error: "start_conflict" } as const;
    return getSessionView(userId, concurrent.id);
  }
  return getSessionView(userId, created.id);
}

export async function getSessionView(userId: string, sessionId: string) {
  const owned = await getOwnedSession(userId, sessionId);
  if (!owned) return { error: "not_found" } as const;
  const version = await db.query.missionVersions.findFirst({
    where: (table, { eq: equal }) => equal(table.id, owned.session.missionVersionId),
  });
  if (!version) return { error: "version_not_found" } as const;
  const snapshot = parseMissionSnapshot(version.snapshot);
  const templateVariables = await getContentVariableDefinitions();
  const templateContext = { child: owned.child };
  const question = snapshot.questions[owned.session.currentQuestionIndex] ?? snapshot.questions.at(-1)!;
  const renderedQuestion = renderQuestionTemplate(question, templateVariables, templateContext);
  const state = await db.query.sessionQuestionStates.findFirst({
    where: and(
      eq(sessionQuestionStates.sessionId, sessionId),
      eq(sessionQuestionStates.questionId, question.id),
    ),
  });
  return {
    session: owned.session,
    mission: {
      id: owned.mission.id,
      slug: owned.mission.slug,
      title: renderContentTemplate(snapshot.title, templateVariables, templateContext),
      rewardBadge: snapshot.rewardBadge,
      coverUrl: snapshot.coverUrl,
    },
    question: sanitizeQuestion(renderedQuestion),
    questionState: state ?? null,
    progress: {
      current: Math.min(owned.session.currentQuestionIndex + 1, snapshot.questions.length),
      total: snapshot.questions.length,
    },
    completeReady: owned.session.correctCount >= snapshot.questions.length,
  } as const;
}

export async function requestHint(userId: string, sessionId: string, questionId: string) {
  const owned = await getOwnedSession(userId, sessionId);
  if (!owned || owned.session.status !== "in_progress") return { error: "not_found" } as const;
  const version = await db.query.missionVersions.findFirst({
    where: (table, { eq: equal }) => equal(table.id, owned.session.missionVersionId),
  });
  if (!version) return { error: "not_found" } as const;
  const snapshot = parseMissionSnapshot(version.snapshot);
  const templateVariables = await getContentVariableDefinitions();
  const templateContext = { child: owned.child };
  const question = snapshot.questions.find((item) => item.id === questionId);
  if (!question) return { error: "question_not_found" } as const;
  const state = await db.query.sessionQuestionStates.findFirst({
    where: and(
      eq(sessionQuestionStates.sessionId, sessionId),
      eq(sessionQuestionStates.questionId, questionId),
    ),
  });
  if (!state) return { error: "question_not_found" } as const;
  const nextLevel = Math.min(state.hintLevel + 1, question.hints.length);
  if (nextLevel > state.hintLevel) {
    await db.transaction(async (tx) => {
      await tx
        .update(sessionQuestionStates)
        .set({ hintLevel: nextLevel })
        .where(eq(sessionQuestionStates.id, state.id));
      await tx
        .update(missionSessions)
        .set({ hintUsedCount: sql`${missionSessions.hintUsedCount} + 1`, updatedAt: new Date() })
        .where(eq(missionSessions.id, sessionId));
      await tx.insert(analyticsEvents).values({
        eventName: "hint_requested",
        userId,
        childProfileId: owned.session.childProfileId,
        missionId: owned.session.missionId,
        sessionId,
        properties: { questionId, level: nextLevel },
      });
    });
  }
  const hint = question.hints[Math.max(0, nextLevel - 1)];
  return {
    hint: {
      ...hint,
      text: renderContentTemplate(hint.text, templateVariables, templateContext),
    },
    level: nextLevel,
    exhausted: nextLevel >= question.hints.length,
  } as const;
}

export async function submitAnswer(input: {
  userId: string;
  sessionId: string;
  questionId: string;
  submission: QuestionSubmission;
  responseTimeMs: number;
  idempotencyKey: string;
}) {
  const owned = await getOwnedSession(input.userId, input.sessionId);
  if (!owned || owned.session.status !== "in_progress") return { error: "not_found" } as const;
  const previousAttempt = await db.query.questionAttempts.findFirst({
    where: eq(questionAttempts.idempotencyKey, input.idempotencyKey),
  });
  if (previousAttempt) {
    if (previousAttempt.sessionId !== input.sessionId) return { error: "idempotency_key_reused" } as const;
    const currentView = await getSessionView(input.userId, input.sessionId);
    if ("error" in currentView) return currentView;
    return {
      ...currentView,
      duplicate: true,
      correct: previousAttempt.isCorrect,
    };
  }
  const version = await db.query.missionVersions.findFirst({
    where: (table, { eq: equal }) => equal(table.id, owned.session.missionVersionId),
  });
  if (!version) return { error: "version_not_found" } as const;
  const snapshot = parseMissionSnapshot(version.snapshot);
  const templateVariables = await getContentVariableDefinitions();
  const templateContext = { child: owned.child };
  const expectedQuestion = snapshot.questions[owned.session.currentQuestionIndex];
  if (!expectedQuestion || expectedQuestion.id !== input.questionId) {
    return { error: "question_not_current" } as const;
  }
  const state = await db.query.sessionQuestionStates.findFirst({
    where: and(
      eq(sessionQuestionStates.sessionId, input.sessionId),
      eq(sessionQuestionStates.questionId, input.questionId),
    ),
  });
  if (!state) return { error: "question_not_found" } as const;
  if (state.completed) return getSessionView(input.userId, input.sessionId);

  const correct = evaluateQuestion(expectedQuestion, input.submission);
  const transactionResult = await db.transaction(async (tx) => {
    const attempts = await tx
      .insert(questionAttempts)
      .values({
        sessionId: input.sessionId,
        questionId: input.questionId,
        selectedAnswer: input.submission,
        isCorrect: correct,
        attemptNumber: state.attempts + 1,
        hintsUsed: state.hintLevel,
        responseTimeMs: Math.max(0, Math.min(input.responseTimeMs, 60 * 60 * 1000)),
        idempotencyKey: input.idempotencyKey,
      })
      .onConflictDoNothing({ target: questionAttempts.idempotencyKey })
      .returning();
    if (!attempts.length) return { duplicate: true, awarded: false };

    let awarded = false;
    if (correct) {
      const completedStates = await tx
        .update(sessionQuestionStates)
        .set({
          attempts: sql`${sessionQuestionStates.attempts} + 1`,
          completed: true,
          completedAt: new Date(),
        })
        .where(and(eq(sessionQuestionStates.id, state.id), eq(sessionQuestionStates.completed, false)))
        .returning({ id: sessionQuestionStates.id });
      awarded = completedStates.length > 0;
      if (awarded) {
        await tx
          .update(missionSessions)
          .set({
            correctCount: sql`${missionSessions.correctCount} + 1`,
            currentQuestionIndex: Math.min(
              owned.session.currentQuestionIndex + 1,
              snapshot.questions.length - 1,
            ),
            updatedAt: new Date(),
          })
          .where(and(eq(missionSessions.id, input.sessionId), eq(missionSessions.status, "in_progress")));
      }
    } else {
      await tx
        .update(sessionQuestionStates)
        .set({ attempts: sql`${sessionQuestionStates.attempts} + 1` })
        .where(eq(sessionQuestionStates.id, state.id));
      await tx
        .update(missionSessions)
        .set({ wrongAttemptCount: sql`${missionSessions.wrongAttemptCount} + 1`, updatedAt: new Date() })
        .where(and(eq(missionSessions.id, input.sessionId), eq(missionSessions.status, "in_progress")));
    }

    await tx.insert(analyticsEvents).values([
      {
        eventName: "answer_submitted",
        userId: input.userId,
        childProfileId: owned.session.childProfileId,
        missionId: owned.session.missionId,
        sessionId: input.sessionId,
        properties: { questionId: input.questionId, attempt: state.attempts + 1 },
      },
      {
        eventName: correct ? "answer_correct" : "answer_incorrect",
        userId: input.userId,
        childProfileId: owned.session.childProfileId,
        missionId: owned.session.missionId,
        sessionId: input.sessionId,
        properties: { questionId: input.questionId, hintsUsed: state.hintLevel, awarded },
      },
    ]);
    return { duplicate: false, awarded };
  });

  const view = await getSessionView(input.userId, input.sessionId);
  if (transactionResult.duplicate) {
    const previous = await db.query.questionAttempts.findFirst({
      where: eq(questionAttempts.idempotencyKey, input.idempotencyKey),
    });
    return { ...view, duplicate: true, correct: previous?.isCorrect ?? correct };
  }
  return {
    correct,
    awarded: transactionResult.awarded,
    feedback: renderContentTemplate(
      correct ? expectedQuestion.feedbackCorrect : expectedQuestion.feedbackIncorrect,
      templateVariables,
      templateContext,
    ),
    ...view,
  } as const;
}

export async function completeMission(userId: string, sessionId: string) {
  const owned = await getOwnedSession(userId, sessionId);
  if (!owned) return { error: "not_found" } as const;
  if (owned.session.status === "completed") {
    const summary = await getCompletionSummary(userId, sessionId);
    return summary
      ? {
          completed: true,
          alreadyCompleted: true,
          badge: summary.badge,
          stars: summary.session.stars,
          thinkingHabits: summary.thinkingHabits,
        }
      : ({ error: "completion_conflict" } as const);
  }
  if (owned.session.status !== "in_progress") return { error: "not_found" } as const;
  const version = await db.query.missionVersions.findFirst({
    where: (table, { eq: equal }) => equal(table.id, owned.session.missionVersionId),
  });
  if (!version) return { error: "version_not_found" } as const;
  const snapshot = parseMissionSnapshot(version.snapshot);
  const templateVariables = await getContentVariableDefinitions();
  const templateContext = { child: owned.child };
  const renderedMissionTitle = renderContentTemplate(snapshot.title, templateVariables, templateContext);
  const states = await db.query.sessionQuestionStates.findMany({
    where: eq(sessionQuestionStates.sessionId, sessionId),
  });
  if (states.filter((state) => state.completed).length !== snapshot.questions.length) {
    return { error: "not_complete" } as const;
  }
  const completedAt = new Date();
  const minutesPlayed = Math.max(
    1,
    Math.round((completedAt.getTime() - owned.session.startedAt.getTime()) / 60_000),
  );
  const today = completedAt.toISOString().slice(0, 10);
  const badge = owned.mission.rewardBadgeId
    ? await db.query.badges.findFirst({ where: eq(badges.id, owned.mission.rewardBadgeId) })
    : null;
  const stars = owned.session.wrongAttemptCount === 0 ? 3 : owned.session.hintUsedCount <= 1 ? 2 : 1;

  const completedNow = await db.transaction(async (tx) => {
    const updatedSessions = await tx
      .update(missionSessions)
      .set({ status: "completed", completedAt, updatedAt: completedAt, stars })
      .where(and(eq(missionSessions.id, sessionId), eq(missionSessions.status, "in_progress")))
      .returning({ id: missionSessions.id });
    if (!updatedSessions.length) return false;

    if (badge) {
      await tx
        .insert(childBadges)
        .values({
          childProfileId: owned.session.childProfileId,
          badgeId: badge.id,
          sourceMissionId: owned.session.missionId,
        })
        .onConflictDoNothing({ target: [childBadges.childProfileId, childBadges.badgeId] });
    }
    await tx
      .insert(activitySummaries)
      .values({
        childProfileId: owned.session.childProfileId,
        date: today,
        missionsCompleted: 1,
        questionsCompleted: snapshot.questions.length,
        minutesPlayed,
        skillStats: Object.fromEntries(
          [snapshot.primarySkill, ...snapshot.secondarySkills].map((skill) => [skill, 1]),
        ),
        hintUsedCount: owned.session.hintUsedCount,
        retryCount: owned.session.wrongAttemptCount,
      })
      .onConflictDoUpdate({
        target: [activitySummaries.childProfileId, activitySummaries.date],
        set: {
          missionsCompleted: sql`${activitySummaries.missionsCompleted} + 1`,
          questionsCompleted: sql`${activitySummaries.questionsCompleted} + ${snapshot.questions.length}`,
          minutesPlayed: sql`${activitySummaries.minutesPlayed} + ${minutesPlayed}`,
          hintUsedCount: sql`${activitySummaries.hintUsedCount} + ${owned.session.hintUsedCount}`,
          retryCount: sql`${activitySummaries.retryCount} + ${owned.session.wrongAttemptCount}`,
          updatedAt: completedAt,
        },
      });
    await tx.insert(notifications).values({
      parentProfileId: owned.parent.id,
      childProfileId: owned.session.childProfileId,
      type: "mission_completed",
      title: "Nhiệm vụ đã hoàn thành",
      body: `Bé vừa hoàn thành “${renderedMissionTitle}” và luyện kỹ năng ${snapshot.primarySkill}.`,
    });
    await tx.insert(analyticsEvents).values({
      eventName: "mission_completed",
      userId,
      childProfileId: owned.session.childProfileId,
      missionId: owned.session.missionId,
      sessionId,
      properties: {
        minutesPlayed,
        hintsUsed: owned.session.hintUsedCount,
        retries: owned.session.wrongAttemptCount,
      },
    });
    if (badge) {
      await tx.insert(analyticsEvents).values({
        eventName: "badge_unlocked",
        userId,
        childProfileId: owned.session.childProfileId,
        missionId: owned.session.missionId,
        sessionId,
        properties: { badgeSlug: badge.slug },
      });
    }
    return true;
  });

  if (!completedNow) {
    const summary = await getCompletionSummary(userId, sessionId);
    return summary
      ? {
          completed: true,
          alreadyCompleted: true,
          badge: summary.badge,
          stars: summary.session.stars,
          thinkingHabits: summary.thinkingHabits,
        }
      : ({ error: "completion_conflict" } as const);
  }
  return { completed: true, badge, stars, thinkingHabits: snapshot.secondarySkills } as const;
}

export async function exitMission(userId: string, sessionId: string) {
  const owned = await getOwnedSession(userId, sessionId);
  if (!owned) return false;
  await db
    .update(missionSessions)
    .set({ status: "exited", updatedAt: new Date() })
    .where(eq(missionSessions.id, sessionId));
  return true;
}

export async function getCompletionSummary(userId: string, sessionId: string) {
  const owned = await getOwnedSession(userId, sessionId);
  if (!owned || owned.session.status !== "completed") return null;
  const version = await db.query.missionVersions.findFirst({
    where: (table, { eq: equal }) => equal(table.id, owned.session.missionVersionId),
  });
  if (!version) return null;
  const snapshot = parseMissionSnapshot(version.snapshot);
  const templateVariables = await getContentVariableDefinitions();
  const templateContext = { child: owned.child };
  const [badge, thinkingHabits] = await Promise.all([
    owned.mission.rewardBadgeId
      ? db.query.badges.findFirst({ where: eq(badges.id, owned.mission.rewardBadgeId) })
      : null,
    resolveSkillLabels(snapshot.secondarySkills),
  ]);
  return {
    session: owned.session,
    mission: {
      id: owned.mission.id,
      slug: owned.mission.slug,
      title: renderContentTemplate(snapshot.title, templateVariables, templateContext),
      coverUrl: snapshot.coverUrl,
    },
    badge,
    thinkingHabits,
  };
}
