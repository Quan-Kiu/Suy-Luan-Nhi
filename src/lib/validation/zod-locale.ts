import { z } from "zod";
import type { $ZodErrorMap } from "zod/v4/core";

export const vietnameseZodError: $ZodErrorMap = (issue) => {
  switch (issue.code) {
    case "invalid_type":
      if (issue.expected === "number") return "Vui lòng nhập một số hợp lệ.";
      if (issue.expected === "string") return "Vui lòng nhập nội dung hợp lệ.";
      if (issue.expected === "boolean") return "Vui lòng xác nhận lựa chọn này.";
      return "Giá trị chưa đúng định dạng.";
    case "too_small":
      if (issue.origin === "string") return `Vui lòng nhập ít nhất ${issue.minimum} ký tự.`;
      if (issue.origin === "array") return `Vui lòng chọn ít nhất ${issue.minimum} mục.`;
      if (issue.origin === "number") return `Giá trị phải từ ${issue.minimum} trở lên.`;
      return "Giá trị chưa đạt yêu cầu tối thiểu.";
    case "too_big":
      if (issue.origin === "string") return `Vui lòng nhập không quá ${issue.maximum} ký tự.`;
      if (issue.origin === "array") return `Chỉ được chọn tối đa ${issue.maximum} mục.`;
      if (issue.origin === "number") return `Giá trị không được vượt quá ${issue.maximum}.`;
      return "Giá trị vượt quá giới hạn cho phép.";
    case "invalid_format":
      if (issue.format === "email") return "Email chưa đúng định dạng.";
      if (issue.format === "url") return "Đường dẫn chưa đúng định dạng.";
      if (issue.format === "uuid") return "Dữ liệu đã chọn không hợp lệ.";
      return "Nội dung chưa đúng định dạng yêu cầu.";
    case "invalid_value":
      return "Vui lòng chọn một giá trị hợp lệ.";
    case "unrecognized_keys":
      return "Dữ liệu có mục không được hỗ trợ.";
    default:
      return "Giá trị chưa hợp lệ.";
  }
};

z.config({ localeError: vietnameseZodError });
