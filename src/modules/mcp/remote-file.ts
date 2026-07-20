import { promises as dns } from "node:dns";
import { isIP } from "node:net";

const privateIpv4Ranges: Array<[number, number]> = [
  [0x00000000, 8],
  [0x0a000000, 8],
  [0x64400000, 10],
  [0x7f000000, 8],
  [0xa9fe0000, 16],
  [0xac100000, 12],
  [0xc0000000, 24],
  [0xc0000200, 24],
  [0xc0a80000, 16],
  [0xc6120000, 15],
  [0xc6336400, 24],
  [0xcb007100, 24],
  [0xe0000000, 4],
  [0xf0000000, 4],
];

function ipv4ToNumber(address: string) {
  return address
    .split(".")
    .map(Number)
    .reduce((result, part) => ((result << 8) | part) >>> 0, 0);
}

function inIpv4Range(address: string, base: number, prefix: number) {
  const mask = prefix === 0 ? 0 : (0xffffffff << (32 - prefix)) >>> 0;
  return (ipv4ToNumber(address) & mask) === (base & mask);
}

export function isUnsafeAddress(address: string): boolean {
  const version = isIP(address);
  if (version === 4) {
    return privateIpv4Ranges.some(([base, prefix]) => inIpv4Range(address, base, prefix));
  }
  if (version === 6) {
    const normalized = address.toLowerCase();
    if (normalized === "::" || normalized === "::1") return true;
    if (normalized.startsWith("fc") || normalized.startsWith("fd")) return true;
    if (/^fe[89ab]/.test(normalized)) return true;
    if (normalized.startsWith("ff")) return true;
    const mapped = normalized.match(/::ffff:(\d+\.\d+\.\d+\.\d+)$/)?.[1];
    return mapped ? isUnsafeAddress(mapped) : false;
  }
  return true;
}

async function assertPublicHostname(hostname: string) {
  if (hostname === "localhost" || hostname.endsWith(".localhost")) {
    throw new Error("Localhost URLs are not allowed");
  }
  const addresses = await dns.lookup(hostname, { all: true, verbatim: true });
  if (!addresses.length || addresses.some((item) => isUnsafeAddress(item.address))) {
    throw new Error("Remote URL resolves to a private or reserved address");
  }
}

function safeFileName(value: string) {
  const decoded = decodeURIComponent(value || "upload");
  return decoded.replace(/[^A-Za-z0-9._-]+/g, "-").slice(0, 120) || "upload";
}

async function readLimitedBody(response: Response, maxBytes: number) {
  if (!response.body) throw new Error("Remote response has no body");
  const reader = response.body.getReader();
  const chunks: Uint8Array[] = [];
  let size = 0;
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    size += value.byteLength;
    if (size > maxBytes) {
      await reader.cancel();
      throw new Error(`Remote file exceeds ${maxBytes} bytes`);
    }
    chunks.push(value);
  }
  return Buffer.concat(
    chunks.map((chunk) => Buffer.from(chunk)),
    size,
  );
}

export async function fileFromRemoteUrl(
  sourceUrl: string,
  options: { maxBytes: number; timeoutMs: number; fileName?: string },
) {
  let current = new URL(sourceUrl);
  for (let redirect = 0; redirect <= 2; redirect += 1) {
    if (current.protocol !== "https:") throw new Error("Only HTTPS remote URLs are allowed");
    await assertPublicHostname(current.hostname);
    const response = await fetch(current, {
      redirect: "manual",
      signal: AbortSignal.timeout(options.timeoutMs),
      headers: { Accept: "image/*,audio/*,video/*" },
    });
    if (response.status >= 300 && response.status < 400) {
      const location = response.headers.get("location");
      if (!location || redirect === 2) throw new Error("Remote URL has too many redirects");
      current = new URL(location, current);
      continue;
    }
    if (!response.ok) throw new Error(`Remote file request failed with ${response.status}`);
    const contentLength = Number(response.headers.get("content-length") || 0);
    if (contentLength > options.maxBytes) throw new Error(`Remote file exceeds ${options.maxBytes} bytes`);
    const mimeType =
      response.headers.get("content-type")?.split(";")[0]?.trim() || "application/octet-stream";
    const bytes = await readLimitedBody(response, options.maxBytes);
    const fileName = safeFileName(options.fileName ?? current.pathname.split("/").pop() ?? "upload");
    return new File([bytes], fileName, { type: mimeType });
  }
  throw new Error("Remote file could not be downloaded");
}

export function fileFromBase64(input: {
  base64: string;
  fileName: string;
  mimeType: string;
  maxBytes: number;
}) {
  const encoded = input.base64.replace(/^data:[^;]+;base64,/, "").replace(/\s/g, "");
  const bytes = Buffer.from(encoded, "base64");
  if (!bytes.length) throw new Error("Base64 payload is empty or invalid");
  if (bytes.length > input.maxBytes) throw new Error(`Base64 file exceeds ${input.maxBytes} bytes`);
  return new File([bytes], safeFileName(input.fileName), { type: input.mimeType });
}
