export const queryKeys = {
  content: {
    all: ["content"] as const,
    namespace: (namespace: string, locale: string) => ["content", namespace, locale] as const,
  },
  children: {
    all: ["children"] as const,
    list: ["children", "list"] as const,
    avatars: ["children", "avatars"] as const,
    detail: (childId: string) => ["children", childId] as const,
    missionMap: (childId: string) => ["children", childId, "mission-map"] as const,
    noActiveMissionMap: ["children", "no-active-child", "mission-map"] as const,
    badges: (childId: string) => ["children", childId, "badges"] as const,
    noActiveBadges: ["children", "no-active-child", "badges"] as const,
  },
  feedback: {
    uploadConfig: ["feedback", "upload-config"] as const,
  },
  parent: {
    dashboard: ["parent", "dashboard"] as const,
    settings: ["parent", "settings"] as const,
    notifications: ["parent", "notifications"] as const,
  },
  admin: {
    content: ["admin", "content"] as const,
    media: ["admin", "media"] as const,
    mediaUploadPolicies: ["admin", "media", "upload-policies"] as const,
    resources: ["admin", "resources"] as const,
    worlds: ["admin", "worlds"] as const,
    badges: ["admin", "badges"] as const,
    taxonomy: ["admin", "taxonomy"] as const,
    missions: ["admin", "missions"] as const,
    feedback: ["admin", "feedback"] as const,
  },
} as const;
