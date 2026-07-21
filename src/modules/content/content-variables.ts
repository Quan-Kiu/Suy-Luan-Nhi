import "server-only";

import { eq } from "drizzle-orm";
import { db } from "@/db/client";
import { systemSettings } from "@/db/schema";
import {
  CONTENT_VARIABLES_SETTING_KEY,
  parseContentVariableDefinitions,
  type ContentVariableDefinition,
} from "@/domain/content-variables";

export async function getContentVariableDefinitions(): Promise<ContentVariableDefinition[]> {
  const setting = await db.query.systemSettings.findFirst({
    where: eq(systemSettings.key, CONTENT_VARIABLES_SETTING_KEY),
  });
  return parseContentVariableDefinitions(setting?.value);
}
