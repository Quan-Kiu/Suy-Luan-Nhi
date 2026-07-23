"use client";

import { useMutation } from "@tanstack/react-query";
import { LoaderCircle } from "lucide-react";
import { signIn } from "@/auth/client";
import { FormStatus } from "@/components/form";
import { contentText, useContent } from "@/content/client";
import { AuthFlowError, getAuthErrorMessage, toAuthFlowError } from "@/features/auth/auth-errors";

type GoogleAuthButtonProps = {
  mode: "sign-in" | "sign-up";
  callbackURL: string;
  errorCallbackURL: string;
  callbackError?: string | null;
};

function GoogleMark() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className="size-5 shrink-0">
      <path
        fill="#4285F4"
        d="M21.6 12.2c0-.7-.1-1.4-.2-2H12v3.9h5.4a4.6 4.6 0 0 1-2 3v2.5h3.3c1.9-1.8 2.9-4.4 2.9-7.4Z"
      />
      <path
        fill="#34A853"
        d="M12 22c2.7 0 5-.9 6.7-2.4l-3.3-2.5c-.9.6-2.1 1-3.4 1a5.9 5.9 0 0 1-5.6-4.1H3v2.6A10 10 0 0 0 12 22Z"
      />
      <path fill="#FBBC05" d="M6.4 14a6 6 0 0 1 0-3.9V7.5H3a10 10 0 0 0 0 9.1L6.4 14Z" />
      <path
        fill="#EA4335"
        d="M12 5.9c1.5 0 2.8.5 3.9 1.5l2.9-2.9A9.8 9.8 0 0 0 3 7.5l3.4 2.6A5.9 5.9 0 0 1 12 5.9Z"
      />
    </svg>
  );
}
export function GoogleAuthButton({
  mode,
  callbackURL,
  errorCallbackURL,
  callbackError,
}: GoogleAuthButtonProps) {
  const content = useContent("auth");
  const mutation = useMutation({
    mutationFn: async () => {
      const result = await signIn.social({
        provider: "google",
        callbackURL,
        newUserCallbackURL: callbackURL,
        errorCallbackURL,
        requestSignUp: mode === "sign-up",
      });
      if (result.error) throw toAuthFlowError(result.error, "OAUTH_ERROR");
      return result.data;
    },
  });
  const callbackFlowError = callbackError ? new AuthFlowError(callbackError) : null;
  const error = mutation.isError ? mutation.error : callbackFlowError;

  return (
    <div className="space-y-3">
      <button
        type="button"
        onClick={() => mutation.mutate()}
        disabled={mutation.isPending}
        className="flex min-h-12 w-full items-center justify-center gap-3 rounded-2xl border border-[#d8d0c2] bg-white px-5 py-3 font-black text-[#3f3a33] shadow-sm transition hover:border-[#b9ad9b] hover:bg-[#fffdf9] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#b9470d] disabled:cursor-wait disabled:opacity-65"
      >
        {mutation.isPending ? (
          <LoaderCircle className="size-5 animate-spin" aria-hidden="true" />
        ) : (
          <GoogleMark />
        )}
        {mutation.isPending
          ? contentText(content, "social.googlePending", "Đang kết nối Google...")
          : contentText(
              content,
              mode === "sign-up" ? "social.googleSignUp" : "social.googleSignIn",
              mode === "sign-up" ? "Đăng ký bằng Google" : "Đăng nhập bằng Google",
            )}
      </button>
      <FormStatus
        status={error ? "error" : "idle"}
        message={error ? getAuthErrorMessage(content, error, "OAUTH_ERROR") : undefined}
      />
      <div className="flex items-center gap-3" aria-hidden="true">
        <span className="h-px flex-1 bg-[#e2d8c8]" />
        <span className="type-caption text-[#88755d]">
          {contentText(content, "social.emailDivider", "hoặc tiếp tục bằng email")}
        </span>
        <span className="h-px flex-1 bg-[#e2d8c8]" />
      </div>
    </div>
  );
}
