# Admin and parent route cache

## Goal

Keep authenticated admin and parent navigation responsive by reusing recently visited dynamic page segments and TanStack Query data instead of showing route-level loading on every return visit.

## Acceptance criteria

- Dynamic App Router page segments remain in the browser cache for five minutes.
- TanStack Query data remains fresh for five minutes and collectible for thirty minutes.
- Admin list workspaces inherit the shared cache policy instead of refetching after thirty seconds.
- Browser coverage proves repeat navigation in admin and parent does not request the same RSC page again within the cache window.
