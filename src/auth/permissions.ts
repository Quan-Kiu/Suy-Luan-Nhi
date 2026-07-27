import { parseRoles, type AppRole } from "@/auth/roles";

export const permissionKeys = [
  "family.access",
  "family.children.manage",
  "family.settings.manage",
  "family.feedback.create",
  "admin.dashboard.view",
  "missions.view",
  "missions.manage",
  "missions.review",
  "resources.view",
  "resources.manage",
  "media.view",
  "media.manage",
  "media.review",
  "content.view",
  "content.manage",
  "content_variables.manage",
  "worlds.manage",
  "badges.view",
  "badges.manage",
  "taxonomy.manage",
  "feedback.view",
  "feedback.manage",
  "reports.view",
  "audit.view",
  "access_control.view",
  "members.manage",
  "data_requests.manage",
  "settings.manage",
  "parent_access.use",
] as const;

export type PermissionKey = (typeof permissionKeys)[number];
export type PermissionGroup = "family" | "content" | "operations" | "security";

export type PermissionDefinition = {
  key: PermissionKey;
  label: string;
  description: string;
  group: PermissionGroup;
  routes: readonly string[];
};

export const permissionDefinitions: readonly PermissionDefinition[] = [
  {
    key: "family.access",
    label: "Truy cập khu vực gia đình",
    description: "Mở khu vực phụ huynh và chế độ học của bé.",
    group: "family",
    routes: ["/parent", "/profiles", "/play/:sessionId"],
  },
  {
    key: "family.children.manage",
    label: "Quản lý hồ sơ bé",
    description: "Tạo, sửa, chọn, đưa vào thùng rác và khôi phục hồ sơ bé.",
    group: "family",
    routes: ["/profiles", "/api/children/**"],
  },
  {
    key: "family.settings.manage",
    label: "Quản lý cài đặt gia đình",
    description: "Cập nhật PIN, quyền riêng tư, âm thanh và thông báo.",
    group: "family",
    routes: ["/parent/settings", "/api/parent/**"],
  },
  {
    key: "family.feedback.create",
    label: "Gửi góp ý",
    description: "Gửi góp ý thủ công và báo lỗi tự động khi đã đồng ý.",
    group: "family",
    routes: ["/api/feedback", "/api/error-reports"],
  },
  {
    key: "admin.dashboard.view",
    label: "Xem tổng quan quản trị",
    description: "Xem số liệu vận hành và công việc cần chú ý.",
    group: "operations",
    routes: ["/admin"],
  },
  {
    key: "missions.view",
    label: "Xem nhiệm vụ",
    description: "Xem danh sách, phiên bản và trạng thái nhiệm vụ.",
    group: "content",
    routes: ["/admin/missions", "GET /api/admin/missions/**"],
  },
  {
    key: "missions.manage",
    label: "Soạn và quản lý nhiệm vụ",
    description: "Tạo, sửa, lưu nháp, nhân bản, lưu trữ và gửi duyệt.",
    group: "content",
    routes: ["/admin/missions/new", "/admin/missions/:id/edit", "POST|PATCH /api/admin/missions/**"],
  },
  {
    key: "missions.review",
    label: "Duyệt và xuất bản nhiệm vụ",
    description: "Duyệt, từ chối, lên lịch và xuất bản phiên bản nhiệm vụ.",
    group: "content",
    routes: ["/admin/reviews", "/api/admin/missions/**/approve|reject|publish|schedule"],
  },
  {
    key: "resources.view",
    label: "Xem gợi ý phụ huynh",
    description: "Xem nội dung tài nguyên dành cho phụ huynh.",
    group: "content",
    routes: ["/admin/resources", "GET /api/admin/resources/**"],
  },
  {
    key: "resources.manage",
    label: "Quản lý gợi ý phụ huynh",
    description: "Tạo, sửa, xuất bản và lưu trữ tài nguyên.",
    group: "content",
    routes: [
      "/admin/resources/new",
      "/admin/resources/:id/edit",
      "POST|PATCH|DELETE /api/admin/resources/**",
    ],
  },
  {
    key: "media.view",
    label: "Xem thư viện",
    description: "Xem tài nguyên hình ảnh và âm thanh.",
    group: "content",
    routes: ["/admin/media", "GET /api/admin/media/**"],
  },
  {
    key: "media.manage",
    label: "Quản lý thư viện",
    description: "Tải lên, cập nhật và xóa tài nguyên.",
    group: "content",
    routes: ["POST|PATCH|DELETE /api/admin/media/**"],
  },
  {
    key: "media.review",
    label: "Kiểm tra an toàn tài nguyên",
    description: "Phê duyệt hoặc từ chối tài nguyên trước khi sử dụng.",
    group: "content",
    routes: ["PATCH /api/admin/media/:id"],
  },
  {
    key: "content.view",
    label: "Xem nội dung hiển thị",
    description: "Xem nội dung giao diện và cấu hình hiển thị.",
    group: "content",
    routes: ["/admin/content", "GET /api/admin/content"],
  },
  {
    key: "content.manage",
    label: "Quản lý nội dung hiển thị",
    description: "Sửa nội dung giao diện theo từng khu vực và ngôn ngữ.",
    group: "content",
    routes: ["/admin/content", "POST|PATCH /api/admin/content"],
  },
  {
    key: "content_variables.manage",
    label: "Quản lý từ điển nội dung",
    description: "Quản lý biến và dữ liệu dùng lại trong nội dung hệ thống.",
    group: "content",
    routes: ["/admin/content-variables"],
  },
  {
    key: "worlds.manage",
    label: "Quản lý chủ đề nhiệm vụ",
    description: "Tạo và cập nhật chủ đề, phạm vi nhóm tuổi và trạng thái hiển thị.",
    group: "content",
    routes: ["/admin/worlds", "/api/admin/worlds/**"],
  },
  {
    key: "badges.view",
    label: "Xem huy hiệu",
    description: "Xem huy hiệu khi soạn hoặc kiểm tra nhiệm vụ.",
    group: "content",
    routes: ["GET /api/admin/badges/**"],
  },
  {
    key: "badges.manage",
    label: "Quản lý huy hiệu",
    description: "Tạo, sửa và gắn huy hiệu thưởng vào nhiệm vụ.",
    group: "content",
    routes: ["/admin/badges", "/api/admin/badges/**"],
  },
  {
    key: "taxonomy.manage",
    label: "Quản lý nhóm tuổi và kỹ năng",
    description: "Cập nhật nhóm tuổi, kỹ năng và phạm vi chủ đề.",
    group: "content",
    routes: ["/admin/taxonomy", "/api/admin/age-groups/**", "/api/admin/skills/**"],
  },
  {
    key: "feedback.view",
    label: "Xem góp ý hệ thống",
    description: "Xem góp ý, lỗi tự động và thông tin chẩn đoán đã ẩn dữ liệu nhạy cảm.",
    group: "operations",
    routes: ["/admin/feedback", "GET /api/admin/feedback"],
  },
  {
    key: "feedback.manage",
    label: "Xử lý góp ý hệ thống",
    description: "Đổi trạng thái và ghi chú xử lý góp ý.",
    group: "operations",
    routes: ["PATCH /api/admin/feedback/:id"],
  },
  {
    key: "reports.view",
    label: "Xem báo cáo sử dụng",
    description: "Xem số liệu tổng hợp về hoạt động học và nội dung.",
    group: "operations",
    routes: ["/admin/reports"],
  },
  {
    key: "audit.view",
    label: "Xem lịch sử thay đổi",
    description: "Tra cứu nhật ký thao tác quản trị.",
    group: "operations",
    routes: ["/admin/audit"],
  },
  {
    key: "access_control.view",
    label: "Xem vai trò và quyền",
    description: "Xem ma trận quyền, chức năng và route của từng vai trò.",
    group: "security",
    routes: ["/admin/access-control"],
  },
  {
    key: "members.manage",
    label: "Quản lý thành viên",
    description: "Gán vai trò, tạm ngưng, đặt lại thông tin đăng nhập và quản lý thùng rác tài khoản.",
    group: "security",
    routes: ["/admin/access-control?tab=members", "/api/admin/members/**"],
  },
  {
    key: "data_requests.manage",
    label: "Xử lý yêu cầu dữ liệu",
    description: "Xử lý yêu cầu xuất hoặc xóa dữ liệu gia đình.",
    group: "security",
    routes: ["/admin/data-requests", "/api/admin/data-requests/**"],
  },
  {
    key: "settings.manage",
    label: "Quản lý cấu hình hệ thống",
    description: "Cập nhật cờ chức năng, giới hạn và cấu hình bảo vệ.",
    group: "security",
    routes: ["/admin/settings", "/api/admin/settings"],
  },
  {
    key: "parent_access.use",
    label: "Mở khu vực phụ huynh từ quản trị",
    description: "Đi vào khu vực phụ huynh bằng quyền super admin.",
    group: "security",
    routes: ["/admin/parent-access"],
  },
] as const;

