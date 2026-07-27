import { createHash } from "node:crypto";
import type { AutomaticErrorReportInput } from "@/domain/error-reporting";

function normalized(value: unknown) {
  if (value === undefined || value === null) return "";
  return String(value).trim().replaceAll(/\s+/g, " ").toLowerCase();
}

export function createAutomaticFeedbackFingerprint(report: AutomaticErrorReportInput) {
  const details = report.error.details;
  const signature = [
    report.pagePath,
    report.error.name,
    report.error.message,
    report.error.digest,
    details.method,
    details.path,
    details.status,
    details.code,
  ]
    .map(normalized)
    .join("\u001f");
  return createHash("md5").update(signature).digest("hex");
}
