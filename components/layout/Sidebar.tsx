"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import clsx from "clsx";
import { ReactNode, useState, useEffect } from "react";
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
  userName?: string;
  userEmail?: string;
  userInitials?: string;
  settingsHref?: string; // used to link the logo back to the active dashboard
  badgeHrefs?: string[]; // hrefs that should show live badge counts from API
}

// One Sidebar component drives both the Business and Auditor portals —
// only the nav items and labels passed in differ. Keeps the two
// sidebars visually identical without duplicating markup.
export default function Sidebar({
  workspaceLabelKey,
  navItems,
  settingsHref = "/dashboard",
  badgeHrefs,
}: SidebarProps) {
  const pathname = usePathname();
  const { t } = useLanguage();

  // Live badge counts fetched from the API
  const [liveBadges, setLiveBadges] = useState<Record<string, number>>({});

  useEffect(() => {
    if (!badgeHrefs || badgeHrefs.length === 0) return;
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
    const token = localStorage.getItem("taxease_token");
    const headers: Record<string, string> = {};
    if (token) headers["Authorization"] = `Bearer ${token}`;

    const portal = settingsHref.includes("auditor") ? "auditor" : "business";

    async function fetchBadges() {
      try {
        const res = await fetch(`${apiUrl}/api/nav/badge-counts?portal=${portal}`, { headers });
        if (res.ok) {
          const data = await res.json();
          const mapped: Record<string, number> = {};
          if (data.requests) mapped["/requests"] = data.requests;
          if (data.responses) mapped["/responses"] = data.responses;
          if (data.discussions) {
            mapped["/auditor-discussions"] = data.discussions;
            mapped["/discussions"] = data.discussions;
          }
          setLiveBadges(mapped);
        }
      } catch {
        // silently fail — badges will not display
      }
    }
    fetchBadges();
    const interval = setInterval(fetchBadges, 30000); // refresh every 30s
    return () => clearInterval(interval);
  }, [badgeHrefs]);

  return (
    <aside className="flex h-screen w-64 shrink-0 flex-col border-r border-gray-100 bg-white">
      <div className="border-b border-gray-100 px-5 py-4">
        <Link
          href={settingsHref.includes("auditor") ? "/auditor-dashboard" : "/dashboard"}
          className="flex items-center gap-3 group"
        >
          <div className="relative h-10 w-10 shrink-0 transition-transform group-hover:scale-105">
            <Image
              src="/images/logo-mark.png"
              alt="TaxEaseLK Logo"
              fill
              priority
              sizes="40px"
              className="object-contain"
            />
          </div>
          <div className="min-w-0">
            <span className="block text-lg font-extrabold tracking-tight text-brand-navy leading-none">
              TaxEaseLK
            </span>
            <span className="block mt-1 truncate text-xs text-gray-400">
              {t(workspaceLabelKey)}
            </span>
          </div>
        </Link>
      </div>

      <nav className="flex-1 space-y-1 px-3 py-4">
        <p className="px-3 pb-2 text-xs font-medium uppercase tracking-wide text-gray-400">
          {t("sidebar.navigation")}
        </p>
        {navItems.map((item) => {
          const active = pathname.startsWith(item.href);
          const badgeCount = liveBadges[item.href] || item.badge;
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
              {badgeCount ? (
                <span
                  className={clsx(
                    "rounded-full px-2 py-0.5 text-xs font-semibold",
                    active
                      ? "bg-white/20 text-white"
                      : "bg-blue-100 text-brand-blue"
                  )}
                >
                  {badgeCount}
                </span>
              ) : null}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
