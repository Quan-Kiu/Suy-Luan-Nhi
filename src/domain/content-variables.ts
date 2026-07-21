import { z } from "zod";

export const CONTENT_VARIABLES_SETTING_KEY = "content.template_variables";

export const contentVariableSourceValues = [
  "child.displayName",
  "child.ageGroup",
  "child.currentRank",
] as const;

export const contentVariableSourceSchema = z.enum(contentVariableSourceValues);
export type ContentVariableSource = z.infer<typeof contentVariableSourceSchema>;

export const contentVariableSourceOptions: Array<{
  value: ContentVariableSource;
  label: string;
  description: string;
}> = [
  { value: "child.displayName", label: "Tên bé", description: "Tên hiển thị trong hồ sơ đang được chọn." },
  { value: "child.ageGroup", label: "Nhóm tuổi", description: "Nhóm tuổi của bé, ví dụ 6–8 tuổi." },
  { value: "child.currentRank", label: "Hạng hiện tại", description: "Danh hiệu hiện tại của bé." },
];

export const contentVariableDefinitionSchema = z.object({
  key: z
    .string()
    .trim()
    .min(2, "Tên tag cần ít nhất 2 ký tự")
    .max(40, "Tên tag không được dài quá 40 ký tự")
    .regex(/^[a-z][a-z0-9_]*$/, "Tên tag chỉ gồm chữ thường, số và dấu gạch dưới"),
  label: z.string().trim().min(2, "Hãy nhập tên dễ hiểu").max(80),
  description: z.string().trim().min(4, "Hãy mô tả tag này").max(240),
  source: contentVariableSourceSchema,
  example: z.string().trim().min(1, "Hãy nhập dữ liệu xem trước").max(80),
  fallback: z.string().trim().min(1, "Hãy nhập nội dung dự phòng").max(80),
  enabled: z.boolean(),
});

export const contentVariableDefinitionsSchema = z
  .array(contentVariableDefinitionSchema)
  .min(1, "Cần có ít nhất một tag")
  .max(30, "Chỉ được cấu hình tối đa 30 tag")
  .superRefine((items, context) => {
    const seen = new Set<string>();
    items.forEach((item, index) => {
      if (seen.has(item.key)) {
        context.addIssue({
          code: "custom",
          path: [index, "key"],
          message: `Tag {{${item.key}}} đang bị trùng`,
        });
      }
      seen.add(item.key);
    });
  });

export type ContentVariableDefinition = z.infer<typeof contentVariableDefinitionSchema>;

export const defaultContentVariableDefinitions: ContentVariableDefinition[] = [
  {
    key: "name",
    label: "Tên bé",
    description: "Gọi tên bé đang sử dụng nhiệm vụ.",
    source: "child.displayName",
    example: "Bống",
    fallback: "bé",
    enabled: true,
  },
  {
    key: "age_group",
    label: "Nhóm tuổi",
    description: "Nhóm tuổi của bé đang sử dụng nhiệm vụ.",
    source: "child.ageGroup",
    example: "6–8 tuổi",
    fallback: "độ tuổi của bé",
    enabled: true,
  },
  {
    key: "rank",
    label: "Hạng hiện tại",
    description: "Danh hiệu hiện tại trong hành trình của bé.",
    source: "child.currentRank",
    example: "Nhà thám hiểm nhí",
    fallback: "nhà thám hiểm nhí",
    enabled: false,
  },
];

export type ContentVariableContext = {
  child?: {
    displayName?: string | null;
    ageGroup?: string | null;
    currentRank?: string | null;
  } | null;
};

export function parseContentVariableDefinitions(value: unknown): ContentVariableDefinition[] {
  const parsed = contentVariableDefinitionsSchema.safeParse(value);
  return parsed.success ? parsed.data : defaultContentVariableDefinitions;
}

export function contentVariableTag(key: string) {
  return `{{${key}}}`;
}

export function extractContentVariableKeys(value: string) {
  return [...value.matchAll(/{{\s*([a-z][a-z0-9_]*)\s*}}/g)].map((match) => match[1]);
}

function sourceValue(source: ContentVariableSource, context: ContentVariableContext) {
  if (source === "child.displayName") return context.child?.displayName ?? null;
  if (source === "child.ageGroup") {
    const ageGroup = context.child?.ageGroup;
    return ageGroup ? `${ageGroup.replace("-", "–")} tuổi` : null;
  }
  return context.child?.currentRank ?? null;
}

export function renderContentTemplate(
  value: string,
  definitions: readonly ContentVariableDefinition[],
  context: ContentVariableContext,
) {
  const byKey = new Map(definitions.map((definition) => [definition.key, definition]));
  return value.replace(/{{\s*([a-z][a-z0-9_]*)\s*}}/g, (match, key: string) => {
    const definition = byKey.get(key);
    if (!definition) return match;
    return sourceValue(definition.source, context) || definition.fallback;
  });
}

export function renderContentTemplatePreview(
  value: string,
  definitions: readonly ContentVariableDefinition[],
) {
  const byKey = new Map(definitions.map((definition) => [definition.key, definition]));
  return value.replace(/{{\s*([a-z][a-z0-9_]*)\s*}}/g, (match, key: string) => {
    return byKey.get(key)?.example || match;
  });
}

export function findUnavailableContentVariableKeys(
  value: string,
  definitions: readonly ContentVariableDefinition[],
) {
  const enabled = new Set(definitions.filter((item) => item.enabled).map((item) => item.key));
  return [...new Set(extractContentVariableKeys(value).filter((key) => !enabled.has(key)))];
}
