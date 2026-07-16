import { db } from "@/db/client";
import { analyticsEvents } from "@/db/schema";

const allowedEvents = new Set([
  "app_opened",
  "landing_cta_clicked",
  "child_profile_created",
  "mission_map_opened",
  "mission_selected",
  "mission_started",
  "question_viewed",
  "answer_submitted",
  "answer_correct",
  "answer_incorrect",
  "hint_requested",
  "mission_completed",
  "badge_unlocked",
  "parent_gate_opened",
  "parent_gate_unlocked",
  "parent_dashboard_viewed",
  "admin_mission_created",
  "admin_mission_submitted_review",
  "admin_mission_published",
]);

export async function recordEvent(input: {
  eventName: string;
  userId?: string | null;
  childProfileId?: string | null;
  missionId?: string | null;
  sessionId?: string | null;
  properties?: Record<string, unknown>;
}) {
  if (!allowedEvents.has(input.eventName)) throw new Error(`Unsupported analytics event: ${input.eventName}`);
  const properties = Object.fromEntries(
    Object.entries(input.properties ?? {}).filter(
      ([key]) => !["email", "name", "location", "address", "birthDate", "ip"].includes(key),
    ),
  );
  await db.insert(analyticsEvents).values({ ...input, properties });
}
