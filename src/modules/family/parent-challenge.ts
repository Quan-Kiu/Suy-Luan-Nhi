import { createHmac, randomBytes, randomInt, timingSafeEqual } from "node:crypto";
import { env } from "@/config/env";

type Operator = "+" | "-";
type ChallengePayload = {
  left: number;
  right: number;
  operator: Operator;
  expiresAt: number;
  nonce: string;
};

export type ParentMathChallenge = {
  prompt: string;
  token: string;
};

function sign(body: string) {
  return createHmac("sha256", env.BETTER_AUTH_SECRET).update(body).digest("base64url");
}

function encode(payload: ChallengePayload) {
  const body = Buffer.from(JSON.stringify(payload)).toString("base64url");
  return `${body}.${sign(body)}`;
}

function decode(token: string): ChallengePayload | null {
  const [body, signature] = token.split(".");
  if (!body || !signature) return null;
  const expected = Buffer.from(sign(body), "utf8");
  const actual = Buffer.from(signature, "utf8");
  if (actual.length !== expected.length || !timingSafeEqual(actual, expected)) return null;

  try {
    const payload = JSON.parse(Buffer.from(body, "base64url").toString("utf8")) as ChallengePayload;
    const valid =
      Number.isInteger(payload.left) &&
      Number.isInteger(payload.right) &&
      (payload.operator === "+" || payload.operator === "-") &&
      typeof payload.nonce === "string" &&
      payload.nonce.length >= 16 &&
      payload.expiresAt > Date.now();
    return valid ? payload : null;
  } catch {
    return null;
  }
}

export function createParentMathChallenge(): ParentMathChallenge {
  const operator: Operator = randomInt(0, 2) === 0 ? "+" : "-";
  const left = randomInt(operator === "+" ? 8 : 18, operator === "+" ? 36 : 51);
  const right = operator === "+" ? randomInt(4, 26) : randomInt(3, left - 2);
  const payload: ChallengePayload = {
    left,
    right,
    operator,
    expiresAt: Date.now() + 10 * 60_000,
    nonce: randomBytes(16).toString("base64url"),
  };
  return { prompt: `${left} ${operator} ${right} = ?`, token: encode(payload) };
}

export function verifyParentMathChallenge(token: string, answer: string) {
  const payload = decode(token);
  if (!payload || !/^-?\d+$/.test(answer.trim())) return false;
  const expected = payload.operator === "+" ? payload.left + payload.right : payload.left - payload.right;
  return Number(answer.trim()) === expected;
}
