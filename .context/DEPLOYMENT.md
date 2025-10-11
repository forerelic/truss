# 🚀 DEPLOYMENT GUIDE

## Truss Monorepo - Complete Production Deployment Manual

> **Last Updated**: 2025-10-10
> **Status**: ✅ Production-Ready
> **For**: Solo developers and small teams

This is the **single source of truth** for deploying the Truss monorepo. Everything you need to ship from local development to production.

---

## 📋 TABLE OF CONTENTS

1. [Architecture Overview](#architecture-overview)
2. [Environment Strategy](#environment-strategy)
3. [Prerequisites](#prerequisites)
4. [Initial Setup](#initial-setup)
5. [Local Development](#local-development)
6. [Database Migrations](#database-migrations)
7. [Deploying to Staging](#deploying-to-staging)
8. [Deploying to Production](#deploying-to-production)
9. [Desktop App Releases](#desktop-app-releases)
10. [Rollback Procedures](#rollback-procedures)
11. [Monitoring & Debugging](#monitoring--debugging)
12. [Troubleshooting](#troubleshooting)
13. [Security Checklist](#security-checklist)
14. [Reference](#reference)

---

## 🏗️ ARCHITECTURE OVERVIEW

```
┌────────────────────────────────────────────────────────────┐
│                      TRUSS MONOREPO                         │
├────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────┐   │
│  │     Web     │    │  Precision  │    │  Momentum   │   │
│  │  (Next.js)  │    │   (Tauri)   │    │   (Tauri)   │   │
│  └─────────────┘    └─────────────┘    └─────────────┘   │
│        │                   │                    │          │
│        └───────────────────┴────────────────────┘          │
│                          │                                  │
│                   ┌──────▼──────┐                          │
│                   │   @repo/ui   │                         │
│                   │   (Shared)   │                         │
│                   └──────┬──────┘                          │
│                          │                                  │
│  ┌───────────────────────┴────────────────────────┐        │
│  │                                                  │       │
│  ▼                    ▼                    ▼               │
│ Better Auth       Supabase DB         Turborepo           │
│ (postgres)        (postgres)          (caching)            │
│                                                             │
└────────────────────────────────────────────────────────────┘
```

### Applications

- **Web** (`apps/web`): Next.js 15 marketing site + auth server
  - **Deployment**: Vercel (auto-deploy on push)
  - **Database**: Supabase Postgres (Better Auth)
  - **URL**: `https://truss.forerelic.com`

- **Precision** (`apps/precision`): Tauri v2 desktop app for project estimation
  - **Deployment**: GitHub Releases (manual/tag-based)
  - **Platforms**: macOS, Windows, Linux
  - **Auth**: Better Auth via web app

- **Momentum** (`apps/momentum`): Tauri v2 desktop app for project tracking
  - **Deployment**: GitHub Releases (manual/tag-based)
  - **Platforms**: macOS, Windows, Linux
  - **Auth**: Better Auth via web app

### Shared Packages

- `@truss/ui`: Platform-agnostic components, utilities, types
- `@truss/eslint-config`: Shared ESLint configuration
- `@truss/typescript-config`: Shared TypeScript configuration

---

## 🌍 ENVIRONMENT STRATEGY

### Three-Tier Pipeline

```
Local Development → Staging → Production
    (any branch)    (develop)    (main)
```

| Environment    | Branch    | Web URL                       | Supabase       | Purpose             |
| -------------- | --------- | ----------------------------- | -------------- | ------------------- |
| **Local**      | Any       | `localhost:3000`              | Local instance | Feature development |
| **Staging**    | `develop` | `staging.truss.forerelic.com` | Staging DB     | Integration testing |
| **Production** | `main`    | `truss.forerelic.com`         | Production DB  | Live users          |

### Environment Files Structure

**Package-specific .env files** (monorepo best practice):

```
apps/web/
  .env.local               # ← Your local config (gitignored)
  .env.example             # ← Template for local dev
  .env.production.example  # ← Template for production
  .env.staging.example     # ← Template for staging

apps/precision/
  .env.local               # ← Your local config (gitignored)
  .env.example             # ← Template for local dev
  .env.production.example  # ← Template for production
  .env.staging.example     # ← Template for staging

apps/momentum/
  .env.local               # ← Your local config (gitignored)
  .env.example             # ← Template for local dev
  .env.production.example  # ← Template for production
  .env.staging.example     # ← Template for staging
```

**⚠️ NEVER create a root `.env.local` file** - This causes environment variable leakage between apps.

---

## ✅ PREREQUISITES

### Required Tools

```bash
# Bun (package manager & runtime)
curl -fsSL https://bun.sh/install | bash
bun --version  # Should be >= 1.2.4

# Supabase CLI
brew install supabase/tap/supabase
# or: npm install -g supabase
supabase --version  # Should be >= 2.0.0

# GitHub CLI (for deployment)
brew install gh
gh auth login

# Vercel CLI (optional, for manual deploys)
npm install -g vercel
vercel login
```

### Optional Tools (for desktop releases)

```bash
# Rust (for Tauri)
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh

# Tauri CLI
cargo install tauri-cli --version "^2.0.0"
```

---

## 🎬 INITIAL SETUP

### 1. Clone Repository

```bash
git clone https://github.com/forerelic/truss.git
cd truss
```

### 2. Install Dependencies

```bash
bun install
```

### 3. Setup Environment Variables

#### For Web App (Required)

```bash
# Copy template
cp apps/web/.env.example apps/web/.env.local

# Edit with your values
code apps/web/.env.local
```

**Required variables:**

```bash
# Database
DATABASE_URL=postgresql://postgres:[password]@db.[project-ref].supabase.co:5432/postgres

# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://[project-ref].supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...

# Better Auth
BETTER_AUTH_SECRET=<generate with: openssl rand -base64 32>

# App URL
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

#### For Desktop Apps (Optional)

```bash
# Precision
cp apps/precision/.env.example apps/precision/.env.local
code apps/precision/.env.local

# Momentum
cp apps/momentum/.env.example apps/momentum/.env.local
code apps/momentum/.env.local
```

**Desktop app variables:**

```bash
VITE_SUPABASE_URL=https://[project-ref].supabase.co
VITE_SUPABASE_ANON_KEY=eyJ...
VITE_BETTER_AUTH_URL=http://localhost:3000
VITE_APP_NAME=Precision  # or Momentum
VITE_APP_VERSION=0.1.0
```

### 4. Start Local Supabase

```bash
# Start all services (postgres, storage, auth, etc.)
bun run db:start

# Verify it's running
bun run db:status

# Optional: Open Supabase Studio
bun run db:studio
```

### 5. Generate TypeScript Types

```bash
# Generate from local database
bun run db:generate:local

# This creates: packages/ui/src/lib/supabase/types.ts
```

### 6. Verify Setup

```bash
# Run linting
bun run lint

# Type check
bun run check-types

# Test build (optional)
bun run build:web
```

---

## 💻 LOCAL DEVELOPMENT

### Starting Development Servers

```bash
# Web app only
bun run dev:web
# → http://localhost:3000

# Precision desktop app
bun run dev:precision
# → http://localhost:1420

# Momentum desktop app
bun run dev:momentum
# → http://localhost:1420

# All apps concurrently
bun run dev
```

### Development Workflow

1. **Create feature branch**

   ```bash
   git checkout -b feature/my-feature
   ```

2. **Make changes** with hot reload enabled

3. **Pre-commit checks** (automatic via Husky)
   - Prettier formatting
   - No manual action needed

4. **Commit changes**

   ```bash
   git add .
   git commit -m "feat: add new feature"
   ```

5. **Pre-push validation** (automatic via Husky)
   - SQL validation (if Supabase changes)
   - Type drift check (if Supabase changes)
   - Can skip with: `git push --no-verify`

6. **Push to GitHub**

   ```bash
   git push origin feature/my-feature
   ```

7. **Create Pull Request**
   - CI runs automatically (lint, type check, build)
   - If touching Supabase: migration validation runs
   - Review and merge when green

### Common Development Tasks

```bash
# Format code
bun run format

# Fix linting issues
bun run lint

# Type check
bun run check-types

# Clean build artifacts
bun run clean

# Kill stuck dev servers
bun run cleanup-ports
```

---

## 🗄️ DATABASE MIGRATIONS

### Migration Workflow (2025 Best Practices)

**Key Principle**: Types are committed **WITH** migrations (atomic changes).

#### Create New Migration

**Option 1: Interactive Helper (Recommended)**

```bash
bun run db:migration:create add_users_table
```

This interactive script will:

1. ✅ Create migration file
2. ✅ Open it in your editor
3. ✅ Wait for you to edit
4. ✅ Apply migration locally
5. ✅ Generate TypeScript types automatically
6. ✅ Show next steps

**Option 2: Manual**

```bash
# 1. Create migration file
bunx supabase migration new add_users_table

# 2. Edit the file
code supabase/migrations/[timestamp]_add_users_table.sql

# 3. Apply locally
bun run db:reset

# 4. Generate types
bun run db:generate:local

# 5. Commit both migration and types
git add supabase/migrations/ packages/ui/src/lib/supabase/types.ts
git commit -m "feat: add users table"
```

#### Migration SQL Example

```sql
-- Create users table with RLS
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  name TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Policy: Users can read their own data
CREATE POLICY "Users can read own data"
ON users FOR SELECT
USING (auth.uid() = id);

-- Grant permissions
GRANT SELECT, INSERT, UPDATE ON users TO authenticated;
```

#### Validate Migrations

```bash
# Check SQL syntax
bun run db:validate

# Test locally
bun run db:reset

# Check for type drift
bun run db:types:check
```

#### Common Migration Commands

```bash
# List all migrations
bun run db:migration:list

# Pull schema from remote
bun run db:pull

# Generate migration from diff
bun run db:diff

# Check database health
bun run db:health
```

---

## 🧪 DEPLOYING TO STAGING

### Staging Environment

- **Branch**: `develop`
- **Web URL**: `https://staging.truss.forerelic.com`
- **Database**: Staging Supabase instance
- **Purpose**: Integration testing before production

### Deployment Process

#### 1. Merge to Develop Branch

```bash
# Ensure you're on your feature branch
git checkout feature/my-feature

# Get latest develop
git checkout develop
git pull origin develop

# Merge your feature
git merge feature/my-feature

# Push to GitHub
git push origin develop
```

#### 2. Automatic Deployments

**Web App (Vercel)**:

- ✅ Auto-deploys on push to `develop`
- ✅ Accessible at: `https://staging.truss.forerelic.com`
- ✅ Uses staging environment variables

**Database Migrations**:

- ✅ Auto-runs on push to `develop` (if `supabase/**` changed)
- ✅ Validates SQL before deploying
- ✅ Deploys to staging Supabase

#### 3. Verify Staging Deployment

```bash
# Check workflow status
gh run list --branch develop --limit 5

# View specific run
gh run view <run-id>

# Visit staging site
open https://staging.truss.forerelic.com
```

#### 4. Manual Database Operations (If Needed)

```bash
# Manual staging migration
gh workflow run database.yml \
  -f environment=staging \
  -f action=migrate

# Reset staging database (destructive!)
gh workflow run database.yml \
  -f environment=staging \
  -f action=reset

# Seed staging data
gh workflow run database.yml \
  -f environment=staging \
  -f action=seed
```

### Staging Checklist

Before promoting to production:

- [ ] ✅ All CI checks pass
- [ ] ✅ Staging deployment successful
- [ ] ✅ Manual testing on staging
- [ ] ✅ Database migrations tested
- [ ] ✅ Authentication works
- [ ] ✅ No console errors
- [ ] ✅ Performance acceptable
- [ ] ✅ Desktop apps connect (if testing)

---

## 🚀 DEPLOYING TO PRODUCTION

### Production Environment

- **Branch**: `main`
- **Web URL**: `https://truss.forerelic.com`
- **Database**: Production Supabase instance
- **⚠️ CAUTION**: Real users, real data

### Pre-Production Checklist

**STOP! Verify before deploying:**

- [ ] ✅ All features tested on staging
- [ ] ✅ PR approved and reviewed
- [ ] ✅ Database migrations are safe (no data loss)
- [ ] ✅ Types are up to date
- [ ] ✅ Breaking changes documented
- [ ] ✅ Rollback plan prepared
- [ ] ✅ Monitoring ready
- [ ] ✅ Off-hours deployment (if critical)

### Deployment Process

#### 1. Merge to Main

```bash
# Get latest main
git checkout main
git pull origin main

# Merge from develop
git merge develop

# Final check
bun run check-types
bun run lint

# Push to production
git push origin main
```

#### 2. Automatic Deployments

**Web App (Vercel)**:

- ✅ Auto-deploys on push to `main`
- ✅ Accessible at: `https://truss.forerelic.com`
- ✅ Uses production environment variables
- ✅ Takes ~2-3 minutes

**Database Migrations**:

- ✅ Auto-runs on push to `main` (if `supabase/**` changed)
- ✅ Creates automatic backup first
- ✅ Shows migration diff
- ✅ Deploys to production Supabase
- ❌ **CANNOT reset** production database (blocked for safety)

#### 3. Monitor Deployment

```bash
# Watch workflow
gh run watch

# Or view completed run
gh run list --branch main --limit 5
gh run view <run-id>

# Check Vercel deployment
vercel ls truss --prod
```

#### 4. Verify Production

```bash
# Smoke test
curl -I https://truss.forerelic.com
# Should return: HTTP/2 200

# Check database
bunx supabase link --project-ref $PRODUCTION_PROJECT_ID
bunx supabase db diff --linked
# Should show: No schema changes detected

# Monitor logs (Vercel dashboard)
open https://vercel.com/forerelic/truss/logs
```

### Post-Deployment Checklist

- [ ] ✅ Web app loads
- [ ] ✅ Authentication works
- [ ] ✅ Database accessible
- [ ] ✅ No errors in Vercel logs
- [ ] ✅ Monitor for ~30 minutes
- [ ] ✅ User testing (if applicable)

### Manual Database Migration (Advanced)

If you need to manually trigger a production migration:

```bash
# ⚠️ DANGEROUS - Only use if auto-deploy failed

# 1. Create backup manually
bunx supabase link --project-ref $PRODUCTION_PROJECT_ID
bunx supabase db dump -f backup_$(date +%Y%m%d_%H%M%S).sql

# 2. Run migration
gh workflow run database.yml \
  -f environment=production \
  -f action=migrate

# 3. Monitor closely
gh run watch
```

---

## 📦 DESKTOP APP RELEASES

### Release Strategy

Desktop apps (Precision & Momentum) are released **independently** via GitHub Releases.

### Version Management

**Using Changesets (Recommended)**

```bash
# 1. Create a changeset
bun run changeset

# Interactive prompts:
# - Select packages: precision, momentum, both?
# - Bump type: patch (0.0.X), minor (0.X.0), major (X.0.0)
# - Summary: What changed?

# 2. Commit the changeset
git add .changeset/
git commit -m "chore: add changeset for precision v1.2.0"
git push

# 3. Changesets workflow creates "Version Packages" PR
# 4. Review and merge PR
# 5. Desktop releases trigger automatically
```

**Manual Release (Alternative)**

```bash
# 1. Bump version in package.json
cd apps/precision
# Edit package.json: "version": "1.0.0" → "1.1.0"

# 2. Update changelog
bun run changelog:precision

# 3. Commit and tag
git add apps/precision/package.json apps/precision/CHANGELOG.md
git commit -m "chore: release precision v1.1.0"
git tag precision-v1.1.0
git push origin main precision-v1.1.0

# 4. Workflow builds installers automatically
```

### Release Workflow (GitHub Actions)

When you push a tag `precision-v*` or `momentum-v*`:

1. ✅ Builds for macOS, Windows, Linux
2. ✅ Code signs (if configured)
3. ✅ Creates GitHub Release
4. ✅ Uploads installers (.dmg, .exe, .AppImage)
5. ✅ Generates auto-updater JSON

**Example tag patterns:**

- `precision-v1.0.0` - Stable release
- `precision-v1.0.0-beta.1` - Beta release
- `momentum-v2.0.0` - Major version

### Manual Trigger (Alternative)

```bash
# Trigger release without tag
gh workflow run release-desktop.yml \
  -f app=precision \
  -f version=1.0.0 \
  -f environment=production

# Staging build (for testing)
gh workflow run release-desktop.yml \
  -f app=precision \
  -f version=1.0.0-staging \
  -f environment=staging
```

### Verify Release

```bash
# Check release was created
gh release list

# View specific release
gh release view precision-v1.0.0

# Download artifacts
gh release download precision-v1.0.0
```

### Auto-Updater

Desktop apps check for updates using Tauri's built-in updater:

```json
// Auto-generated in GitHub Release
{
  "version": "1.0.0",
  "notes": "Release notes here",
  "pub_date": "2025-10-10T12:00:00Z",
  "platforms": {
    "darwin-x86_64": {
      "signature": "...",
      "url": "https://github.com/.../precision_1.0.0_x64.app.tar.gz"
    }
  }
}
```

**Update check:** Apps check on startup and every 24 hours.

---

## ↩️ ROLLBACK PROCEDURES

### Web App Rollback

**Option 1: Vercel Dashboard (Fastest)**

1. Go to https://vercel.com/forerelic/truss/deployments
2. Find previous working deployment
3. Click "..." → "Promote to Production"
4. Done! ✅ (takes ~30 seconds)

**Option 2: Git Revert**

```bash
# Find problematic commit
git log --oneline -10

# Revert it
git revert <bad-commit-hash>
git push origin main

# Vercel auto-deploys the revert
```

**Option 3: Redeploy Previous Commit**

```bash
# Checkout previous commit
git checkout <good-commit-hash>

# Force push (⚠️ dangerous, use with caution)
git push origin main --force

# Better: Create revert PR
git checkout -b revert/bad-feature
git revert <bad-commit-hash>
git push origin revert/bad-feature
# Merge via PR
```

### Database Rollback

**⚠️ IMPORTANT**: Database rollbacks are **complex** - migrations are forward-only.

**Prevention (Best Practice)**:

- ✅ Test thoroughly on staging
- ✅ Use transactions in migrations
- ✅ Create backups before deploying

**If you must rollback:**

```bash
# 1. Link to production
bunx supabase link --project-ref $PRODUCTION_PROJECT_ID

# 2. Create backup FIRST
bunx supabase db dump -f emergency_backup_$(date +%Y%m%d_%H%M%S).sql

# 3. Option A: Restore from backup
bunx supabase db push --dry-run  # Preview
bunx supabase db reset --db-url $DATABASE_URL

# 4. Option B: Write reverse migration
# Create migration to undo changes manually
bunx supabase migration new rollback_feature_x
# Edit to reverse changes
bunx supabase db push
```

### Desktop App Rollback

**Option 1: Delete Bad Release**

```bash
# Delete the problematic release
gh release delete precision-v1.0.1 --yes

# Users on auto-update will stay on previous version
# Re-release fixed version when ready
```

**Option 2: Publish Hotfix**

```bash
# Quick patch release
git tag precision-v1.0.2
git push origin precision-v1.0.2

# Builds fixed version
# Users auto-update within 24 hours
```

---

## 📊 MONITORING & DEBUGGING

### Workflow Monitoring

```bash
# List recent runs
gh run list --limit 10

# Watch a running workflow
gh run watch

# View failed workflow
gh run view <run-id> --log-failed

# Re-run failed workflow
gh run rerun <run-id>
```

### Vercel Logs

```bash
# View production logs
vercel logs truss --prod

# View specific deployment
vercel logs <deployment-url>

# Follow live logs
vercel logs --follow
```

### Database Monitoring

```bash
# Check Supabase status
bun run db:status

# Health check
bun run db:health

# View database logs (Supabase dashboard)
open https://supabase.com/dashboard/project/[project-ref]/logs/postgres
```

### Performance Monitoring

**Vercel Analytics**:

- https://vercel.com/forerelic/truss/analytics

**Supabase Metrics**:

- https://supabase.com/dashboard/project/[project-ref]/reports

### Error Tracking

**Vercel Errors**:

- Dashboard → Logs → Filter by "error"

**Better Auth Logs**:

```typescript
// Server logs
console.log("Auth event:", event);

// Client logs
authClient.onAuthStateChange((event) => {
  console.log("Auth changed:", event);
});
```

---

## 🔧 TROUBLESHOOTING

### Common Issues

#### "EADDRINUSE: Port already in use"

```bash
# Kill stuck processes
bun run cleanup-ports

# Or manually
lsof -ti:3000 | xargs kill -9
lsof -ti:1420 | xargs kill -9
```

#### "Supabase CLI not running"

```bash
# Start Supabase
bun run db:start

# If stuck, full restart
bun run db:stop
bun run db:start
```

#### "Type drift detected"

```bash
# Regenerate types
bun run db:generate:local

# Check diff
git diff packages/ui/src/lib/supabase/types.ts

# Commit if correct
git add packages/ui/src/lib/supabase/types.ts
git commit -m "fix: update types after schema change"
```

#### "CI failing on type check"

```bash
# Run locally
bun run check-types

# Check specific package
cd packages/ui
bun run check-types

# View errors
bunx tsc --noEmit
```

#### "Vercel build failing"

```bash
# Check environment variables
vercel env ls

# Pull env locally to test
vercel env pull .env.vercel

# Build locally
bun run build:web
```

#### "Database migration failed"

```bash
# Validate migration SQL
bun run db:validate

# Test locally first
bun run db:reset

# Check SQL syntax
cat supabase/migrations/[latest].sql
```

#### "Desktop build failing"

```bash
# Check Rust is installed
rustc --version

# Update Rust
rustup update

# Check Tauri deps (macOS)
xcode-select --install

# Clean and rebuild
cd apps/precision
cargo clean
bun run build
```

### Debug Mode

Enable verbose logging:

```bash
# Turbo verbose mode
TURBO_VERBOSITY=2 bun run build

# GitHub Actions debug
# Add to workflow:
env:
  ACTIONS_STEP_DEBUG: true
  ACTIONS_RUNNER_DEBUG: true
```

### Getting Help

1. **Check this guide** (you're here!)
2. **Search GitHub Issues**: https://github.com/forerelic/truss/issues
3. **View workflow runs**: https://github.com/forerelic/truss/actions
4. **Supabase docs**: https://supabase.com/docs
5. **Better Auth docs**: https://better-auth.com/docs
6. **Vercel docs**: https://vercel.com/docs

---

## 🔒 SECURITY CHECKLIST

### Before Production

- [ ] ✅ All secrets stored in GitHub Secrets (never committed)
- [ ] ✅ Vercel environment variables configured
- [ ] ✅ `.gitignore` blocks all `.env*` except `.example` files
- [ ] ✅ Row Level Security (RLS) enabled on all tables
- [ ] ✅ Database backups automated
- [ ] ✅ HTTPS enforced (Vercel automatic)
- [ ] ✅ Secure cookies in production (`useSecureCookies: true`)
- [ ] ✅ CORS properly configured
- [ ] ✅ Rate limiting enabled (Better Auth default)
- [ ] ✅ Two-factor authentication available

### Ongoing Security

- [ ] ✅ Dependabot auto-updates enabled
- [ ] ✅ CodeQL security scanning weekly
- [ ] ✅ Secret scanning with TruffleHog
- [ ] ✅ Regular dependency audits: `bun audit`
- [ ] ✅ Monitor Vercel/Supabase security alerts
- [ ] ✅ Rotate secrets quarterly
- [ ] ✅ Review access logs monthly

### Security Commands

```bash
# Audit dependencies
bun audit

# Check for secrets in code
git log -p | grep -i "password\|secret\|key" --color

# Verify .gitignore
git check-ignore -v .env.local

# Test authentication
bun run auth:test
```

---

## 📚 REFERENCE

### GitHub Actions Workflows

| Workflow                  | Trigger                                 | Purpose              |
| ------------------------- | --------------------------------------- | -------------------- |
| `ci.yml`                  | PR, push to main/develop                | Lint, test, build    |
| `database.yml`            | Push to main/develop (supabase changes) | Deploy migrations    |
| `validate-migrations.yml` | PR (supabase changes)                   | Validate SQL & types |
| `changesets.yml`          | Push to main                            | Version management   |
| `release-desktop.yml`     | Tags `*-v*`, manual                     | Build installers     |
| `codeql.yml`              | Weekly, PR                              | Security scanning    |

### Environment Variables

**GitHub Secrets (15)**:

```
BETTER_AUTH_SECRET
NEXT_PUBLIC_APP_URL
PRODUCTION_DATABASE_URL
PRODUCTION_DB_PASSWORD
PRODUCTION_PROJECT_ID
PRODUCTION_SUPABASE_ANON_KEY
PRODUCTION_SUPABASE_URL
STAGING_DATABASE_URL
STAGING_DB_PASSWORD
STAGING_PROJECT_ID
STAGING_SUPABASE_ANON_KEY
STAGING_SUPABASE_URL
STAGING_WEB_URL
SUPABASE_ACCESS_TOKEN
TURBO_TOKEN
```

**GitHub Variables (2)**:

```
TURBO_TEAM=forerelic
ENABLE_CODE_SIGNING=false
```

### Package.json Scripts

**Development**:

```bash
bun run dev              # All apps
bun run dev:web          # Web only
bun run dev:precision    # Precision only
bun run dev:momentum     # Momentum only
```

**Building**:

```bash
bun run build            # All apps
bun run build:web
bun run build:precision
bun run build:momentum
```

**Quality**:

```bash
bun run lint             # ESLint
bun run format           # Prettier write
bun run format:check     # Prettier check
bun run check-types      # TypeScript
```

**Database**:

```bash
bun run db:start         # Start local Supabase
bun run db:stop          # Stop local Supabase
bun run db:status        # Check status
bun run db:studio        # Open Studio
bun run db:reset         # Reset local DB
bun run db:push          # Push migrations
bun run db:generate      # Generate types
bun run db:types:check   # Check type drift
bun run db:validate      # Validate SQL
bun run db:migration:create <name>  # Create migration
```

**Utilities**:

```bash
bun run cleanup-ports    # Kill port 3000/1420
bun run clean            # Clean build artifacts
```

### URLs

**Production**:

- Web: https://truss.forerelic.com
- GitHub: https://github.com/forerelic/truss
- Vercel: https://vercel.com/forerelic/truss
- Supabase: https://supabase.com/dashboard/project/[prod-id]

**Staging**:

- Web: https://staging.truss.forerelic.com
- Supabase: https://supabase.com/dashboard/project/[staging-id]

**Resources**:

- Turborepo: https://turbo.build/repo/docs
- Better Auth: https://better-auth.com/docs
- Tauri: https://v2.tauri.app
- Supabase: https://supabase.com/docs

---

## 🎯 QUICK REFERENCE CARDS

### Deploy Web to Production

```bash
git checkout main
git merge develop
git push origin main
# ✅ Auto-deploys via Vercel
```

### Deploy Database to Production

```bash
# 1. Create migration
bun run db:migration:create add_feature

# 2. Edit SQL, test locally
bun run db:reset

# 3. Generate types
bun run db:generate:local

# 4. Commit & push
git add supabase/ packages/ui/src/lib/supabase/types.ts
git commit -m "feat: add feature"
git push origin main
# ✅ Auto-deploys via GitHub Actions
```

### Release Desktop App

```bash
# Option 1: Changesets (recommended)
bun run changeset
git add .changeset/
git commit -m "chore: changeset"
git push
# Merge "Version Packages" PR

# Option 2: Manual tag
git tag precision-v1.0.0
git push origin precision-v1.0.0
# ✅ Builds via GitHub Actions
```

### Rollback Production

```bash
# Web: Vercel dashboard → Previous deployment → Promote
# or: git revert <commit> && git push

# Database: bunx supabase db dump + manual restore
# Desktop: gh release delete <tag>
```

---

**🎉 You're ready to deploy!**

Questions? Open an issue: https://github.com/forerelic/truss/issues/new

Last updated: 2025-10-10 by Claude Code
