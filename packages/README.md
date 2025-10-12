# Truss Packages

This directory contains the shared packages used across all Truss applications (web, Precision,
Momentum).

## Package Architecture

### Principles

1. **Single Responsibility** - Each package has ONE clear purpose
2. **Just-in-Time (JIT) Strategy** - Packages export TypeScript source, not compiled JS
3. **Platform-Agnostic** - All packages work in both Next.js and Tauri environments
4. **Zero Circular Dependencies** - Maintain acyclic dependency graph

### Dependency Flow

```
Apps (web, precision, momentum)
  ↓
Feature Packages (@truss/features)
  ↓
Infrastructure Packages (@truss/auth, @truss/database, @truss/ui)
  ↓
Foundation Packages (@truss/types, @truss/lib, @truss/config)
  ↓
Build Tools (@truss/eslint-config, @truss/typescript-config)
```

**Rule**: Higher-level packages can depend on lower-level ones, but NEVER the reverse.

## Core Packages

### Infrastructure

| Package                    | Purpose                         | Dependencies                             |
| -------------------------- | ------------------------------- | ---------------------------------------- |
| `@truss/auth`              | Better Auth server & clients    | `@truss/config`, `@truss/database`       |
| `@truss/database`          | Supabase types & client         | `@truss/config`                          |
| `@truss/ui`                | Platform-agnostic UI components | `@truss/lib`, `@truss/types`             |
| `@truss/features`          | Business logic features         | All infrastructure + foundation packages |
| `@truss/types`             | Centralized TypeScript types    | `@truss/database` (for type re-exports)  |
| `@truss/lib`               | Utility functions & helpers     | None                                     |
| `@truss/config`            | Configuration & constants       | None                                     |
| `@truss/eslint-config`     | Shared ESLint configuration     | None                                     |
| `@truss/typescript-config` | Shared TypeScript config        | None                                     |

## Package Decision Tree

### "Where should I put this code?"

#### 1. Is it a **type definition only**?

→ `@truss/types`

**Examples**: API response types, database types, utility types

#### 2. Is it a **pure utility function**?

→ `@truss/lib`

**Examples**: String formatters, date utilities, validation helpers

#### 3. Is it a **constant or configuration**?

→ `@truss/config`

**Examples**: URLs, timeouts, feature flags, environment helpers

#### 4. Is it a **UI component**?

→ `@truss/ui`

**Examples**: Buttons, cards, modals, generic React components

#### 5. Is it **authentication related**?

→ `@truss/auth`

**Examples**: Better Auth config, session management, auth clients

#### 6. Is it **database related**?

→ `@truss/database`

**Examples**: Supabase client, database queries (future)

#### 7. Is it **business logic or a feature**?

→ `@truss/features`

**Examples**: Organization management, permission checking, workspace context

#### 8. Is it **app-specific**?

→ Keep in `apps/web/`, `apps/precision/`, or `apps/momentum/`

**Examples**: Next.js-specific code, Tauri commands, app-specific pages

## Separation of Concerns

### Platform-Agnostic Code

✅ **Can use anywhere** (web + desktop):

- React components (with `"use client"` directive)
- TypeScript types
- Pure functions
- Browser APIs (if you check `typeof window !== 'undefined'`)

❌ **Next.js-specific** (keep in `apps/web/`):

- `next/image`, `next/link`, `next/router`
- Next.js API routes
- Server Components (without `"use client"`)
- Middleware

❌ **Tauri-specific** (keep in `apps/precision/` or `apps/momentum/`):

- `@tauri-apps/api` imports
- Tauri commands and events
- Native filesystem access

### Import Rules

✅ **GOOD**:

```typescript
// Use package imports
import type { ApiResponse } from "@truss/types/api";
import { formatDate } from "@truss/lib/date";
import { AUTH } from "@truss/config/constants";
import { hasPermission } from "@truss/features/organizations";
```

❌ **BAD**:

