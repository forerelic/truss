# CLAUDE.md

Instructions for Claude Code when working with this repository.

## Bash Commands

### Development

```bash
bun run dev:web          # Web app (localhost:3000)
bun run dev:precision    # Precision desktop (localhost:1420)
bun run dev:momentum     # Momentum desktop (localhost:1420)
```

### Quality Checks

```bash
bun run lint             # ESLint all packages
bun run check-types      # TypeScript type check
bun run format           # Prettier format
bun run format:check     # Check formatting (CI)
```

### Building

```bash
bun run build            # All apps
bun run build:web        # Web only
bun run build:precision  # Precision only
bun run build:momentum   # Momentum only
```

### Database (Supabase)

```bash
bun run db:start                    # Start local Supabase
bun run db:stop                     # Stop local Supabase
bun run db:status                   # Check status
bun run db:studio                   # Open Studio UI
bun run db:reset                    # Reset local DB
bun run db:migration:create <name>  # Create migration + generate types
bun run db:generate                 # Generate TypeScript types
bun run db:types:check              # Check for type drift
bun run db:validate                 # Validate SQL syntax
```

### Utilities

```bash
bun run cleanup-ports    # Kill processes on port 3000/1420
bun run clean            # Clean build artifacts
```

## Critical Rules

### Package Manager

- ✅ **ALWAYS** use `bun` commands
- ❌ **NEVER** use `npm install` or `yarn`

### Shared UI Package (@repo/ui)

- ✅ Keep components platform-agnostic (work in both Vite and Next.js)
- ❌ **NEVER** import Next.js-specific features (`next/link`, `next/image`, etc.)
- ❌ **NEVER** use Node.js-only libraries
- ✅ Next.js-specific code belongs in `apps/web/src/lib/` instead

### Environment Files

- ✅ **Package-specific** `.env.local` files in each app directory
- ❌ **NEVER** create root `.env.local` file (causes variable leakage)
- ✅ Structure:
  ```
  apps/web/.env.local
  apps/precision/.env.local
  apps/momentum/.env.local
  ```

### Authentication

- ✅ **Better Auth** is used (configured in `packages/ui/src/lib/auth/server.ts`)
- ❌ **Supabase Auth is DISABLED** (see `supabase/config.toml` line 123)
- ✅ Reason: Better Auth is framework-agnostic and more flexible

### Database Migrations

- ✅ Types committed **WITH** migrations (atomic changes)
- ✅ Use `bun run db:migration:create` for interactive helper
- ❌ **NEVER** manually commit types without migration
- ✅ Pre-push hook validates SQL syntax + type drift
- ⚠️ If type drift detected: run `bun run db:generate`

## Code Style

### TypeScript

- Use ES modules (`import`/`export`), not CommonJS (`require`)
- Destructure imports when possible: `import { foo } from 'bar'`
- Explicit return types on exported functions
- Use `type` for object shapes, `interface` for extendable contracts

### React

- Functional components only (no class components)
- React 19 features available
- Use `"use client"` directive when needed (Next.js Server Components)

### Imports

```typescript
// Shared components
import { Button } from "@truss/ui/components/button";
import { cn } from "@truss/ui/lib/utils";
import type { Database } from "@truss/ui/lib/supabase/types";

// Web app (Next.js specific)
import { getSupabaseServerClient } from "@/lib/supabase/server";
```

## Architecture

### Monorepo Structure

```
apps/
  web/        - Next.js 15 marketing site (Vercel)
  precision/  - Tauri v2 desktop app (estimation)
  momentum/   - Tauri v2 desktop app (tracking)
packages/
  ui/         - Shared platform-agnostic components
  eslint-config/
  typescript-config/
scripts/      - Automation scripts
```

### Tech Stack

- **Web**: Next.js 15 + Tailwind CSS v4 + Better Auth
- **Desktop**: Tauri v2 + React 19 + Vite
- **Database**: Supabase Postgres (Better Auth tables)
- **Build**: Turborepo with remote caching
- **Package Manager**: Bun 1.2.4+
- **Styling**: Tailwind CSS v4 (design tokens)

### Deployment Pipeline

```
Local (any branch) → Staging (develop) → Production (main)
```

- **Local**: `localhost:3000` + local Supabase
- **Staging**: `staging.truss.forerelic.com` + staging Supabase
- **Production**: `truss.forerelic.com` + production Supabase

## Workflow

### Creating a Migration

