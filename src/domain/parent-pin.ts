import { z } from "zod";

export const PARENT_PIN_LENGTH = 6;
export const PARENT_PIN_MAX_LEGACY_LENGTH = 8;

const COMMON_PARENT_PINS = new Set([
  "000000",
  "111111",
  "222222",
  "333333",
  "444444",
  "555555",
  "666666",
  "777777",
  "888888",
  "999999",
  "112233",
  "121212",
  "123123",
  "012345",
  "123456",
  "234567",
  "345678",
  "456789",
  "987654",
  "876543",
  "765432",
  "654321",
]);

export const parentPinValueSchema = z
  .string()
  .trim()
  .regex(/^\d{6}$/, "Mã PIN cần đủ 6 chữ số")
  .refine((pin) => !COMMON_PARENT_PINS.has(pin), "Hãy chọn mã PIN khó đoán hơn");

export const parentPinUnlockSchema = z
  .string()
  .trim()
  .regex(/^\d{4,8}$/, "Mã PIN chưa đúng định dạng");

const parentPinConfirmationShape = {
  pin: parentPinValueSchema,
  confirmPin: z
    .string()
    .trim()
    .regex(/^\d{6}$/, "Mã PIN nhập lại cần đủ 6 chữ số"),
};

export const parentPinSetupSchema = z
  .object(parentPinConfirmationShape)
  .refine((values) => values.pin === values.confirmPin, {
    path: ["confirmPin"],
    message: "Mã PIN nhập lại chưa khớp",
  });

export const parentPinResetSchema = z
  .object({
    token: z.string().trim().min(32, "Liên kết đặt lại mã PIN không hợp lệ").max(256),
    ...parentPinConfirmationShape,
  })
  .refine((values) => values.pin === values.confirmPin, {
    path: ["confirmPin"],
    message: "Mã PIN nhập lại chưa khớp",
  });

export type ParentPinSetupInput = z.infer<typeof parentPinSetupSchema>;
