/**
 * Momentum Shell Configuration
 *
 * Desktop application shell configuration for the Momentum tracking app.
 */

import {
  Timer,
  FolderOpen,
  BarChart3,
  Clock,
  Settings,
  Search,
  Play,
  Pause,
  StopCircle,
  Calendar,
  Users,
  Target,
  TrendingUp,
  CheckSquare,
  ListTodo,
  Activity,
  Archive,
  Hash,
  Plus,
  Save,
  Download,
} from "lucide-react";
import type { AppShellConfig } from "@truss/features/desktop-shell/types";

export const momentumShellConfig: AppShellConfig = {
  app: {
    name: "Momentum",
    version: "1.0.0",
    icon: Timer,
  },

  sidebar: {
    sections: [
      {
        id: "time-tracking",
        label: "Time Tracking",
        icon: Timer,
        defaultOpen: true,
        items: [
          {
            id: "current-timer",
            label: "Current Timer",
            href: "/timer",
            icon: Clock,
            badge: "Active",
          },
          {
            id: "time-entries",
            label: "Time Entries",
            href: "/entries",
            icon: ListTodo,
          },
          {
            id: "calendar-view",
            label: "Calendar",
            href: "/calendar",
            icon: Calendar,
          },
          {
            id: "archived-entries",
            label: "Archived",
            href: "/entries/archived",
            icon: Archive,
          },
        ],
      },
      {
        id: "projects",
        label: "Projects",
        icon: FolderOpen,
        items: [
          {
            id: "active-projects",
            label: "Active Projects",
            href: "/projects/active",
            badge: "8",
          },
          {
            id: "all-projects",
            label: "All Projects",
            href: "/projects",
          },
          {
            id: "project-phases",
            label: "Phases & Milestones",
            href: "/projects/phases",
            icon: Target,
          },
          {
            id: "project-categories",
            label: "Categories",
            href: "/projects/categories",
            icon: Hash,
          },
        ],
      },
      {
        id: "tasks",
        label: "Tasks",
        icon: CheckSquare,
        items: [
          {
            id: "my-tasks",
            label: "My Tasks",
            href: "/tasks/mine",
            badge: "14",
          },
          {
            id: "team-tasks",
            label: "Team Tasks",
            href: "/tasks/team",
          },
          {
            id: "completed",
            label: "Completed",
            href: "/tasks/completed",
          },
        ],
      },
      {
        id: "team",
        label: "Team",
        icon: Users,
        items: [
          {
            id: "team-activity",
            label: "Activity Feed",
            href: "/team/activity",
            icon: Activity,
          },
          {
            id: "team-members",
            label: "Members",
            href: "/team/members",
          },
          {
            id: "team-schedule",
            label: "Schedule",
            href: "/team/schedule",
            icon: Calendar,
          },
        ],
      },
      {
        id: "reports",
        label: "Reports",
        icon: BarChart3,
        items: [
          {
            id: "productivity",
            label: "Productivity",
            href: "/reports/productivity",
            icon: TrendingUp,
          },
          {
            id: "time-analysis",
            label: "Time Analysis",
            href: "/reports/time",
          },
          {
            id: "project-progress",
            label: "Project Progress",
            href: "/reports/progress",
          },
          {
            id: "custom-reports",
            label: "Custom Reports",
            href: "/reports/custom",
          },
        ],
      },
    ],

    pinnedItems: ["current-timer", "my-tasks", "active-projects"],

    footer: {
      showUserMenu: true,
      showSettings: true,
      showHelp: true,
      showConnectionStatus: true,
    },

    defaultCollapsed: false,
    collapsedWidth: 48,
    expandedWidth: 240,
  },

  commands: [
    // Timer Commands
    {
      id: "start-timer",
      label: "Start Timer",
      icon: Play,
      category: "Timer",
      shortcut: "⌘T",
      searchTerms: ["start", "begin", "timer", "track"],
      handler: () => {
        document.dispatchEvent(new CustomEvent("start-timer"));
      },
    },
    {
      id: "pause-timer",
      label: "Pause Timer",
      icon: Pause,
      category: "Timer",
      shortcut: "⌘P",
      searchTerms: ["pause", "stop", "timer", "break"],
      handler: () => {
        document.dispatchEvent(new CustomEvent("pause-timer"));
      },
    },
    {
      id: "stop-timer",
      label: "Stop Timer",
      icon: StopCircle,
      category: "Timer",
      shortcut: "⌘⇧T",
      searchTerms: ["stop", "end", "finish", "timer"],
      handler: () => {
        document.dispatchEvent(new CustomEvent("stop-timer"));
      },
    },

    // Entry Commands
    {
      id: "new-entry",
      label: "New Time Entry",
      icon: Plus,
      category: "Entries",
      shortcut: "⌘N",
      searchTerms: ["new", "create", "entry", "time", "log"],
      handler: () => {
        window.location.href = "/entries/new";
      },
    },
    {
      id: "save-entry",
      label: "Save Current Entry",
      icon: Save,
      category: "Entries",
      shortcut: "⌘S",
      searchTerms: ["save", "store", "entry"],
      handler: () => {
        document.dispatchEvent(new CustomEvent("save-entry"));
      },
    },

    // Task Commands
    {
      id: "new-task",
      label: "New Task",
      icon: CheckSquare,
      category: "Tasks",
      shortcut: "⌘⇧N",
      searchTerms: ["new", "create", "task", "todo"],
      handler: () => {
        window.location.href = "/tasks/new";
      },
    },
    {
      id: "search-tasks",
      label: "Search Tasks",
      icon: Search,
      category: "Tasks",
      shortcut: "⌘F",
      searchTerms: ["find", "search", "tasks", "locate"],
      handler: () => {
        window.location.href = "/tasks?search=true";
      },
    },

    // Report Commands
    {
      id: "generate-report",
      label: "Generate Report",
      icon: BarChart3,
      category: "Reports",
      shortcut: "⌘R",
      searchTerms: ["generate", "create", "report"],
      handler: () => {
        window.location.href = "/reports/new";
      },
    },
    {
      id: "export-timesheet",
      label: "Export Timesheet",
      icon: Download,
      category: "Reports",
      shortcut: "⌘E",
      searchTerms: ["export", "download", "timesheet", "csv", "excel"],
      handler: () => {
        document.dispatchEvent(new CustomEvent("export-timesheet"));
      },
    },

    // Settings
    {
      id: "settings",
      label: "Settings",
      icon: Settings,
      category: "System",
      shortcut: "⌘,",
      searchTerms: ["settings", "preferences", "config", "options"],
      handler: () => {
        window.location.href = "/settings";
      },
    },
  ],

  shortcuts: [
    // Navigation
    { key: "cmd+1", handler: () => (window.location.href = "/timer"), description: "Go to Timer" },
    {
      key: "cmd+2",
      handler: () => (window.location.href = "/entries"),
      description: "Go to Time Entries",
    },
    { key: "cmd+3", handler: () => (window.location.href = "/tasks"), description: "Go to Tasks" },
    {
      key: "cmd+4",
      handler: () => (window.location.href = "/projects"),
      description: "Go to Projects",
    },
    {
      key: "cmd+5",
      handler: () => (window.location.href = "/reports"),
      description: "Go to Reports",
    },

    // View toggles
    {
      key: "cmd+b",
      handler: () => document.dispatchEvent(new CustomEvent("toggle-sidebar")),
      description: "Toggle Sidebar",
    },
    {
      key: "cmd+\\",
      handler: () => document.dispatchEvent(new CustomEvent("toggle-calendar")),
      description: "Toggle Calendar View",
    },

    // Quick actions
    {
      key: "space",
      handler: () => document.dispatchEvent(new CustomEvent("quick-timer-toggle")),
      description: "Quick Start/Stop Timer",
    },
    {
      key: "cmd+shift+t",
      handler: () => document.dispatchEvent(new CustomEvent("switch-task")),
      description: "Switch Task",
    },
    {
      key: "cmd+d",
      handler: () => document.dispatchEvent(new CustomEvent("duplicate-entry")),
      description: "Duplicate Entry",
    },
    {
      key: "cmd+delete",
      handler: () => document.dispatchEvent(new CustomEvent("delete-entry")),
      description: "Delete Entry",
    },
  ],

  theme: {
    mode: "system",
    accent: "zinc",
    density: "comfortable",
  },

  layout: {
    default: "three-column",
    allowModeSwitch: true,
    persistState: true,
  },

  features: {
    commandPalette: true,
    globalSearch: true,
    notifications: true,
    statusBar: true,
    activityBar: false,
    workspaceSwitcher: true,
    multiWindow: false,
  },
};
