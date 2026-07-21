import type { ContentValue } from "@/content/types";

export type ContentAreaMeta = {
  label: string;
  shortLabel: string;
  description: string;
  audience: "everyone" | "family" | "child" | "parent" | "staff";
};

const areaMeta: Record<string, ContentAreaMeta> = {
  common: {
    label: "Nội dung dùng chung",
    shortLabel: "Dùng chung",
    description: "Tên thương hiệu, trạng thái và thông báo xuất hiện ở nhiều nơi.",
    audience: "everyone",
  },
  landing: {
    label: "Trang giới thiệu",
    shortLabel: "Trang giới thiệu",
    description: "Nội dung người dùng thấy trước khi đăng nhập.",
    audience: "everyone",
  },
  auth: {
    label: "Đăng nhập và tài khoản",
    shortLabel: "Tài khoản",
    description: "Đăng nhập, đăng ký, quên và đặt lại mật khẩu.",
    audience: "family",
  },
  profile: {
    label: "Hồ sơ của bé",
    shortLabel: "Hồ sơ bé",
    description: "Tạo, chọn và chỉnh sửa hồ sơ dành cho bé.",
    audience: "family",
  },
  child: {
    label: "Khu vực của bé",
    shortLabel: "Khu vực bé",
    description: "Bản đồ nhiệm vụ, menu và hướng dẫn dành cho bé.",
    audience: "child",
  },
  gameplay: {
    label: "Trong nhiệm vụ",
    shortLabel: "Nhiệm vụ",
    description: "Nút thao tác, gợi ý và phản hồi khi bé làm nhiệm vụ.",
    audience: "child",
  },
  parent: {
    label: "Khu vực phụ huynh",
    shortLabel: "Phụ huynh",
    description: "Tổng quan, hoạt động, tài nguyên và cài đặt gia đình.",
    audience: "parent",
  },
  admin: {
    label: "Khu vực quản trị",
    shortLabel: "Quản trị",
    description: "Công việc soạn, duyệt và theo dõi nội dung.",
    audience: "staff",
  },
};
export const contentAreaOptions = Object.entries(areaMeta).map(([value, meta]) => ({ value, ...meta }));

const categoryLabels: Record<string, string> = {
  actions: "Nút và thao tác",
  activity: "Lịch sử hoạt động",
  brand: "Tên và giới thiệu",
  completion: "Hoàn thành nhiệm vụ",
  content: "Nội dung hiển thị",
  create: "Tạo mới",
  dashboard: "Trang tổng quan",
  edit: "Chỉnh sửa",
  errors: "Thông báo khi có lỗi",
  feedback: "Phản hồi cho bé",
  forgot: "Quên mật khẩu",
  gate: "Xác nhận phụ huynh",
  header: "Thanh điều hướng",
  hero: "Phần giới thiệu chính",
  hint: "Gợi ý",
  how: "Cách hoạt động",
  journey: "Hành trình",
  list: "Danh sách",
  media: "Hình ảnh, âm thanh và video",
  mission: "Nhiệm vụ",
  missionEditor: "Soạn nhiệm vụ",
  missions: "Danh sách nhiệm vụ",
  nav: "Menu điều hướng",
  navGroup: "Nhóm trong menu",
  reset: "Đặt lại mật khẩu",
  review: "Duyệt nội dung",
  reviews: "Danh sách chờ duyệt",
  safe: "An toàn cho bé",
  settings: "Cài đặt",
  shell: "Khung trang",
  signIn: "Đăng nhập",
  signUp: "Tạo tài khoản",
  states: "Trạng thái",
  taxonomy: "Nhóm tuổi và kỹ năng",
  world: "Chủ đề nhiệm vụ",
  general: "Nội dung khác",
};

export function getContentAreaMeta(namespace: string): ContentAreaMeta {
  return (
    areaMeta[namespace] ?? {
      label: "Khu vực khác",
      shortLabel: "Khu vực khác",
      description: "Nội dung chưa được xếp vào một khu vực quen thuộc.",
      audience: "staff",
    }
  );
}

