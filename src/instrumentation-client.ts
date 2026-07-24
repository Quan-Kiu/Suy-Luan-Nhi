import {
  initializeClientErrorReporting,
  recordRouterTransition,
} from "@/lib/monitoring/client-error-reporter";

try {
  initializeClientErrorReporting();
} catch {
  // Instrumentation must not prevent hydration.
}

export function onRouterTransitionStart(url: string, navigationType: "push" | "replace" | "traverse") {
  try {
    recordRouterTransition(url, navigationType);
  } catch {
    // Monitoring failures must remain isolated from navigation.
  }
}
