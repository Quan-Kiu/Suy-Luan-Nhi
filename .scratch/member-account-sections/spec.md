# Member account sections

## Goal

Make the admin member page clearly separate parent accounts from staff accounts and expose how each account signs in.

## Requirements

- Render distinct "Ban quản trị" and "Phụ huynh" sections on desktop and mobile.
- Keep role and suspension actions working in both sections.
- Show whether an account uses email/password, Google, or both.
- Preserve unknown provider values in a readable fallback instead of hiding them.
- Keep current-user protections and staff MFA status visible.
- Update page copy so it describes all members, not only admin accounts.

## Acceptance

- A Google-only staff account is displayed under "Ban quản trị" with a "Google" badge.
- A credential parent account is displayed under "Phụ huynh" with an "Email & mật khẩu" badge.
- An account linked to both methods displays both badges.
- No member disappears when the list is partitioned.
- The page remains usable on mobile and desktop.
