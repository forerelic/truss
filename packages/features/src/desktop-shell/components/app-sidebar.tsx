"use client";

/**
 * AppSidebar Component
 *
 * Collapsible navigation sidebar with workspace switching, similar to VS Code and Slack.
 */

import { ChevronRight, Search } from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarRail,
} from "@truss/ui/components/sidebar";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@truss/ui/components/collapsible";
import { Input } from "@truss/ui/components/input";
import { ScrollArea } from "@truss/ui/components/scroll-area";
import { Badge } from "@truss/ui/components/badge";
import { cn } from "@truss/ui/lib/utils";
import { WorkspaceSwitcher } from "./workspace-switcher";
import { UserMenu } from "./user-menu";
import { useShell } from "../providers/shell-provider";
import type { AppShellConfig, SidebarSection } from "../types";
import { useState } from "react";

interface AppSidebarProps {
  config: AppShellConfig;
  onLogout?: () => void | Promise<void>;
}

/**
 * Main sidebar component with navigation and workspace switching
 */
export function AppSidebar({ config, onLogout }: AppSidebarProps) {
  const { sidebarCollapsed } = useShell();
  const [searchQuery, setSearchQuery] = useState("");

  return (
    <Sidebar className="border-r transition-all duration-200">
      <SidebarHeader className="border-b">
        {/* Workspace Switcher */}
        {config.features?.workspaceSwitcher !== false && (
          <WorkspaceSwitcher appName={config.app.name} appIcon={config.app.icon} />
        )}

        {/* Search (only visible when expanded) */}
        {!sidebarCollapsed && config.features?.globalSearch !== false && (
          <div className="px-3 pb-3 pt-2">
            <div className="relative group">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground transition-colors group-focus-within:text-foreground" />
              <Input
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 h-9 bg-sidebar-accent/50 border-sidebar-border hover:bg-sidebar-accent focus-visible:bg-background transition-all duration-150"
              />
            </div>
          </div>
        )}
      </SidebarHeader>

      <SidebarContent>
        <ScrollArea className="flex-1">
          {/* Main Navigation Sections */}
          {config.sidebar.sections.map((section, index) => (
            <NavSection
              key={section.id}
              section={section}
              collapsed={sidebarCollapsed}
              index={index}
            />
          ))}

          {/* Pinned Items */}
          {config.sidebar.pinnedItems && config.sidebar.pinnedItems.length > 0 && (
            <SidebarGroup>
              <SidebarGroupLabel>Quick Access</SidebarGroupLabel>
              <SidebarMenu>
                {config.sidebar.pinnedItems.map((itemId) => {
                  // Find the item in sections
                  const item = findItemById(config.sidebar.sections, itemId);
                  if (!item) return null;

                  return (
                    <SidebarMenuItem key={itemId}>
                      <SidebarMenuButton asChild tooltip={item.label}>
                        <a href={item.href}>
                          {item.icon && <item.icon />}
                          <span>{item.label}</span>
                          {item.badge && (
                            <Badge variant="secondary" className="ml-auto">
                              {item.badge}
                            </Badge>
                          )}
                        </a>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  );
                })}
              </SidebarMenu>
            </SidebarGroup>
          )}
        </ScrollArea>
      </SidebarContent>

      <SidebarFooter>
        {/* User Menu */}
        {config.sidebar.footer?.showUserMenu !== false && <UserMenu onLogout={onLogout} />}

        {/* Custom Footer Content */}
        {config.sidebar.footer?.customContent}
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  );
}

/**
 * Navigation section component with enhanced animations
 */
function NavSection({
  section,
  index = 0,
}: {
  section: SidebarSection;
  collapsed: boolean;
  index?: number;
}) {
  const [isOpen, setIsOpen] = useState(section.defaultOpen !== false);

  if (!section.items || section.items.length === 0) {
    // Simple button if no sub-items
    return (
      <SidebarGroup>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton tooltip={section.label}>
              {section.icon && <section.icon />}
              <span>{section.label}</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarGroup>
    );
  }

  // Collapsible section with items with staggered animation
  const animationDelay = `${index * 50}ms`;

  return (
    <SidebarGroup style={{ animationDelay }} className="animate-in fade-in-0 slide-in-from-left-2">
      <SidebarGroupLabel className="text-xs font-semibold text-sidebar-foreground/70 px-3 mb-1">
        {section.label}
      </SidebarGroupLabel>
      <SidebarMenu>
        {section.collapsible !== false ? (
          <Collapsible open={isOpen} onOpenChange={setIsOpen} className="group/collapsible">
            <SidebarMenuItem>
              <CollapsibleTrigger asChild>
                <SidebarMenuButton
                  tooltip={section.label}
                  className="group/trigger hover:bg-sidebar-accent transition-all duration-150"
                >
                  {section.icon && (
                    <section.icon className="transition-transform group-hover/trigger:scale-110" />
                  )}
                  <span className="font-medium">{section.label}</span>
                  <ChevronRight
                    className={cn(
                      "ml-auto h-4 w-4 transition-all duration-200 ease-out",
                      isOpen && "rotate-90",
                      "group-hover/trigger:text-sidebar-foreground"
                    )}
                  />
                </SidebarMenuButton>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <SidebarMenuSub>
                  {section.items.map((item) => (
                    <SidebarMenuSubItem key={item.id} className="group/item">
                      <SidebarMenuSubButton asChild>
                        <a
                          href={item.href}
                          className={cn(
                            "transition-all duration-150",
                            item.disabled
                              ? "pointer-events-none opacity-50"
                              : "hover:bg-sidebar-accent active:bg-sidebar-accent/80"
                          )}
                        >
                          {item.icon && (
                            <item.icon className="h-4 w-4 transition-transform group-hover/item:scale-110" />
                          )}
                          <span className="transition-colors">{item.label}</span>
                          {item.badge && (
                            <Badge
                              variant="secondary"
                              className="ml-auto transition-all group-hover/item:bg-primary/10"
                            >
                              {item.badge}
                            </Badge>
                          )}
                        </a>
                      </SidebarMenuSubButton>
                    </SidebarMenuSubItem>
                  ))}
                </SidebarMenuSub>
              </CollapsibleContent>
            </SidebarMenuItem>
          </Collapsible>
        ) : (
          // Non-collapsible items
          section.items.map((item) => (
            <SidebarMenuItem key={item.id} className="group/item">
              <SidebarMenuButton asChild tooltip={item.label}>
                <a
                  href={item.href}
                  className={cn(
                    "transition-all duration-150",
                    item.disabled
                      ? "pointer-events-none opacity-50"
                      : "hover:bg-sidebar-accent active:bg-sidebar-accent/80"
                  )}
                >
                  {item.icon && (
                    <item.icon className="transition-transform group-hover/item:scale-110" />
                  )}
                  <span className="transition-colors">{item.label}</span>
                  {item.badge && (
                    <Badge
                      variant="secondary"
                      className="ml-auto transition-all group-hover/item:bg-primary/10"
                    >
                      {item.badge}
                    </Badge>
                  )}
                </a>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))
        )}
      </SidebarMenu>
    </SidebarGroup>
  );
}

/**
 * Helper to find an item by ID in sections
 */
function findItemById(sections: SidebarSection[], itemId: string) {
  for (const section of sections) {
    if (section.items) {
      const item = section.items.find((i) => i.id === itemId);
      if (item) return item;

      // Check nested items
      for (const sItem of section.items) {
        if (sItem.children) {
          const nested = sItem.children.find((c) => c.id === itemId);
          if (nested) return nested;
        }
      }
    }
  }
  return null;
}
