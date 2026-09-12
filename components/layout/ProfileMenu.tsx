"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ChevronDown, User, Settings, LogOut, Copy, Check, ShieldCheck } from "lucide-react";
import { useLanguage } from "@/lib/i18n/LanguageContext";

interface ProfileMenuProps {
  displayName: string;
  email: string;
  userInitials: string;
  roleLabel: string; // small chip shown under the name, e.g. "Admin" or "Auditor"
  settingsHref: string;
}

export default function ProfileMenu({
  displayName,
  email,
  userInitials,
  roleLabel,
  settingsHref,
}: ProfileMenuProps) {
  const { t } = useLanguage();
  const [open, setOpen] = useState(false);
  const [userId, setUserId] = useState<string>("");
  const [copied, setCopied] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function syncUser() {
      try {
        const userStr = localStorage.getItem("taxease_user");
        if (userStr) {
          const u = JSON.parse(userStr);
          const rawId = u.formatted_id || (u.id ? (String(u.role || "").toUpperCase().includes("AUDITOR") ? `AUD-${u.id.replace(/-/g, "").slice(0, 8).toUpperCase()}` : `BIZ-${u.id.replace(/-/g, "").slice(0, 8).toUpperCase()}`) : "");
          if (rawId) setUserId(rawId);
        }
      } catch {}
    }
    syncUser();
    window.addEventListener("storage", syncUser);
    return () => window.removeEventListener("storage", syncUser);
  }, []);

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
        <div className="absolute right-0 z-40 mt-2 w-72 rounded-card border border-gray-100 bg-white shadow-lg">
          <div className="flex items-center gap-3 border-b border-gray-100 px-4 py-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand-blue text-sm font-semibold text-white">
              {userInitials}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-gray-800">
                {displayName}
              </p>
              <p className="truncate text-xs text-gray-400">{email}</p>
              {userId && (
                <div className="mt-1 flex items-center justify-between gap-1 rounded bg-gray-50 border border-gray-200/80 px-2 py-0.5">
                  <span className="font-mono text-[10px] font-bold text-gray-700 truncate">
                    {userId}
                  </span>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      navigator.clipboard.writeText(userId);
                      setCopied(true);
                      setTimeout(() => setCopied(false), 1800);
                    }}
                    title="Copy User ID"
                    className="flex items-center gap-0.5 text-[10px] font-semibold text-brand-blue hover:text-blue-700 cursor-pointer"
                  >
                    {copied ? (
                      <>
                        <Check className="h-3 w-3 text-emerald-600" />
                        <span className="text-emerald-600">Copied</span>
                      </>
                    ) : (
                      <>
                        <Copy className="h-3 w-3" />
                        <span>Copy</span>
                      </>
                    )}
                  </button>
                </div>
              )}
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
              onClick={() => {
                if (typeof window !== "undefined") {
                  localStorage.removeItem("taxease_token");
                  localStorage.removeItem("taxease_user");
                  document.cookie = "taxease_token=; path=/; max-age=0; SameSite=Lax";
                }
                setOpen(false);
              }}
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
