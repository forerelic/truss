import { betterAuth } from "better-auth";
import { Pool } from "pg";
import { admin, twoFactor, organization } from "better-auth/plugins";
import { tauri } from "@daveyplate/better-auth-tauri/plugin";

/**
 * Authentication server configuration using Better Auth.
 * Provides email/password auth, social providers, two-factor authentication,
 * admin roles, and organization management.
 */
const getDatabaseUrl = () => {
  if (typeof process !== "undefined") {
    const dbUrl = process.env.DATABASE_URL || process.env.SUPABASE_DB_URL;
    if (dbUrl) return dbUrl;
  }

  throw new Error(
    "Missing DATABASE_URL environment variable. " +
      "Set in .env.local: postgresql://postgres:[password]@[host]:5432/postgres"
  );
};

const getBaseUrl = () => {
  if (typeof process !== "undefined" && process.env?.NEXT_PUBLIC_APP_URL) {
    return process.env.NEXT_PUBLIC_APP_URL;
  }
  return "http://localhost:3000";
};

export const auth = betterAuth({
  database: new Pool({
    connectionString: getDatabaseUrl(),
    max: 10,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000,
  }),

  baseURL: getBaseUrl(),

  emailAndPassword: {
    enabled: true,
    requireEmailVerification: false,
    autoSignIn: true,
  },

  socialProviders: {
    github: {
      clientId: process.env.GITHUB_CLIENT_ID || "",
      clientSecret: process.env.GITHUB_CLIENT_SECRET || "",
      enabled: !!(process.env.GITHUB_CLIENT_ID && process.env.GITHUB_CLIENT_SECRET),
    },
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
      enabled: !!(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET),
    },
  },

  session: {
    expiresIn: 60 * 60 * 24 * 7,
    updateAge: 60 * 60 * 24,
    cookieCache: {
      enabled: true,
      maxAge: 5 * 60,
    },
  },

  advanced: {
    crossSubDomainCookies: {
      enabled: false,
    },
    useSecureCookies: process.env.NODE_ENV === "production",
    generateId: false,
  },

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

  plugins: [
    admin({
      defaultRole: "user",
      adminRole: "admin",
    }),

    twoFactor({
      issuer: "Truss",
    }),

    organization({
      allowUserToCreateOrganization: true,
      organizationLimit: 10,

      schema: {
        organization: {
          additionalFields: {
            allowedDomains: {
              type: "string[]",
              required: false,
              defaultValue: null,
              input: true,
            },
            autoJoinEnabled: {
              type: "boolean",
              required: false,
              defaultValue: false,
              input: true,
            },
          },
        },
      },

      sendInvitationEmail: async (data) => {
        // TODO: Implement email provider integration
        console.log("Send invitation email:", data);
      },

      async onUserSignUp() {},
    }),

    tauri({
      scheme: "truss",
      callbackURL: "/",
      successText: "Authentication successful! You can close this window.",
      debugLogs: process.env.NODE_ENV === "development",
    }),
  ],
});
