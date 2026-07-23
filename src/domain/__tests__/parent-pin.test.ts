import { describe, expect, it } from "vitest";
import { parentPinSetupSchema, parentPinUnlockSchema, parentPinValueSchema } from "@/domain/parent-pin";

describe("parent PIN validation", () => {
  it("accepts a non-trivial six-digit PIN", () => {
    expect(parentPinValueSchema.safeParse("246824").success).toBe(true);
  });

  it.each(["1234", "12345678", "12a456"])("rejects invalid new PIN %s", (pin) => {
    expect(parentPinValueSchema.safeParse(pin).success).toBe(false);
  });

  it.each(["000000", "123456", "654321"])("rejects common PIN %s", (pin) => {
    expect(parentPinValueSchema.safeParse(pin).success).toBe(false);
  });

  it("requires the confirmation PIN to match", () => {
    const result = parentPinSetupSchema.safeParse({ pin: "246824", confirmPin: "246825" });
    expect(result.success).toBe(false);
  });

  it("accepts legacy four-to-eight digit PINs when unlocking", () => {
    expect(parentPinUnlockSchema.safeParse("2468").success).toBe(true);
    expect(parentPinUnlockSchema.safeParse("24682468").success).toBe(true);
  });
});
