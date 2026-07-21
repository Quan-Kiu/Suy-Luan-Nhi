"use client";

export default function GlobalError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <html lang="vi">
      <body>
        <main
          style={{
            minHeight: "100vh",
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
