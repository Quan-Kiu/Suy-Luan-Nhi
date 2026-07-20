# Media storage providers

The media domain depends on the `StorageProvider` interface in `src/modules/media/storage/types.ts`. Business modules only call `storeMedia` and `deleteStoredMedia`; they do not import Cloudinary, S3 or filesystem APIs directly.

Available providers:

- `local`: development fallback under `public/uploads`.
- `cloudinary`: signed server-side uploads for images, audio and video.
- `s3`: S3-compatible storage such as AWS S3, Cloudflare R2 or MinIO.

Each `media_assets` record stores `storageProvider`, `storageKey` and `storageMetadata`. Changing the active provider does not prevent deletion of files uploaded with an older provider.

## Enable Cloudinary

Set these variables in `.env`:

```dotenv
STORAGE_DRIVER=cloudinary
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
CLOUDINARY_FOLDER=sln-gpt
```

Restart the Next.js server after changing the environment. The API secret stays on the server and is never returned to the browser.
