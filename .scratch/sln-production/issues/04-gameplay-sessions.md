# 04 — Deliver server-authoritative Mission Sessions

**What to build:** a child can start or resume a Mission, answer every supported question type, request hints, retry, exit, complete, and unlock rewards with all state persisted transactionally.

**Blocked by:** 03 — Persist the Mission catalog and creative seed content.

**Status:** done

- [x] Duplicate answer requests are idempotent and cannot double-award progress.
- [x] Attempts, response times, hints, Thinking Habits, stars, and badges are stored.
- [x] Gameplay reload and cross-device resume preserve the current question.
