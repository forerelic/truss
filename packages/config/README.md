# @truss/config

**Purpose**: Shared configuration, constants, and environment helpers

## Usage

```typescript
// Constants
import { AUTH, URLS, PAGINATION } from "@truss/config/constants";

// Environment helpers
import { getEnv, isDev, getApiUrl } from "@truss/config/env";

// Feature flags
import { features, isFeatureEnabled } from "@truss/config/features";

// Examples
const sessionDuration = AUTH.SESSION_DURATION; // 7 days
const apiUrl = getApiUrl(); // http://localhost:3000 (dev) or production URL
const is2FAEnabled = features.enableTwoFactor; // true
```

## What Goes Here

✅ **DO** add:

- Application constants (URLs, limits, timeouts)
- Environment variable helpers
- Feature flags
- Configuration objects
- Validation patterns (regex, etc.)

❌ **DON'T** add:

- Secrets or API keys (use environment variables)
- Business logic (use `@truss/features`)
- Database queries (use `@truss/database`)
- Runtime utilities (use `@truss/lib`)

## Rules

1. **Constants only** - All values should be `const` or `as const`
2. **No secrets** - Never hardcode sensitive data
3. **Environment-aware** - Support dev/staging/production
4. **Platform-agnostic** - Must work in both Next.js and Tauri

## File Structure

```
src/
├── constants.ts    - App constants (AUTH, URLS, PAGINATION, etc.)
├── env.ts          - Environment variable helpers
├── features.ts     - Feature flags and A/B testing
└── index.ts        - Barrel export
```

## Dependencies

None - This package has zero external dependencies

## Environment Variables

This package provides helpers for accessing environment variables:

### Next.js (prefix: `NEXT_PUBLIC_`)

```bash
NEXT_PUBLIC_APP_URL=https://truss.forerelic.com
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
```

### Tauri (prefix: `VITE_`)

```bash
VITE_API_URL=https://truss.forerelic.com
VITE_SUPABASE_URL=https://xxx.supabase.co
```
