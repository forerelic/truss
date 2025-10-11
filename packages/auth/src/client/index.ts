/**
 * Better Auth Client Exports
 *
 * This package provides auth clients for different environments:
 * - web.ts: For Next.js web applications
 * - tauri.ts: For Tauri desktop applications
 *
 * Each client is configured for its specific environment but shares
 * the same server configuration for type inference.
 */

// Export web client (Next.js)
export {
  authClient,
  useSession,
  signIn,
  signOut,
  signUp,
  useActiveOrganization,
  useListOrganizations,
} from "./web";

// Export Tauri client (for desktop apps)
export {
  tauriAuthClient,
  useSession as useTauriSession,
  signIn as tauriSignIn,
  signOut as tauriSignOut,
  signUp as tauriSignUp,
  useActiveOrganization as useTauriActiveOrganization,
  useListOrganizations as useTauriListOrganizations,
} from "./tauri";
