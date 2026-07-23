import { createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import { env } from "@/config/env";
import { PARENT_GATE_COOKIE_NAME } from "@/modules/family/parent-gate-constants";
import { getOperationalSystemSettings } from "@/modules/system-settings/runtime";

type GateMethod = "pin" | "admin";
type GatePayload = {
  parentProfileId: string;
  accessKey: string;
  method: GateMethod;
  expiresAt: number;
};

function keyedAccess(value: string) {
  return createHmac("sha256", env.BETTER_AUTH_SECRET).update(value).digest("base64url").slice(0, 32);
}

function pinAccessKey(pinHash: string) {
  return keyedAccess(`parent-gate:pin:${pinHash}`);
}

function legacyPinAccessKey(pinHash: string) {
  return keyedAccess(`parent-gate:${pinHash}`);
}

function adminAccessKey(sessionToken: string) {
  return keyedAccess(`parent-gate:admin-session:${sessionToken}`);
}

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
    const payload = JSON.parse(Buffer.from(body, "base64url").toString("utf8")) as {
      parentProfileId?: unknown;
      accessKey?: unknown;
      method?: unknown;
      expiresAt?: unknown;
      pinKey?: unknown;
    };
    const legacyPinPayload = payload.method === undefined && typeof payload.pinKey === "string";
    const method = legacyPinPayload ? "pin" : payload.method;
    const accessKey = legacyPinPayload ? payload.pinKey : payload.accessKey;

    if (
      typeof payload.parentProfileId !== "string" ||
      typeof accessKey !== "string" ||
      (method !== "pin" && method !== "admin") ||
      typeof payload.expiresAt !== "number" ||
      payload.expiresAt <= Date.now()
    ) {
      return null;
    }
    return {
      parentProfileId: payload.parentProfileId,
      accessKey,
      method,
      expiresAt: payload.expiresAt,
    };
  } catch {
    return null;
  }
}

async function grantGate(parentProfileId: string, method: GateMethod, accessKey: string) {
  const systemSettings = await getOperationalSystemSettings();
  const expiresAt = Date.now() + systemSettings.security.parentGateSessionMinutes * 60_000;
  (await cookies()).set(PARENT_GATE_COOKIE_NAME, encode({ parentProfileId, accessKey, method, expiresAt }), {
    httpOnly: true,
    secure: new URL(env.BETTER_AUTH_URL).protocol === "https:",
    sameSite: "strict",
    path: "/",
  });
}

async function hasGate(parentProfileId: string, method: GateMethod, accessKeys: readonly string[]) {
  const value = (await cookies()).get(PARENT_GATE_COOKIE_NAME)?.value;
  const payload = value ? decode(value) : null;
  return (
    payload?.parentProfileId === parentProfileId &&
    payload.method === method &&
    accessKeys.includes(payload.accessKey)
  );
}

export function grantParentGate(parentProfileId: string, pinHash: string) {
  return grantGate(parentProfileId, "pin", pinAccessKey(pinHash));
}

export function hasParentGate(parentProfileId: string, pinHash: string) {
  return hasGate(parentProfileId, "pin", [pinAccessKey(pinHash), legacyPinAccessKey(pinHash)]);
}

export function grantAdminParentGate(parentProfileId: string, sessionToken: string) {
  return grantGate(parentProfileId, "admin", adminAccessKey(sessionToken));
}

export function hasAdminParentGate(parentProfileId: string, sessionToken: string) {
  return hasGate(parentProfileId, "admin", [adminAccessKey(sessionToken)]);
}

export async function revokeParentGate() {
  (await cookies()).delete(PARENT_GATE_COOKIE_NAME);
}
