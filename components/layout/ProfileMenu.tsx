"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ChevronDown, User, Settings, LogOut } from "lucide-react";
import { useLanguage } from "@/lib/i18n/LanguageContext";

interface ProfileMenuProps {
  displayName: string;
  email: string;
  userInitials: string;
  roleLabel: string; // small chip shown under the name, e.g. "Admin" or "Auditor"
  settingsHref: string;
}

// The avatar + name button in the top-right corner, now with a real
// dropdown (name/email, Profile/Settings link, Logout) instead of just
// being a static, non-functional button.
export default function ProfileMenu({
  displayName,
  email,
  userInitials,
  roleLabel,
  settingsHref,
}: ProfileMenuProps) {
  const { t } = useLanguage();
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div ref={containerRef} className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-2 rounded-lg px-2 py-1 hover:bg-gray-50"
      >
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-200 text-xs font-semibold text-gray-600">
          {userInitials}
        </div>
        <span className="text-sm font-medium text-gray-700">{roleLabel}</span>
        <ChevronDown className="h-4 w-4 text-gray-400" />
      </button>

      {open && (
        <div className="absolute right-0 z-40 mt-2 w-64 rounded-card border border-gray-100 bg-white shadow-lg">
          <div className="flex items-center gap-3 border-b border-gray-100 px-4 py-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand-blue text-sm font-semibold text-white">
              {userInitials}
            </div>
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-gray-800">
                {displayName}
              </p>
              <p className="truncate text-xs text-gray-400">{email}</p>
            </div>
          </div>

          <div className="p-1.5">
            <Link
              href={settingsHref}
              onClick={() => setOpen(false)}
              className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-gray-600 hover:bg-gray-50"
            >
              <User className="h-4 w-4 text-gray-400" />
              {t("common.profile")}
            </Link>
            <Link
              href={settingsHref}
              onClick={() => setOpen(false)}
              className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-gray-600 hover:bg-gray-50"
            >
              <Settings className="h-4 w-4 text-gray-400" />
              {t("common.settings")}
            </Link>
          </div>

          <div className="border-t border-gray-100 p-1.5">
            <Link
              href="/sign-in"
              onClick={() => setOpen(false)}
              className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-status-critical hover:bg-red-50"
            >
              <LogOut className="h-4 w-4" />
              {t("common.logout")}
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
