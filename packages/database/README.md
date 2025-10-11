# @truss/database

Database package for Supabase PostgreSQL integration.

## Contents

- **Generated TypeScript types** from Supabase schema
- **Supabase client utilities** for browser environments

## Usage

```typescript
import type { Database } from "@truss/database";
import { getSupabaseClient } from "@truss/database/client";

const supabase = getSupabaseClient();
```

## Type Generation

Types are generated from the Supabase database schema using the Supabase CLI:

```bash
bun run db:generate
```

This runs the script that generates `src/types.ts` from your database schema.

## Architecture

This package follows 2025 Turborepo best practices:

- ✅ Single purpose: Database types and client
- ✅ Generated types committed with migrations
- ✅ Shared across all apps (web, precision, momentum)
- ✅ No UI concerns mixed in

## Environment Variables

Supports both Next.js and Vite environments:

**Next.js:**

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

**Vite (Tauri):**

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`
