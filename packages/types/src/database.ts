/**
 * Database Types
 *
 * Re-exports from @truss/database for convenience
 * Also includes common database-related utility types
 */

// Re-export database types for convenience
export type { Database } from "@truss/database/types";

/**
 * Database-specific utility types
 */
export type RequireAtLeastOne<T, Keys extends keyof T = keyof T> = Pick<T, Exclude<keyof T, Keys>> &
  {
    [K in Keys]-?: Required<Pick<T, K>> & Partial<Pick<T, Exclude<Keys, K>>>;
  }[Keys];