const parentPermissions: PermissionKey[] = [
  "family.access",
  "family.children.manage",
  "family.settings.manage",
  "family.feedback.create",
];

const staffReadPermissions: PermissionKey[] = [
  "admin.dashboard.view",
  "missions.view",
  "resources.view",
  "media.view",
  "content.view",
  "badges.view",
  "feedback.view",
  "feedback.manage",
  "reports.view",
  "audit.view",
];

const editorPermissions: PermissionKey[] = [
  ...staffReadPermissions,
  "missions.manage",
  "resources.manage",
  "media.manage",
  "content.manage",
  "worlds.manage",
  "badges.manage",
  "taxonomy.manage",
];

const reviewerPermissions: PermissionKey[] = [...staffReadPermissions, "missions.review", "media.review"];

export const rolePermissionMap: Record<AppRole, readonly PermissionKey[]> = {
  parent: parentPermissions,
  content_admin: editorPermissions,
  reviewer: reviewerPermissions,
  super_admin: permissionKeys,
};

export const roleDefinitions: Record<
  AppRole,
  { label: string; description: string; audience: "family" | "staff" }
> = {
  parent: {
    label: "Phụ huynh",
    description: "Quản lý gia đình, hồ sơ bé, cài đặt và trải nghiệm học.",
    audience: "family",
  },
  content_admin: {
    label: "Biên tập nội dung",
    description: "Soạn và quản lý nội dung nhưng không tự duyệt hoặc xuất bản phiên bản.",
    audience: "staff",
  },
  reviewer: {
    label: "Người kiểm tra nội dung",
    description: "Kiểm tra an toàn, duyệt và xuất bản nhưng không chỉnh sửa bản nháp.",
    audience: "staff",
  },
  super_admin: {
    label: "Quản trị viên",
    description: "Toàn quyền vận hành, bảo mật, thành viên và khu vực gia đình.",
    audience: "staff",
  },
};

export function hasPermission(value: unknown, permission: PermissionKey) {
  return parseRoles(value).some((role) => rolePermissionMap[role].includes(permission));
}

export function getPermissionsForRole(role: AppRole) {
  return rolePermissionMap[role];
}

export function getPermissionDefinition(key: PermissionKey) {
  return permissionDefinitions.find((definition) => definition.key === key)!;
}
