# @truss/types

**Purpose**: Centralized TypeScript type definitions shared across all applications

## Usage

```typescript
// API types
import type { ApiResponse, HttpStatus } from "@truss/types/api";
import { ApiError, isSuccessResponse } from "@truss/types/api";

// Database types
import type { Database } from "@truss/types/database";

// Common utility types
import type { Result, Nullable, Prettify } from "@truss/types/common";
```

## What Goes Here

✅ **DO** add:

- Shared TypeScript types used across multiple apps
- API response/request types
- Common utility types (Result, Nullable, etc.)
- Database type re-exports for convenience

❌ **DON'T** add:

- Business logic (use `@truss/features`)
- Runtime code (use `@truss/lib`)
- Configuration values (use `@truss/config`)
- App-specific types (keep in app directories)

## Rules

1. **Type-only exports** - No runtime code or functions
2. **Platform-agnostic** - Must work in both Next.js and Tauri
3. **No external dependencies** - Only depends on `@truss/database` for type re-exports
4. **Generic and reusable** - Types should be broadly applicable

## File Structure

```
src/
├── api.ts          - API response types, HttpStatus enum, ApiError
├── database.ts     - Database type re-exports and utilities
├── common.ts       - Generic utility types (Prettify, DeepPartial, etc.)
└── index.ts        - Barrel export
```

## Dependencies

- `@truss/database` (peer) - For database type re-exports
