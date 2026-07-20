import { afterEach, describe, expect, it, vi } from "vitest";
import { secureTokenEquals } from "@/modules/mcp/auth";
import { getMcpHttpConfig } from "@/modules/mcp/config";
import { fileFromBase64, isUnsafeAddress } from "@/modules/mcp/remote-file";

afterEach(() => vi.unstubAllEnvs());

describe("MCP gateway security", () => {
  it("compares equal-length bearer tokens without accepting a mismatch", () => {
    expect(secureTokenEquals("a".repeat(32), "a".repeat(32))).toBe(true);
    expect(secureTokenEquals("a".repeat(32), "b".repeat(32))).toBe(false);
    expect(secureTokenEquals("short", "a".repeat(32))).toBe(false);
  });

  it.each(["127.0.0.1", "10.0.0.8", "172.16.4.2", "192.168.1.1", "169.254.10.2", "::1", "fc00::1"])(
    "blocks private or reserved address %s",
    (address) => expect(isUnsafeAddress(address)).toBe(true),
  );

  it.each(["8.8.8.8", "1.1.1.1", "2606:4700:4700::1111"])("allows public address %s", (address) =>
    expect(isUnsafeAddress(address)).toBe(false),
  );

  it("builds a bounded File from encoded data", async () => {
    const file = fileFromBase64({
      base64: Buffer.from("hello").toString("base64"),
      fileName: "hello.txt",
      mimeType: "text/plain",
      maxBytes: 16,
    });
    expect(file.name).toBe("hello.txt");
    expect(file.size).toBe(5);
    expect(await file.text()).toBe("hello");
  });

  it("rejects encoded data over the configured byte limit", () => {
    expect(() =>
      fileFromBase64({
        base64: Buffer.from("too large").toString("base64"),
        fileName: "large.txt",
        mimeType: "text/plain",
        maxBytes: 4,
      }),
    ).toThrow(/exceeds/i);
  });

  it("only permits unauthenticated tunnel mode on loopback", () => {
    vi.stubEnv("BETTER_AUTH_SECRET", "x".repeat(32));
    vi.stubEnv("MCP_AUTH_MODE", "none");
    vi.stubEnv("MCP_HOST", "0.0.0.0");
    expect(() => getMcpHttpConfig()).toThrow(/loopback/i);
  });

  it("accepts unauthenticated tunnel mode on localhost", () => {
    vi.stubEnv("BETTER_AUTH_SECRET", "x".repeat(32));
    vi.stubEnv("MCP_AUTH_MODE", "none");
    vi.stubEnv("MCP_HOST", "127.0.0.1");
    expect(getMcpHttpConfig().MCP_AUTH_MODE).toBe("none");
  });
});
