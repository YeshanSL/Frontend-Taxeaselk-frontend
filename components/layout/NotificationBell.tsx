"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import {
  Bell,
  AlertTriangle,
  CheckCircle2,
  FileText,
  MessagesSquare,
  Sparkles,
  Check,
  ChevronRight,
  ArrowRight,
} from "lucide-react";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import {
  getNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  AppNotification,
} from "@/lib/api/notifications";

const TONE_STYLES = {
  critical: {
    bg: "bg-red-50",
    text: "text-red-600",
    icon: AlertTriangle,
  },
  warning: {
    bg: "bg-amber-50",
    text: "text-amber-600",
    icon: AlertTriangle,
  },
  info: {
    bg: "bg-blue-50",
    text: "text-brand-blue",
    icon: MessagesSquare,
  },
  success: {
    bg: "bg-emerald-50",
    text: "text-emerald-600",
    icon: CheckCircle2,
  },
};

export default function NotificationBell() {
  const { t } = useLanguage();
  const router = useRouter();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [userRole, setUserRole] = useState<"business" | "auditor">("business");
  const [companyName, setCompanyName] = useState<string>("");
  const containerRef = useRef<HTMLDivElement>(null);

  // 1. Detect role and active company
  useEffect(() => {
    function detectContext() {
      try {
        const isAuditorRoute =
          pathname.includes("/auditor") ||
          pathname.includes("/companies") ||
          pathname.includes("/requests") ||
          pathname.includes("/responses") ||
          pathname.includes("/review-queue") ||
          pathname.includes("/audit-log");

        const savedUser = localStorage.getItem("taxease_user");
        let detectedRole: "business" | "auditor" = isAuditorRoute ? "auditor" : "business";
        if (savedUser) {
          const parsed = JSON.parse(savedUser);
          if (parsed.role === "auditor" || isAuditorRoute) {
            detectedRole = "auditor";
          }
        }
        setUserRole(detectedRole);

        const savedSettings = localStorage.getItem("taxease_company_settings");
        if (savedSettings) {
          const parsed = JSON.parse(savedSettings);
          if (parsed.companyName) {
            setCompanyName(parsed.companyName);
          }
        }
      } catch {
        // Ignored
      }
    }

    detectContext();
    window.addEventListener("taxease_company_updated", detectContext);
    window.addEventListener("storage", detectContext);
    return () => {
      window.removeEventListener("taxease_company_updated", detectContext);
      window.removeEventListener("storage", detectContext);
    };
  }, [pathname]);

  // 2. Fetch live notifications
  useEffect(() => {
    let isCancelled = false;
    async function load() {
      setIsLoading(true);
      try {
        const res = await getNotifications(userRole, userRole === "business" ? companyName : undefined);
        if (!isCancelled && res) {
          setNotifications(res.notifications);
          setUnreadCount(res.unread_count);
        }
      } catch {
        // Fallback handled
      } finally {
        if (!isCancelled) setIsLoading(false);
      }
    }

    load();
    return () => {
      isCancelled = true;
    };
  }, [userRole, companyName]);

  // 3. Close panel on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // 4. Handle Notification click -> Mark read & Navigate
  async function handleNotificationClick(notif: AppNotification) {
    if (!notif.is_read) {
      setNotifications((prev) =>
        prev.map((n) => (n.id === notif.id ? { ...n, is_read: true } : n))
      );
      setUnreadCount((c) => Math.max(0, c - 1));
      markNotificationAsRead(notif.id).catch(() => {});
    }
    setOpen(false);

    if (notif.link) {
      router.push(notif.link);
    }
  }

  // 5. Mark all as read
  async function handleMarkAllRead() {
    setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
    setUnreadCount(0);
    markAllNotificationsAsRead(userRole, userRole === "business" ? companyName : undefined).catch(() => {});
  }

  return (
    <div ref={containerRef} className="relative">
      <button
        aria-label={t("common.notifications")}
        onClick={() => setOpen((o) => !o)}
        className="relative flex h-9 w-9 items-center justify-center rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors"
      >
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-status-critical px-1 text-[10px] font-bold text-white shadow-sm ring-2 ring-white animate-in zoom-in-50 duration-150">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 z-50 mt-2 w-84 sm:w-96 rounded-xl border border-gray-100 bg-white shadow-xl animate-in fade-in zoom-in-95 duration-100 overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-gray-100 bg-gray-50/50 px-4 py-3">
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-gray-900">
                {t("common.notifications")}
              </span>
              {unreadCount > 0 ? (
                <span className="rounded-full bg-blue-100 px-2 py-0.5 text-[11px] font-bold text-brand-blue">
                  {unreadCount} new
                </span>
              ) : (
                <span className="rounded-full bg-gray-100 px-2 py-0.5 text-[11px] font-medium text-gray-500">
                  All read
                </span>
              )}
            </div>

            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllRead}
                className="flex items-center gap-1 text-xs font-semibold text-brand-blue hover:text-blue-700 hover:underline transition-colors"
              >
                <Check className="h-3 w-3" />
                {t("common.markAllRead")}
              </button>
            )}
          </div>

          {/* Notifications Feed */}
          <div className="max-h-96 overflow-y-auto divide-y divide-gray-50">
            {notifications.length === 0 ? (
              <div className="px-4 py-10 text-center text-gray-400">
                <Bell className="mx-auto h-8 w-8 stroke-1 text-gray-300 mb-2" />
                <p className="text-sm font-medium text-gray-700">No notifications yet</p>
                <p className="text-xs text-gray-400 mt-1">
                  You are all caught up on audit filings and updates!
                </p>
              </div>
            ) : (
              notifications.map((n) => {
                const toneConfig = TONE_STYLES[n.type as keyof typeof TONE_STYLES] || TONE_STYLES.info;
                const IconComponent = toneConfig.icon;

                return (
                  <button
                    key={n.id}
                    onClick={() => handleNotificationClick(n)}
                    className={`flex w-full items-start gap-3 px-4 py-3.5 text-left transition-colors hover:bg-blue-50/40 ${
                      !n.is_read ? "bg-blue-50/20" : "bg-white"
                    }`}
                  >
                    <span
                      className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${toneConfig.bg} ${toneConfig.text} shadow-2xs mt-0.5`}
                    >
                      <IconComponent className="h-4 w-4" />
                    </span>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1">
                        <p
                          className={`text-xs truncate ${
                            !n.is_read ? "font-bold text-gray-900" : "font-medium text-gray-700"
                          }`}
                        >
                          {n.title}
                        </p>
                        <span className="shrink-0 text-[10px] text-gray-400">
                          {n.created_at}
                        </span>
                      </div>

                      <p className="mt-0.5 text-xs text-gray-500 line-clamp-2 leading-relaxed">
                        {n.message}
                      </p>

                      {n.company_name && userRole === "auditor" && (
                        <span className="mt-1.5 inline-block rounded bg-gray-100 px-1.5 py-0.5 text-[10px] font-medium text-gray-600">
                          {n.company_name}
                        </span>
                      )}
                    </div>

                    {!n.is_read ? (
                      <span className="h-2 w-2 shrink-0 rounded-full bg-brand-blue self-center" />
                    ) : (
                      <ChevronRight className="h-3.5 w-3.5 shrink-0 text-gray-300 self-center" />
                    )}
                  </button>
                );
              })
            )}
          </div>

          {/* Footer Quick Action */}
          <div className="border-t border-gray-100 bg-gray-50/50 p-2 text-center">
          <div className="border-t border-gray-100 bg-gray-50/50 p-2.5 text-center">
            <button
              onClick={() => {
                setOpen(false);
                router.push(userRole === "auditor" ? "/auditor-discussions" : "/discussions");
              }}
              className="w-full rounded-lg py-1.5 text-center text-xs font-semibold text-brand-blue hover:bg-blue-50 transition-colors"
              className="flex w-full items-center justify-center gap-1.5 rounded-lg py-1.5 text-center text-xs font-semibold text-brand-blue hover:bg-blue-50 transition-colors"
            >
              {userRole === "auditor" ? "Open Audit Discussions &rarr;" : "View Discussions Hub &rarr;"}
              <span>{t("common.viewAll") || "View all notifications"}</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
