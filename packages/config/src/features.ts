/**
 * Feature Flags
 *
 * Centralized feature flags for A/B testing and gradual rollouts
 */

/**
 * Feature flag configuration
 */
export interface FeatureFlags {
  /**
   * Enable two-factor authentication
   */
  enableTwoFactor: boolean;

  /**
   * Enable organization auto-join by email domain
   */
  enableOrgAutoJoin: boolean;

  /**
   * Enable file uploads
   */
  enableFileUploads: boolean;

  /**
   * Enable real-time collaboration
   */
  enableRealtime: boolean;

  /**
   * Enable analytics tracking
   */
  enableAnalytics: boolean;

  /**
   * Enable beta features
   */
  enableBetaFeatures: boolean;

  /**
   * Enable desktop app auto-updates
   */
  enableAutoUpdates: boolean;
}

/**
 * Default feature flags (development)
 */
const DEFAULT_FLAGS: FeatureFlags = {
  enableTwoFactor: true,
  enableOrgAutoJoin: true,
  enableFileUploads: true,
  enableRealtime: false,
  enableAnalytics: false,
  enableBetaFeatures: true,
  enableAutoUpdates: false,
};

/**
 * Production feature flags
 */
const PRODUCTION_FLAGS: FeatureFlags = {
  enableTwoFactor: true,
  enableOrgAutoJoin: true,
  enableFileUploads: true,
  enableRealtime: false,
  enableAnalytics: true,
  enableBetaFeatures: false,
  enableAutoUpdates: true,
};

/**
 * Get feature flags based on environment
 */
export function getFeatureFlags(): FeatureFlags {
  const isProd = typeof process !== "undefined" && process.env?.NODE_ENV === "production";
  return isProd ? PRODUCTION_FLAGS : DEFAULT_FLAGS;
}

/**
 * Check if a feature is enabled
 */
export function isFeatureEnabled(feature: keyof FeatureFlags): boolean {
  const flags = getFeatureFlags();
  return flags[feature];
}

/**
 * Feature flags instance
 */
export const features = getFeatureFlags();
