"use client";

import { useEffect, useState } from "react";

const seenReleaseStorageKey = "sln.parent.seen-release-version";
const seenReleaseEvent = "sln:release-notes-seen";

type ReadableStorage = Pick<Storage, "getItem">;
type WritableStorage = Pick<Storage, "setItem">;

export function hasUnseenRelease(latestVersion: string | null, seenVersion: string | null) {
  return Boolean(latestVersion && latestVersion !== seenVersion);
}

export function readSeenReleaseVersion(storage: ReadableStorage): string | null {
  try {
    return storage.getItem(seenReleaseStorageKey);
  } catch {
    return null;
  }
}

export function writeSeenReleaseVersion(storage: WritableStorage, version: string): boolean {
  try {
    storage.setItem(seenReleaseStorageKey, version);
    return true;
  } catch {
    return false;
  }
}

export function markReleaseNotesSeen(version: string) {
  if (typeof window === "undefined") return;
  writeSeenReleaseVersion(window.localStorage, version);
  window.dispatchEvent(new CustomEvent(seenReleaseEvent, { detail: { version } }));
}

export function useHasUnseenReleaseNotes(latestVersion: string | null) {
  const [hasUnseen, setHasUnseen] = useState(false);

  useEffect(() => {
    function syncSeenState() {
      setHasUnseen(hasUnseenRelease(latestVersion, readSeenReleaseVersion(window.localStorage)));
    }

    function handleSeenEvent(event: Event) {
      const seenVersion = (event as CustomEvent<{ version?: string }>).detail?.version;
      if (seenVersion === latestVersion) setHasUnseen(false);
      else syncSeenState();
    }

    syncSeenState();
    window.addEventListener("storage", syncSeenState);
    window.addEventListener(seenReleaseEvent, handleSeenEvent);
    return () => {
      window.removeEventListener("storage", syncSeenState);
      window.removeEventListener(seenReleaseEvent, handleSeenEvent);
    };
  }, [latestVersion]);

  return hasUnseen;
}

export function ReleaseNotesSeenMarker({ version }: { version: string }) {
  useEffect(() => {
    markReleaseNotesSeen(version);
  }, [version]);

  return null;
}
