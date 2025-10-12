"use client";

import { createAuthClient } from "better-auth/react";
import {
  twoFactorClient,
  organizationClient,
  adminClient,
  inferAdditionalFields,
  inferOrgAdditionalFields,
} from "better-auth/client/plugins";
import type { auth } from "../server";

/**
 * Authentication client for web applications with type-safe hooks and session management.
 */

// Get base URL for API requests
const getBaseUrl = () => {
  if (typeof process !== "undefined" && process.env?.NEXT_PUBLIC_APP_URL) {
    return process.env.NEXT_PUBLIC_APP_URL;
  }

  return "http://localhost:3000";
};

export const authClient = createAuthClient({
  baseURL: getBaseUrl(),

  plugins: [
    inferAdditionalFields<typeof auth>(),
    twoFactorClient({
      onTwoFactorRedirect() {
        window.location.href = "/auth/2fa";
      },
    }),
    organizationClient({
      schema: inferOrgAdditionalFields<typeof auth>(),
    }),
    adminClient(),
  ],
});

export const { useSession, signIn, signOut, signUp, useActiveOrganization, useListOrganizations } =
  authClient;
