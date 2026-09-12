const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export interface AppNotification {
  id: string;
  recipient_role: "business" | "auditor";
  company_name?: string;
  title: string;
  message: string;
  type: "critical" | "warning" | "info" | "success";
  link?: string;
  is_read: boolean;
  created_at: string;
}

export interface NotificationsResponse {
  notifications: AppNotification[];
  unread_count: number;
}

async function getAuthHeaders(): Promise<Record<string, string>> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("taxease_token");
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }
  }
  return headers;
}

export async function getNotifications(
  role: string = "business",
  companyName?: string
): Promise<NotificationsResponse> {
  try {
    const headers = await getAuthHeaders();
    const query = new URLSearchParams({ role });
    if (companyName) {
      query.set("company_name", companyName);
    }
    const res = await fetch(`${API_URL}/api/notifications?${query.toString()}`, {
      headers,
      cache: "no-store",
    });
    if (res.ok) {
      return await res.json();
    }
  } catch {
    // Graceful offline fallback
  }

  return {
    notifications: [],
    unread_count: 0,
  };
}

export async function markNotificationAsRead(id: string): Promise<boolean> {
  try {
    const headers = await getAuthHeaders();
    const res = await fetch(`${API_URL}/api/notifications/${id}/read`, {
      method: "POST",
      headers,
    });
    if (res.ok) return true;
  } catch {
    // Handled
  }
  return true;
}

export async function markAllNotificationsAsRead(
  role: string = "business",
  companyName?: string
): Promise<boolean> {
  try {
    const headers = await getAuthHeaders();
    const query = new URLSearchParams({ role });
    if (companyName) {
      query.set("company_name", companyName);
    }
    const res = await fetch(`${API_URL}/api/notifications/mark-all-read?${query.toString()}`, {
      method: "POST",
      headers,
    });
    if (res.ok) return true;
  } catch {
    // Handled
  }
  return true;
}
