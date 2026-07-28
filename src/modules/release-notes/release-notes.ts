export const releaseNoteKinds = ["feature", "improvement", "fix", "security"] as const;

export type ReleaseNoteKind = (typeof releaseNoteKinds)[number];

export type ReleaseNoteItem = {
  kind: ReleaseNoteKind;
  title: string;
  description: string;
};

export type ReleaseNote = {
  version: string;
  title: string;
  summary: string;
  publishedAt: string;
  announcement: boolean;
  items: readonly ReleaseNoteItem[];
};

export const releaseNotes = [
  {
    version: "2026.07.28",
    title: "Bảo mật tài khoản rõ ràng hơn",
    summary:
      "Ba mẹ có thể kiểm tra các thiết bị đang đăng nhập và chủ động đăng xuất phiên không còn sử dụng.",
    publishedAt: "2026-07-28T15:00:00+07:00",
    announcement: true,
    items: [
      {
        kind: "security",
        title: "Kiểm tra thiết bị đang đăng nhập",
        description:
          "Trang cài đặt hiển thị trình duyệt, hệ điều hành, địa chỉ IP và thời hạn của từng phiên đăng nhập.",
      },
      {
        kind: "security",
        title: "Đăng xuất thiết bị lạ",
        description:
          "Ba mẹ có thể đăng xuất một thiết bị hoặc tất cả thiết bị khác mà không làm gián đoạn phiên đang dùng.",
      },
      {
        kind: "improvement",
        title: "Thông tin bảo mật dễ hiểu hơn",
        description:
          "Trạng thái xác minh email, xác thực hai lớp và cách đăng nhập được trình bày cùng một nơi.",
      },
    ],
  },
  {
    version: "2026.07.24",
    title: "Các thay đổi mới nhất",
    summary:
      "Bổ sung khả năng đặt lại mã PIN, cải thiện trải nghiệm trên điện thoại và tăng độ ổn định khi hiển thị dữ liệu.",
    publishedAt: "2026-07-24T08:00:00+07:00",
    announcement: true,
    items: [
      {
        kind: "feature",
        title: "Khôi phục mã PIN phụ huynh",
        description: "Ba mẹ có thể đặt lại mã PIN bằng luồng xác minh an toàn khi không còn nhớ mã cũ.",
      },
      {
        kind: "improvement",
        title: "Điều hướng thuận tiện hơn trên điện thoại",
        description:
          "Các lối tắt quan trọng được sắp xếp rõ ràng hơn và giữ vùng chạm phù hợp trên màn hình nhỏ.",
      },
      {
        kind: "fix",
        title: "Dữ liệu mới hiển thị ổn định hơn",
        description:
          "Cải thiện việc làm mới hồ sơ, huy hiệu và nội dung sau khi ba mẹ hoặc bé hoàn tất thao tác.",
      },
      {
        kind: "security",
        title: "Xử lý phiên đăng nhập hết hạn rõ ràng",
        description:
          "Khi phiên không còn hợp lệ, hệ thống đưa người dùng về đăng nhập thay vì để màn hình ở trạng thái lỗi.",
      },
    ],
  },
] satisfies readonly ReleaseNote[];

export function filterPublishedReleaseNotes(notes: readonly ReleaseNote[], now: Date): ReleaseNote[] {
  const currentTime = now.getTime();
  return notes
    .filter((note) => {
      const publishedTime = Date.parse(note.publishedAt);
      return Number.isFinite(publishedTime) && publishedTime <= currentTime;
    })
    .toSorted((left, right) => Date.parse(right.publishedAt) - Date.parse(left.publishedAt));
}

export function listPublishedReleaseNotes(now = new Date()): ReleaseNote[] {
  return filterPublishedReleaseNotes(releaseNotes, now);
}

export function getLatestPublishedReleaseNote(now = new Date()): ReleaseNote | null {
  return listPublishedReleaseNotes(now)[0] ?? null;
}
