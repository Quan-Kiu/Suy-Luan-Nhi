import { requireApiPermission } from "@/auth/api";
import { parentResourceErrorCodes, parentResourceErrorMessages } from "@/domain/parent-resources";
import { apiJson } from "@/lib/api-response";
import { invalidateParentResources } from "@/lib/cache/invalidation";
import {
  adminResourceSchema,
  archiveAdminResource,
  getAdminResource,
  ResourceRevisionConflictError,
  updateAdminResource,
} from "@/modules/admin/resource-admin";

type Context = { params: Promise<{ resourceId: string }> };

function readExpectedRevision(request: Request) {
  const value = Number(request.headers.get("x-resource-revision"));
  return Number.isInteger(value) && value > 0 ? value : null;
}

function conflictResponse(error: ResourceRevisionConflictError) {
  return apiJson(
    {
      code: parentResourceErrorCodes.editConflict,
      message: parentResourceErrorMessages.editConflict,
      currentRevision: error.currentRevision,
      currentUpdatedAt: error.currentUpdatedAt.toISOString(),
    },
    { status: 409 },
  );
}

export async function GET(request: Request, context: Context) {
  const authResult = await requireApiPermission(request, "resources.view");
  if ("error" in authResult) return authResult.error;
  const { resourceId } = await context.params;
  const resource = await getAdminResource(resourceId);
  return resource
    ? apiJson(resource)
    : apiJson(
        {
          code: parentResourceErrorCodes.notFound,
          message: parentResourceErrorMessages.notFound,
        },
        { status: 404 },
      );
}

export async function PATCH(request: Request, context: Context) {
  const authResult = await requireApiPermission(request, "resources.manage");
  if ("error" in authResult) return authResult.error;
  const expectedRevision = readExpectedRevision(request);
  if (expectedRevision === null) {
    return apiJson(
      {
        code: parentResourceErrorCodes.revisionRequired,
        message: parentResourceErrorMessages.revisionRequired,
      },
      { status: 428 },
    );
  }
  const input = adminResourceSchema.safeParse(await request.json().catch(() => null));
  if (!input.success) {
    return apiJson(
      {
        code: parentResourceErrorCodes.validationFailed,
        message: input.error.issues[0]?.message ?? parentResourceErrorMessages.validationFailed,
        issues: input.error.flatten(),
      },
      { status: 400 },
    );
  }
  const { resourceId } = await context.params;
  try {
    const resource = await updateAdminResource(
      resourceId,
      input.data,
      authResult.session.user.id,
      expectedRevision,
    );
    if (!resource) {
      return apiJson(
        {
          code: parentResourceErrorCodes.notFound,
          message: parentResourceErrorMessages.notFound,
        },
        { status: 404 },
      );
    }
    invalidateParentResources();
    return apiJson(resource);
  } catch (error) {
    if (error instanceof ResourceRevisionConflictError) return conflictResponse(error);
    if (error instanceof Error && error.message.includes("unique")) {
      return apiJson(
        {
          code: parentResourceErrorCodes.slugConflict,
          message: parentResourceErrorMessages.slugConflict,
        },
        { status: 409 },
      );
    }
    throw error;
  }
}

export async function DELETE(request: Request, context: Context) {
  const authResult = await requireApiPermission(request, "resources.manage");
  if ("error" in authResult) return authResult.error;
  const expectedRevision = readExpectedRevision(request);
  if (expectedRevision === null) {
    return apiJson(
      {
        code: parentResourceErrorCodes.revisionRequired,
        message: parentResourceErrorMessages.revisionRequired,
      },
      { status: 428 },
    );
  }
  const { resourceId } = await context.params;
  try {
    const resource = await archiveAdminResource(resourceId, authResult.session.user.id, expectedRevision);
    if (!resource) {
      return apiJson(
        {
          code: parentResourceErrorCodes.notFound,
          message: parentResourceErrorMessages.notFound,
        },
        { status: 404 },
      );
    }
    invalidateParentResources();
    return apiJson(resource);
  } catch (error) {
    if (error instanceof ResourceRevisionConflictError) return conflictResponse(error);
    throw error;
  }
}
