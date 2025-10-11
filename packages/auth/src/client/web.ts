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
 * Better Auth client for web applications (Next.js)
 *
 * This client is used in web apps and provides:
 * - Type-safe authentication hooks
 * - Automatic session management
 * - Two-factor authentication
 * - Organization management
 * - Admin role checks
 *
 * Usage:
 * ```tsx
 * import { authClient, useSession } from '@repo/ui/lib/auth/client'
 *
 * function MyComponent() {
 *   const { data: session, isPending } = useSession()
 *   // ...
 * }
 * ```
 */

// Get base URL for API requests
// Note: Native apps (Tauri) should use their own auth-client.ts file
// This client is primarily for Next.js web app
const getBaseUrl = () => {
  // Next.js environment variable
  if (typeof process !== "undefined" && process.env?.NEXT_PUBLIC_APP_URL) {
    return process.env.NEXT_PUBLIC_APP_URL;
  }

  // Default to localhost for development
  return "http://localhost:3000";
};

export const authClient = createAuthClient({
  baseURL: getBaseUrl(),

  plugins: [
    // Infer additional fields from server config for type safety
    inferAdditionalFields<typeof auth>(),

    // Two-factor authentication client
    twoFactorClient({
      onTwoFactorRedirect() {
        // Redirect to 2FA verification page
        window.location.href = "/auth/2fa";
      },
    }),

    // Organization management client with inferred schema from server
    organizationClient({
      schema: inferOrgAdditionalFields<typeof auth>(),
    }),

    // Admin role management client
    adminClient(),
  ],
});

// Export commonly used hooks for convenience
// Organization plugin hooks (useActiveOrganization, useListOrganizations) are added directly to authClient
export const { useSession, signIn, signOut, signUp, useActiveOrganization, useListOrganizations } =
  authClient;
