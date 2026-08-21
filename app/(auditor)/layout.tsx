import {
  LayoutGrid,
  Building2,
  ClipboardList,
  AlertTriangle,
  History,
  Settings as SettingsIcon,
} from "lucide-react";
import Sidebar, { NavItem } from "@/components/layout/Sidebar";
import TopBar from "@/components/layout/TopBar";

const navItems: NavItem[] = [
  { href: "/auditor-dashboard", label: "Dashboard", icon: <LayoutGrid className="h-4 w-4" /> },
  { href: "/companies", label: "Companies", icon: <Building2 className="h-4 w-4" /> },
  { href: "/review-queue", label: "Review Queue", icon: <ClipboardList className="h-4 w-4" />, badge: 4 },
  { href: "/issues", label: "Issues", icon: <AlertTriangle className="h-4 w-4" />, badge: 2 },
  { href: "/audit-log", label: "Audit Log", icon: <History className="h-4 w-4" /> },
  { href: "/auditor-settings", label: "Settings", icon: <SettingsIcon className="h-4 w-4" /> },
];

// Shared shell for every page under the Auditor portal. Mirrors
// (business)/layout.tsx structurally — same Sidebar/TopBar components,
// different nav items and top bar content (all-companies picker instead
// of a single company).
export default function AuditorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar
        workspaceLabel="Auditor Workspace"
        navItems={navItems}
        userName="Professional Auditor"
        userEmail="auditor@example.com"
        userInitials="PA"
      />
      <div className="flex min-w-0 flex-1 flex-col">
        <TopBar
          roleLabel="Auditor"
          userInitials="PA"
          leftContent={
            <>
              <span className="rounded-lg border border-gray-200 px-3 py-1.5 text-sm font-medium text-gray-600">
                All Companies
              </span>
              <span className="rounded-lg border border-gray-200 px-3 py-1.5 text-sm font-medium text-gray-600">
                2025/26
              </span>
            </>
          }
        />
        <main className="flex-1 overflow-y-auto p-8">{children}</main>
      </div>
    </div>
  );
}
