export type AccountMethod = {
  providerId: string;
  label: string;
};

const providerLabels: Record<string, string> = {
  credential: "Email & mật khẩu",
  google: "Google",
};

const providerOrder = ["credential", "google"];

function readableProviderName(providerId: string) {
  return providerId.replaceAll(/[_-]+/g, " ").replaceAll(/\b\w/g, (letter) => letter.toUpperCase());
}

export function getAccountMethods(providerIds: readonly string[]): AccountMethod[] {
  const uniqueProviderIds = [...new Set(providerIds.filter(Boolean))].sort((left, right) => {
    const leftIndex = providerOrder.indexOf(left);
    const rightIndex = providerOrder.indexOf(right);
    if (leftIndex === -1 && rightIndex === -1) return left.localeCompare(right);
    if (leftIndex === -1) return 1;
    if (rightIndex === -1) return -1;
    return leftIndex - rightIndex;
  });

  if (!uniqueProviderIds.length) {
    return [{ providerId: "unknown", label: "Chưa xác định" }];
  }

  return uniqueProviderIds.map((providerId) => ({
    providerId,
    label: providerLabels[providerId] ?? readableProviderName(providerId),
  }));
}

export function partitionMembersByAccess<T extends { role: string }>(items: readonly T[]) {
  return {
    staff: items.filter((item) => item.role !== "parent"),
    parents: items.filter((item) => item.role === "parent"),
  };
}
