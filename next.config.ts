import type { NextConfig } from "next";

const DYNAMIC_ROUTE_CACHE_SECONDS = 5 * 60;

const remotePatterns: NonNullable<NonNullable<NextConfig["images"]>["remotePatterns"]> = [];
if (process.env.S3_PUBLIC_BASE_URL) {
  const url = new URL(process.env.S3_PUBLIC_BASE_URL);
  remotePatterns.push({
    protocol: url.protocol === "http:" ? "http" : "https",
    hostname: url.hostname,
    port: url.port,
    pathname: `${url.pathname.replace(/\/$/, "")}/**`,
  });
}
if (process.env.CLOUDINARY_CLOUD_NAME) {
  remotePatterns.push({
    protocol: "https",
    hostname: "res.cloudinary.com",
    pathname: `/${process.env.CLOUDINARY_CLOUD_NAME}/**`,
  });
}

const securityHeaders = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), payment=(), usb=()" },
  { key: "Cross-Origin-Opener-Policy", value: "same-origin" },
  ...(process.env.NODE_ENV === "production"
    ? [{ key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" }]
    : []),
];

const nextConfig: NextConfig = {
  output: "standalone",
  poweredByHeader: false,
  compress: true,
  images: { remotePatterns },
  experimental: {
    serverActions: { bodySizeLimit: "2mb" },
    staleTimes: { dynamic: DYNAMIC_ROUTE_CACHE_SECONDS },
  },
  async headers() {
    return [{ source: "/(.*)", headers: securityHeaders }];
  },
};

export default nextConfig;
