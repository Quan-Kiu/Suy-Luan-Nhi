import { buildSignInPath } from "@/auth/navigation";

type BrowserLocation = Pick<Location, "pathname" | "search" | "hash">;

type RedirectRuntime = {
  location: BrowserLocation | null;
  replace: (target: string) => void;
};

function browserRuntime(): RedirectRuntime | null {
  if (typeof window === "undefined") return null;
  return {
    location: window.location,
    replace: (target) => window.location.replace(target),
  };
}

function isAuthRoute(pathname: string) {
  return pathname === "/auth" || pathname.startsWith("/auth/");
}

export function buildUnauthorizedSignInPath(status: number | undefined, location: BrowserLocation | null) {
  if (status !== 401 || !location || isAuthRoute(location.pathname)) return null;
  return buildSignInPath(`${location.pathname}${location.search}${location.hash}`);
}

export function createUnauthorizedRedirectHandler() {
  let redirectStarted = false;

  return (status: number | undefined, runtime: RedirectRuntime | null = browserRuntime()) => {
    if (redirectStarted || !runtime) return false;
    const target = buildUnauthorizedSignInPath(status, runtime.location);
    if (!target) return false;

    runtime.replace(target);
    redirectStarted = true;
    return true;
  };
}

export const redirectToSignInAfterUnauthorized = createUnauthorizedRedirectHandler();
