"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useRef } from "react";
import { soundEffectRegistry, type SoundEffectDefinition, type SoundEffectId } from "@/domain/sound-effects";

type SoundEffectsContextValue = {
  enabled: boolean;
  celebrationsEnabled: boolean;
  play: (id: SoundEffectId) => Promise<boolean>;
  stopAll: () => void;
};

const SoundEffectsContext = createContext<SoundEffectsContextValue>({
  enabled: false,
  celebrationsEnabled: false,
  play: async () => false,
  stopAll: () => undefined,
});
const maxPoolSize = 3;

type AudioPool = Map<string, HTMLAudioElement[]>;

function createAudio(source: string, definition: SoundEffectDefinition) {
  const audio = new Audio(source);
  audio.preload = "auto";
  audio.volume = definition.volume;
  return audio;
}

function takeAudio(pool: AudioPool, source: string, definition: SoundEffectDefinition) {
  const entries = pool.get(source) ?? [];
  const available = entries.find((audio) => audio.paused || audio.ended);
  if (available) return available;

  if (entries.length < maxPoolSize) {
    const audio = createAudio(source, definition);
    entries.push(audio);
    pool.set(source, entries);
    return audio;
  }

  return entries[0];
}
export function SoundEffectsProvider({
  enabled,
  celebrationsEnabled,
  children,
}: {
  enabled: boolean;
  celebrationsEnabled: boolean;
  children: React.ReactNode;
}) {
  const poolRef = useRef<AudioPool>(new Map());
  const lastPlayedRef = useRef(new Map<SoundEffectId, number>());
  const sourceCursorRef = useRef(new Map<SoundEffectId, number>());

  const stopAll = useCallback(() => {
    for (const entries of poolRef.current.values()) {
      for (const audio of entries) {
        audio.pause();
        audio.currentTime = 0;
      }
    }
  }, []);

  const play = useCallback(
    async (id: SoundEffectId) => {
      const definition = soundEffectRegistry[id];
      if (!enabled) return false;
      if (definition.category === "celebration" && !celebrationsEnabled) return false;

      const now = Date.now();
      const lastPlayed = lastPlayedRef.current.get(id) ?? 0;
      if (now - lastPlayed < definition.cooldownMs) return false;
      lastPlayedRef.current.set(id, now);

      const cursor = sourceCursorRef.current.get(id) ?? 0;
      const source = definition.sources[cursor % definition.sources.length];
      sourceCursorRef.current.set(id, cursor + 1);
      const audio = takeAudio(poolRef.current, source, definition);
      audio.currentTime = 0;
      audio.volume = definition.volume;

      try {
        await audio.play();
        return true;
      } catch {
        return false;
      }
    },
    [celebrationsEnabled, enabled],
  );
  useEffect(() => {
    if (!enabled) {
      stopAll();
      return;
    }

    for (const definition of Object.values(soundEffectRegistry) as SoundEffectDefinition[]) {
      if (!definition.preload) continue;
      for (const source of definition.sources) {
        if (poolRef.current.has(source)) continue;
        const audio = createAudio(source, definition);
        poolRef.current.set(source, [audio]);
        audio.load();
      }
    }
  }, [enabled, stopAll]);

  useEffect(() => {
    const stopWhenHidden = () => {
      if (document.visibilityState === "hidden") stopAll();
    };
    document.addEventListener("visibilitychange", stopWhenHidden);
    return () => {
      document.removeEventListener("visibilitychange", stopWhenHidden);
      stopAll();
    };
  }, [stopAll]);

  const value = useMemo(
    () => ({ enabled, celebrationsEnabled, play, stopAll }),
    [celebrationsEnabled, enabled, play, stopAll],
  );

  return <SoundEffectsContext.Provider value={value}>{children}</SoundEffectsContext.Provider>;
}

export function useSoundEffects() {
  return useContext(SoundEffectsContext);
}
