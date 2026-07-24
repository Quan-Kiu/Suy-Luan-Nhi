import { describe, expect, it } from "vitest";
import {
  filterPublishedReleaseNotes,
  getLatestPublishedReleaseNote,
  type ReleaseNote,
} from "@/modules/release-notes/release-notes";

function note(version: string, publishedAt: string): ReleaseNote {
  return {
    version,
    publishedAt,
    title: version,
    summary: version,
    announcement: false,
    items: [],
  };
}

describe("release notes catalog", () => {
  it("filters future releases and orders published releases newest first", () => {
    const notes = [
      note("older", "2026-07-20T00:00:00Z"),
      note("future", "2026-08-01T00:00:00Z"),
      note("latest", "2026-07-24T00:00:00Z"),
    ];

    expect(filterPublishedReleaseNotes(notes, new Date("2026-07-25T00:00:00Z"))).toEqual([
      notes[2],
      notes[0],
    ]);
  });

  it("returns the current catalog release as the latest published entry", () => {
    expect(getLatestPublishedReleaseNote(new Date("2026-07-24T12:00:00+07:00"))?.version).toBe("2026.07.24");
  });
});
