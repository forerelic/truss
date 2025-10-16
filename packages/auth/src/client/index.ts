/**
 * Better Auth client exports for web and desktop applications.
 *
 * Re-export the Tauri client as default since it's used by shared features.
 * Web apps don't use the client hooks (they use server-side auth).
 */

export {
  tauriAuthClient as authClient,
  useSession,
  signIn,
  signOut,
  signUp,
  useActiveOrganization,
  useListOrganizations,
} from "./tauri";

export { tauriAuthClient } from "./tauri";
