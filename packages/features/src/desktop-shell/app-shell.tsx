"use client";

/**
 * AppShell Component
 *
 * Silicon Valley-standard desktop application shell inspired by VS Code, Linear, Slack, and Raycast.
 * Provides a consistent, professional desktop experience for both Momentum and Precision apps.
 */

import { useEffect } from "react";
import { cn } from "@truss/ui/lib/utils";
import { Toaster } from "@truss/ui/components/sonner";
import { ShellProvider, ThemeProvider, DensityProvider, KeyboardProvider } from "./providers";
import { ThreeColumnLayout } from "./layouts/three-column-layout";
import { CommandPalette } from "./components/command-palette";
import { StatusBar } from "./components/status-bar";
import { useLayoutStore } from "./hooks/use-layout-store";
import type { AppShellProps } from "./types";

/**
 * Main application shell component
 *
 * @example
 * ```tsx
 * import { AppShell } from "@truss/features/desktop-shell";
 * import { shellConfig } from "./config/shell-config";
 *
 * function App() {
 *   return (
 *     <AppShell config={shellConfig}>
 *       <YourAppContent />
 *     </AppShell>
 *   );
 * }
 * ```
 */
export function AppShell({
  config,
  children,
  onCommandExecute,
  onLogout,
  className,
}: AppShellProps) {
  // Initialize layout persistence
  const { hydrate } = useLayoutStore();

  useEffect(() => {
    // Hydrate persisted layout state on mount
    hydrate();
  }, [hydrate]);

  // Initialize keyboard shortcuts from config
  const initialShortcuts = config.shortcuts || [];

  return (
    <ShellProvider config={config}>
      <ThemeProvider defaultTheme={config.theme?.mode}>
        <DensityProvider defaultDensity={config.theme?.density}>
          <KeyboardProvider initialShortcuts={initialShortcuts}>
            <div
              className={cn(
                "app-shell",
                "h-screen w-screen overflow-hidden",
                "bg-background text-foreground",
                "flex flex-col",
                className
              )}
              data-app={config.app.name.toLowerCase().replace(/\s+/g, "-")}
            >
              {/* Main layout container */}
              <div className="flex-1 flex overflow-hidden">
                {renderLayout(config, children, onLogout)}
              </div>

              {/* Status bar at bottom */}
              {config.features?.statusBar !== false && <StatusBar />}

              {/* Global components */}
              {config.features?.commandPalette !== false && (
                <CommandPalette commands={config.commands} onExecute={onCommandExecute} />
              )}

              {/* Notification toasts */}
              {config.features?.notifications !== false && <Toaster position="bottom-right" />}
            </div>
          </KeyboardProvider>
        </DensityProvider>
      </ThemeProvider>
    </ShellProvider>
  );
}

/**
 * Render the appropriate layout based on configuration
 */
function renderLayout(
  config: AppShellProps["config"],
  children: React.ReactNode,
  onLogout?: () => void | Promise<void>
) {
  const layoutMode = config.layout?.default || "three-column";

  switch (layoutMode) {
    case "three-column":
      return (
        <ThreeColumnLayout config={config} onLogout={onLogout}>
          {children}
        </ThreeColumnLayout>
      );

    case "split":
      // TODO: Implement split layout
      return (
        <ThreeColumnLayout config={config} onLogout={onLogout}>
          {children}
        </ThreeColumnLayout>
      );

    case "focus":
      // TODO: Implement focus layout
      return <div className="flex-1 overflow-auto">{children}</div>;

    case "custom": {
      // Use custom layout if provided
      const CustomLayout = config.layout?.customLayouts?.["custom"];
      if (CustomLayout) {
        return <CustomLayout />;
      }
      return (
        <ThreeColumnLayout config={config} onLogout={onLogout}>
          {children}
        </ThreeColumnLayout>
      );
    }

    default:
      return (
        <ThreeColumnLayout config={config} onLogout={onLogout}>
          {children}
        </ThreeColumnLayout>
      );
  }
}
