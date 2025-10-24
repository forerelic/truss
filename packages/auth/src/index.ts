/**
 * @truss/auth
 *
 * Authentication package using Better Auth with server configuration
 * and clients for desktop platforms and shared features.
 */

export { auth } from "./server";
export * from "./client";
export { tauriAuthClient } from "./client/tauri";
