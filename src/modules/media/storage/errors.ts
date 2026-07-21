export class MediaValidationError extends Error {
  readonly status = 400;
  readonly code = "MEDIA_VALIDATION_FAILED";

  constructor(message: string) {
    super(message);
    this.name = "MediaValidationError";
  }
}

export class MediaStorageError extends Error {
  readonly status = 503;
  readonly code = "MEDIA_STORAGE_UNAVAILABLE";

  constructor(message: string, options?: ErrorOptions) {
    super(message, options);
    this.name = "MediaStorageError";
  }
}

export function isMediaUploadError(error: unknown): error is MediaValidationError | MediaStorageError {
  return error instanceof MediaValidationError || error instanceof MediaStorageError;
}
