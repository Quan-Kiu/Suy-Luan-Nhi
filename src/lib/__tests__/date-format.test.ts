import { describe, expect, it } from "vitest";
import {
  displayDateToIso,
  formatVietnamDateTime,
  isoDateToDisplay,
  maskDisplayDate,
  normalizeDateQuery,
} from "@/lib/date-format";

describe("date format helpers", () => {
  it("masks and converts dd/mm/yyyy dates", () => {
    expect(maskDisplayDate("01072026")).toBe("01/07/2026");
    expect(displayDateToIso("01/07/2026")).toBe("2026-07-01");
    expect(isoDateToDisplay("2026-07-01")).toBe("01/07/2026");
  });

  it("rejects invalid calendar dates and normalizes query values", () => {
    expect(displayDateToIso("31/02/2026")).toBeNull();
    expect(normalizeDateQuery("31/02/2026")).toBeUndefined();
    expect(normalizeDateQuery("2026-07-20")).toBe("2026-07-20");
  });

  it("formats activity timestamps consistently for Vietnam", () => {
    expect(formatVietnamDateTime("2026-07-20T13:32:00.000Z")).toBe("20:32 · 20/07/2026");
  });
});
