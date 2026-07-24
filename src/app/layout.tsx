import type { Metadata, Viewport } from "next";
import { Nunito } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/providers";
import { GlobalFeedbackWidget } from "@/features/feedback/global-feedback-widget";
import "@/lib/validation/zod-locale";

const appFont = Nunito({
  subsets: ["latin", "vietnamese"],
  display: "swap",
  variable: "--font-app",
  fallback: ["Arial", "sans-serif"],
});

export const metadata: Metadata = {
  title: "Suy Luận Nhí",
  description: "Nhiệm vụ vui giúp bé luyện cách nghĩ an toàn và tích cực.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#fffaf0",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="vi" className={appFont.variable} data-scroll-behavior="smooth">
      <body>
        <Providers>
          {children}
          <GlobalFeedbackWidget />
        </Providers>
      </body>
    </html>
  );
}
