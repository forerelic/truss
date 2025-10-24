/**
 * Authentication client for Tauri desktop applications.
 */

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
 * Get the base URL for the authentication server.
 */
const getBaseUrl = () => {
  if (typeof import.meta !== "undefined" && import.meta.env) {
    if (import.meta.env.VITE_BETTER_AUTH_URL) {
      return import.meta.env.VITE_BETTER_AUTH_URL;
    }
    if (import.meta.env.DEV === true || import.meta.env.MODE === "development") {
      return "http://localhost:3000";
    }
  }
  // Default to localhost for development/testing
  return "http://localhost:3000";
};

/**
 * Authentication client configured for Tauri desktop applications.
 * Handles token-based auth in production and cookie-based auth in development.
 */
export const tauriAuthClient = createAuthClient({
  baseURL: getBaseUrl(),

  fetchOptions: {
    credentials: "include",
  },

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

/**
 * Export authentication methods for use in components.
 */
export const { useSession, signIn, signOut, signUp, useActiveOrganization, useListOrganizations } =
  tauriAuthClient;

export { tauriAuthClient as authClient };
