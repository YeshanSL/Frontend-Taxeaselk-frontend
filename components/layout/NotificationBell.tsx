"use client";

import { useEffect, useRef, useState } from "react";
import { Bell, AlertTriangle, CheckCircle2, FileText } from "lucide-react";
import { useLanguage } from "@/lib/i18n/LanguageContext";

// Mock notifications standing in for a real feed. Once the FastAPI
// backend has a notifications endpoint, replace NOTIFICATIONS with a
// fetch — the panel UI itself doesn't need to change.
const NOTIFICATIONS = [
  {
    id: "n1",
    icon: AlertTriangle,
    tone: "critical" as const,
    title: "Critical: Taxable income mismatch",
    timeAgo: "10 minutes ago",
  },
  {
    id: "n2",
    icon: FileText,
    tone: "info" as const,
    title: "Document processed: Trial Balance.xlsx",
    timeAgo: "1 hour ago",
  },
  {
    id: "n3",
    icon: CheckCircle2,
    tone: "success" as const,
    title: "CIT Computation approved by auditor",
    timeAgo: "Yesterday",
  },
];

const TONE_CLASSES = {
  critical: "bg-red-50 text-status-critical",
  info: "bg-blue-50 text-status-info",
  success: "bg-green-50 text-status-success",
};

export default function NotificationBell() {
  const { t } = useLanguage();
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Close the panel on an outside click, matching standard dropdown
  // behavior (Escape key would be a nice follow-up, kept out for now
  // to keep this component small).
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
        aria-label={t("common.notifications")}
        onClick={() => setOpen((o) => !o)}
        className="relative text-gray-400 hover:text-gray-600"
      >
        <Bell className="h-5 w-5" />
        {NOTIFICATIONS.length > 0 && (
          <span className="absolute -right-0.5 -top-0.5 h-2 w-2 rounded-full bg-status-critical" />
        )}
      </button>

      {open && (
        <div className="absolute right-0 z-40 mt-2 w-80 rounded-card border border-gray-100 bg-white shadow-lg">
          <div className="flex items-center justify-between border-b border-gray-100 px-4 py-3">
            <p className="text-sm font-semibold text-gray-800">
              {t("common.notifications")}
            </p>
            {NOTIFICATIONS.length > 0 && (
              <button className="text-xs font-medium text-brand-blue hover:underline">
                {t("common.markAllRead")}
              </button>
            )}
          </div>

          <div className="max-h-80 overflow-y-auto">
            {NOTIFICATIONS.length === 0 ? (
              <p className="px-4 py-8 text-center text-sm text-gray-400">
                {t("common.noNotifications")}
              </p>
            ) : (
              NOTIFICATIONS.map((n) => {
                const Icon = n.icon;
                return (
                  <div
                    key={n.id}
                    className="flex items-start gap-3 border-b border-gray-50 px-4 py-3 last:border-0 hover:bg-gray-50/60"
                  >
                    <span
                      className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${TONE_CLASSES[n.tone]}`}
                    >
                      <Icon className="h-4 w-4" />
                    </span>
                    <div className="min-w-0">
                      <p className="text-sm text-gray-800">{n.title}</p>
                      <p className="mt-0.5 text-xs text-gray-400">{n.timeAgo}</p>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {NOTIFICATIONS.length > 0 && (
            <div className="border-t border-gray-100 p-2">
              <button className="w-full rounded-lg py-1.5 text-center text-xs font-medium text-brand-blue hover:bg-gray-50">
                {t("common.viewAll")}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
