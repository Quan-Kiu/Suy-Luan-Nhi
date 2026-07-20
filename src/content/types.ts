export type ContentValue =
  string | number | boolean | null | ContentValue[] | { [key: string]: ContentValue };

export type ContentDefinition = {
  namespace: string;
  key: string;
  locale: string;
  category: string;
  valueType: "text" | "number" | "boolean" | "json";
  value: ContentValue;
  description: string;
};

export type ContentDictionary = Record<string, ContentValue>;
