# Suy Luận Nhí — SLN-GPT

MVP tương tác cho sản phẩm học suy luận an toàn dành cho trẻ em, được dựng từ SPEC, 10 ảnh tham chiếu và bộ assets đi kèm.

## Công nghệ

- Next.js 16 App Router, React 19, TypeScript
- Tailwind CSS 4
- Zod cho domain validation và API boundaries
- React Hook Form cho onboarding và CMS
- TanStack Query cho server-state và mutations
- Vitest + Testing Library cho unit/component tests
- Playwright cho end-to-end acceptance tests

## Chạy dự án

```bash
npm install
npm run dev
```

Mặc định ứng dụng chạy tại `http://localhost:3000`.

## Các route chính

| Route                           | Chức năng                                  |
| ------------------------------- | ------------------------------------------ |
| `/`                             | Landing page và cam kết an toàn            |
| `/onboarding`                   | Tạo Child Profile tối giản dữ liệu         |
| `/profiles`                     | Chọn hồ sơ quay lại                        |
| `/missions`                     | Bản đồ Mission Worlds                      |
| `/missions/footprint-detective` | Chi tiết nhiệm vụ mẫu                      |
| `/play`                         | Gameplay, hint, retry và feedback tích cực |
| `/complete`                     | Hoàn thành và nhận huy hiệu                |
| `/parent`                       | Parent Gate và dashboard tiến độ           |
| `/admin/missions`               | CMS chỉnh sửa, preview và gửi duyệt        |

## Kiểm tra chất lượng

```bash
npm run format:check
npm run lint
npm run typecheck
npm run test
npm run build
npm run test:e2e
```

`npm run check` chạy format, lint, typecheck, unit tests và production build. `npm run verify` chạy thêm Playwright E2E.

## Kiến trúc

- `src/domain/`: Zod schemas, domain types và nội dung MVP.
- `src/features/`: các vertical slices onboarding, gameplay, parent và admin.
- `src/components/question-renderer.tsx`: Child Renderer dùng chung cho gameplay và CMS preview.
- `src/lib/profile-store.ts`, `src/lib/progress-store.ts`: local-first adapters có validation và recovery.
- `src/app/api/`: route-handler boundaries để UI không phụ thuộc trực tiếp vào persistence.
- `CONTEXT.md`, `docs/adr/`: ngôn ngữ domain và quyết định kiến trúc.
- `.scratch/sln-gpt-mvp/`: spec đã chuẩn hóa và local implementation tickets theo workflow Matt Pocock.
- `_bmad-output/implementation-artifacts/reviews/`: kết quả review BMAD.

## Dữ liệu MVP

Child Profile và tiến độ demo được lưu trong `localStorage`. Đây là lựa chọn local-first có chủ đích; production authentication, database, cloud sync và server-side parent authorization nằm ngoài phạm vi MVP hiện tại.

## Assets và nguồn tham chiếu

- Assets runtime: `public/assets/`
- SPEC gốc: `starter/source/SPEC.md`
- Screenshots gốc: `starter/screenshots/`
