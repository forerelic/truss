"use client";

/**
 * StatusBar Component
 *
 * Bottom status bar showing connection status, sync state, and activity indicators.
 * Similar to VS Code's status bar.
 */

import { useState, useEffect } from "react";
import { Wifi, WifiOff, Cloud, CloudOff, AlertCircle, Loader2, Command } from "lucide-react";
import { Badge } from "@truss/ui/components/badge";
import { Button } from "@truss/ui/components/button";
import { Separator } from "@truss/ui/components/separator";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@truss/ui/components/tooltip";
import { cn } from "@truss/ui/lib/utils";
import { useWorkspace } from "../../organizations/workspace-context";
import type { ConnectionStatus, SyncStatus } from "../types";

/**
 * Status bar component for the bottom of the application
 */
export function StatusBar() {
  const { workspace } = useWorkspace();
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>("connected");
  const [syncStatus] = useState<SyncStatus>({ state: "idle" });
  const [time, setTime] = useState(new Date());

  // Update time every minute
  useEffect(() => {
    const timer = setInterval(() => {
      setTime(new Date());
    }, 60000);

    return () => clearInterval(timer);
  }, []);

  // Simulate connection monitoring (replace with real implementation)
  useEffect(() => {
    const handleOnline = () => setConnectionStatus("connected");
    const handleOffline = () => setConnectionStatus("disconnected");

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    // Check initial status
    setConnectionStatus(navigator.onLine ? "connected" : "disconnected");

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  return (
    <TooltipProvider>
      <div className="status-bar h-6 border-t bg-background px-2 flex items-center justify-between text-xs text-muted-foreground">
        {/* Left Section */}
        <div className="flex items-center gap-2">
          {/* Connection Status */}
          <ConnectionIndicator status={connectionStatus} />

          <Separator orientation="vertical" className="h-3" />

          {/* Workspace Info */}
          <div className="flex items-center gap-1">
            <span className="font-medium">{workspace?.organization_name || "Personal"}</span>
            {workspace?.role && (
              <Badge variant="secondary" className="h-4 px-1 text-[10px]">
                {workspace.role}
              </Badge>
            )}
          </div>

          <Separator orientation="vertical" className="h-3" />

          {/* Sync Status */}
          <SyncIndicator status={syncStatus} />
        </div>

        {/* Center Section */}
        <div className="flex items-center gap-2">
          {/* Activity indicator */}
          {syncStatus.state === "syncing" && (
            <div className="flex items-center gap-1">
              <Loader2 className="h-3 w-3 animate-spin" />
              <span className="text-[10px]">Syncing {syncStatus.pendingCount || 0} items...</span>
            </div>
          )}
        </div>

        {/* Right Section */}
        <div className="flex items-center gap-2">
          {/* Command Palette Hint */}
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="h-5 px-1 hover:bg-accent/50"
                onClick={() => {
                  // Trigger command palette
                  const event = new KeyboardEvent("keydown", {
                    key: "k",
                    metaKey: true,
                    ctrlKey: true,
                  });
                  document.dispatchEvent(event);
                }}
              >
                <Command className="h-3 w-3 mr-1" />
                <span>⌘K</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent side="top">
              <p>Open Command Palette</p>
            </TooltipContent>
          </Tooltip>

          <Separator orientation="vertical" className="h-3" />

          {/* Time */}
          <span className="tabular-nums">
            {time.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
          </span>
        </div>
      </div>
    </TooltipProvider>
  );
}

/**
 * Connection status indicator
 */
function ConnectionIndicator({ status }: { status: ConnectionStatus }) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <div
          className={cn(
            "flex items-center gap-1",
            status === "connected" && "text-green-600 dark:text-green-400",
            status === "connecting" && "text-yellow-600 dark:text-yellow-400",
            status === "disconnected" && "text-red-600 dark:text-red-400",
            status === "error" && "text-destructive"
          )}
        >
          {status === "connected" && <Wifi className="h-3 w-3" />}
          {status === "connecting" && <Loader2 className="h-3 w-3 animate-spin" />}
          {status === "disconnected" && <WifiOff className="h-3 w-3" />}
          {status === "error" && <AlertCircle className="h-3 w-3" />}
          <span className="capitalize">{status}</span>
        </div>
      </TooltipTrigger>
      <TooltipContent side="top">
        <p>Connection: {status}</p>
      </TooltipContent>
    </Tooltip>
  );
}

/**
 * Sync status indicator
 */
function SyncIndicator({ status }: { status: SyncStatus }) {
  const lastSync = status.lastSyncedAt
    ? new Date(status.lastSyncedAt).toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      })
    : "Never";

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <div
          className={cn(
            "flex items-center gap-1",
            status.state === "idle" && "text-muted-foreground",
            status.state === "syncing" && "text-blue-600 dark:text-blue-400",
            status.state === "error" && "text-destructive"
          )}
        >
          {status.state === "idle" && <Cloud className="h-3 w-3" />}
          {status.state === "syncing" && <Loader2 className="h-3 w-3 animate-spin" />}
          {status.state === "error" && <CloudOff className="h-3 w-3" />}
          <span>Sync</span>
          {status.pendingCount && status.pendingCount > 0 && (
            <Badge variant="secondary" className="h-3 px-1 text-[10px]">
              {status.pendingCount}
            </Badge>
          )}
        </div>
      </TooltipTrigger>
      <TooltipContent side="top">
        <div className="space-y-1">
          <p>Sync: {status.state}</p>
          <p className="text-xs text-muted-foreground">Last: {lastSync}</p>
          {status.error && <p className="text-xs text-destructive">{status.error}</p>}
        </div>
      </TooltipContent>
    </Tooltip>
  );
}
