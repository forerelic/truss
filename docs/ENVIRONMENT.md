# Environment Variables Guide

Comprehensive guide to configuring environment variables for Truss applications.

## Quick Start

```bash
# 1. Run setup script (creates .env.local files from examples)
./scripts/setup-env.sh

# 2. Edit each .env.local file with your credentials
# - apps/web/.env.local
# - apps/precision/.env.local
# - apps/momentum/.env.local

# 3. Start developing
bun run dev:precision
```

## Environment File Structure

```
apps/web/.env.local          # Web app (Next.js) - gitignored
apps/precision/.env.local    # Precision desktop - gitignored
apps/momentum/.env.local     # Momentum desktop - gitignored

apps/web/.env.example        # Template for web app
apps/precision/.env.example  # Template for Precision
apps/momentum/.env.example   # Template for Momentum
```

**Important:**

- `.env.local` files are gitignored and contain your actual credentials
- `.env.example` files are committed and serve as templates
- Never commit actual credentials to git

## Web App Environment Variables

### Required Variables

#### Database (Better Auth)

```bash
DATABASE_URL=postgresql://postgres:[password]@[host]:5432/postgres
```

Better Auth requires PostgreSQL. Two connection options:

**Option 1: Transaction Pooler (Recommended for Production)**

```bash
DATABASE_URL=postgresql://postgres.[project-ref]:[password]@aws-0-[region].pooler.supabase.com:6543/postgres?pgbouncer=true
```

Benefits:

- Better connection pooling for serverless environments
- Handles connection limits efficiently
- Recommended for Vercel deployments

**Option 2: Direct Connection (Works Everywhere)**

```bash
DATABASE_URL=postgresql://postgres:[password]@db.[project-ref].supabase.co:5432/postgres
```

Get your credentials:

1. Go to https://supabase.com/dashboard/project/_/settings/database
2. Copy the connection string under "Connection string" → "URI"
3. Replace `[YOUR-PASSWORD]` with your database password

#### Better Auth Secret

```bash
BETTER_AUTH_SECRET=your-secret-here
```

Generate a secure secret:

```bash
openssl rand -base64 32
```

**Important:**

- Use different secrets for development, staging, and production
- Never reuse secrets across environments
- Store production secrets in Vercel environment variables

#### Supabase Public Configuration

```bash
NEXT_PUBLIC_SUPABASE_URL=https://[project-ref].supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

Get these values:

1. Go to https://supabase.com/dashboard/project/_/settings/api
2. Copy "Project URL" → `NEXT_PUBLIC_SUPABASE_URL`
3. Copy "anon public" key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`