```typescript
// Never use deep file imports
import { ApiResponse } from "@truss/types/src/api";
import { formatDate } from "@truss/lib/src/date";
```

## Adding a New Package

### Checklist

1. **Create package directory**:

   ```bash
   mkdir -p packages/my-package/src
   ```

2. **Create `package.json`**:

   ```json
   {
     "name": "@truss/my-package",
     "version": "0.0.0",
     "private": true,
     "type": "module",
     "exports": {
       ".": "./src/index.ts"
     },
     "scripts": {
       "lint": "eslint . --max-warnings 0",
       "check-types": "tsc --noEmit"
     },
     "peerDependencies": {
       // Add peer dependencies here
     },
     "devDependencies": {
       "@truss/eslint-config": "*",
       "@truss/typescript-config": "*",
       "typescript": "5.9.2",
       "eslint": "^9.34.0"
     }
   }
   ```

3. **Create `tsconfig.json`**:

   ```json
   {
     "extends": "@truss/typescript-config/base.json",
     "compilerOptions": {
       "outDir": "./dist",
       "rootDir": "./src",
       "module": "ESNext",
       "moduleResolution": "Bundler"
     },
     "include": ["src/**/*.ts"],
     "exclude": ["node_modules", "dist"]
   }
   ```

4. **Create `eslint.config.mjs`**:

   ```javascript
   import { config } from "@truss/eslint-config/library";
   export default config;
   ```

5. **Create `src/index.ts`** with exports

6. **Create `README.md`** following Anthropic's best practices

7. **Run setup**:

   ```bash
   bun install
   cd packages/my-package
   bun run lint
   bun run check-types
   ```

## Common Pitfalls

### ❌ Circular Dependencies

```
@truss/ui → @truss/features → @truss/ui  (BAD!)
```

**Fix**: Move shared code to a lower-level package or create a new foundation package.

### ❌ Mixing Platform-Specific Code

```typescript
// DON'T do this in a shared package
import Image from "next/image"; // Next.js-specific!
```

**Fix**: Keep Next.js code in `apps/web/`, use generic `<img>` in shared packages.

### ❌ Using `dependencies` Instead of `peerDependencies`

```json
{
  "dependencies": {
    "react": "^19.1.0" // WRONG for internal packages
  }
}
```

**Fix**: Use `peerDependencies` for external libraries, workspace protocol for internal packages:

```json
{
  "peerDependencies": {
    "@truss/types": "*", // Workspace package
    "react": "^19.1.0" // External library
  }
}
```

### ❌ Committing Built Files

Always add to `.gitignore`:

```gitignore
dist/
.next/
.turbo/
```

## Quality Standards

Every package MUST:

- ✅ Pass `bun run lint` with 0 warnings
- ✅ Pass `bun run check-types` with 0 errors
- ✅ Have proper exports in `package.json`
- ✅ Use correct peer dependencies
- ✅ Follow Single Responsibility Principle
- ✅ Have a scannable README.md
- ✅ Use proper TypeScript types (no `any`)

## Technology Stack

- **Build System**: Turborepo with remote caching
- **Package Manager**: Bun 1.2.4+
- **Module System**: ESM (ES Modules)
- **TypeScript**: 5.9.2 with strict mode
- **React**: 19.1.0 (for UI components)
- **Styling**: Tailwind CSS v4
- **Database**: Supabase PostgreSQL
- **Authentication**: Better Auth
- **UI Components**: Shadcn UI (Radix UI primitives)

## References

- **Cal.com Monorepo**: https://github.com/calcom/cal.com/tree/main/packages
- **Turborepo Docs**: https://turborepo.com/docs/core-concepts/internal-packages
- **Better Auth**: https://www.better-auth.com/docs/concepts/typescript
- **Anthropic Best Practices**: https://www.anthropic.com/engineering/claude-code-best-practices

---

**Last Updated**: 2025-10-11 **Maintainer**: Truss Development Team **Status**: ✅ Production-Ready
