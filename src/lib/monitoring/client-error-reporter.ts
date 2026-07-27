import type {
  AutomaticErrorReportInput,
  AutomaticErrorReportSource,
  ErrorBreadcrumb,
  ErrorBreadcrumbCategory,
} from "@/domain/error-reporting";
import { normalizeUnknownError, redactErrorText, sanitizeRoutePath } from "@/domain/error-reporting";

const runtimeKey = "__slnAutomaticErrorReportingRuntime";
const consentEventName = "sln:error-reporting-consent";
const reportEndpoint = "/api/error-reports";
const maxBreadcrumbs = 20;
const maxPendingReports = 3;
const dedupeWindowMs = 5 * 60_000;
const dedupeStorageKey = "sln:automatic-error-fingerprints";
const reportedErrors = new WeakSet<object>();

type ConsentState = "unknown" | "granted" | "denied";

type RuntimeState = {
  initialized: boolean;
  consent: ConsentState;
  breadcrumbs: ErrorBreadcrumb[];
  pendingReports: AutomaticErrorReportInput[];
  recentFingerprints: Map<string, number>;
  consentRequestStarted: boolean;
  consentLastCheckedAt: number;
};

type MonitoringGlobal = typeof globalThis & {
  [runtimeKey]?: RuntimeState;
};

function getRuntime(): RuntimeState {
  const scope = globalThis as MonitoringGlobal;
  scope[runtimeKey] ??= {
    initialized: false,
    consent: "unknown",
    breadcrumbs: [],
    pendingReports: [],
    recentFingerprints: new Map(),
    consentRequestStarted: false,
    consentLastCheckedAt: 0,
  };
  return scope[runtimeKey];
}

function nowIso() {
  return new Date().toISOString();
}

function cleanBreadcrumbData(data: Record<string, unknown> | undefined) {
  const result: ErrorBreadcrumb["data"] = {};
  if (!data) return result;

  for (const [key, rawValue] of Object.entries(data).slice(0, 12)) {
    if (rawValue === null || typeof rawValue === "boolean" || typeof rawValue === "number") {
      result[key] = rawValue;
      continue;
    }
    if (typeof rawValue === "string") {
      result[key] = redactErrorText(rawValue, 500);
    }
  }
  return result;
}

export function addErrorBreadcrumb(
  category: ErrorBreadcrumbCategory,
  action: string,
  data?: Record<string, unknown>,
) {
  if (typeof window === "undefined") return;
  const runtime = getRuntime();
  if (runtime.consent !== "granted") return;
  runtime.breadcrumbs.push({
    timestamp: nowIso(),
    category,
    action: redactErrorText(action, 100) || "unknown",
    data: cleanBreadcrumbData(data),
  });
  if (runtime.breadcrumbs.length > maxBreadcrumbs) {
    runtime.breadcrumbs.splice(0, runtime.breadcrumbs.length - maxBreadcrumbs);
  }
}

export function markClientErrorAsReported(error: unknown) {
  if ((typeof error === "object" && error !== null) || typeof error === "function") {
    reportedErrors.add(error as object);
  }
}

export function wasClientErrorReported(error: unknown) {
  return (typeof error === "object" && error !== null) || typeof error === "function"
    ? reportedErrors.has(error as object)
    : false;
}

function normalizedFingerprintValue(value: unknown) {
  if (value === undefined || value === null) return "";
  return String(value).trim().replaceAll(/\s+/g, " ").toLowerCase();
}

function reportFingerprint(report: AutomaticErrorReportInput) {
  const details = report.error.details;
  return [
    report.pagePath,
    report.error.name,
    report.error.message,
    report.error.digest,
    details.method,
    details.path,
    details.status,
    details.code,
  ]
    .map(normalizedFingerprintValue)
    .join("\u001f");
}

function fingerprintHash(value: string) {
  let hash = 2166136261;
  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return (hash >>> 0).toString(16);
}

function readPersistedFingerprints() {
  if (typeof window === "undefined") return {} as Record<string, number>;
  try {
    const parsed = JSON.parse(window.localStorage.getItem(dedupeStorageKey) ?? "{}") as unknown;
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) return {};
    return Object.fromEntries(
      Object.entries(parsed).filter((entry): entry is [string, number] => typeof entry[1] === "number"),
    );
  } catch {
    return {};
  }
}

function persistFingerprints(values: Record<string, number>) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(dedupeStorageKey, JSON.stringify(values));
  } catch {
    // Storage may be unavailable in private browsing; in-memory dedupe remains active.
  }
}

