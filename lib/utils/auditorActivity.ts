export interface AuditorActivityItem {
  id: string;
  title: string;
  company: string;
  type?: "approval" | "issue" | "document" | "request";
  timestamp: string;
  timeAgo: string;
}

const STORAGE_KEY = "taxease_auditor_recent_activities";
export const AUDITOR_ACTIVITY_EVENT = "taxease_auditor_activity_updated";

export function getAuditorActivities(): AuditorActivityItem[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function recordAuditorActivity(item: {
  title: string;
  company: string;
  type?: "approval" | "issue" | "document" | "request";
}): AuditorActivityItem {
  const newItem: AuditorActivityItem = {
    id: `act_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    title: item.title,
    company: item.company,
    type: item.type || "approval",
    timestamp: new Date().toISOString(),
    timeAgo: "Just now",
  };

  if (typeof window !== "undefined") {
    try {
      const existing = getAuditorActivities();
      // Keep most recent 20 activities
      const updated = [newItem, ...existing].slice(0, 20);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      window.dispatchEvent(new CustomEvent(AUDITOR_ACTIVITY_EVENT, { detail: newItem }));
    } catch {
      // Ignored
    }
  }

  return newItem;
}

