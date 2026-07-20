import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { SoundEffectsProvider, useSoundEffects } from "@/features/sound/sound-effects-provider";
import type { SoundEffectId } from "@/domain/sound-effects";

class MockAudio {
  static instances: MockAudio[] = [];
  src: string;
  preload = "";
  volume = 1;
  currentTime = 0;
  paused = true;
  ended = false;
  load = vi.fn();
  pause = vi.fn(() => {
    this.paused = true;
  });
  play = vi.fn(async () => {
    this.paused = false;
  });

  constructor(src: string) {
    this.src = src;
    MockAudio.instances.push(this);
  }
}
function PlayButton({ id }: { id: SoundEffectId }) {
  const sound = useSoundEffects();
  return (
    <button type="button" onClick={() => void sound.play(id)}>
      Play
    </button>
  );
}

function renderSound(id: SoundEffectId, enabled = true, celebrationsEnabled = true) {
  return render(
    <SoundEffectsProvider enabled={enabled} celebrationsEnabled={celebrationsEnabled}>
      <PlayButton id={id} />
    </SoundEffectsProvider>,
  );
}

beforeEach(() => {
  MockAudio.instances = [];
  vi.stubGlobal("Audio", MockAudio);
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("SoundEffectsProvider", () => {
  it("does not create or play audio when sound is disabled", async () => {
    renderSound("game.correct", false);
    await userEvent.click(screen.getByRole("button", { name: "Play" }));
    expect(MockAudio.instances).toHaveLength(0);
  });
  it("plays the mapped interaction sound", async () => {
    renderSound("game.correct");
    await userEvent.click(screen.getByRole("button", { name: "Play" }));
    const audio = MockAudio.instances.find((item) => item.src.endsWith("answer-correct.ogg"));
    expect(audio?.play).toHaveBeenCalledOnce();
    expect(audio?.volume).toBe(0.55);
  });

  it("keeps celebration sounds muted when celebration effects are disabled", async () => {
    renderSound("mission.complete", true, false);
    await userEvent.click(screen.getByRole("button", { name: "Play" }));
    expect(MockAudio.instances.some((item) => item.src.endsWith("mission-complete.ogg"))).toBe(false);
  });
});
