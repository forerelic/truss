"use client";

/**
 * Three-Column Layout
 *
 * Master-Detail-Inspector layout with resizable panes.
 * Inspired by VS Code and other professional desktop applications.
 */

import { useState } from "react";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@truss/ui/components/resizable";
import { ScrollArea } from "@truss/ui/components/scroll-area";
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@truss/ui/components/sidebar";
import { cn } from "@truss/ui/lib/utils";
import { AppSidebar } from "../components/app-sidebar";
import { useShell } from "../providers/shell-provider";
import { useLayoutStore } from "../hooks/use-layout-store";
import type { AppShellConfig } from "../types";

interface ThreeColumnLayoutProps {
  config: AppShellConfig;
  children: React.ReactNode;
  showMasterList?: boolean;
  masterListContent?: React.ReactNode;
  onLogout?: () => void | Promise<void>;
}

/**
 * Three-column layout with collapsible sidebar and optional master list
 */
export function ThreeColumnLayout({
  config,
  children,
  showMasterList = false,
  masterListContent,
  onLogout,
}: ThreeColumnLayoutProps) {
  const { sidebarCollapsed } = useShell();
  const { panelSizes, setPanelSizes } = useLayoutStore();

  // Load saved panel sizes or use defaults (now only for master-detail split)
  const savedSizes = panelSizes["three-column"] || [25, 75];
  const [localSizes, setLocalSizes] = useState(savedSizes);

  // Persist panel sizes on change
  const handlePanelResize = (sizes: number[]) => {
    setLocalSizes(sizes);
    setPanelSizes("three-column", sizes);
  };

  // Calculate responsive sizes for master-detail split
  const masterSize = showMasterList ? localSizes[0] || 25 : 0;
  const detailSize = showMasterList ? localSizes[1] || 75 : 100;

  return (
    <SidebarProvider defaultOpen={!sidebarCollapsed}>
      <div className="flex h-full w-full">
        {/* Sidebar */}
        <AppSidebar config={config} onLogout={onLogout} />

        {/* Main content area */}
        <SidebarInset className="flex-1">
          {/* Sidebar toggle button */}
          <div className="flex h-12 items-center border-b px-4">
            <SidebarTrigger className="-ml-1" />
          </div>

          <ResizablePanelGroup
            direction="horizontal"
            onLayout={handlePanelResize}
            className="h-[calc(100%-3rem)] w-full"
          >
            {/* Master List Panel (optional) */}
            {showMasterList && masterListContent && (
              <>
                <ResizablePanel
                  defaultSize={masterSize}
                  minSize={15}
                  maxSize={40}
                  className="master-panel bg-muted/30"
                >
                  <ScrollArea className="h-full w-full">{masterListContent}</ScrollArea>
                </ResizablePanel>

                <ResizableHandle
                  className={cn(
                    "w-[1px] bg-border",
                    "hover:bg-primary/20 active:bg-primary/30",
                    "transition-colors duration-150"
                  )}
                />
              </>
            )}

            {/* Detail/Main Content Panel */}
            <ResizablePanel defaultSize={detailSize} minSize={30} className="detail-panel">
              <ScrollArea className="h-full w-full">
                <div className="p-6">{children}</div>
              </ScrollArea>
            </ResizablePanel>
          </ResizablePanelGroup>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}
