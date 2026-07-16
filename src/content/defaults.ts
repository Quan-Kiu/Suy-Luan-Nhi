import type { ContentDefinition } from "@/content/types";

const vi = "vi";

export const defaultContentEntries: ContentDefinition[] = [
  {
    namespace: "common",
    key: "brand.name",
    locale: vi,
    value: "Suy Luận Nhí",
    description: "Tên thương hiệu hiển thị toàn hệ thống.",
  },
  {
    namespace: "common",
    key: "brand.description",
    locale: vi,
    value: "Nhiệm vụ vui giúp bé luyện cách nghĩ an toàn và tích cực.",
    description: "Mô tả mặc định cho metadata và landing page.",
  },
  {
    namespace: "common",
    key: "actions.save",
    locale: vi,
    value: "Lưu thay đổi",
    description: "Nhãn nút lưu chung.",
  },
  {
    namespace: "common",
    key: "errors.generic",
    locale: vi,
    value: "Có lỗi xảy ra. Vui lòng thử lại.",
    description: "Thông báo lỗi chung.",
  },
  {
    namespace: "auth",
    key: "signIn.title",
    locale: vi,
    value: "Đăng nhập",
    description: "Tiêu đề màn hình đăng nhập.",
  },
  {
    namespace: "auth",
    key: "signIn.emailPlaceholder",
    locale: vi,
    value: "ba.me@example.com",
    description: "Placeholder email đăng nhập.",
  },
  {
    namespace: "auth",
    key: "signIn.passwordPlaceholder",
    locale: vi,
    value: "Nhập mật khẩu",
    description: "Placeholder mật khẩu đăng nhập.",
  },
  {
    namespace: "auth",
    key: "signUp.parentNamePlaceholder",
    locale: vi,
    value: "Ví dụ: Nguyễn Minh Anh",
    description: "Placeholder tên phụ huynh.",
  },
  {
    namespace: "profile",
    key: "create.namePlaceholder",
    locale: vi,
    value: "Ví dụ: Bống, Mít...",
    description: "Placeholder tên thân mật của bé.",
  },
  {
    namespace: "profile",
    key: "create.privacyTitle",
    locale: vi,
    value: "Chỉ thu thập điều thật sự cần",
    description: "Tiêu đề cam kết riêng tư khi tạo hồ sơ.",
  },
  {
    namespace: "parent",
    key: "gate.mathQuestion",
    locale: vi,
    value: "17 + 6 = ?",
    description: "Phép tính mặc định của Parent Gate.",
  },
  {
    namespace: "parent",
    key: "gate.answerPlaceholder",
    locale: vi,
    value: "Nhập kết quả",
    description: "Placeholder câu trả lời Parent Gate.",
  },
  {
    namespace: "gameplay",
    key: "actions.checkAnswer",
    locale: vi,
    value: "Kiểm tra đáp án",
    description: "Nhãn nút kiểm tra đáp án.",
  },
  {
    namespace: "gameplay",
    key: "actions.hint",
    locale: vi,
    value: "Cho con một gợi ý",
    description: "Nhãn nút lấy gợi ý.",
  },
  {
    namespace: "gameplay",
    key: "feedback.correctTitle",
    locale: vi,
    value: "Tuyệt vời!",
    description: "Tiêu đề phản hồi đúng.",
  },
  {
    namespace: "gameplay",
    key: "feedback.retryTitle",
    locale: vi,
    value: "Chưa trúng thôi!",
    description: "Tiêu đề phản hồi thử lại.",
  },
  {
    namespace: "admin",
    key: "content.title",
    locale: vi,
    value: "Quản lý nội dung hệ thống",
    description: "Tiêu đề trang Content Management.",
  },
  {
    namespace: "admin",
    key: "content.description",
    locale: vi,
    value: "Chỉnh sửa UI copy, thông báo và nội dung dùng chung mà không cần sửa component.",
    description: "Mô tả trang Content Management.",
  },
  {
    namespace: "admin",
    key: "content.valuePlaceholder",
    locale: vi,
    value: "Nhập chuỗi hoặc JSON hợp lệ",
    description: "Placeholder trình chỉnh sửa content value.",
  },
];

export function getDefaultContent(namespace: string, locale = vi) {
  return Object.fromEntries(
    defaultContentEntries
      .filter((entry) => entry.namespace === namespace && entry.locale === locale)
      .map((entry) => [entry.key, entry.value]),
  );
}
