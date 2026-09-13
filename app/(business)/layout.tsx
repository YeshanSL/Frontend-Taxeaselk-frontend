import {
  LayoutGrid,
  FileText,
  DollarSign,
  UserCheck,
  MessagesSquare,
  Settings as SettingsIcon,
} from "lucide-react";
import Sidebar, { NavItem } from "@/components/layout/Sidebar";
import TopBar from "@/components/layout/TopBar";
import BusinessTopBarBadges from "@/components/layout/BusinessTopBarBadges";
import { getCompanySettings } from "@/lib/api/business";

const navItems: NavItem[] = [
  { href: "/dashboard", labelKey: "sidebar.dashboard", icon: <LayoutGrid className="h-4 w-4" /> },
  { href: "/documents", labelKey: "sidebar.documents", icon: <FileText className="h-4 w-4" /> },
  { href: "/financials", labelKey: "sidebar.financials", icon: <DollarSign className="h-4 w-4" /> },
  { href: "/auditor-review", labelKey: "sidebar.auditorReview", icon: <UserCheck className="h-4 w-4" /> },
  { href: "/discussions", labelKey: "sidebar.discussions", icon: <MessagesSquare className="h-4 w-4" /> },
  { href: "/settings", labelKey: "sidebar.settings", icon: <SettingsIcon className="h-4 w-4" /> },
];

// Shared shell for every page under the Business Owner portal.
export default async function BusinessLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const settings = await getCompanySettings();

  return (
    <div className="flex h-screen bg-brand-bgblue">
      <Sidebar
        workspaceLabelKey="sidebar.companyUser"
        navItems={navItems}
        userName="Admin User"
        userEmail="admin@abc.lk"
        userInitials="AU"
        settingsHref="/settings"
        badgeHrefs={["/discussions"]}
      />
      <div className="flex min-w-0 flex-1 flex-col">
        <TopBar
          roleLabel="Admin"
          userInitials="AU"
          displayName="Admin User"
          email="admin@abc.lk"
          settingsHref="/settings"
          showSearch={false}
          leftContent={
            <BusinessTopBarBadges
              initialCompanyName={settings.companyName}
              initialFinancialYear={settings.financialYear}
            />
          }
        />
        <main className="flex-1 overflow-y-auto p-8">{children}</main>
      </div>
    </div>
  );
}
