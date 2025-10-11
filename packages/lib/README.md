# @truss/lib

**Purpose**: Shared utility functions and helpers for all applications

## Usage

```typescript
// Date utilities
import { formatDate, formatRelativeTime, isToday } from "@truss/lib/date";

// String utilities
import { slugify, truncate, capitalize } from "@truss/lib/string";

// Validation
import { isValidEmail, isStrongPassword } from "@truss/lib/validation";

// Platform detection
import { isTauri, getOS, isMobile } from "@truss/lib/platform";

// General utilities
import { debounce, sleep, uniqueId } from "@truss/lib/utils";
```

## What Goes Here

✅ **DO** add:

- Pure utility functions (no side effects)
- String/date/number formatters
- Validation helpers
- Platform detection utilities
- Common algorithms (debounce, throttle, etc.)

❌ **DON'T** add:

- Business logic (use `@truss/features`)
- Database queries (use `@truss/database`)
- API calls (use app-specific code)
- React components or hooks (use `@truss/ui` or `@truss/features`)

## Rules

1. **Pure functions** - No side effects, deterministic output
2. **Platform-agnostic** - Must work in both Next.js and Tauri
3. **Well-tested** - All utilities should have test coverage
4. **No external dependencies** - Keep it lightweight

## File Structure

```
src/
├── date.ts         - Date/time formatting and manipulation
├── string.ts       - String manipulation (slugify, truncate, etc.)
├── validation.ts   - Input validation (email, URL, etc.)
├── platform.ts     - Platform/browser/OS detection
├── utils.ts        - General utilities (debounce, sleep, etc.)
└── index.ts        - Barrel export
```

## Dependencies

None - This package has zero external dependencies
