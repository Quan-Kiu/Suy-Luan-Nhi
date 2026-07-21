import { z } from "zod";

export const managedSystemSettingKeys = [
  "maintenance.enabled",
  "maintenance.title",
  "maintenance.message",
  "features.registrationEnabled",
  "features.parentResourcesEnabled",
  "features.feedbackEnabled",
  "limits.maxChildProfiles",
  "limits.feedbackMaxAttachments",
  "security.parentGateMaxAttempts",
  "security.parentGateLockMinutes",
  "security.parentGateSessionMinutes",
] as const;

export type ManagedSystemSettingKey = (typeof managedSystemSettingKeys)[number];
export type SystemSettingGroup = "maintenance" | "features" | "limits" | "security";
export type ManagedSystemSettingKind = "boolean" | "number" | "text";

export type ManagedSystemSettingDefinition = {
  key: ManagedSystemSettingKey;
  group: SystemSettingGroup;
  label: string;
  description: string;
  kind: ManagedSystemSettingKind;
  defaultValue: boolean | number | string;
  schema: z.ZodType<boolean | number | string>;
  input?: "text" | "textarea";
  min?: number;
  max?: number;
  unit?: string;
  danger?: boolean;
};

const booleanSchema = z.boolean();

export const managedSystemSettingDefinitions: readonly ManagedSystemSettingDefinition[] = [
  {
    key: "maintenance.enabled",
    group: "maintenance",
    label: "Bật chế độ bảo trì",
    description: "Tạm dừng khu vực công khai, phụ huynh và chế độ bé; quản trị viên vẫn đăng nhập được.",
    kind: "boolean",
    defaultValue: false,
    schema: booleanSchema,
    danger: true,
  },
  {
    key: "maintenance.title",
    group: "maintenance",
    label: "Tiêu đề trang bảo trì",
    description: "Thông báo ngắn giúp người dùng hiểu hệ thống đang tạm dừng.",
    kind: "text",
    defaultValue: "Hệ thống đang được bảo trì",
    schema: z.string().trim().min(3).max(80),
  },
  {
    key: "maintenance.message",
    group: "maintenance",
    label: "Nội dung thông báo bảo trì",
    description: "Nêu tình trạng và hướng dẫn người dùng quay lại sau.",
    kind: "text",
    input: "textarea",
    defaultValue: "Suy Luận Nhí đang được nâng cấp để hoạt động ổn định hơn. Vui lòng quay lại sau ít phút.",
    schema: z.string().trim().min(10).max(500),
  },
  {
    key: "features.registrationEnabled",
    group: "features",
    label: "Cho phép tạo tài khoản mới",
    description: "Tắt khi cần tạm ngưng tiếp nhận phụ huynh mới; tài khoản hiện có vẫn đăng nhập được.",
    kind: "boolean",
    defaultValue: true,
    schema: booleanSchema,
  },
  {
    key: "features.parentResourcesEnabled",
    group: "features",
    label: "Hiển thị tài nguyên cho phụ huynh",
    description: "Ẩn thư viện hướng dẫn khỏi khu vực phụ huynh khi nội dung chưa sẵn sàng.",
    kind: "boolean",
    defaultValue: true,
    schema: booleanSchema,
  },
  {
    key: "features.feedbackEnabled",
    group: "features",
    label: "Cho phép gửi góp ý hệ thống",
    description: "Tắt biểu mẫu và API nhận góp ý trong thời gian đội ngũ chưa thể tiếp nhận.",
    kind: "boolean",
    defaultValue: true,
    schema: booleanSchema,
  },
  {
    key: "limits.maxChildProfiles",
    group: "limits",
    label: "Số hồ sơ bé tối đa mỗi gia đình",
    description: "Giới hạn số hồ sơ đang hoạt động để tránh tạo nhầm hoặc lạm dụng.",
    kind: "number",
    defaultValue: 6,
    schema: z.number().int().min(1).max(20),
    min: 1,
    max: 20,
    unit: "hồ sơ",
  },
  {
    key: "limits.feedbackMaxAttachments",
    group: "limits",
    label: "Số ảnh tối đa trong một góp ý",
    description: "Áp dụng cho mỗi lần gửi góp ý; giới hạn dung lượng từng ảnh nằm ở cấu hình tải ảnh.",
    kind: "number",
    defaultValue: 5,
    schema: z.number().int().min(0).max(10),
    min: 0,
    max: 10,
    unit: "ảnh",
  },
  {
    key: "security.parentGateMaxAttempts",
    group: "security",
    label: "Số lần thử Parent Gate trước khi khóa",
    description: "Khóa tạm thời khu vực phụ huynh khi nhập sai liên tiếp quá số lần này.",
    kind: "number",
    defaultValue: 5,
    schema: z.number().int().min(3).max(20),
    min: 3,
    max: 20,
    unit: "lần",
  },
  {
    key: "security.parentGateLockMinutes",
    group: "security",
    label: "Thời gian khóa Parent Gate",
    description: "Khoảng thời gian phải chờ sau khi nhập sai quá số lần cho phép.",
    kind: "number",
    defaultValue: 5,
    schema: z.number().int().min(1).max(60),
    min: 1,
    max: 60,
    unit: "phút",
  },
  {
    key: "security.parentGateSessionMinutes",
    group: "security",
    label: "Thời gian giữ Parent Gate đã mở",
    description: "Sau thời gian này, phụ huynh cần xác nhận lại trước khi xem dữ liệu được bảo vệ.",
    kind: "number",
    defaultValue: 30,
    schema: z.number().int().min(5).max(120),
    min: 5,
    max: 120,
    unit: "phút",
  },
];
const definitionMap = new Map(
  managedSystemSettingDefinitions.map((definition) => [definition.key, definition]),
);

