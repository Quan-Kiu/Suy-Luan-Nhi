# Suy Luận Nhí domain context

## Product language

- **Child Profile**: a privacy-minimal profile containing a nickname, age group, avatar, mascot, and progress.
- **Mission World**: a themed collection of missions such as Thám tử Quy luật.
- **Mission**: a short, positive learning experience made of one or more questions.
- **Mission Session**: the child's current progress, attempts, hints, and completion state for one mission.
- **Thinking Habit**: a positive behavior such as observing, comparing, checking, or trying again.
- **Parent Gate**: an adult-only challenge that protects parent data and settings.
- **Safety Checklist**: mandatory review criteria that must pass before a mission can be published.
- **Child Renderer**: the shared rendering module used by child gameplay and admin preview.

## Invariants

- Child mode contains no advertising, external links, purchases, public rankings, open chat, or collection of sensitive child data.
- Wrong answers are treated as retry opportunities, never as punishment.
- Hints do not prevent completion or rewards.
- Published missions must have an age group, primary skill, answer, hint, positive feedback, cover image, and a complete Safety Checklist.
- Parent progress never compares a child with other children.
