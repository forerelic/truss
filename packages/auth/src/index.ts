/**
 * @truss/auth
 *
 * Authentication package using Better Auth
 * Provides server configuration and clients for all platforms
 *
 * This package follows Better Auth's recommended monorepo setup:
 * - Server config exports auth instance
 * - Clients use type inference from server
 * - Separate clients for web and Tauri
 *
 * @see https://www.better-auth.com/docs/concepts/typescript
 */

// Re-export server configuration
export { auth } from "./server";

// Re-export all client utilities
export * from "./client";

// For convenience, also export individual clients
export { authClient } from "./client/web";
export { tauriAuthClient } from "./client/tauri";
