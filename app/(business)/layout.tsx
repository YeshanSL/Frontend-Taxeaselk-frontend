import {
  LayoutGrid,
  FileText,
  DollarSign,
  UserCheck,
  Settings as SettingsIcon,
} from "lucide-react";
import Sidebar, { NavItem } from "@/components/layout/Sidebar";
import TopBar from "@/components/layout/TopBar";

const navItems: NavItem[] = [
  { href: "/dashboard", labelKey: "sidebar.dashboard", icon: <LayoutGrid className="h-4 w-4" /> },
  { href: "/documents", labelKey: "sidebar.documents", icon: <FileText className="h-4 w-4" /> },
  { href: "/financials", labelKey: "sidebar.financials", icon: <DollarSign className="h-4 w-4" /> },
  { href: "/auditor-review", labelKey: "sidebar.auditorReview", icon: <UserCheck className="h-4 w-4" /> },
  { href: "/settings", labelKey: "sidebar.settings", icon: <SettingsIcon className="h-4 w-4" /> },
];

// Shared shell for every page under the Business Owner portal.
// TODO (Week 2): replace the hard-coded user/company info below with
// the signed-in user's session data (from Supabase) and the selected
// company + financial year (from the FastAPI backend).
export default function BusinessLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen bg-brand-bgblue">
      <Sidebar
        workspaceLabelKey="sidebar.companyUser"
        navItems={navItems}
        userName="Admin User"
        userEmail="admin@abc.lk"
        userInitials="AU"
        settingsHref="/settings"
      />
      <div className="flex min-w-0 flex-1 flex-col">
        <TopBar
          roleLabel="Admin"
          userInitials="AU"
          displayName="Admin User"
          email="admin@abc.lk"
          settingsHref="/settings"
          leftContent={
            <>
              <span className="rounded-lg border border-blue-200 bg-blue-50 px-3 py-1.5 text-sm font-medium text-brand-blue">
                Company ABC (Pvt) Ltd
              </span>
              <span className="rounded-lg border border-gray-200 px-3 py-1.5 text-sm font-medium text-gray-600">
                FY 2025/26
              </span>
            </>
          }
        />
        <main className="flex-1 overflow-y-auto p-8">{children}</main>
      </div>
    </div>
  );
}
