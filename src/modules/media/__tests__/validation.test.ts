import sharp from "sharp";
import { describe, expect, it } from "vitest";
import type { ImageUploadPolicy } from "@/domain/media-upload-policy";
import { validateMedia } from "@/modules/media/storage/validation";

const basePolicy: ImageUploadPolicy = {
  sizeValidationEnabled: true,
  maxSizeMb: 5,
  dimensionValidationEnabled: false,
  minWidth: null,
  minHeight: null,
  maxWidth: null,
  maxHeight: null,
};

async function pngFile(width = 100, height = 100) {
  const buffer = await sharp({
    create: { width, height, channels: 4, background: { r: 255, g: 255, b: 255, alpha: 1 } },
  })
    .png()
    .toBuffer();
  return new File([Uint8Array.from(buffer)], "sample.png", { type: "image/png" });
}

describe("validateMedia", () => {
  it("uses the configurable image size limit", async () => {
    const image = await pngFile();
    const padded = new File([await image.arrayBuffer(), new Uint8Array(2 * 1024 * 1024)], "large.png", {
      type: "image/png",
    });
    await expect(validateMedia(padded, { imagePolicy: { ...basePolicy, maxSizeMb: 1 } })).rejects.toThrow(
      "Ảnh vượt quá giới hạn 1MB",
    );
  });

  it("checks configurable image dimensions", async () => {
    const image = await pngFile(100, 80);
    await expect(
      validateMedia(image, {
        imagePolicy: {
          ...basePolicy,
          dimensionValidationEnabled: true,
          minWidth: 120,
        },
      }),
    ).rejects.toThrow("Ảnh cần rộng ít nhất 120px");
  });

  it("accepts an image when optional dimension checks are disabled", async () => {
    const image = await pngFile(100, 80);
    await expect(validateMedia(image, { imagePolicy: basePolicy })).resolves.toMatchObject({
      mediaType: "image",
      mimeType: "image/png",
    });
  });
});
