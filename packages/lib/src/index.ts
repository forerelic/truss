/**
 * @truss/lib
 *
 * Shared utility functions and helpers for all applications
 *
 * @example
 * ```typescript
 * import { formatDate, formatRelativeTime } from "@truss/lib/date";
 * import { slugify, truncate } from "@truss/lib/string";
 * import { isValidEmail, isStrongPassword } from "@truss/lib/validation";
 * import { isTauri, getOS } from "@truss/lib/platform";
 * import { debounce, sleep } from "@truss/lib/utils";
 * ```
 */

// Export all utilities
export * from "./date";
export * from "./string";
export * from "./validation";
export * from "./platform";
export * from "./utils";
