import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Suy Luận Nhí",
    short_name: "Suy Luận Nhí",
    description: "Nhiệm vụ vui giúp bé luyện cách nghĩ an toàn và tích cực.",
    start_url: "/",
    display: "standalone",
    background_color: "#fffaf0",
    theme_color: "#e9641a",
    icons: [
      { src: "/assets/icons/icon-192.svg", sizes: "192x192", type: "image/svg+xml" },
      { src: "/assets/icons/icon-512.svg", sizes: "512x512", type: "image/svg+xml" },
      {
        src: "/assets/icons/icon-maskable-512.svg",
        sizes: "512x512",
        type: "image/svg+xml",
        purpose: "maskable",
      },
    ],
  };
}
