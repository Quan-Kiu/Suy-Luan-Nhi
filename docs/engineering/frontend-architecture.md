# Frontend Architecture

This document defines the required frontend patterns for Suy Luận Nhí. New code must preserve the separation between transport, domain data, forms, presentation, content, and routing.

## Module boundaries

- `src/api/**` contains typed browser API adapters.
- `src/lib/api/**` owns the shared Axios client, response-envelope parsing, and normalized request errors.
- `src/lib/query/**` owns QueryClient defaults and canonical query keys.
- `src/components/form/**` contains reusable React Hook Form fields and form states.
- `src/content/**` owns editable interface content and default fallbacks.
- `src/features/**` contains feature composition and user interaction.
- `src/modules/**` contains server-side domain and persistence logic.

UI modules must not query PostgreSQL, construct raw API URLs repeatedly, or know the custom API envelope format.

## Axios and API adapters

- Custom application APIs use the shared Axios `apiRequest` adapter.
- Components do not call `fetch`, parse envelopes, or duplicate authentication/error handling.
- Each domain has a focused adapter such as `mediaApi`, `reviewsApi`, or `childrenApi`; do not create a broad catch-all admin API.
- Adapters return domain-shaped data with explicit TypeScript types.
- Mutation responses should contain enough data to update the current UI immediately.
- Better Auth continues to use its official client; custom user fields are inferred from the server auth schema.

## TanStack Query

- Use canonical keys from `src/lib/query/keys.ts`; do not create anonymous array literals throughout features.
- Queries have explicit loading, error, empty, and success rendering.
- Mutations expose pending state on the exact control that initiated the action.
- Update local state or the Query cache from mutation responses. `router.refresh()` is secondary synchronization, not the primary UI state mechanism.
- Do not retry client errors. Shared QueryClient defaults decide retry and stale policies.

## React Hook Form

- Use Zod schemas with `zodResolver` at the form boundary.
- Prefer reusable `TextField`, `TextareaField`, `SelectField`, `CheckboxField`, `SubmitButton`, and `FormStatus` primitives.
- Use `FormProvider` for deep form sections and `useFieldArray` for repeatable domain collections.
- Do not mirror every input in `useState`; React Hook Form owns form state.
- Transform data through controlled field adapters when the displayed value differs from the domain value.
- Disable SSR-rendered forms until hydration when early typing could overwrite or concatenate controlled values.

## Interface content

- User-facing copy that product or content staff may change belongs in a namespace under `src/content/catalog/**`.
- Server Components use `getContentNamespace` with `contentText` or `contentTemplate`.
- Client Components use `useContent` with the same resolvers.
- Every editable key keeps a safe code fallback so public pages still render when PostgreSQL is unavailable.
- Validation messages, stable technical identifiers, security errors, and emergency error pages may remain in code.

## Layouts, loading, and cache

- Shared headers and navigation live in App Router layouts, not individual pages.
- Route-level `loading.tsx` files sit below persistent shells so only the changing main region suspends.
- Server data may use React request memoization and Next Data Cache when the ownership scope is explicit.
- Domain modules do not import `next/cache`. Route Handlers invalidate cache tags after successful mutations.
- Mutations requiring read-your-own-write use immediate tag expiry; stale-while-revalidate is reserved for data where stale reads are acceptable.
- Browser tests reset both PostgreSQL and Next Data Cache to keep test runs isolated.

## Motion and accessibility

- Motion is purposeful: navigation drawers, route entry, feedback, and card affordance.
- Global `MotionConfig` respects the user's reduced-motion preference.
- Avoid continuous decorative animation and layout-shifting effects.
- Interactive icons require accessible names, expanded state, controlled-region relationships, Escape handling, and keyboard focus visibility.

## Verification

Every frontend change must pass formatting, TypeScript, ESLint, unit tests, PostgreSQL integration, production build, and targeted browser acceptance. Run Playwright with one worker on local development machines to prevent resource contention.
