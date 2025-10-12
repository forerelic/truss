/**
 * Better Auth client exports for web and desktop applications.
 */

export {
  authClient,
  useSession,
  signIn,
  signOut,
  signUp,
  useActiveOrganization,
  useListOrganizations,
} from "./web";

export {
  tauriAuthClient,
  useSession as useTauriSession,
  signIn as tauriSignIn,
  signOut as tauriSignOut,
  signUp as tauriSignUp,
  useActiveOrganization as useTauriActiveOrganization,
  useListOrganizations as useTauriListOrganizations,
} from "./tauri";
