/**
 * @truss/config
 *
 * Shared configuration, constants, and environment helpers
 *
 * @example
 * ```typescript
 * import { AUTH, URLS, PAGINATION } from "@truss/config/constants";
 * import { getEnv, isDev, getApiUrl } from "@truss/config/env";
 * import { features, isFeatureEnabled } from "@truss/config/features";
 * ```
 */

// Export all constants
export * from "./constants";

// Export environment helpers
export * from "./env";

// Export feature flags
export * from "./features";