function shouldSendReport(report: AutomaticErrorReportInput) {
  const runtime = getRuntime();
  const now = Date.now();
  const fingerprint = fingerprintHash(reportFingerprint(report));
  const persisted = readPersistedFingerprints();
  const previous = Math.max(runtime.recentFingerprints.get(fingerprint) ?? 0, persisted[fingerprint] ?? 0);
  runtime.recentFingerprints.set(fingerprint, now);
  persisted[fingerprint] = now;

  for (const [key, timestamp] of runtime.recentFingerprints) {
    if (now - timestamp > dedupeWindowMs * 4) runtime.recentFingerprints.delete(key);
  }
  for (const [key, timestamp] of Object.entries(persisted)) {
    if (now - timestamp > dedupeWindowMs * 4) delete persisted[key];
  }
  persistFingerprints(persisted);
  return now - previous > dedupeWindowMs;
}

async function sendReport(report: AutomaticErrorReportInput) {
  if (!shouldSendReport(report)) return;

  try {
    const response = await fetch(reportEndpoint, {
      method: "POST",
      credentials: "same-origin",
      keepalive: true,
      cache: "no-store",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify(report),
    });
    if (response.status === 401 || response.status === 403) {
      setClientErrorReportingConsent(false);
    }
  } catch {
    // Monitoring must never interfere with the application or create a reporting loop.
  }
}

function flushPendingReports() {
  const runtime = getRuntime();
  if (runtime.consent !== "granted") return;
  const pending = runtime.pendingReports.splice(0, maxPendingReports);
  for (const report of pending) void sendReport(report);
}

export function setClientErrorReportingConsent(enabled: boolean) {
  const runtime = getRuntime();
  const previousConsent = runtime.consent;
  runtime.consent = enabled ? "granted" : "denied";
  runtime.consentLastCheckedAt = Date.now();
  if (!enabled) {
    runtime.pendingReports = [];
    runtime.breadcrumbs = [];
    runtime.recentFingerprints.clear();
    if (typeof window !== "undefined") window.localStorage.removeItem(dedupeStorageKey);
  } else {
    if (previousConsent === "denied") runtime.breadcrumbs = [];
    flushPendingReports();
  }

  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent(consentEventName, { detail: enabled }));
  }
}

async function loadConsent(force = false) {
  const runtime = getRuntime();
  const consentIsFresh = Date.now() - runtime.consentLastCheckedAt < 60_000;
  if (runtime.consentRequestStarted || (!force && runtime.consent !== "unknown" && consentIsFresh)) return;
  runtime.consentRequestStarted = true;

  try {
    const response = await fetch(reportEndpoint, {
      method: "GET",
      credentials: "same-origin",
      cache: "no-store",
      headers: { Accept: "application/json" },
    });
    if (!response.ok) {
      runtime.consent = "denied";
      runtime.pendingReports = [];
      runtime.breadcrumbs = [];
      runtime.recentFingerprints.clear();
      return;
    }
    const payload = (await response.json()) as { data?: { enabled?: boolean }; enabled?: boolean };
    const enabled = payload.data?.enabled ?? payload.enabled ?? false;
    runtime.consent = enabled ? "granted" : "denied";
    runtime.consentLastCheckedAt = Date.now();
    if (enabled) flushPendingReports();
    else {
      runtime.pendingReports = [];
      runtime.breadcrumbs = [];
      runtime.recentFingerprints.clear();
    }
  } catch {
    runtime.consent = "denied";
    runtime.pendingReports = [];
    runtime.breadcrumbs = [];
    runtime.recentFingerprints.clear();
  } finally {
    runtime.consentRequestStarted = false;
  }
}

function buildReport(
  source: AutomaticErrorReportSource,
  error: unknown,
  options?: {
    digest?: string;
    details?: Record<string, unknown>;
    pagePath?: string;
  },
): AutomaticErrorReportInput {
  const normalized = normalizeUnknownError(error);
  return {
    source,
    pagePath: sanitizeRoutePath(options?.pagePath ?? window.location.href),
    error: {
      ...normalized,
      digest: options?.digest ? redactErrorText(options.digest, 300) : undefined,
      details: cleanBreadcrumbData(options?.details),
    },
    breadcrumbs: [...getRuntime().breadcrumbs],
    viewportWidth: window.innerWidth || undefined,
    viewportHeight: window.innerHeight || undefined,
    devicePixelRatio: window.devicePixelRatio || undefined,
  };
}