export function getContentCategoryLabel(category: string) {
  return categoryLabels[category] ?? "Nội dung khác";
}
export type ContentPurpose = {
  label: string;
  help: string;
  editor: "singleLine" | "multiLine" | "structured";
};

function hasAny(value: string, terms: string[]) {
  const normalized = value.toLocaleLowerCase("vi");
  return terms.some((term) => normalized.includes(term));
}

export function getContentPurpose(key: string, value: ContentValue): ContentPurpose {
  const last = key.split(".").at(-1) ?? key;
  const signal = `${key}.${last}`;
  if (typeof value !== "string") {
    return {
      label: "Thiết lập có cấu trúc",
      help: "Dữ liệu này ảnh hưởng đến nhiều phần của giao diện và cần giữ đúng cấu trúc.",
      editor: "structured",
    };
  }
  if (hasAny(signal, ["placeholder"])) {
    return {
      label: "Gợi ý trong ô nhập",
      help: "Dòng chữ mờ giúp người dùng biết nên nhập nội dung gì.",
      editor: "singleLine",
    };
  }
  if (hasAny(signal, ["description", "subtitle", "intro", "body", "help", "hint"])) {
    return {
      label: "Nội dung giải thích",
      help: "Đoạn ngắn giúp người dùng hiểu mục đích hoặc bước tiếp theo.",
      editor: "multiLine",
    };
  }
  if (hasAny(signal, ["error", "failed", "invalid"])) {
    return {
      label: "Thông báo khi có lỗi",
      help: "Nói rõ điều gì chưa hoàn tất và người dùng cần làm gì để sửa.",
      editor: "multiLine",
    };
  }
  if (hasAny(signal, ["success", "saved", "complete", "created", "updated"])) {
    return {
      label: "Thông báo hoàn tất",
      help: "Xác nhận thao tác đã thực sự hoàn thành.",
      editor: "multiLine",
    };
  }
  if (hasAny(signal, ["alt", "imagealt"])) {
    return {
      label: "Mô tả hình ảnh",
      help: "Mô tả ngắn nội dung quan trọng trong hình cho người không nhìn thấy hình ảnh.",
      editor: "multiLine",
    };
  }
  if (hasAny(signal, ["title", "heading", "eyebrow"])) {
    return {
      label: "Tiêu đề",
      help: "Giúp người dùng nhận biết nhanh phần nội dung đang xem.",
      editor: "singleLine",
    };
  }
  if (hasAny(signal, ["label", "nav", "menu", "column", "status"])) {
    return {
      label: "Nhãn hiển thị",
      help: "Tên ngắn dùng cho trường nhập, menu, cột hoặc trạng thái.",
      editor: "singleLine",
    };
  }
  return {
    label: "Nút hoặc câu chữ ngắn",
    help: "Nội dung ngắn người dùng nhìn thấy khi thực hiện tác vụ.",
    editor: value.length > 90 ? "multiLine" : "singleLine",
  };
}
export function getContentLocationSummary(
  namespace: string,
  category: string,
  key: string,
  value: ContentValue,
) {
  const area = getContentAreaMeta(namespace);
  const purpose = getContentPurpose(key, value);
  return `${purpose.label} trong phần ${getContentCategoryLabel(category).toLocaleLowerCase("vi")} của ${area.label.toLocaleLowerCase("vi")}.`;
}

export function contentPreviewText(value: ContentValue) {
  if (typeof value === "string") return value;
  if (typeof value === "number" || typeof value === "boolean") return String(value);
  if (value === null) return "Không có nội dung";
  return JSON.stringify(value, null, 2);
}

export function contentHasTemplateVariables(value: ContentValue) {
  if (typeof value !== "string") return [];
  return [...value.matchAll(/\{([a-zA-Z0-9_]+)\}/g)].map((match) => match[1]);
}

export function getContentLengthGuidance(key: string, value: ContentValue) {
  if (typeof value !== "string") return null;
  const purpose = getContentPurpose(key, value);
  if (purpose.editor === "singleLine") return 80;
  if (purpose.label === "Thông báo khi có lỗi") return 180;
  return 320;
}
