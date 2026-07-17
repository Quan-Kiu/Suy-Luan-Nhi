import { adminOperationsContentEntries } from "@/content/catalog/admin-operations-ui-content";
import { authContentEntries } from "@/content/catalog/auth-ui-content";
import { childContentEntries } from "@/content/catalog/child-ui-content";
import { parentContentEntries, profileContentEntries } from "@/content/catalog/family-ui-content";
import { landingContentEntries } from "@/content/catalog/landing-ui-content";
import { missionEditorContentEntries } from "@/content/catalog/mission-editor-ui-content";
import {
  adminContentEntries,
  commonContentEntries,
  gameplayContentEntries,
} from "@/content/catalog/system-ui-content";
import type { ContentDefinition } from "@/content/types";

const vi = "vi";

export const defaultContentEntries: ContentDefinition[] = [
  ...commonContentEntries,
  ...landingContentEntries,
  ...authContentEntries,
  ...childContentEntries,
  ...profileContentEntries,
  ...parentContentEntries,
  ...gameplayContentEntries,
  ...adminContentEntries,
  ...adminOperationsContentEntries,
  ...missionEditorContentEntries,
];

export function getDefaultContent(namespace: string, locale = vi) {
  return Object.fromEntries(
    defaultContentEntries
      .filter((entry) => entry.namespace === namespace && entry.locale === locale)
      .map((entry) => [entry.key, entry.value]),
  );
}
