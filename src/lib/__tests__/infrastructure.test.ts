import { describe, expect, it } from "vitest";
import { isDatabaseUnavailable } from "@/lib/infrastructure";

describe("isDatabaseUnavailable", () => {
  it("detects connection timeout errors nested by database clients", () => {
    const error = new Error("Failed query", {
      cause: new Error("Connection terminated due to connection timeout"),
    });

    expect(isDatabaseUnavailable(error)).toBe(true);
  });

  it("detects unexpected connection termination", () => {
    expect(isDatabaseUnavailable(new Error("Connection terminated unexpectedly"))).toBe(true);
  });

  it("does not hide application query errors", () => {
    expect(isDatabaseUnavailable(new Error("column does_not_exist does not exist"))).toBe(false);
  });
});
