---
name: motion-ui
description: Add purposeful, accessible Motion for React animations without causing layout shift or hiding loading and error states.
---

# Motion UI

Use this skill when adding animation, drawers, route transitions, list entrance effects, feedback states, or layout motion.

## Rules

- Use `motion` from `motion/react`; use `motion/react-client` only from Server Components.
- Keep `MotionConfig reducedMotion="user"` at the application provider boundary.
- Prefer opacity and small `y` transitions. Avoid large parallax, continuous motion, and decorative loops.
- Never animate in a way that delays navigation, form submission, loading, error, or success feedback.
- Use `AnimatePresence` only when elements actually enter or leave the React tree.
- Give every direct `AnimatePresence` child a stable, unique key.
- Use layout animation only for real reordering or size changes; do not add `layout` everywhere.
- Keep interaction durations around 160–240ms and page/list entrances around 220–360ms.
- Keep CSS transitions for simple color and shadow changes; use Motion for presence, gestures, sequencing, and layout.
- Test keyboard interaction, Escape handling, focus visibility, and reduced-motion behavior.
