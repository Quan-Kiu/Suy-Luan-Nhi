import "server-only";

import { env } from "@/config/env";

export const googleAuthConfigured = Boolean(env.GOOGLE_CLIENT_ID && env.GOOGLE_CLIENT_SECRET);
