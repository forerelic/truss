# @truss/ui

**Purpose**: Platform-agnostic UI components that work in both Next.js and Tauri environments

## Usage

```typescript
// Import components
import { Button } from "@truss/ui/components/button";
import { Card, CardHeader, CardTitle, CardContent } from "@truss/ui/components/card";
import { Input } from "@truss/ui/components/input";

// Import utilities
import { cn } from "@truss/ui/lib/utils";

// Import styles
import "@truss/ui/globals.css";
import "@truss/ui/styles/theme.css";

// Example usage
function MyComponent() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Hello World</CardTitle>
      </CardHeader>
      <CardContent>
        <Input placeholder="Enter text..." />
        <Button variant="default">Click me</Button>
      </CardContent>
    </Card>
  );
}
```

## What Goes Here

✅ **DO** add:

- Platform-agnostic React components (Button, Card, Input, etc.)
- Shadcn UI components and variants
- Reusable UI patterns (modals, dropdowns, etc.)
- UI utility functions (cn, classnames, etc.)
- Shared CSS and theme files

❌ **DON'T** add:

- Next.js-specific components (use `<img>` not `<Image>`)
- Tauri-specific components (keep in app directories)
- Business logic (use `@truss/features`)
- API calls or data fetching
- Page layouts (keep in app directories)

## Rules

1. **Platform-agnostic** - Must work in both Next.js (web) and Tauri (desktop)
2. **"use client" directive** - Required for React 19 Server Components compatibility
3. **No framework imports** - No `next/image`, `next/link`, or `@tauri-apps/api`
4. **Shadcn UI based** - Built on Radix UI primitives with Tailwind CSS v4
5. **Composable** - Components should be small, focused, and composable

## File Structure

```
src/
├── components/
│   ├── button.tsx       - Button component with variants
│   ├── card.tsx         - Card components (Card, CardHeader, etc.)
│   ├── input.tsx        - Input component
│   └── index.ts         - Barrel export (optional)
├── hooks/
│   └── ...              - Custom React hooks (future)
├── lib/
│   └── utils.ts         - Utility functions (cn, etc.)
└── styles/
    ├── globals.css      - Global styles
    └── theme.css        - Tailwind CSS v4 theme tokens
```

## Component Guidelines

### Variants

Use `class-variance-authority` (CVA) for component variants:

```typescript
import { cva, type VariantProps } from "class-variance-authority";

const buttonVariants = cva(
  "inline-flex items-center justify-center rounded-md text-sm font-medium",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground",
        destructive: "bg-destructive text-destructive-foreground",
        outline: "border border-input",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-md px-3",
        lg: "h-11 rounded-md px-8",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);
```

### Props

Export prop types for external use:

```typescript
export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}
```

### Composition

Use Radix UI's `Slot` component for composition:

```typescript
import { Slot } from "@radix-ui/react-slot";

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
```

## Generating New Components

Use Turbo generators to scaffold new components:

```bash
cd packages/ui
bun run generate:component

# Follow the prompts:
# Component name: my-component
# Description: My new component
```

This creates:

- `src/components/my-component.tsx` - Component file
- Proper exports with CVA variants
- TypeScript types
- Base styling

## Styling

### Tailwind CSS v4

This package uses **Tailwind CSS v4** with CSS-first configuration:

- **Theme tokens** defined in `src/styles/theme.css`
- **Design tokens** use CSS custom properties
- **No tailwind.config.js** - configuration is in CSS

### Theme Variables

```css
/* src/styles/theme.css */
@theme {
  --color-primary: oklch(0.6 0.2 250);
  --color-secondary: oklch(0.7 0.15 280);
  /* ... */
}
```

### Utility Function

The `cn()` function combines `clsx` and `tailwind-merge`:

```typescript
import { cn } from "@truss/ui/lib/utils";

// Merge classes intelligently
cn("px-2 py-1", "px-4"); // → "py-1 px-4" (px-4 wins)
```

## Dependencies

- `react` (peer) - React 19.1.0+
- `@radix-ui/react-slot` - Composition utility
- `lucide-react` - Icon library
- `class-variance-authority` - Variant management
- `clsx` - Classname utility
- `tailwind-merge` - Tailwind class merging
- `@truss/lib` (peer) - Utility functions
- `@truss/types` (peer) - Type definitions

## Integration

### Next.js (Web)

```typescript
// app/layout.tsx
import "@truss/ui/globals.css";
import "@truss/ui/styles/theme.css";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
```

### Tauri (Desktop)

```typescript
// src/main.tsx
import "@truss/ui/globals.css";
import "@truss/ui/styles/theme.css";

function App() {
  return <div>{/* Your app */}</div>;
}
```

## Common Patterns

### Accessible Forms

```typescript
import { Input } from "@truss/ui/components/input";
import { Button } from "@truss/ui/components/button";

<form>
  <label htmlFor="email">Email</label>
  <Input id="email" type="email" placeholder="Enter email..." />
  <Button type="submit">Submit</Button>
</form>;
```

### Card Layouts

```typescript
import { Card, CardHeader, CardTitle, CardContent } from "@truss/ui/components/card";

<Card>
  <CardHeader>
    <CardTitle>Title</CardTitle>
  </CardHeader>
  <CardContent>
    <p>Content goes here</p>
  </CardContent>
</Card>;
```

## Best Practices

1. **Always use `"use client"`** at the top of component files
2. **Forward refs** for all components that render HTML elements
3. **Export prop types** for external use
4. **Use `cn()`** for className merging
5. **Test in both Next.js and Tauri** before committing
6. **Follow Shadcn UI patterns** for consistency
7. **Document complex components** with JSDoc comments

## Troubleshooting

### "use client" directive required

All React components must have `"use client"` directive:

```typescript
"use client";

import React from "react";
// ...
```

### Tailwind classes not applying

Ensure you've imported the global CSS:

```typescript
import "@truss/ui/globals.css";
import "@truss/ui/styles/theme.css";
```

### Component not rendering in Tauri

Check for Next.js-specific imports:

```typescript
// ❌ BAD
import Image from "next/image";

// ✅ GOOD
<img src="..." alt="..." />;
```

## Resources

- **Shadcn UI**: https://ui.shadcn.com
- **Radix UI**: https://www.radix-ui.com
- **Tailwind CSS v4**: https://tailwindcss.com
- **CVA**: https://cva.style
