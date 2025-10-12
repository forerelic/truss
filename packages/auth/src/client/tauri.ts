"use client";

import { createAuthClient } from "better-auth/react";
import {
  twoFactorClient,
  organizationClient,
  adminClient,
  inferAdditionalFields,
} from "better-auth/client/plugins";
import type { auth } from "../server";

/**
 * Authentication client for Tauri desktop applications with deep link OAuth support.
 * Sessions persist via cookies through the Tauri HTTP Plugin.
 */
const getBaseUrl = () => {
  if (typeof import.meta !== "undefined") {
    const meta = import.meta as { env?: Record<string, string> };
    if (meta.env?.VITE_BETTER_AUTH_URL) {
      return meta.env.VITE_BETTER_AUTH_URL;
    }

    if (meta.env?.DEV) {
      return "http://localhost:3000";
    }
  }

  throw new Error("VITE_BETTER_AUTH_URL environment variable is required for production");
};

export const tauriAuthClient = createAuthClient({
  baseURL: getBaseUrl(),

  plugins: [
    inferAdditionalFields<typeof auth>(),
    twoFactorClient({
      onTwoFactorRedirect() {
        window.location.href = "/auth/2fa";
      },
    }),
    organizationClient(),
    adminClient(),
  ],
});

export const { useSession, signIn, signOut, signUp, useActiveOrganization, useListOrganizations } =
  tauriAuthClient;
