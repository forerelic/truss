"use client";

import { createAuthClient } from "better-auth/react";
import {
  twoFactorClient,
  organizationClient,
  adminClient,
  inferAdditionalFields,
} from "better-auth/client/plugins";
import type { auth } from "./server";

/**
 * Better Auth client for Tauri native applications
 *
 * This client is specifically configured for Precision and Momentum desktop apps.
 * The @daveyplate/better-auth-tauri plugin handles:
 * - Deep link support for OAuth flows (GitHub, Google)
 * - Session persistence via cookies through Tauri HTTP Plugin
 * - Authentication state management
 *
 * Usage in Tauri App.tsx:
 * ```tsx
 * import { useBetterAuthTauri } from '@daveyplate/better-auth-tauri/react'
 * import { tauriAuthClient } from '@repo/ui/lib/auth/tauri-client'
 *
 * function App() {
 *   useBetterAuthTauri({
 *     authClient: tauriAuthClient,
 *     scheme: 'truss',
 *     debugLogs: import.meta.env.DEV,
 *     onSuccess: (callbackURL) => {
 *       console.log('✅ Auth successful')
 *       // Navigate to callback URL or dashboard
 *     },
 *     onError: (error) => {
 *       console.error('❌ Auth error:', error)
 *     }
 *   })
 *
 *   return <YourApp />
 * }
 * ```
 *
 * IMPORTANT:
 * - The scheme 'truss' must match tauri.conf.json deep link configuration
 * - Cookies are automatically handled by the better-auth-tauri plugin
 * - No custom storage needed - sessions persist via server-side cookies
 */

// Get API base URL from environment
const getBaseUrl = () => {
  // Production URL from environment variable
  // @ts-ignore - import.meta.env is Vite-specific
  if (
    typeof import.meta !== "undefined" &&
    import.meta.env?.VITE_BETTER_AUTH_URL
  ) {
    // @ts-ignore
    return import.meta.env.VITE_BETTER_AUTH_URL;
  }

  // Development: Connect to local Next.js server
  // @ts-ignore
  if (typeof import.meta !== "undefined" && import.meta.env?.DEV) {
    console.log("[TauriAuthClient] Using local development server");
    return "http://localhost:3000";
  }

  // Production fallback - should be set via environment variable
  console.warn(
    "[TauriAuthClient] VITE_BETTER_AUTH_URL not set, using production URL",
  );
  return "https://your-app.vercel.app"; // Will be replaced with actual URL
};

export const tauriAuthClient = createAuthClient({
  baseURL: getBaseUrl(),

  // No custom storage needed - the better-auth-tauri plugin handles
  // session persistence via cookies through Tauri's HTTP Plugin

  plugins: [
    // Infer additional fields from server config for type safety
    inferAdditionalFields<typeof auth>(),

    // Two-factor authentication client
    twoFactorClient({
      onTwoFactorRedirect() {
        // In a real app, use your router to navigate
        // For now, using window.location as a fallback
        window.location.href = "/auth/2fa";
      },
    }),

    // Organization management client
    organizationClient(),

    // Admin role management client
    adminClient(),
  ],
});

// Export commonly used hooks for convenience
export const {
  useSession,
  signIn,
  signOut,
  signUp,
  useActiveOrganization,
  useListOrganizations,
} = tauriAuthClient;