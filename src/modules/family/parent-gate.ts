import { createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import { env } from "@/config/env";
import { PARENT_GATE_COOKIE_NAME } from "@/modules/family/parent-gate-constants";
import { getOperationalSystemSettings } from "@/modules/system-settings/runtime";

type GatePayload = { parentProfileId: string; expiresAt: number };

function encode(payload: GatePayload) {
  const body = Buffer.from(JSON.stringify(payload)).toString("base64url");
  const signature = createHmac("sha256", env.BETTER_AUTH_SECRET).update(body).digest("base64url");
  return `${body}.${signature}`;
}

function decode(value: string): GatePayload | null {
  const [body, signature] = value.split(".");
  if (!body || !signature) return null;
  const expected = Buffer.from(
    createHmac("sha256", env.BETTER_AUTH_SECRET).update(body).digest("base64url"),
    "utf8",
  );
  const actual = Buffer.from(signature, "utf8");
  if (actual.length !== expected.length || !timingSafeEqual(actual, expected)) return null;
  try {
    const payload = JSON.parse(Buffer.from(body, "base64url").toString("utf8")) as GatePayload;
    return payload.expiresAt > Date.now() ? payload : null;
  } catch {
    return null;
  }
}

export async function grantParentGate(parentProfileId: string) {
  const systemSettings = await getOperationalSystemSettings();
  const expiresAt = Date.now() + systemSettings.security.parentGateSessionMinutes * 60_000;
  (await cookies()).set(PARENT_GATE_COOKIE_NAME, encode({ parentProfileId, expiresAt }), {
    httpOnly: true,
    secure: new URL(env.BETTER_AUTH_URL).protocol === "https:",
    sameSite: "strict",
    path: "/",
  });
}

export async function hasParentGate(parentProfileId: string) {
  const value = (await cookies()).get(PARENT_GATE_COOKIE_NAME)?.value;
  const payload = value ? decode(value) : null;
  return payload?.parentProfileId === parentProfileId;
}

export async function revokeParentGate() {
  (await cookies()).delete(PARENT_GATE_COOKIE_NAME);
}
