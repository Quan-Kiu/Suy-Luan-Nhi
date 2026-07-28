type SessionClient = {
  browser: string;
  operatingSystem: string;
  deviceType: "desktop" | "mobile" | "tablet" | "unknown";
};

type MatchRule = { pattern: RegExp; label: string };

const browserRules: readonly MatchRule[] = [
  { pattern: /Edg\//i, label: "Microsoft Edge" },
  { pattern: /SamsungBrowser\//i, label: "Samsung Internet" },
  { pattern: /Firefox\//i, label: "Firefox" },
  { pattern: /CriOS\//i, label: "Chrome" },
  { pattern: /Chrome\//i, label: "Chrome" },
  { pattern: /Safari\//i, label: "Safari" },
];

const operatingSystemRules: readonly MatchRule[] = [
  { pattern: /Android/i, label: "Android" },
  { pattern: /iPhone|iPad|iPod/i, label: "iOS" },
  { pattern: /Windows NT/i, label: "Windows" },
  { pattern: /Mac OS X/i, label: "macOS" },
  { pattern: /Linux/i, label: "Linux" },
];

function firstMatch(value: string, rules: readonly MatchRule[], fallback: string) {
  return rules.find((rule) => rule.pattern.test(value))?.label ?? fallback;
}

function resolveDeviceType(userAgent: string): SessionClient["deviceType"] {
  if (/iPad|Tablet/i.test(userAgent)) return "tablet";
  if (/Mobile|Android|iPhone|iPod/i.test(userAgent)) return "mobile";
  if (/Windows NT|Mac OS X|Linux/i.test(userAgent)) return "desktop";
  return "unknown";
}

export function parseSessionClient(userAgent: string | null): SessionClient {
  if (!userAgent?.trim()) {
    return {
      browser: "Trình duyệt chưa xác định",
      operatingSystem: "Hệ điều hành chưa xác định",
      deviceType: "unknown",
    };
  }
  return {
    browser: firstMatch(userAgent, browserRules, "Trình duyệt khác"),
    operatingSystem: firstMatch(userAgent, operatingSystemRules, "Hệ điều hành khác"),
    deviceType: resolveDeviceType(userAgent),
  };
}

export function normalizeSessionIpAddress(ipAddress: string | null) {
  const value = ipAddress?.trim();
  if (!value) return null;
  return value.startsWith("::ffff:") ? value.slice("::ffff:".length) : value;
}
