# Scripts Directory

Automation scripts for the Truss monorepo.

## Database Management

| Script                      | Description                      | Usage                      |
| --------------------------- | -------------------------------- | -------------------------- |
| `db-check-type-drift.ts`    | Check for Supabase type drift    | `bun run db:types:check`   |
| `db-generate-types.ts`      | Generate TypeScript types        | `bun run db:generate`      |
| `db-health-check.ts`        | Validate database health         | `bun run db:health`        |
| `db-migration-helper.sh`    | Interactive migration creator    | `bun run db:migration:new` |
| `db-pull-schema.ts`         | Pull schema from Supabase        | `bun run db:pull`          |
| `db-push-safe.ts`           | Safe schema push with validation | `bun run db:push`          |
| `db-validate-migrations.ts` | Validate migration files         | `bun run db:validate`      |

## Authentication

| Script                       | Description                     | Usage                   |
| ---------------------------- | ------------------------------- | ----------------------- |
| `generate-auth-migration.ts` | Generate Better Auth migrations | `bun run auth:generate` |
| `test-better-auth.ts`        | Test Better Auth configuration  | `bun run auth:test`     |

## Environment & Utilities

| Script                    | Description                         | Usage                   |
| ------------------------- | ----------------------------------- | ----------------------- |
| `validate-environment.ts` | Validate environment variables      | `bun run env:validate`  |
| `cleanup-ports.sh`        | Kill processes on conflicting ports | `bun run cleanup-ports` |

## Setup Scripts (Archived)

One-time setup scripts are in `/docs/setup-scripts/`:

- `set-vercel-env.sh` - Configure Vercel environment variables
- `setup-github-secrets.sh` - Configure GitHub secrets

These are rarely needed after initial project setup.

## Adding New Scripts

1. Create script in `/scripts/` directory
2. Add executable permissions: `chmod +x scripts/your-script.sh`
3. Add to `package.json` scripts section
4. Update this README with description and usage

## Development Notes

- All TypeScript scripts run with `bun` for fast execution
- Shell scripts use `#!/usr/bin/env bash` for portability
- Scripts follow the principle: "Fail fast, fail loud"
- Always validate inputs and provide clear error messages
