"use client";

import { childProfileSchema, type ChildProfile } from "@/domain/schemas";

const PROFILE_KEY = "sln.child-profile";
const PROFILE_CHANGE_EVENT = "sln:profile-change";

export function saveProfile(profile: ChildProfile) {
  const validatedProfile = childProfileSchema.parse(profile);
  window.localStorage.setItem(PROFILE_KEY, JSON.stringify(validatedProfile));
  window.dispatchEvent(new Event(PROFILE_CHANGE_EVENT));
}

export function getProfileSnapshot() {
  return window.localStorage.getItem(PROFILE_KEY) ?? "";
}

export function getProfileServerSnapshot() {
  return "";
}

export function subscribeToProfile(onStoreChange: () => void) {
  window.addEventListener("storage", onStoreChange);
  window.addEventListener(PROFILE_CHANGE_EVENT, onStoreChange);
  return () => {
    window.removeEventListener("storage", onStoreChange);
    window.removeEventListener(PROFILE_CHANGE_EVENT, onStoreChange);
  };
}
