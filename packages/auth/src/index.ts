/**
 * @truss/auth
 *
 * Authentication package using Better Auth with server configuration
 * and clients for web and desktop platforms.
 */

export { auth } from "./server";
export * from "./client";
export { authClient } from "./client/web";
export { tauriAuthClient } from "./client/tauri";
