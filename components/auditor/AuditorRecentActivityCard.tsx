"use client";

import { useEffect, useState } from "react";
import { CheckCircle2, AlertTriangle, FileText, Send } from "lucide-react";
import Card from "@/components/ui/Card";
import {
  AuditorActivityItem,
  getAuditorActivities,
  AUDITOR_ACTIVITY_EVENT,
} from "@/lib/utils/auditorActivity";

interface Props {
  initialActivities: {
    title: string;
    company: string;
    timeAgo: string;
  }[];
}

export default function AuditorRecentActivityCard({ initialActivities }: Props) {
  const [activities, setActivities] = useState<AuditorActivityItem[]>(() => {
    return initialActivities.map((a, idx) => ({
      id: `init_${idx}`,
      title: a.title,
      company: a.company,
      type: a.title.toLowerCase().includes("issue")
        ? "issue"
        : a.title.toLowerCase().includes("document")
        ? "document"
        : "approval",
      timestamp: new Date().toISOString(),
      timeAgo: a.timeAgo,
    }));
  });

  useEffect(() => {
    function syncActivities() {
      const local = getAuditorActivities();
      if (local.length > 0) {
        // Merge recorded activities on top of initial defaults
        const combined = [...local];
        initialActivities.forEach((init, idx) => {
          if (!combined.some((c) => c.title === init.title && c.company === init.company)) {
            combined.push({
              id: `init_${idx}`,
              title: init.title,
              company: init.company,
              type: "approval",
              timestamp: new Date().toISOString(),
              timeAgo: init.timeAgo,
            });
          }
        });
        setActivities(combined.slice(0, 8));
      }
    }

    syncActivities();
    window.addEventListener(AUDITOR_ACTIVITY_EVENT, syncActivities);
    window.addEventListener("storage", syncActivities);
    return () => {
      window.removeEventListener(AUDITOR_ACTIVITY_EVENT, syncActivities);
      window.removeEventListener("storage", syncActivities);
    };
  }, [initialActivities]);

  function renderIcon(type?: string) {
    switch (type) {
      case "issue":
        return <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-status-warning" />;
      case "document":
        return <FileText className="mt-0.5 h-4 w-4 shrink-0 text-brand-blue" />;
      case "request":
        return <Send className="mt-0.5 h-4 w-4 shrink-0 text-purple-600" />;
      default:
        return <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-status-success" />;
    }
  }

  return (
    <Card className="p-5">
      <div className="mb-3 flex items-center justify-between">
        <p className="font-semibold text-gray-800">Recent Activity</p>
        <span className="flex h-2 w-2 relative" title="Live real-time sync active">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
        </span>
      </div>

      <div className="flex flex-col gap-3.5">
        {activities.map((activity) => (
          <div key={activity.id} className="flex items-start gap-2.5 transition-all">
            {renderIcon(activity.type)}
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-gray-800 truncate">
                {activity.title}
              </p>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="text-xs font-medium text-brand-blue truncate">
                  {activity.company}
                </span>
                <span className="text-gray-300 text-xs">•</span>
                <span className="text-xs text-gray-400 whitespace-nowrap">
                  {activity.timeAgo}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}

