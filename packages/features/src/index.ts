/**
 * @truss/features
 *
 * Modular business logic features for all applications
 *
 * @example
 * ```typescript
 * // Organizations
 * import { hasPermission, getAppAccess } from "@truss/features/organizations/permissions";
 * import { useWorkspace, WorkspaceProvider } from "@truss/features/organizations/workspace-context";
 * import type { WorkspaceContext, AppPermissionLevel } from "@truss/features/organizations/types";
 * ```
 */

// Export organizations feature
export * from "./organizations";
