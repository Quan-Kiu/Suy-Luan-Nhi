"use client";

import { inferAdditionalFields, twoFactorClient } from "better-auth/client/plugins";
import { createAuthClient } from "better-auth/react";
import type { auth } from "@/auth/auth";

export const authClient = createAuthClient({
  fetchOptions: {
    onRequest(context) {
      const locale = typeof document === "undefined" ? "vi" : document.documentElement.lang || "vi";
      context.headers.set("X-App-Locale", locale);
      return context;
    },
  },
  plugins: [twoFactorClient({ twoFactorPage: "/auth/two-factor" }), inferAdditionalFields<typeof auth>()],
});

export const { signIn, signUp, signOut, useSession } = authClient;
