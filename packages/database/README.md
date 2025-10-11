# @truss/database

**Purpose**: Supabase PostgreSQL types and client for all apps

## Quick Start

```typescript
import type { Database } from "@truss/database";
import { getSupabaseClient } from "@truss/database/client";

const supabase = getSupabaseClient();

// Query with full type safety
const { data, error } = await supabase.from("users").select("*").eq("email", "user@example.com");
```

## What Goes Here

✅ **DO** add:

- Generated TypeScript types from Supabase schema
- Supabase client utilities (browser-safe)
- Database type exports and re-exports

❌ **DON'T** add:

- Database migrations (use `supabase/migrations/`)
- Business logic (use `@truss/features`)
- UI components (use `@truss/ui`)
- Server-side utilities (keep in `apps/web/lib/supabase/`)

## Common Workflows

### Query Data

```typescript
import { getSupabaseClient } from "@truss/database/client";

const supabase = getSupabaseClient();

// Select
const { data: users } = await supabase.from("users").select("*");

// Filter
const { data: admin } = await supabase.from("users").select("*").eq("role", "admin").single();

// Join
const { data: posts } = await supabase.from("posts").select(`
    *,
    author:users(name, email)
  `);
```

### Insert Data

```typescript
const { data, error } = await supabase
  .from("users")
  .insert({
    email: "user@example.com",
    name: "John Doe",
  })
  .select()
  .single();
```

### Update Data

```typescript
const { data, error } = await supabase
  .from("users")
  .update({ name: "Jane Doe" })
  .eq("id", userId)
  .select()
  .single();
```

### Delete Data

```typescript
const { error } = await supabase.from("users").delete().eq("id", userId);
```

### Real-time Subscriptions

```typescript
const channel = supabase
  .channel("users-changes")
  .on("postgres_changes", { event: "*", schema: "public", table: "users" }, (payload) => {
    console.log("Change received!", payload);
  })
  .subscribe();

// Cleanup
channel.unsubscribe();
```

## Type Generation

Types are **automatically generated** from your Supabase database schema:

```bash
# Generate types from local Supabase
bun run db:generate:local

# Generate types from remote Supabase
bun run db:generate:remote
```

**Important**: Types are committed **with migrations** for atomic changes.

## Type Safety

### Table Types

```typescript
import type { Database } from "@truss/database";

type User = Database["public"]["Tables"]["users"]["Row"];
type UserInsert = Database["public"]["Tables"]["users"]["Insert"];
type UserUpdate = Database["public"]["Tables"]["users"]["Update"];
```

### Custom Types

```typescript
import type { Database } from "@truss/database";

type AppPermission = Database["public"]["Enums"]["app_permission"];
// → "view_app" | "use_app" | "manage_app"
```

### Function Return Types

```typescript
import type { Database } from "@truss/database";

type GetUserByEmailResult = Database["public"]["Functions"]["get_user_by_email"]["Returns"];
```

## Environment Setup

### Next.js (Web)

```bash
NEXT_PUBLIC_SUPABASE_URL="https://[project-ref].supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="your-anon-key"
```

### Vite (Tauri)

```bash
VITE_SUPABASE_URL="https://[project-ref].supabase.co"
VITE_SUPABASE_ANON_KEY="your-anon-key"
```

The client **automatically detects** which environment you're using.

## Platform Support

This package works in **both Next.js and Tauri**:

- **Next.js**: Uses `NEXT_PUBLIC_*` environment variables
- **Tauri**: Uses `VITE_*` environment variables
- **Client**: Platform-agnostic, works in both

```typescript
// Works everywhere!
const supabase = getSupabaseClient();
```

## Architecture

### Singleton Pattern

The client uses a **singleton pattern** to ensure only one instance exists:

```typescript
let client: ReturnType<typeof createBrowserClient<Database>> | undefined;

export function getSupabaseClient() {
  if (client) return client;
  client = createBrowserClient<Database>(supabaseUrl, supabaseAnonKey);
  return client;
}
```

### Reset Client (Testing)

```typescript
import { resetSupabaseClient } from "@truss/database/client";

// Reset singleton (useful for tests)
resetSupabaseClient();
```

## Migration Workflow

1. **Create migration**:

   ```bash
   bun run db:migration:create add_users_table
   ```

2. **Apply locally**:

   ```bash
   bun run db:push
   ```

3. **Generate types**:

   ```bash
   bun run db:generate:local
   ```

4. **Commit both**:
   ```bash
   git add supabase/migrations/ packages/database/src/types.ts
   git commit -m "feat: add users table"
   ```

**Important**: Pre-push hook validates SQL syntax and checks for type drift.

## Type Drift Detection

Pre-push hook checks for **type drift** between database schema and committed types:

```bash
# Manual check
bun run db:types:check

# If drift detected, regenerate
bun run db:generate:local
```

## Troubleshooting

### "Missing Supabase environment variables"

**Fix**: Set environment variables in `.env.local`:

```bash
# Next.js
NEXT_PUBLIC_SUPABASE_URL="https://[project-ref].supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="your-anon-key"

# Tauri
VITE_SUPABASE_URL="https://[project-ref].supabase.co"
VITE_SUPABASE_ANON_KEY="your-anon-key"
```

### Type errors after schema changes

**Fix**: Regenerate types:

```bash
bun run db:generate:local
```

### "Type drift detected" error

**Cause**: Database schema changed but types not updated.

**Fix**:

```bash
bun run db:generate:local
git add packages/database/src/types.ts
git commit --amend
```

### Client not working in Tauri

1. Check `VITE_*` environment variables are set (not `NEXT_PUBLIC_*`)
2. Verify Supabase URL is accessible from desktop app
3. Check CORS settings in Supabase dashboard

## Best Practices

1. **Always generate types after migrations**: Use `bun run db:migration:create` helper
2. **Commit types with migrations**: Keeps schema and types in sync
3. **Use type inference**: Let TypeScript infer types from queries
4. **Check for drift before push**: Pre-push hook catches issues early
5. **Reset client in tests**: Use `resetSupabaseClient()` for isolation

## Resources

- [Supabase Docs](https://supabase.com/docs)
- [Supabase + Turborepo Guide](https://philipp.steinroetter.com/posts/supabase-turborepo)
- [TypeScript Support](https://supabase.com/docs/reference/javascript/typescript-support)

## Dependencies

- `@supabase/ssr` (peer) - SSR support for Next.js
- `@supabase/supabase-js` (peer) - Supabase JavaScript client
- `@truss/config` (peer) - Environment configuration
