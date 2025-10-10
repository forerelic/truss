# Scripts Directory

Utility scripts for the Truss monorepo.

## Database & Migration Scripts

### `db-migration-helper.sh` 🚀

Interactive helper for creating migrations with automatic type generation.

**Use when:** Creating new database migrations.

**Usage:**

```bash
bun run db:migration:create add_users_table
```

**What it does:**

1. Creates a new migration file
2. Opens it in your default editor
3. Applies the migration locally
4. Generates TypeScript types automatically
5. Formats the generated types with Prettier
6. Shows you the next steps to commit

---

### `db-generate-types.ts` 📝

Generates TypeScript types from your Supabase database schema.

**Use when:** You need to update types after schema changes.

**Usage:**

```bash
bun run db:generate              # Auto-detect (local or remote)
bun run db:generate:local        # Force local database
bun run db:generate:remote       # Force remote database
```

**What it does:**

1. Connects to Supabase (local or remote)
2. Generates TypeScript types
3. Saves to `packages/ui/src/lib/supabase/types.ts`

---

### `db-check-type-drift.ts` 🔍

Checks if committed types match the current database schema.

**Use when:** Validating migrations in CI or before pushing.

**Usage:**

```bash
bun run db:types:check
```

**What it does:**

1. Generates types from current local database
2. Compares with committed `types.ts` file
3. Shows diff if they don't match
4. Exits with error if drift detected (fails CI)

---

### `db-validate-migrations.ts` ✅

Validates SQL syntax and checks for common migration issues.

**Use when:** Before committing migrations or in CI.

**Usage:**

```bash
bun run db:validate [migration-file]
```

**What it checks:**

- ✅ SQL syntax validity
- ✅ Dangerous operations (DROP TABLE without IF EXISTS)
- ✅ Missing RLS (Row Level Security) policies
- ✅ Foreign keys without ON DELETE clauses
- ✅ Table creation without IF NOT EXISTS

---

### `db-push-safe.ts` 🛡️

Safely pushes migrations with validation checks.

**Use when:** Manually deploying migrations.

**Usage:**

```bash
bun run db:push
```

**What it does:**

1. Validates migrations first
2. Shows a confirmation prompt
3. Pushes to the database
4. Handles errors gracefully

---

### `db-health-check.ts` 🏥

Checks database connection and migration status.

**Usage:**

```bash
bun run db:health
```

---

### `db-pull-schema.ts` ⬇️

Pulls the current database schema into migration files.

**Use when:** Syncing local migrations with remote schema.

**Usage:**

```bash
bun run db:pull
```

---

## Development Scripts

### `cleanup-ports.sh` 🧹

Kills processes on ports 3000 and 1420.

**Use when:** You get "EADDRINUSE" errors.

**Usage:**

```bash
./scripts/cleanup-ports.sh
# or via package.json
bun run cleanup-ports
```

**What it does:**

1. Checks if ports 3000 and 1420 are in use
2. Sends SIGTERM (graceful shutdown) to processes
3. Waits 5 seconds for graceful shutdown
4. Sends SIGKILL if processes don't respond
5. Reports success/failure for each port

---

## Troubleshooting

### "EADDRINUSE: address already in use"

```bash
bun run cleanup-ports
```

### Old processes keep hanging around

```bash
# Kill all node/bun processes
pkill -f "node\|bun"

# Or use cleanup script
bun run cleanup-ports
```

---

## Quick Reference

| Command                 | What it does                      |
| ----------------------- | --------------------------------- |
| `bun run cleanup-ports` | Kill processes on ports 3000/1420 |
| `bun run health-check`  | Verify all services are healthy   |
