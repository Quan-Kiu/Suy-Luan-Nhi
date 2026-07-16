"use client";

import { z } from "zod";

const COMPLETE_KEY = "sln.completed-missions";
const PROGRESS_CHANGE_EVENT = "sln:progress-change";
const completedMissionIdsSchema = z.array(z.string().min(1));

function parseCompletedMissionIds(rawValue: string | null) {
  if (!rawValue) return [];
  try {
    const result = completedMissionIdsSchema.safeParse(JSON.parse(rawValue));
    return result.success ? [...new Set(result.data)] : [];
  } catch {
    return [];
  }
}

export function getCompletedMissionIds() {
  return parseCompletedMissionIds(window.localStorage.getItem(COMPLETE_KEY));
}

export function markMissionComplete(missionId: string) {
  const completed = new Set(getCompletedMissionIds());
  completed.add(missionId);
  try {
    window.localStorage.setItem(COMPLETE_KEY, JSON.stringify([...completed]));
    window.dispatchEvent(new Event(PROGRESS_CHANGE_EVENT));
    return true;
  } catch {
    return false;
  }
}

export function getProgressSnapshot() {
  return JSON.stringify(getCompletedMissionIds());
}

export function getProgressServerSnapshot() {
  return "[]";
}

export function subscribeToProgress(onStoreChange: () => void) {
  window.addEventListener("storage", onStoreChange);
  window.addEventListener(PROGRESS_CHANGE_EVENT, onStoreChange);
  return () => {
    window.removeEventListener("storage", onStoreChange);
    window.removeEventListener(PROGRESS_CHANGE_EVENT, onStoreChange);
  };
}
