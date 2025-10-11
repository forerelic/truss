/**
 * @truss/shared
 *
 * Shared business logic and types
 * Contains organization management, permissions, and common types
 *
 * This package follows Turborepo best practices:
 * - Business logic separated from UI
 * - Shared types and utilities
 * - Cross-app functionality
 *
 * @see Cal.com's monorepo pattern for client/server separation
 */

// Re-export everything from organizations
export * from "./organizations";

// Re-export everything from types
export * from "./types";
