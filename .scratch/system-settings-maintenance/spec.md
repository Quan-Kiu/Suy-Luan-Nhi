# System settings and maintenance

## Goal

Expose operational, non-secret settings in the super-admin dashboard and make them affect runtime behavior.

## Managed settings

- Maintenance enabled, title, and message.
- New account registration enabled.
- Parent resource library enabled.
- System feedback enabled.
- Maximum child profiles per family.
- Maximum feedback image attachments.
- Parent Gate maximum failed attempts, temporary lock duration, and unlocked-session duration.

## Safety boundaries

- SMTP, database, authentication secrets, Cloudinary credentials, and trusted origins remain environment-only.
- Mission review and child-safety invariants are not switchable.
- Admin/auth/health routes remain reachable during maintenance.
- Runtime settings use safe defaults when PostgreSQL is unavailable.

## Acceptance

- Settings appear without manually creating technical keys.
- Each saved value is schema-validated and audited.
- Maintenance blocks public, parent, and child routes while preserving admin access.
- Registration, resources, feedback, profile limits, and Parent Gate use the saved values.
