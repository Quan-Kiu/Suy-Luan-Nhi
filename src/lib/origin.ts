function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function matchesPattern(origin: string, pattern: string) {
  if (!pattern.includes("*") && !pattern.includes("?")) return origin === pattern;
  const expression = escapeRegExp(pattern).replaceAll("\\*", ".*").replaceAll("\\?", ".");
  return new RegExp(`^${expression}$`).test(origin);
}

function validOrigin(value: string | null | undefined) {
  if (!value) return null;
  try {
    return new URL(value).origin;
  } catch {
    return null;
  }
}

function isLoopback(origin: string) {
  try {
    const host = new URL(origin).hostname;
    return host === "localhost" || host === "127.0.0.1" || host === "::1" || host === "[::1]";
  } catch {
    return false;
  }
}
export function isTrustedRequestOrigin({
  origin,
  requestOrigin,
  host,
  forwardedHost,
  forwardedProto,
}: {
  origin: string | null;
  requestOrigin: string;
  host: string | null;
  forwardedHost: string | null;
  forwardedProto: string | null;
}) {
  const normalizedOrigin = validOrigin(origin);
  if (!normalizedOrigin) return process.env.NODE_ENV !== "production";

  if (process.env.NODE_ENV === "development" && isLoopback(normalizedOrigin)) return true;

  const protocol = forwardedProto ?? new URL(requestOrigin).protocol.replace(":", "");
  const publicHost = forwardedHost ?? host;
  const candidates = [
    validOrigin(requestOrigin),
    validOrigin(process.env.BETTER_AUTH_URL),
    publicHost ? validOrigin(`${protocol}://${publicHost}`) : null,
  ].filter((value): value is string => Boolean(value));
  const configured = (process.env.BETTER_AUTH_TRUSTED_ORIGINS ?? "")
    .split(",")
    .map((value) => value.trim())
    .filter(Boolean);

  return [...candidates, ...configured].some((pattern) => matchesPattern(normalizedOrigin, pattern));
}
