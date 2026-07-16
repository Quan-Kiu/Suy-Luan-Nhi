# 02 — Persist Parent Account and Child Profile management

**What to build:** a signed-in parent can manage multiple Child Profiles, select an active profile, change PIN/settings, reset progress, export data, and request deletion.

**Blocked by:** 01 — Establish production identity and PostgreSQL foundation.

**Status:** done

- [x] Child Profile ownership is enforced on every read and mutation.
- [x] Parent PIN is hashed and lockout works after repeated failures.
- [x] Soft deletion, restore, export, and progress reset are auditable.
