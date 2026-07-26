import { beforeEach, describe, expect, it, vi } from "vitest";

const state = vi.hoisted(() => ({ value: undefined as string | undefined }));

vi.mock("next/headers", () => ({
  cookies: async () => ({
    set: (_name: string, value: string) => {
      state.value = value;
    },
    get: () => (state.value ? { value: state.value } : undefined),
    delete: () => {
      state.value = undefined;
    },
  }),
}));
vi.mock("@/modules/system-settings/runtime", () => ({
  getOperationalSystemSettings: async () => ({ security: { parentGateSessionMinutes: 15 } }),
}));

import { grantParentGate, hasParentGate } from "@/modules/family/parent-gate";

describe("Parent Gate reset invalidation", () => {
  beforeEach(() => {
    state.value = undefined;
  });

  it("rejects an existing gate cookie as soon as the stored PIN hash changes", async () => {
    await grantParentGate("parent-profile", "old-pin-hash");
    await expect(hasParentGate("parent-profile", "old-pin-hash")).resolves.toBe(true);
    await expect(hasParentGate("parent-profile", "new-pin-hash")).resolves.toBe(false);
  });
});
