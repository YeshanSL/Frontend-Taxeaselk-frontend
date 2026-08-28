"use client";

import { HelpCircle, Search } from "lucide-react";
import { ReactNode } from "react";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import LanguageToggle from "./LanguageToggle";
import NotificationBell from "./NotificationBell";
import ProfileMenu from "./ProfileMenu";

interface TopBarProps {
  // Left-side content differs per portal: company + FY pickers for the
  // Business view, "All Companies" + year pickers for the Auditor view.
  leftContent: ReactNode;
  roleLabel: string; // "Admin" or "Auditor" — shown as the small chip next to the avatar
  userInitials: string;
  displayName: string;
  email: string;
  settingsHref: string;
}

export default function TopBar({
  leftContent,
  roleLabel,
  userInitials,
  displayName,
  email,
  settingsHref,
}: TopBarProps) {
  const { t } = useLanguage();

  return (
    <header className="flex h-16 shrink-0 items-center justify-between border-b border-gray-100 bg-white px-6">
      <div className="flex items-center gap-3">
        {leftContent}
        <LanguageToggle />
      </div>

      <div className="flex items-center gap-4">
        <div className="relative hidden md:block">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input
            type="search"
            placeholder={t("common.search")}
            className="w-56 rounded-lg border border-gray-200 bg-gray-50 py-2 pl-9 pr-3 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-1 focus:ring-brand-blue"
          />
        </div>

        <NotificationBell />

        <button aria-label={t("common.help")} className="text-gray-400 hover:text-gray-600">
          <HelpCircle className="h-5 w-5" />
        </button>

        <ProfileMenu
          displayName={displayName}
          email={email}
          userInitials={userInitials}
          roleLabel={roleLabel}
          settingsHref={settingsHref}
        />
      </div>
    </header>
  );
}
