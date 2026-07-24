# Automatic error reporting

## Goal

Allow a parent to explicitly opt in to privacy-minimal automatic error reports. When enabled, unexpected client errors and failed server requests are stored as system feedback with a short, redacted breadcrumb trail so developers can reproduce and fix issues.

## Privacy requirements

- Opt-in is off by default.
- Reports are accepted only for an authenticated family whose parent profile currently has `privacySettings.errorReporting=true`.
- Never capture input values, form payloads, cookies, authorization headers, query strings, screenshots, child profile names, or typed content.
- Redact emails, access-like tokens, UUIDs, and long numeric values from error messages/stacks.
- Breadcrumbs contain only route paths, navigation type, generic interactive element metadata, and API method/status/request ID.
- Automatic reports use the existing admin feedback workflow and are visibly marked as automatic.
- Rate-limit and deduplicate reports to prevent loops and noise.

## Acceptance criteria

1. Parent settings show separate toggles for anonymous usage analytics and automatic error reports.
2. Saving the error-report setting updates the active browser consent without requiring a reload.
3. Client monitoring initializes before hydration, records privacy-safe breadcrumbs, and catches `error`, `unhandledrejection`, error-boundary errors, and unexpected API failures.
4. The API rechecks server-side consent before accepting a report.
5. Accepted reports appear in `/admin/feedback` with technical details and breadcrumbs.
6. Unit tests cover redaction, payload normalization, disabled consent, and schema validation.