export function reportClientError(
  error: unknown,
  options?: {
    source?: AutomaticErrorReportSource;
    digest?: string;
    details?: Record<string, unknown>;
    pagePath?: string;
  },
) {
  if (typeof window === "undefined") return;
  const runtime = getRuntime();
  const report = buildReport(options?.source ?? "window_error", error, options);

  if (runtime.consent === "granted") {
    void sendReport(report);
    return;
  }
  if (runtime.consent === "unknown" && runtime.pendingReports.length < maxPendingReports) {
    runtime.pendingReports.push(report);
    void loadConsent();
  }
}

export function reportApiFailure(input: {
  method?: string;
  url?: string;
  status?: number;
  code?: string;
  requestId?: string;
}) {
  if (typeof window === "undefined") return;
  const path = sanitizeRoutePath(input.url ?? window.location.pathname);
  if (path === reportEndpoint) return;
  if (input.code === "ERR_CANCELED") return;
  if (typeof input.status === "number" && input.status < 500) return;

  const method = (input.method || "GET").toUpperCase();
  addErrorBreadcrumb("request", "api.failed", {
    method,
    path,
    status: input.status ?? null,
    code: input.code ?? null,
    requestId: input.requestId ?? null,
  });
  reportClientError(new Error(`API ${method} ${path} thất bại`), {
    source: "api_failure",
    details: {
      method,
      path,
      status: input.status ?? null,
      code: input.code ?? null,
      requestId: input.requestId ?? null,
    },
  });
}

function readInteractiveTarget(target: EventTarget | null) {
  if (!(target instanceof Element)) return null;
  return target.closest<HTMLElement>(
    "button, a, input, select, textarea, [role='button'], [role='link'], [role='menuitem']",
  );
}

function interactionBreadcrumb(event: MouseEvent) {
  const target = readInteractiveTarget(event.target);
  if (!target || target.closest("[data-feedback-ui]") || target.closest("[data-error-report-private]"))
    return;

  const data: Record<string, unknown> = {
    element: target.tagName.toLowerCase(),
    role: target.getAttribute("role") || null,
    inputType: target instanceof HTMLInputElement ? target.type : null,
  };
  const explicitAction = target.dataset.errorAction;
  if (explicitAction) data.monitorAction = explicitAction;
  if (target instanceof HTMLAnchorElement && target.href) data.destination = sanitizeRoutePath(target.href);
  addErrorBreadcrumb("interaction", "click", data);
}

function submitBreadcrumb(event: SubmitEvent) {
  if (!(event.target instanceof HTMLFormElement) || event.target.closest("[data-error-report-private]"))
    return;
  addErrorBreadcrumb("interaction", "form.submit", {
    method: (event.target.method || "get").toUpperCase(),
    action: sanitizeRoutePath(event.target.action || window.location.pathname),
  });
}

function handleWindowError(event: ErrorEvent) {
  reportClientError(event.error ?? event.message, { source: "window_error" });
}

function handleUnhandledRejection(event: PromiseRejectionEvent) {
  if (wasClientErrorReported(event.reason)) return;
  reportClientError(event.reason, { source: "unhandled_rejection" });
}

export function initializeClientErrorReporting() {
  if (typeof window === "undefined") return;
  const runtime = getRuntime();
  if (runtime.initialized) return;
  runtime.initialized = true;

  addErrorBreadcrumb("lifecycle", "monitoring.initialized", {
    path: sanitizeRoutePath(window.location.pathname),
  });
  window.addEventListener("error", handleWindowError);
  window.addEventListener("unhandledrejection", handleUnhandledRejection);
  document.addEventListener("click", interactionBreadcrumb, true);
  document.addEventListener("submit", submitBreadcrumb, true);
  window.addEventListener(consentEventName, ((event: CustomEvent<boolean>) => {
    const state = getRuntime();
    state.consent = event.detail ? "granted" : "denied";
    state.consentLastCheckedAt = Date.now();
    if (event.detail) flushPendingReports();
  }) as EventListener);
  window.addEventListener("focus", () => void loadConsent());
  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "visible") void loadConsent();
  });

  void loadConsent();
}

export function recordRouterTransition(url: string, navigationType: string) {
  addErrorBreadcrumb("navigation", "route.transition", {
    path: sanitizeRoutePath(url),
    navigationType,
  });
  void loadConsent();
}
