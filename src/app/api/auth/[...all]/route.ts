import { toNextJsHandler } from "better-auth/next-js";
import { auth } from "@/auth/auth";
import { withSanitizedAuthErrors } from "@/auth/response";

const handlers = toNextJsHandler(auth);

export const GET = withSanitizedAuthErrors(handlers.GET);
export const POST = withSanitizedAuthErrors(handlers.POST);
export const PATCH = withSanitizedAuthErrors(handlers.PATCH);
export const PUT = withSanitizedAuthErrors(handlers.PUT);
export const DELETE = withSanitizedAuthErrors(handlers.DELETE);
