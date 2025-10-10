import { useBetterAuthTauri } from "@daveyplate/better-auth-tauri/react";
import { tauriAuthClient, useSession } from "@truss/ui/lib/auth/tauri-client";
import { Card, CardContent, CardHeader, CardTitle } from "@truss/ui/components/card";
import { Button } from "@truss/ui/components/button";

function App() {
  // Set up Better Auth Tauri deep link handler
  // This enables OAuth flows (GitHub, Google) to work in the desktop app
  // The hook handles initialization internally, no need for useRef
  useBetterAuthTauri({
    authClient: tauriAuthClient,
    scheme: "truss", // Must match tauri.conf.json
    debugLogs: import.meta.env.DEV,
    onRequest: (href) => {
      console.log("[Auth] OAuth request initiated:", href);
    },
    onSuccess: (callbackURL) => {
      console.log("[Auth] ✅ Authentication successful!");
      // Navigate to callback URL or dashboard
      // navigate(callbackURL || '/dashboard')
    },
    onError: (error) => {
      console.error("[Auth] ❌ Authentication failed:", error);
      // Show user-friendly error notification
    },
  });

  return <MomentumApp />;
}

function MomentumApp() {
  const { data: session, isPending } = useSession();

  if (isPending) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Loading Momentum...</p>
        </div>
      </div>
    );
  }

  if (!session?.user) {
    return <AuthView />;
  }

  return (
    <div className="min-h-screen bg-background">
      <DashboardView user={session.user} />
    </div>
  );
}

function AuthView() {
  const handleSignIn = async () => {
    // Use Better Auth sign in methods
    // Example: await signIn.social({ provider: 'github' })
    console.log("Sign in clicked - implement auth flow");
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl text-center">Welcome to Momentum</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-center text-muted-foreground">
            Project tracking and progress management for construction teams.
          </p>
          <Button onClick={handleSignIn} className="w-full" size="lg">
            Sign In
          </Button>
          <p className="text-xs text-center text-muted-foreground">
            Part of the MCP Suite by Forerelic
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

function DashboardView({ user }: { user: any }) {
  return (
    <div className="container mx-auto p-8">
      <Card>
        <CardHeader>
          <CardTitle>Momentum Dashboard</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground mb-4">Welcome back, {user.name || user.email}!</p>
          <p className="text-sm text-muted-foreground">
            🚧 Dashboard under construction. Start building your project tracking features here.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

export default App;
