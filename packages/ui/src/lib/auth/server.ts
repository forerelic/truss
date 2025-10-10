import { betterAuth } from "better-auth";
import { Pool } from "pg";
import { admin, twoFactor, organization } from "better-auth/plugins";
import { tauri } from "@daveyplate/better-auth-tauri/plugin";

/**
 * Better Auth server configuration
 *
 * This is the main authentication server setup that all apps share.
 * It uses Supabase Postgres as the database via the pg Pool adapter.
 *
 * Features:
 * - Email/Password authentication
 * - Social providers (GitHub, Google, etc.)
 * - Two-Factor authentication (TOTP)
 * - Admin role management
 * - Organization/Team management
 * - Tauri deep link support for native apps
 *
 * @see https://better-auth.com/docs
 */

// Get database URL from environment
// Better Auth standard: DATABASE_URL
// We also support SUPABASE_DB_URL for backward compatibility
const getDatabaseUrl = () => {
  if (typeof process !== "undefined") {
    const dbUrl = process.env.DATABASE_URL || process.env.SUPABASE_DB_URL;
    if (dbUrl) return dbUrl;
  }

  throw new Error(
    "Missing DATABASE_URL environment variable. " +
      "Please set it in your .env.local file. " +
      "Format: postgresql://postgres:[password]@db.[project-ref].supabase.co:5432/postgres",
  );
};

// Get base URL for auth callbacks
const getBaseUrl = () => {
  // Production: use environment variable
  if (typeof process !== "undefined" && process.env?.NEXT_PUBLIC_APP_URL) {
    return process.env.NEXT_PUBLIC_APP_URL;
  }

  // Development: default to localhost
  return "http://localhost:3000";
};

export const auth = betterAuth({
  database: new Pool({
    connectionString: getDatabaseUrl(),
    // Recommended pool settings for production
    max: 10, // Maximum number of clients in the pool
    idleTimeoutMillis: 30000, // How long a client is allowed to remain idle (30s)
    connectionTimeoutMillis: 2000, // How long to wait for a connection (2s)
  }),

  baseURL: getBaseUrl(),

  // Email and password authentication
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: false, // Set to true in production
    autoSignIn: true, // Automatically sign in after registration
  },

  // Social authentication providers
  socialProviders: {
    github: {
      clientId: process.env.GITHUB_CLIENT_ID || "",
      clientSecret: process.env.GITHUB_CLIENT_SECRET || "",
      enabled: !!(
        process.env.GITHUB_CLIENT_ID && process.env.GITHUB_CLIENT_SECRET
      ),
    },
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
      enabled: !!(
        process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET
      ),
    },
  },

  // Session configuration
  session: {
    expiresIn: 60 * 60 * 24 * 7, // 7 days
    updateAge: 60 * 60 * 24, // Update session every 24 hours
    cookieCache: {
      enabled: true,
      maxAge: 5 * 60, // Cache for 5 minutes
    },
  },

  // Advanced security features
  advanced: {
    crossSubDomainCookies: {
      enabled: false, // Enable if you need cross-subdomain auth
    },
    useSecureCookies: process.env.NODE_ENV === "production",
    generateId: false, // Use default ID generation (nanoid)
  },

  // User data schema
  user: {
    additionalFields: {
      role: {
        type: "string",
        defaultValue: "user",
        required: false,
      },
      metadata: {
        type: "json",
        required: false,
      },
    },
  },

  // Plugins
  plugins: [
    // Admin role management
    admin({
      defaultRole: "user",
      adminRole: "admin",
    }),

    // Two-factor authentication (TOTP)
    twoFactor({
      issuer: "Truss", // Your app name for authenticator apps
    }),

    // Organization/team management
    // Organizations ("workspaces") enable multi-tenant collaboration
    // Users can belong to multiple organizations and switch between them
    // App-specific permissions are managed separately (see app_permissions table)
    organization({
      allowUserToCreateOrganization: true,
      organizationLimit: 10, // Max organizations per user

      // Roles: owner, admin, member, guest
      // - owner: Full control of organization + all apps
      // - admin: Can manage members + set app permissions
      // - member: Default role, app permissions control access
      // - guest: Limited access, must have explicit app permissions

      // Extend organization schema with custom fields
      // These fields are added to the organization table automatically
      schema: {
        organization: {
          additionalFields: {
            // Email domain auto-join (like Notion, Slack)
            // Allows automatic organization membership for users with matching email domains
            allowedDomains: {
              type: "string[]",
              required: false,
              defaultValue: null,
              input: true, // Allow setting when creating/updating organization
            },
            autoJoinEnabled: {
              type: "boolean",
              required: false,
              defaultValue: false,
              input: true, // Allow setting when creating/updating organization
            },
          },
        },
      },

      // Email invitations for joining organizations
      sendInvitationEmail: async (data) => {
        // TODO: Implement email sending (e.g., via Resend, SendGrid)
        console.log("Send invitation email:", data);
        // For now, invitations work via token without email
      },

      // Create a personal organization for new users
      async onUserSignUp(_user: any) {
        // Personal organizations can be created manually if needed
        // For now, users can create orgs as needed
      },
    }),

    // Tauri plugin for desktop app authentication
    // This enables proper OAuth flows and deep link handling for Tauri apps
    tauri({
      scheme: "truss", // Deep link scheme - must match tauri.conf.json
      callbackURL: "/", // Where to redirect after successful auth
      successText: "Authentication successful! You can close this window.",
      debugLogs: process.env.NODE_ENV === "development",
    }),
  ],
});
