# Security and privacy threat model

## Protected assets

- Parent accounts and sessions
- Privacy-minimal Child Profiles
- Mission progress, attempts and badges
- Draft, reviewed and published content versions
- Uploaded images/audio and audit history

## Primary controls

| Threat                          | Control                                                                                                                                                                   |
| ------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Unauthorized parent data access | Better Auth session, ownership joins and Parent Gate on sensitive pages/APIs                                                                                              |
| Role escalation                 | Server-side RBAC on every admin route/API; role changes are audited; self-demotion and removal of the final active super admin are blocked in service and database layers |
| Banned account reuse            | Ban, session revocation and audit run in one transaction; API/page guards reject old sessions; auth hook and PostgreSQL trigger reject new sessions                       |
| Staff credential compromise     | TOTP plus backup codes is mandatory for staff by default, with trusted-device expiry and account lockout after repeated second-factor failures                            |
| CSRF/cross-origin mutation      | Same-origin mutation guard plus SameSite cookies                                                                                                                          |
| Duplicate rewards or sessions   | Partial unique DB index, idempotency keys and guarded transactional updates                                                                                               |
| Draft leaking to children       | Child catalog reads only immutable published mission versions                                                                                                             |
| Unsafe media publication        | MIME sniffing, size limits, required alt text and reviewer safety status                                                                                                  |
| Deleting referenced media       | Reference checks against missions, questions and active content snapshots                                                                                                 |
| Brute-force Parent Gate         | Scrypt PIN, attempt counter, timed lockout and signed HttpOnly gate cookie                                                                                                |
| Excessive child tracking        | No ads, location, contacts or public rankings; first-party event whitelist only                                                                                           |
| Data export/deletion abuse      | Session ownership, Parent Gate, expiring export request and super-admin deletion processing                                                                               |

## Residual risks and operational requirements

- Production must terminate TLS and keep HSTS enabled.
- SMTP and S3 credentials must be rotated and scoped to the application.
- Database backups contain private family data and must be encrypted with restricted access.
- Administrators must review audit logs and pending data requests regularly.
- Staff must store TOTP backup codes outside the application and report lost trusted devices immediately.
- Dependency advisories must be reviewed on every release; high/critical findings block CI.