**Note:** The anon key is safe to expose publicly (it's prefixed with `NEXT_PUBLIC_`).

#### Application URL

```bash
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

Set to your deployment URL in production:

- Local: `http://localhost:3000`
- Staging: `https://staging.truss.forerelic.com`
- Production: `https://truss.forerelic.com`

### Optional Variables

#### OAuth Providers

**GitHub OAuth**

```bash
GITHUB_CLIENT_ID=your_client_id
GITHUB_CLIENT_SECRET=your_client_secret
```

Setup:

1. Go to https://github.com/settings/developers
2. Create new OAuth App
3. Set callback URL: `https://your-app.com/api/auth/callback/github`
4. Copy Client ID and generate Client Secret

**Google OAuth**

```bash
GOOGLE_CLIENT_ID=your_client_id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your_client_secret
```

Setup:

1. Go to https://console.cloud.google.com/apis/credentials
2. Create OAuth 2.0 Client ID
3. Add authorized redirect URI: `https://your-app.com/api/auth/callback/google`
4. Copy Client ID and Client Secret

#### Email Provider (Resend)

```bash
EMAIL_FROM=noreply@your-domain.com
RESEND_API_KEY=re_your_api_key
```

Setup:

1. Sign up at https://resend.com
2. Verify your domain
3. Create API key in dashboard
4. Set `EMAIL_FROM` to an email address on your verified domain

**Note:** Email is required for magic links, email verification, and password resets.

#### Supabase Service Role Key

```bash
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

**Warning:** This key bypasses Row Level Security (RLS). Only use server-side!

Get the key:

1. Go to https://supabase.com/dashboard/project/_/settings/api
2. Copy "service_role" secret key

**Use cases:**

- Admin operations that need to bypass RLS
- Server-side batch operations
- Database migrations

**Never:**

- Expose to client-side code
- Use in browser environments
- Commit to git

## Desktop Apps Environment Variables

Both Precision and Momentum use the same environment variables.

### Required Variables

#### API Base URL

```bash
VITE_API_BASE_URL=http://localhost:3000
```

Points to your Next.js backend (web app).

**Environments:**

- Local: `http://localhost:3000`
- Staging: `https://staging.truss.forerelic.com`
- Production: `https://truss.forerelic.com`

#### Better Auth URL

```bash
VITE_BETTER_AUTH_URL=http://localhost:3000
```

Same as API_BASE_URL. Used by the Tauri auth client.

#### Supabase Configuration

```bash
VITE_SUPABASE_URL=https://[project-ref].supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

Must match the web app configuration.

### Optional Variables

#### App Metadata

```bash
VITE_APP_NAME=Precision
VITE_APP_VERSION=0.1.0
```

Automatically set from package.json. Override if needed.

#### Feature Flags

```bash
VITE_ENABLE_REALTIME=true
VITE_ENABLE_OFFLINE_MODE=false
VITE_ENABLE_ANALYTICS=false
```

Enable/disable features during development.

#### Debug Settings

```bash
VITE_DEBUG_MODE=true
VITE_DEBUG_AUTH=true
```

Shows additional console logs. Set to `false` in production.

## Production Deployment

### Vercel (Web App)

**Do NOT use `.env.production` files.** Instead, set environment variables in Vercel:

#### Via Dashboard

1. Go to your project settings:
   https://vercel.com/your-team/your-project/settings/environment-variables
2. Add each variable with appropriate scope:
   - **Production** - Used for `main` branch deployments
   - **Preview** - Used for PR preview deployments
   - **Development** - Used for local development with `vercel dev`

#### Via CLI

```bash
# Set production variable
vercel env add DATABASE_URL production

# Set preview variable
vercel env add DATABASE_URL preview

# List all variables
vercel env ls
```

#### Required Production Variables

```bash
DATABASE_URL                    # Use transaction pooler URL
BETTER_AUTH_SECRET              # Generate unique secret
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
NEXT_PUBLIC_APP_URL             # Your production URL
GITHUB_CLIENT_ID                # Optional, if using GitHub OAuth
GITHUB_CLIENT_SECRET
GOOGLE_CLIENT_ID                # Optional, if using Google OAuth
GOOGLE_CLIENT_SECRET
EMAIL_FROM                      # Optional, if using email auth
RESEND_API_KEY
```

#### Environment Groups

Use Vercel's environment groups for easier management:

```bash
# Create .env.production locally (NOT committed)
DATABASE_URL=postgresql://...
BETTER_AUTH_SECRET=...
# ... other production values

# Sync to Vercel
vercel env pull .env.production
```

### Tauri (Desktop Apps)

Desktop apps are distributed as installers. Environment variables are **embedded at build time**.

#### Build Configuration

Create environment-specific files (NOT committed):

```bash
# apps/precision/.env.production
VITE_API_BASE_URL=https://truss.forerelic.com
VITE_BETTER_AUTH_URL=https://truss.forerelic.com
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGci...
VITE_DEBUG_MODE=false
VITE_DEBUG_AUTH=false
```

#### Building for Production

```bash
# Build with production environment
cd apps/precision
VITE_ENV=production bun run tauri build

# Or use environment file
bun run tauri build --config-env production
```

**Note:** Production builds create signed installers. Ensure you have signing certificates
configured.

## Environment Variable Validation

### Next.js (Web App)

The web app uses `@t3-oss/env-nextjs` for runtime validation.

Configuration: `apps/web/src/env.ts`

```typescript
export const env = createEnv({
  server: {
    DATABASE_URL: z.string().url(),
    BETTER_AUTH_SECRET: z.string().min(32),
    // ...
  },
  client: {
    NEXT_PUBLIC_SUPABASE_URL: z.string().url(),
    NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string(),
    // ...
  },
  runtimeEnv: {
    DATABASE_URL: process.env.DATABASE_URL,
    // ...
  },
});
```

**Benefits:**

- Type-safe environment variables
- Runtime validation on startup
- Autocomplete in your IDE
- Catches missing variables early

To skip validation during build (not recommended):

```bash
SKIP_ENV_VALIDATION=true bun run build
```

### Tauri (Desktop Apps)

Desktop apps don't have built-in validation. Ensure all required variables are set before building.

## Turborepo Configuration

Environment variables used in builds must be declared in `turbo.json`:

```json
{
  "tasks": {
    "build": {
      "env": ["NEXT_PUBLIC_*", "VITE_*", "DATABASE_URL", "BETTER_AUTH_SECRET"]
    }
  }
}
```

**Why?**

- Turborepo uses environment variables for cache hashing
- Changing a variable invalidates the cache
- Ensures builds are reproducible

**Framework Inference:**

- Next.js: `NEXT_PUBLIC_*` automatically included
- Vite: `VITE_*` automatically included

## Security Best Practices

### Development

- ✅ Use separate database for local development
- ✅ Use weak/test secrets for local `.env.local`
- ✅ Never commit `.env.local` files
- ✅ Rotate secrets after sharing them accidentally

### Staging

- ✅ Use dedicated staging Supabase project
- ✅ Generate unique `BETTER_AUTH_SECRET`
- ✅ Use different OAuth app credentials
- ✅ Enable Vercel Preview Protection

### Production

- ✅ Use strong, randomly generated secrets
- ✅ Store secrets in Vercel's encrypted vault
- ✅ Enable 2FA on all third-party services
- ✅ Rotate secrets regularly (every 90 days)
- ✅ Use transaction pooler for database connections
- ✅ Monitor for leaked secrets with GitHub secret scanning

### Secret Rotation

If you suspect a secret has been compromised:

1. **Generate new secret**

   ```bash
   openssl rand -base64 32
   ```

2. **Update in Vercel dashboard**
   - Add new variable
   - Deploy
   - Verify deployment works
   - Remove old variable

3. **Update OAuth credentials**
   - Create new OAuth app
   - Update Vercel variables
   - Deploy
   - Delete old OAuth app

4. **Database credentials**
   - Reset database password in Supabase dashboard
   - Update `DATABASE_URL` in Vercel
   - Redeploy immediately

## Troubleshooting

### Missing Environment Variables

**Error:**

```
Error: Missing required environment variable: DATABASE_URL
```

**Fix:**

1. Check `.env.local` exists in the app directory
2. Ensure variable is defined (no typos)
3. Restart dev server after adding variables

### Authentication Fails in Tauri

**Error:**

```
Failed to authenticate: Network request failed
```

**Fix:**

1. Verify `VITE_BETTER_AUTH_URL` points to running backend
2. Check backend is accessible from desktop app
3. Ensure CORS is configured in `apps/web/app/api/auth/[...all]/route.ts`

### Database Connection Errors

**Error:**

```
Error: connection to server failed: FATAL: password authentication failed
```

**Fix:**

1. Verify `DATABASE_URL` format is correct
2. Check database password (reset in Supabase if needed)
3. For local development, ensure Supabase is running: `bun run db:start`

### Environment Variables Not Updating

**Symptom:** Changed variable but app still uses old value.

**Fix:**

1. **Next.js:** Restart dev server (`bun run dev:web`)
2. **Vite:** Restart dev server (`bun run dev:precision`)
3. **Vercel:** Redeploy after changing environment variables
4. **Turborepo:** Clear cache: `bun run clean`

### Type Errors for Environment Variables

**Error:**

```
Property 'MY_VAR' does not exist on type 'ProcessEnv'
```

**Fix:**

1. Add variable to `apps/web/src/env.ts` schema
2. Add to `runtimeEnv` object
3. TypeScript will now recognize the variable

## Common Patterns

### Sharing Variables Across Apps

**Option 1: Documentation** (Recommended)

Document in this file which variables must match across apps:

```
VITE_SUPABASE_URL must match NEXT_PUBLIC_SUPABASE_URL
VITE_SUPABASE_ANON_KEY must match NEXT_PUBLIC_SUPABASE_ANON_KEY
```

**Option 2: Script** (Advanced)

Create `scripts/sync-env-vars.sh`:

```bash
#!/bin/bash
# Read from web app, write to desktop apps
source apps/web/.env.local

cat > apps/precision/.env.local <<EOF
VITE_SUPABASE_URL=${NEXT_PUBLIC_SUPABASE_URL}
VITE_SUPABASE_ANON_KEY=${NEXT_PUBLIC_SUPABASE_ANON_KEY}
EOF
```

### Multiple Developers

**Use different local development databases:**

Developer 1:

```bash
DATABASE_URL=postgresql://postgres:password@localhost:5432/truss_dev1
```

Developer 2:

```bash
DATABASE_URL=postgresql://postgres:password@localhost:5432/truss_dev2
```

**Benefits:**

- Isolated development environments
- No conflicts when running migrations
- Can test database changes safely

### Testing with Different Configurations

**Create test-specific environment files:**

```bash
# apps/web/.env.test (gitignored)
DATABASE_URL=postgresql://postgres:password@localhost:5432/truss_test
BETTER_AUTH_SECRET=test-secret-do-not-use-in-production
```

**Run tests:**

```bash
NODE_ENV=test bun run test
```

## Reference

### All Environment Variables

#### Web App (`apps/web`)

| Variable                        | Required | Default                 | Description                  |
| ------------------------------- | -------- | ----------------------- | ---------------------------- |
| `DATABASE_URL`                  | ✅       | -                       | PostgreSQL connection string |
| `BETTER_AUTH_SECRET`            | ✅       | -                       | Session encryption secret    |
| `NEXT_PUBLIC_SUPABASE_URL`      | ✅       | -                       | Supabase project URL         |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | ✅       | -                       | Supabase anon key            |
| `NEXT_PUBLIC_APP_URL`           | ✅       | `http://localhost:3000` | App base URL                 |
| `SUPABASE_SERVICE_ROLE_KEY`     | ❌       | -                       | Supabase admin key           |
| `GITHUB_CLIENT_ID`              | ❌       | -                       | GitHub OAuth client ID       |
| `GITHUB_CLIENT_SECRET`          | ❌       | -                       | GitHub OAuth secret          |
| `GOOGLE_CLIENT_ID`              | ❌       | -                       | Google OAuth client ID       |
| `GOOGLE_CLIENT_SECRET`          | ❌       | -                       | Google OAuth secret          |
| `EMAIL_FROM`                    | ❌       | -                       | Sender email address         |
| `RESEND_API_KEY`                | ❌       | -                       | Resend API key               |
| `NODE_ENV`                      | ❌       | `development`           | Environment mode             |

#### Desktop Apps (`apps/precision`, `apps/momentum`)

| Variable                   | Required | Default                 | Description              |
| -------------------------- | -------- | ----------------------- | ------------------------ |
| `VITE_API_BASE_URL`        | ✅       | `http://localhost:3000` | Backend API URL          |
| `VITE_BETTER_AUTH_URL`     | ✅       | `http://localhost:3000` | Auth server URL          |
| `VITE_SUPABASE_URL`        | ✅       | -                       | Supabase project URL     |
| `VITE_SUPABASE_ANON_KEY`   | ✅       | -                       | Supabase anon key        |
| `VITE_APP_NAME`            | ❌       | `Precision`/`Momentum`  | App display name         |
| `VITE_APP_VERSION`         | ❌       | From package.json       | App version              |
| `VITE_ENABLE_REALTIME`     | ❌       | `true`                  | Enable Supabase Realtime |
| `VITE_ENABLE_OFFLINE_MODE` | ❌       | `false`                 | Enable offline support   |
| `VITE_ENABLE_ANALYTICS`    | ❌       | `false`                 | Enable analytics         |
| `VITE_DEBUG_MODE`          | ❌       | `false`                 | Show debug logs          |
| `VITE_DEBUG_AUTH`          | ❌       | `false`                 | Show auth debug logs     |

---

**Last Updated:** 2025-10-11