export const systemSettingGroupLabels: Record<SystemSettingGroup, { title: string; description: string }> = {
  maintenance: {
    title: "Bảo trì hệ thống",
    description: "Dùng khi cần tạm ngưng trải nghiệm người dùng để nâng cấp hoặc xử lý sự cố.",
  },
  features: {
    title: "Chức năng đang hoạt động",
    description: "Bật hoặc tắt những chức năng có thể thay đổi theo từng giai đoạn vận hành.",
  },
  limits: {
    title: "Giới hạn sử dụng",
    description: "Kiểm soát số lượng dữ liệu hoặc tệp trong các thao tác phổ biến.",
  },
  security: {
    title: "Bảo vệ truy cập",
    description: "Điều chỉnh ngưỡng bảo vệ không chứa khóa bí mật hoặc thông tin kết nối.",
  },
};

export function getManagedSystemSettingDefinition(key: string) {
  return definitionMap.get(key as ManagedSystemSettingKey);
}

export function isManagedSystemSettingKey(key: string): key is ManagedSystemSettingKey {
  return definitionMap.has(key as ManagedSystemSettingKey);
}

export function parseManagedSystemSetting(key: string, value: unknown) {
  const definition = getManagedSystemSettingDefinition(key);
  if (!definition) return null;
  return definition.schema.safeParse(value);
}
export type OperationalSystemSettings = {
  maintenance: { enabled: boolean; title: string; message: string };
  features: {
    registrationEnabled: boolean;
    parentResourcesEnabled: boolean;
    feedbackEnabled: boolean;
  };
  limits: { maxChildProfiles: number; feedbackMaxAttachments: number };
  security: {
    parentGateMaxAttempts: number;
    parentGateLockMinutes: number;
    parentGateSessionMinutes: number;
  };
};

export function resolveOperationalSystemSettings(rows: readonly { key: string; value: unknown }[]) {
  const values = Object.fromEntries(
    managedSystemSettingDefinitions.map((definition) => {
      const stored = rows.find((row) => row.key === definition.key)?.value;
      const parsed = definition.schema.safeParse(stored);
      return [definition.key, parsed.success ? parsed.data : definition.defaultValue];
    }),
  ) as Record<ManagedSystemSettingKey, boolean | number | string>;

  return {
    maintenance: {
      enabled: Boolean(values["maintenance.enabled"]),
      title: String(values["maintenance.title"]),
      message: String(values["maintenance.message"]),
    },
    features: {
      registrationEnabled: Boolean(values["features.registrationEnabled"]),
      parentResourcesEnabled: Boolean(values["features.parentResourcesEnabled"]),
      feedbackEnabled: Boolean(values["features.feedbackEnabled"]),
    },
    limits: {
      maxChildProfiles: Number(values["limits.maxChildProfiles"]),
      feedbackMaxAttachments: Number(values["limits.feedbackMaxAttachments"]),
    },
    security: {
      parentGateMaxAttempts: Number(values["security.parentGateMaxAttempts"]),
      parentGateLockMinutes: Number(values["security.parentGateLockMinutes"]),
      parentGateSessionMinutes: Number(values["security.parentGateSessionMinutes"]),
    },
  } satisfies OperationalSystemSettings;
}
