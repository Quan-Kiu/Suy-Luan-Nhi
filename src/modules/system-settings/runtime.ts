import { inArray } from "drizzle-orm";
import { db } from "@/db/client";
import { systemSettings } from "@/db/schema";
import {
  managedSystemSettingDefinitions,
  managedSystemSettingKeys,
  resolveOperationalSystemSettings,
  type OperationalSystemSettings,
} from "@/domain/system-settings";

const runtimeCacheTtlMs = 5_000;
let runtimeCache: { value: OperationalSystemSettings; expiresAt: number } | undefined;

const defaultRuntimeSettings = resolveOperationalSystemSettings([]);

async function readManagedRows() {
  return db
    .select({ key: systemSettings.key, value: systemSettings.value, updatedAt: systemSettings.updatedAt })
    .from(systemSettings)
    .where(inArray(systemSettings.key, [...managedSystemSettingKeys]));
}

export async function getOperationalSystemSettings(options: { fresh?: boolean } = {}) {
  if (!options.fresh && runtimeCache && runtimeCache.expiresAt > Date.now()) return runtimeCache.value;

  try {
    const value = resolveOperationalSystemSettings(await readManagedRows());
    runtimeCache = { value, expiresAt: Date.now() + runtimeCacheTtlMs };
    return value;
  } catch (error) {
    console.error("[system_settings.runtime_read_failed]", error);
    return defaultRuntimeSettings;
  }
}

export function clearOperationalSystemSettingsCache() {
  runtimeCache = undefined;
}

export async function getManagedSystemSettingsForDashboard() {
  const rows = await readManagedRows();
  const byKey = new Map(rows.map((row) => [row.key, row]));

  return managedSystemSettingDefinitions.map((definition) => {
    const stored = byKey.get(definition.key);
    const parsed = definition.schema.safeParse(stored?.value);
    return {
      key: definition.key,
      value: parsed.success ? parsed.data : definition.defaultValue,
      updatedAt: stored?.updatedAt ?? null,
      source: stored && parsed.success ? ("saved" as const) : ("default" as const),
    };
  });
}
