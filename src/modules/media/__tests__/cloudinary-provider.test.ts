import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  config: vi.fn(),
  destroy: vi.fn(),
  uploadStream: vi.fn(),
}));

vi.mock("@/config/env", () => ({
  env: {
    CLOUDINARY_CLOUD_NAME: "demo",
    CLOUDINARY_API_KEY: "key",
    CLOUDINARY_API_SECRET: "secret",
    CLOUDINARY_FOLDER: "sln-gpt",
    CLOUDINARY_UPLOAD_PRESET: "restricted-preset",
  },
}));

vi.mock("cloudinary", () => ({
  v2: {
    config: mocks.config,
    uploader: {
      destroy: mocks.destroy,
      upload_stream: mocks.uploadStream,
    },
  },
}));
import { cloudinaryStorageProvider } from "@/modules/media/storage/providers/cloudinary";

describe("cloudinaryStorageProvider", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("retries a forbidden upload without the configured preset", async () => {
    let attempt = 0;
    mocks.uploadStream.mockImplementation((options, callback) => ({
      end() {
        attempt += 1;
        if (attempt === 1) {
          callback({ http_code: 403, message: "Server returned unexpected status code - 403" }, undefined);
          return;
        }
        callback(undefined, {
          public_id: "asset-1",
          secure_url: "https://res.cloudinary.com/demo/image/upload/asset-1.png",
          resource_type: "image",
          format: "png",
          width: 32,
          height: 32,
          version: 1,
        });
      },
    }));
    const result = await cloudinaryStorageProvider.upload({
      buffer: Buffer.from("image"),
      mimeType: "image/png",
      extension: "png",
      mediaType: "image",
      size: 5,
    });

    expect(result.storageKey).toBe("asset-1");
    expect(mocks.uploadStream).toHaveBeenCalledTimes(2);
    expect(mocks.uploadStream.mock.calls[0]?.[0]).toMatchObject({
      upload_preset: "restricted-preset",
    });
    expect(mocks.uploadStream.mock.calls[1]?.[0]).not.toHaveProperty("upload_preset");
  });
});
