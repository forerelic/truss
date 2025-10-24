import { useBetterAuthTauri } from "@daveyplate/better-auth-tauri/react";
import { tauriAuthClient, useSession, signOut } from "./lib/auth-client";
import { WorkspaceProvider } from "@truss/features/organizations/workspace-context";
import { AppShell, AuthScreen, SettingsPage } from "@truss/features";
import { Card, CardContent, CardHeader, CardTitle } from "@truss/ui/components/card";
import { Button } from "@truss/ui/components/button";
import { momentumShellConfig } from "./config/shell-config";
import { Play, Pause, Clock } from "lucide-react";
import { useState, useEffect } from "react";

function App() {
  // Handle OAuth deep links for Tauri
  useBetterAuthTauri({
    authClient: tauriAuthClient,
    scheme: "truss",
    debugLogs: false,
    onRequest: () => {},
    onSuccess: () => {},
    onError: () => {},
  });

  return (
    <WorkspaceProvider>
      <MomentumApp />
    </WorkspaceProvider>
  );
}

function MomentumApp() {
  const { data: session, isPending } = useSession();
  const [currentPath, setCurrentPath] = useState(window.location.pathname);

  useEffect(() => {
    const handleLocationChange = () => {
      setCurrentPath(window.location.pathname);
    };

    window.addEventListener("popstate", handleLocationChange);
    return () => window.removeEventListener("popstate", handleLocationChange);
  }, []);

  const handleLogout = async () => {
    await signOut({
      fetchOptions: {
        onSuccess: () => {
          // Session will automatically update and trigger re-render
          console.log("Successfully logged out");
        },
        onError: (error) => {
          console.error("Failed to logout:", error);
        },
      },
    });
  };

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
    return (
      <AuthScreen
        appName="Momentum"
        appDescription="Project tracking and progress management for construction teams"
        onSuccess={() => {
          // Session hook will automatically update and re-render
        }}
      />
    );
  }

  const renderContent = () => {
    if (currentPath === "/settings") {
      return <SettingsPage />;
    }
    return <DashboardView user={session.user} />;
  };

  return (
    <AppShell
      config={momentumShellConfig}
      onCommandExecute={(commandId) => {}}
      onLogout={handleLogout}
    >
      {renderContent()}
    </AppShell>
  );
}

function DashboardView({ user }: { user: { name?: string; email: string } }) {
  // Mock timer state - pending real state management
  const isTimerRunning = false;
  const currentTime = "00:00:00";
  const currentProject = "Office Renovation";
  const currentTask = "Review blueprints";

  return (
    <>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Welcome back, {user.name || user.email}!
          </h1>
          <p className="text-muted-foreground">
            Track your time, manage tasks, and monitor project progress.
          </p>
        </div>

        {/* Timer Widget */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Current Timer
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="text-center">
                <div className="text-4xl font-mono font-bold">{currentTime}</div>
                {isTimerRunning && (
                  <div className="mt-2 space-y-1">
                    <p className="text-sm font-medium">{currentProject}</p>
                    <p className="text-xs text-muted-foreground">{currentTask}</p>
                  </div>
                )}
              </div>
              <div className="flex gap-2 justify-center">
                <Button
                  size="lg"
                  onClick={() => document.dispatchEvent(new CustomEvent("start-timer"))}
                  disabled={isTimerRunning}
                >
                  <Play className="mr-2 h-4 w-4" />
                  Start
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  onClick={() => document.dispatchEvent(new CustomEvent("pause-timer"))}
                  disabled={!isTimerRunning}
                >
                  <Pause className="mr-2 h-4 w-4" />
                  Pause
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Stats Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium">Today's Hours</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">6.5</div>
              <p className="text-xs text-muted-foreground">1.5 hours remaining</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium">This Week</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">32.5h</div>
              <p className="text-xs text-muted-foreground">7.5 hours to goal</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium">Active Tasks</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">14</div>
              <p className="text-xs text-muted-foreground">3 due today</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium">Team Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">8</div>
              <p className="text-xs text-muted-foreground">Team members online</p>
            </CardContent>
          </Card>
        </div>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Time Entries</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Your recent time entries will appear here. Use the timer above to start tracking your
              work.
            </p>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="flex gap-2">
            <Button onClick={() => (window.location.href = "/entries/new")}>New Entry</Button>
            <Button variant="outline" onClick={() => (window.location.href = "/tasks")}>
              View Tasks
            </Button>
            <Button variant="outline" onClick={() => (window.location.href = "/reports")}>
              Generate Report
            </Button>
          </CardContent>
        </Card>
      </div>
    </>
  );
}

export default App;
