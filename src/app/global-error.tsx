"use client";

import { useEffect } from "react";
import { reportClientError } from "@/lib/monitoring/client-error-reporter";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    reportClientError(error, { source: "error_boundary", digest: error.digest });
  }, [error]);

  return (
    <html lang="vi">
      <body>
        <main
          style={{
            minHeight: "100svh",
            display: "grid",
            placeItems: "center",
            padding: 24,
            fontFamily: "system-ui",
          }}
        >
          <section style={{ maxWidth: 440, textAlign: "center" }}>
            <h1>Ứng dụng đang gặp chút trục trặc</h1>
            <p>Thông tin của gia đình vẫn được bảo vệ. Hãy tải lại trang.</p>
            <button onClick={reset} style={{ padding: "12px 20px", borderRadius: 12, fontWeight: 700 }}>
              Tải lại ứng dụng
            </button>
          </section>
        </main>
      </body>
    </html>
  );
}
