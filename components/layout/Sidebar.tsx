"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import clsx from "clsx";
import { ReactNode } from "react";
import Logo from "@/components/ui/Logo";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import { TranslationKey } from "@/lib/i18n/translations";

export interface NavItem {
  href: string;
  labelKey: TranslationKey;
  // A rendered icon element (e.g. <LayoutGrid className="h-4 w-4" />),
  // NOT the component reference itself. Server Components (our layouts)
  // can pass already-rendered JSX to a Client Component like this one,
  // but they can't pass a raw function/component reference as a prop —
  // that's what caused the "Functions cannot be passed directly to
  // Client Components" error.
  icon: ReactNode;
  badge?: number;
}

interface SidebarProps {
  workspaceLabelKey: TranslationKey; // e.g. "sidebar.companyUser"
  navItems: NavItem[];
  userName: string;
  userEmail: string;
  userInitials: string;
  settingsHref: string; // where the "Profile" button should send you
}

// One Sidebar component drives both the Business and Auditor portals —
// only the nav items and labels passed in differ. Keeps the two
// sidebars visually identical without duplicating markup. Labels are
// translation keys (not literal strings) so the sidebar updates
// instantly when the language toggle in the top bar is changed.
export default function Sidebar({
  workspaceLabelKey,
  navItems,
  userName,
  userEmail,
  userInitials,
  settingsHref,
}: SidebarProps) {
  const pathname = usePathname();
  const { t } = useLanguage();

  return (
    <aside className="flex h-screen w-64 shrink-0 flex-col border-r border-gray-100 bg-white">
      <div className="border-b border-gray-100 px-5 py-5">
        <Logo size="sm" />
        <p className="mt-1 pl-9 text-xs text-gray-400">{t(workspaceLabelKey)}</p>
      </div>

      <nav className="flex-1 space-y-1 px-3 py-4">
        <p className="px-3 pb-2 text-xs font-medium uppercase tracking-wide text-gray-400">
          {t("sidebar.navigation")}
        </p>
        {navItems.map((item) => {
          const active = pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={clsx(
                "flex items-center justify-between rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                active
                  ? "bg-brand-blue text-white"
                  : "text-gray-600 hover:bg-gray-50"
              )}
            >
              <span className="flex items-center gap-3">
                {item.icon}
                {t(item.labelKey)}
              </span>
              {item.badge ? (
                <span
                  className={clsx(
                    "rounded-full px-2 py-0.5 text-xs font-semibold",
                    active
                      ? "bg-white/20 text-white"
                      : "bg-blue-100 text-brand-blue"
                  )}
                >
                  {item.badge}
                </span>
              ) : null}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-gray-100 p-4">
        <div className="mb-3 flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-blue text-xs font-semibold text-white">
            {userInitials}
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-gray-800">
              {userName}
            </p>
            <p className="truncate text-xs text-gray-400">{userEmail}</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Link
            href={settingsHref}
            className="flex-1 rounded-lg border border-gray-200 py-1.5 text-center text-xs font-medium text-gray-600 hover:bg-gray-50"
          >
            {t("common.profile")}
          </Link>
          <Link
            href="/sign-in"
            className="flex-1 rounded-lg border border-gray-200 py-1.5 text-center text-xs font-medium text-gray-600 hover:bg-gray-50"
          >
            {t("common.logout")}
          </Link>
        </div>
      </div>
    </aside>
  );
}
