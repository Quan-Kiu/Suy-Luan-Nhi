export const queryKeys = {
  content: {
    all: ["content"] as const,
    namespace: (namespace: string, locale: string) => ["content", namespace, locale] as const,
  },
  children: {
    all: ["children"] as const,
    detail: (childId: string) => ["children", childId] as const,
    missionMap: (childId: string) => ["children", childId, "mission-map"] as const,
    noActiveMissionMap: ["children", "no-active-child", "mission-map"] as const,
  },
  parent: {
    dashboard: ["parent", "dashboard"] as const,
    settings: ["parent", "settings"] as const,
    notifications: ["parent", "notifications"] as const,
  },
  admin: {
    content: ["admin", "content"] as const,
    media: ["admin", "media"] as const,
    resources: ["admin", "resources"] as const,
    worlds: ["admin", "worlds"] as const,
    taxonomy: ["admin", "taxonomy"] as const,
    missions: ["admin", "missions"] as const,
  },
} as const;