```bash
# 1. Create migration + types in one command
bun run db:migration:create add_users_table

# 2. Interactive helper will:
#    - Create migration file
#    - Open in editor
#    - Apply locally
#    - Generate types
#    - Format with Prettier

# 3. Commit both files
git add supabase/migrations/ packages/ui/src/lib/supabase/types.ts
git commit -m "feat: add users table"
```

### Git Hooks

- **Pre-commit**: Auto-formats with Prettier (no ESLint)
- **Pre-push**: Validates migrations + checks type drift
- Bypass with `--no-verify` (not recommended)

### Type Checking

- **Always** run `bun run check-types` after making changes
- CI will fail if types don't match database schema
- Fix drift: `bun run db:generate`

### Changesets (Versioning)

```bash
# 1. Create changeset
bun run changeset
# Select packages, bump type, write summary

# 2. Commit
git add .changeset/
git commit -m "chore: add changeset"

# 3. CI creates "Version Packages" PR
# 4. Merge PR → triggers releases
```

## Repository Etiquette

### Branch Naming

- `feature/description` - New features
- `fix/description` - Bug fixes
- `chore/description` - Maintenance

### Commits

- Use conventional commits: `feat:`, `fix:`, `chore:`
- Keep commits atomic and focused
- Reference issues: `fix: resolve #123`

### Merging

- **Merge**, don't rebase (preserves history)
- Squash feature branches when merging to develop
- Keep main/develop clean

### PRs

- Title: conventional commit format
- Description: what changed and why
- CI must pass before merge
- If touching Supabase: migration validation required

## Environment Setup

### Required Tools

- Bun 1.2.4+ (`curl -fsSL https://bun.sh/install | bash`)
- Supabase CLI (`brew install supabase/tap/supabase`)
- Node.js v20.11.0 (see `.nvmrc`)

### Initial Setup

```bash
# 1. Install dependencies
bun install

# 2. Copy environment files
cp apps/web/.env.example apps/web/.env.local
cp apps/precision/.env.example apps/precision/.env.local
cp apps/momentum/.env.example apps/momentum/.env.local

# 3. Fill in values (see apps/*/env.example for required vars)

# 4. Start local Supabase
bun run db:start

# 5. Generate types
bun run db:generate:local
```

## Unexpected Behaviors & Warnings

### Port Conflicts

- **Issue**: "EADDRINUSE: address already in use"
- **Fix**: `bun run cleanup-ports`

### Supabase Auth Disabled

- **Warning**: `supabase/config.toml` has `auth.enabled = false`
- **Reason**: Using Better Auth instead (more flexible)
- **Don't** enable Supabase Auth - causes conflicts

### Type Errors After Schema Changes

- **Issue**: TypeScript errors after migration
- **Fix**: `bun run db:generate`
- **Prevention**: Use `bun run db:migration:create` (auto-generates)

### Build Failures

- **Issue**: Builds fail with env errors
- **Fix**: Check `.env.local` exists in affected app
- **Common**: Forgetting to copy `.env.example` → `.env.local`

### Connection Pooling

- **Enabled** in `supabase/config.toml` (port 54329)
- **Mode**: Transaction pooling
- **Limits**: 20 connections per user, 100 max clients

### Turborepo Cache

- **Remote caching enabled** (requires `TURBO_TOKEN`)
- **Local cache**: `.turbo/cache/` (gitignored)
- **Bust cache**: `bun run clean`

## Core Files

### Configuration

- `turbo.json` - Turborepo config (envMode: "strict")
- `supabase/config.toml` - Supabase local config
- `.nvmrc` - Node version (v20.11.0)
- `.editorconfig` - Editor consistency

### Git Hooks

- `.husky/pre-commit` - Prettier formatting
- `.husky/pre-push` - Migration validation

### Database

- `supabase/migrations/` - SQL migration files
- `packages/ui/src/lib/supabase/types.ts` - Generated types
- `supabase/seed.sql` - Seed data

### Auth

- `packages/ui/src/lib/auth/server.ts` - Better Auth config
- `apps/web/app/api/auth/[...all]/route.ts` - Auth API handler

### Scripts

- `scripts/db-migration-helper.sh` - Interactive migration creator
- `scripts/db-check-type-drift.ts` - Type drift validator
- `scripts/db-generate-types.ts` - Type generator

## Documentation

For comprehensive deployment instructions, see **`DEPLOYMENT.md`** (600+ lines, single source of
truth).

For authentication details, see **`docs/AUTHENTICATION.md`**.

---

**Last Updated**: 2025-10-10 **Maintainer**: Claude Code **Version**: Production-ready (Grade A-)
