export const soundEffectIds = [
  "ui.select",
  "game.correct",
  "game.retry",
  "game.hint",
  "game.dragPickup",
  "game.dragDrop",
  "game.sortMove",
  "mission.locked",
  "mission.complete",
  "reward.badge",
] as const;

export type SoundEffectId = (typeof soundEffectIds)[number];
export type SoundEffectCategory = "interaction" | "celebration";

export type SoundEffectDefinition = {
  sources: readonly string[];
  volume: number;
  category: SoundEffectCategory;
  cooldownMs: number;
  preload?: boolean;
};
export const soundEffectRegistry = {
  "ui.select": {
    sources: ["/audio/sfx/kenney/ui-select-1.ogg", "/audio/sfx/kenney/ui-select-2.ogg"],
    volume: 0.35,
    category: "interaction",
    cooldownMs: 45,
    preload: true,
  },
  "game.correct": {
    sources: ["/audio/sfx/kenney/answer-correct.ogg"],
    volume: 0.55,
    category: "interaction",
    cooldownMs: 250,
    preload: true,
  },
  "game.retry": {
    sources: ["/audio/sfx/kenney/answer-retry.ogg"],
    volume: 0.42,
    category: "interaction",
    cooldownMs: 250,
    preload: true,
  },
  "game.hint": {
    sources: ["/audio/sfx/kenney/hint-reveal.ogg"],
    volume: 0.42,
    category: "interaction",
    cooldownMs: 300,
    preload: true,
  },
  "game.dragPickup": {
    sources: ["/audio/sfx/kenney/drag-pickup.ogg"],
    volume: 0.3,
    category: "interaction",
    cooldownMs: 80,
  },
  "game.dragDrop": {
    sources: ["/audio/sfx/kenney/drag-drop.ogg"],
    volume: 0.38,
    category: "interaction",
    cooldownMs: 100,
  },
  "game.sortMove": {
    sources: ["/audio/sfx/kenney/sort-move.ogg"],
    volume: 0.34,
    category: "interaction",
    cooldownMs: 80,
  },
  "mission.locked": {
    sources: ["/audio/sfx/kenney/mission-locked.ogg"],
    volume: 0.34,
    category: "interaction",
    cooldownMs: 500,
  },
  "mission.complete": {
    sources: ["/audio/sfx/kenney/mission-complete.ogg"],
    volume: 0.48,
    category: "celebration",
    cooldownMs: 1_000,
  },
  "reward.badge": {
    sources: ["/audio/sfx/kenney/badge-unlock.ogg"],
    volume: 0.46,
    category: "celebration",
    cooldownMs: 1_000,
  },
} satisfies Record<SoundEffectId, SoundEffectDefinition>;
