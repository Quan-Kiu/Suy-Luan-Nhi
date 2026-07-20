type HeaderReader = Pick<Headers, "get">;

export function isNavigationPrefetch(headers: HeaderReader) {
  return (
    headers.get("next-router-prefetch") === "1" ||
    headers.get("purpose")?.toLowerCase() === "prefetch" ||
    headers.get("sec-purpose")?.toLowerCase().includes("prefetch") === true
  );
}

export function shouldRelockParentGate({
  pathname,
  hasGateCookie,
  headers,
}: {
  pathname: string;
  hasGateCookie: boolean;
  headers: HeaderReader;
}) {
  return (
    hasGateCookie &&
    !pathname.startsWith("/parent") &&
    !pathname.startsWith("/api/") &&
    !isNavigationPrefetch(headers)
  );
}
