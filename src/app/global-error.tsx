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
            <h1>Hệ thống đang cần một lần thử lại</h1>
            <p>Không có dữ liệu nhạy cảm nào được hiển thị trong thông báo lỗi.</p>
            <button onClick={reset} style={{ padding: "12px 20px", borderRadius: 12, fontWeight: 700 }}>
              Tải lại ứng dụng
            </button>
          </section>
        </main>
      </body>
    </html>
  );
}
