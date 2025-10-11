# @truss/auth

Authentication package using [Better Auth](https://better-auth.com).

## Contents

- **Server configuration** with Better Auth plugins
- **Web client** for Next.js applications
- **Tauri client** for desktop applications
- **Type inference** from server to clients

## Usage

### Server (Next.js API Routes)

```typescript
import { auth } from "@truss/auth/server";

// In your API route handler
export const { GET, POST } = auth.handler;
```

### Web Client (Next.js)

```typescript
import { authClient, useSession } from "@truss/auth/client";

function MyComponent() {
  const { data: session, isPending } = useSession();

  if (isPending) return <div>Loading...</div>;
  if (!session) return <div>Not authenticated</div>;

  return <div>Hello, {session.user.name}!</div>;
}
```

### Tauri Client (Desktop Apps)

```typescript
import { tauriAuthClient, useTauriSession } from "@truss/auth/client";
import { useBetterAuthTauri } from "@daveyplate/better-auth-tauri/react";

function App() {
  // Initialize Tauri deep link handling
  useBetterAuthTauri({
    authClient: tauriAuthClient,
    scheme: "truss",
    debugLogs: import.meta.env.DEV,
  });

  const { data: session } = useTauriSession();

  return <div>Your App</div>;
}
```

## Features

- ✅ Email/password authentication
- ✅ OAuth providers (GitHub, Google)
- ✅ Two-factor authentication (TOTP)
- ✅ Organization/team management
- ✅ Admin role system
- ✅ Tauri deep link support
- ✅ Full TypeScript type inference

## Architecture

This package follows Better Auth's intended setup:

- Server configuration in `server.ts`
- Client implementations in `client/` directory
- Type inference using `inferAdditionalFields`
- Separate clients for different environments

## Environment Variables

### Server (Next.js)

- `DATABASE_URL` - PostgreSQL connection string
- `BETTER_AUTH_SECRET` - Secret key for session signing
- `NEXT_PUBLIC_APP_URL` - Application base URL
- `GITHUB_CLIENT_ID`, `GITHUB_CLIENT_SECRET` - OAuth (optional)
- `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET` - OAuth (optional)

### Client (Web)

- `NEXT_PUBLIC_APP_URL` - Application base URL

### Client (Tauri)

- `VITE_BETTER_AUTH_URL` - Auth server URL (production)
- Auto-detects `http://localhost:3000` in development
