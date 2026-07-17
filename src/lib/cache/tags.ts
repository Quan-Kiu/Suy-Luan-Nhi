export const cacheTags = {
  content: "content",
  parentResources: "parent-resources",
  parentSuggestions: "parent-suggestions",
  parentDashboard: (childId: string) => `parent-dashboard:${childId}`,
  parentNotifications: (parentProfileId: string) => `parent-notifications:${parentProfileId}`,
  publishedCatalog: "published-catalog",
  adminTaxonomy: "admin-taxonomy",
} as const;
