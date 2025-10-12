/**
 * Environment variable helpers and validation.
 */

/**
 * Get environment variable with fallback.
 */
export function getEnv(key: string, fallback?: string): string {
  // Check browser environment (Vite prefix)
  if (
    typeof window !== "undefined" &&
    "import" in window &&
    "meta" in (window as Record<string, unknown>)
  ) {
    const value = (import.meta as unknown as Record<string, Record<string, string>>).env?.[key];
    if (value !== undefined) return value;
  }

  // Check Node.js environment
  if (typeof process !== "undefined" && process.env) {
    const value = process.env[key];
    if (value !== undefined) return value;
  }

  // Return fallback or throw
  if (fallback !== undefined) return fallback;
  throw new Error(`Environment variable ${key} is not defined`);
}

/**
 * Get required environment variable.
 */
export function getRequiredEnv(key: string): string {
  return getEnv(key);
}

/**
 * Get optional environment variable.
 */
export function getOptionalEnv(key: string, fallback = ""): string {
  try {
    return getEnv(key, fallback);
  } catch {
    return fallback;
  }
}

/**
 * Check if environment is development.
 */
export function isDev(): boolean {
  return getOptionalEnv("NODE_ENV", "development") === "development";
}

/**
 * Check if environment is production.
 */
export function isProd(): boolean {
  return getOptionalEnv("NODE_ENV") === "production";
}

/**
 * Check if environment is staging.
 */
export function isStaging(): boolean {
  return getOptionalEnv("VERCEL_ENV") === "preview";
}

/**
 * Get base URL for API.
 */
export function getApiUrl(): string {
  // Check for explicit API URL
  const apiUrl = getOptionalEnv("NEXT_PUBLIC_API_URL") || getOptionalEnv("VITE_API_URL");
  if (apiUrl) return apiUrl;

  // Fallback to app URL
  return getOptionalEnv("NEXT_PUBLIC_APP_URL", "http://localhost:3000");
}

/**
 * Get Supabase URL.
 */
export function getSupabaseUrl(): string {
  return getOptionalEnv("NEXT_PUBLIC_SUPABASE_URL") || getOptionalEnv("VITE_SUPABASE_URL", "");
}

/**
 * Get Supabase anon key.
 */
export function getSupabaseAnonKey(): string {
  return (
    getOptionalEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY") || getOptionalEnv("VITE_SUPABASE_ANON_KEY", "")
  );
}

/**
 * Environment configuration object.
 */
export const ENV = {
  isDev: isDev(),
  isProd: isProd(),
  isStaging: isStaging(),
  apiUrl: getApiUrl(),
  supabase: {
    url: getSupabaseUrl(),
    anonKey: getSupabaseAnonKey(),
  },
} as const;
