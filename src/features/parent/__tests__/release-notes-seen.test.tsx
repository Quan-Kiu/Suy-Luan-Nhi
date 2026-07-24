import { render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it } from "vitest";
import {
  hasUnseenRelease,
  ReleaseNotesSeenMarker,
  useHasUnseenReleaseNotes,
} from "@/features/parent/release-notes-seen";

function Status({ version }: { version: string }) {
  const hasUnseen = useHasUnseenReleaseNotes(version);
  return <span>{hasUnseen ? "Mới" : "Đã xem"}</span>;
}

describe("parent release-note seen state", () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it("treats a different latest version as unseen", () => {
    expect(hasUnseenRelease("2026.07.24", null)).toBe(true);
    expect(hasUnseenRelease("2026.07.24", "2026.07.23")).toBe(true);
    expect(hasUnseenRelease("2026.07.24", "2026.07.24")).toBe(false);
  });

  it("marks a release as seen and updates listeners in the same tab", async () => {
    const { rerender } = render(
      <>
        <Status version="2026.07.24" />
      </>,
    );

    await waitFor(() => expect(screen.getByText("Mới")).toBeInTheDocument());

    rerender(
      <>
        <Status version="2026.07.24" />
        <ReleaseNotesSeenMarker version="2026.07.24" />
      </>,
    );

    await waitFor(() => expect(screen.getByText("Đã xem")).toBeInTheDocument());
  });
});
