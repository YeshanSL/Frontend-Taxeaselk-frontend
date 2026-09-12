import {
  AuditorDashboardSummary,
  CompaniesSummary,
  ReviewQueueSummary,
  IssuesSummary,
  AuditLogSummary,
  AuditorProfileSettings,
  AuditorFullSettings,
  AuditorTeamMember,
  AuditPreferences,
  AuditorSecuritySettings,
  AuditorNotificationPrefs,
  AuditorDocumentsSummary,
  AuditorRequestsSummary,
  AuditorDiscussionsSummary,
  AuditorResponsesSummary,
  ClientResponseItem,
  AttachedResponseFile,
  CitStatus,
} from "@/lib/types";

// --- DATA LAYER (Auditor portal) -----------------------------------------
// Connects to FastAPI backend (/api/auditor, /api/documents, /api/auth).
// Sends JWT bearer token from localStorage and gracefully falls back to mock
// data if backend is unreachable or returns an error.
// -------------------------------------------------------------------------

async function getAuthHeaders(): Promise<HeadersInit> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("taxease_token");
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }
  } else {
    try {
      const { cookies } = await import("next/headers");
      const cookieStore = cookies();
      const token = cookieStore.get("taxease_token")?.value;
      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }
    } catch {
      // Outside SSR request context
    }
  }
  return headers;
}

const SHARED_COMPANIES: any[] = [];


const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export async function getAuditorDashboardSummary(): Promise<AuditorDashboardSummary> {
  try {
    const authHeaders = await getAuthHeaders();
    const res = await fetch(`${API_URL}/api/auditor/dashboard`, {
      headers: authHeaders,
      cache: "no-store",
    });


    if (res.ok) {
      const summary = await res.json();
      const wl = summary.workload || {};

      const priorityReviews = Array.isArray(summary.priority_reviews)
        ? summary.priority_reviews.map((c: any) => {
            const isCritical = (c.critical_count || 0) > 0;
            const isReady = c.status === "Ready for Approval" || c.cit_status_badge === "Ready for Auditor";
            const tag: "critical" | "attention" | "ready" = isCritical ? "critical" : isReady ? "ready" : "attention";
            const tagLabel = isCritical ? "CRITICAL" : isReady ? "READY FOR APPROVAL" : "ATTENTION REQUIRED";
            const detail = `CIT Review Required — ${c.critical_count || 0} Critical • ${c.warnings_count || 0} Warnings`;
            return {
              companyName: c.name || "Company",
              tag,
              tagLabel,
              detail,
              progressPercent: c.progress_percent ?? 0,
              dueDate: c.due_date || "30 Sep",
            };
          })
        : [];

      const recentActivity = Array.isArray(summary.recent_activity)
        ? summary.recent_activity.map((a: any) => ({
            title: a.title,
            company: a.company_name || a.company || "Assigned Company",
            timeAgo: a.timestamp || "Recently",
          }))
        : [];

      return {
        companiesAssigned: summary.companies_assigned ?? 0,
        underReview: summary.under_review ?? 0,
        pendingReviews: summary.pending_reviews ?? 0,
        criticalIssues: summary.critical_issues ?? 0,
        completedThisPeriod: summary.completed_reviews ?? 0,
        priorityReviews,
        workload: {
          pending: wl["Pending"] ?? wl.pending ?? 0,
          inProgress: wl["In Progress"] ?? wl.in_progress ?? 0,
          waitingForCompany: wl["Waiting for Company"] ?? wl.waiting_for_company ?? 0,
          readyForApproval: wl["Ready for Approval"] ?? wl.ready_for_approval ?? 0,
          completed: wl["Completed"] ?? wl.completed ?? 0,
        },
        recentActivity,
      };
    }
  } catch {
    // Graceful fallback
  }

  return {
    companiesAssigned: 0,
    underReview: 0,
    pendingReviews: 0,
    criticalIssues: 0,
    completedThisPeriod: 0,
    priorityReviews: [],
    workload: {
      pending: 0,
      inProgress: 0,
      waitingForCompany: 0,
      readyForApproval: 0,
      completed: 0,
    },
    recentActivity: [],
  };
}


export async function getCompaniesSummary(): Promise<CompaniesSummary> {
  try {
    const authHeaders = await getAuthHeaders();
    const res = await fetch(`${API_URL}/api/auditor/companies`, {
      headers: authHeaders,
      cache: "no-store",
    });
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data) && data.length > 0) {
        const citMap: Record<string, CitStatus> = {
          draft: "Draft",
          under_review: "Under Review",
          ready_for_auditor: "Ready for Auditor",
          approved: "Approved",
          waiting_for_company: "Waiting for Company",
          Draft: "Draft",
          "Under Review": "Under Review",
          "Ready for Auditor": "Ready for Auditor",
          Approved: "Approved",
          "Waiting for Company": "Waiting for Company",
        };

        const companies = data.map((c: any) => ({
          id: String(c.id),
          name: c.name,
          tin: c.tin_number || c.tin || "134578291",
          financialYear: c.current_fiscal_year || c.financial_year || "2025/26",
          citStatus: citMap[c.cit_status_badge] || citMap[c.status] || "Under Review",
          subStatusLabel: c.status || "In Progress",
          criticalCount: c.critical_count ?? c.critical_issues_count ?? 0,
          warningsCount: c.warnings_count ?? 0,
          progressPercent: c.progress_percent ?? 0,
          dueDate: c.due_date || "30 Sep",
          contactEmail: c.contact_email || c.contactEmail,
          contactPhone: c.contact_phone || c.contactPhone,
          registrationNumber: c.registration_number || c.registrationNumber,
          address: c.address || c.registered_address,
          businessCategory: c.business_category || c.category,
          annualTurnover: c.annual_turnover || c.turnover,
          contactPerson: c.contact_person || c.contactPerson,
          taxOffice: c.tax_office || c.taxOffice,
        }));

        return { companies };
      }
    }
  } catch {
    // Graceful fallback
  }

  return { companies: SHARED_COMPANIES };
}

export async function getReviewQueueSummary(): Promise<ReviewQueueSummary> {
  try {
    const authHeaders = await getAuthHeaders();
    const res = await fetch(`${API_URL}/api/auditor/review-queue`, {
      headers: authHeaders,
      cache: "no-store",
    });

    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data) && data.length > 0) {
        const rows = data.map((c: any) => ({
          id: String(c.id),
          companyName: c.name,
          tin: c.tin_number || c.tin || "",
          status: c.status || "In Progress",
          criticalCount: c.critical_count ?? c.critical_issues_count ?? 0,
          warningsCount: c.warnings_count ?? 0,
          progressPercent: c.progress_percent ?? 0,
          dueDate: c.due_date || "30 Sep",
        }));
        return { rows };
      }
    }
  } catch {
    // Fallback
  }

  return {
    rows: SHARED_COMPANIES.map((c) => ({
      id: c.id,
      companyName: c.name,
      tin: c.tin,
      status: c.subStatusLabel,
      criticalCount: c.criticalCount,
      warningsCount: c.warningsCount,
      progressPercent: c.progressPercent,
      dueDate: c.dueDate,
    })),
  };
}

export async function getIssuesSummary(): Promise<IssuesSummary> {
  try {
    const authHeaders = await getAuthHeaders();
    const res = await fetch(`${API_URL}/api/auditor-review`, {
      headers: authHeaders,
      cache: "no-store",
    });

    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data.issues) && data.issues.length > 0) {
        const issues = data.issues.map((i: any) => ({
          id: String(i.id),
          title: i.title,
          company: i.company_name || i.company || "Assigned Company",
          amount: typeof i.amount === "number" ? `Rs. ${i.amount.toLocaleString()}` : (i.amount || "Rs. 0"),
          severity: (i.severity === "Critical" || i.severity === "critical" ? "Critical" : i.severity === "Warning" || i.severity === "warning" ? "Warning" : i.severity === "Resolved" || i.severity === "resolved" ? "Resolved" : "Information") as any,
          status: (i.status === "Resolved" || i.status === "resolved" ? "Resolved" : "Open") as any,
          source: i.source || "CIT",
        }));

        const criticalCount = issues.filter((i: any) => i.severity === "Critical").length;
        const warningsCount = issues.filter((i: any) => i.severity === "Warning").length;
        const informationCount = issues.filter((i: any) => i.severity === "Information").length;
        const resolvedCount = issues.filter((i: any) => i.status === "Resolved").length;

        return {
          criticalCount: criticalCount,
          warningsCount: warningsCount,
          informationCount: informationCount,
          resolvedCount: resolvedCount,
          issues,
        };
      }
    }
  } catch {
    // Fallback
  }

  return {
    criticalCount: 0,
    warningsCount: 0,
    informationCount: 0,
    resolvedCount: 0,
    issues: [],
  };
}

export async function getAuditLogSummary(): Promise<AuditLogSummary> {
  try {
    const authHeaders = await getAuthHeaders();
    const res = await fetch(`${API_URL}/api/auditor/dashboard`, {
      headers: authHeaders,
      cache: "no-store",
    });

    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data.recent_activity) && data.recent_activity.length > 0) {
        const entries = data.recent_activity.map((l: any, idx: number) => ({
          id: String(l.id || `act_${idx}`),
          timestamp: l.timestamp || "Today",
          company: l.company_name || l.company || "Company",
          user: "Auditor",
          action: l.title || "Audit Activity",
          actionTone: (l.title?.includes("Approved") ? "success" : l.title?.includes("Reviewed") || l.title?.includes("Flagged") ? "warning" : l.title?.includes("Requested") ? "pending" : "info") as any,
          details: l.details || l.title || "",
        }));
        return { entries };
      }
    }
  } catch {
    // Fallback
  }

  return {
    entries: [],
  };
}


let MOCK_AUDITOR_FULL_SETTINGS: AuditorFullSettings = {
  profile: {
    fullName: "Chartered Accountant",
    email: "",
    phone: "",
    licenseNumber: "",
    organization: "Audit Practice",
    designation: "Audit Partner",
    caSriLankaNo: "",
    irdPractitionerNo: "",
    firmRegNo: "",
    firmAddress: "Colombo, Sri Lanka",
    signatureStampUrl: "",
  },
  team: [],
  preferences: {
    defaultTaxYear: "2025/26 (Apr 1 - Mar 31)",
    accountingStandard: "SLFRS / LKAS for SMEs",
    materialityThresholdPercent: 5.0,
    autoRemindDaysBeforeDeadline: [14, 7, 3],
    autoRequestStandardPackOnConnect: true,
    strictVatReconciliation: true,
  },
  notifications: {
    clientDocumentUploaded: true,
    clientResponseReceived: true,
    discussionMessageReceived: true,
    deadlineApproaching: true,
    clientInvitationReceived: true,
    digestFrequency: "instant",
  },
  security: {
    twoFactorEnabled: false,
    sessionTimeoutMinutes: 60,
    ipWhitelistEnabled: false,
    immutableAuditTrail: true,
    activeSessions: [],
  },
};


export async function getAuditorProfileSettings(): Promise<AuditorProfileSettings> {
  return MOCK_AUDITOR_FULL_SETTINGS.profile;
}

export async function getAuditorFullSettings(): Promise<AuditorFullSettings> {
  try {
    const authHeaders = await getAuthHeaders();
    const res = await fetch(`${API_URL}/api/auditor/settings`, {
      headers: authHeaders,
      cache: "no-store",
    });
    if (res.ok) {
      const data = await res.json();
      if (data && data.profile) {
        return data;
      }
    }
  } catch {
    // Fallback to local mock data
  }

  return { ...MOCK_AUDITOR_FULL_SETTINGS };
}

export async function updateAuditorProfile(
  profile: Partial<AuditorProfileSettings>
): Promise<AuditorProfileSettings> {
  try {
    const authHeaders = await getAuthHeaders();
    await fetch(`${API_URL}/api/auditor/profile`, {
      method: "PUT",
      headers: authHeaders,
      body: JSON.stringify(profile),
    });
  } catch {
    // Fallback
  }

  MOCK_AUDITOR_FULL_SETTINGS.profile = {
    ...MOCK_AUDITOR_FULL_SETTINGS.profile,
    ...profile,
  };
  return MOCK_AUDITOR_FULL_SETTINGS.profile;
}

export async function updateAuditPreferences(
  prefs: Partial<AuditPreferences>
): Promise<AuditPreferences> {
  try {
    const authHeaders = await getAuthHeaders();
    await fetch(`${API_URL}/api/auditor/preferences`, {
      method: "PATCH",
      headers: authHeaders,
      body: JSON.stringify(prefs),
    });
  } catch {
    // Fallback
  }

  MOCK_AUDITOR_FULL_SETTINGS.preferences = {
    ...MOCK_AUDITOR_FULL_SETTINGS.preferences,
    ...prefs,
  };
  return MOCK_AUDITOR_FULL_SETTINGS.preferences;
}

export async function updateAuditorSecurity(
  sec: Partial<AuditorSecuritySettings>
): Promise<AuditorSecuritySettings> {
  try {
    const authHeaders = await getAuthHeaders();
    await fetch(`${API_URL}/api/auditor/security`, {
      method: "PATCH",
      headers: authHeaders,
      body: JSON.stringify(sec),
    });
  } catch {
    // Fallback
  }

  MOCK_AUDITOR_FULL_SETTINGS.security = {
    ...MOCK_AUDITOR_FULL_SETTINGS.security,
    ...sec,
  };
  return MOCK_AUDITOR_FULL_SETTINGS.security;
}

export async function updateAuditorNotifications(
  notifs: Partial<AuditorNotificationPrefs>
): Promise<AuditorNotificationPrefs> {
  try {
    const authHeaders = await getAuthHeaders();
    await fetch(`${API_URL}/api/auditor/notifications`, {
      method: "PATCH",
      headers: authHeaders,
      body: JSON.stringify(notifs),
    });
  } catch {
    // Fallback
  }

  MOCK_AUDITOR_FULL_SETTINGS.notifications = {
    ...MOCK_AUDITOR_FULL_SETTINGS.notifications,
    ...notifs,
  };
  return MOCK_AUDITOR_FULL_SETTINGS.notifications;
}

export async function inviteAuditorTeamMember(
  member: { name: string; email: string; role: AuditorTeamMember["role"] }
): Promise<AuditorTeamMember> {
  const newMember: AuditorTeamMember = {
    id: `tm_${Date.now()}`,
    name: member.name,
    initials: member.name
      .split(" ")
      .map((w) => w[0])
      .join("")
      .slice(0, 2)
      .toUpperCase(),
    email: member.email,
    role: member.role,
    assignedCompaniesCount: 0,
    status: "Invited",
  };

  MOCK_AUDITOR_FULL_SETTINGS.team.push(newMember);
  return newMember;
}

export async function getAuditorDocumentsSummary(): Promise<AuditorDocumentsSummary> {
  try {
    const authHeaders = await getAuthHeaders();
    const res = await fetch(`${API_URL}/api/documents`, {
      headers: authHeaders,
      cache: "no-store",
    });

    if (res.ok) {
      const data = await res.json();
      const rawDocs = Array.isArray(data) ? data : Array.isArray(data.documents) ? data.documents : [];
      if (rawDocs.length > 0) {
        const documents = rawDocs.map((d: any) => ({
          id: String(d.id),
          companyName: d.company_name || d.companyName || "Assigned Company",
          documentName: d.name || d.documentName || "Document.pdf",
          documentType: d.type || d.doc_type || d.category || "Financial Statements",
          status: (d.status === "review_required" || d.status === "PENDING" ? "review_required" : "verified") as any,
          aiConfidencePercent: d.ai_confidence_percent ?? 95,
          uploadedDate: d.uploaded_date || d.uploaded_at || "Recent",
          sizeLabel: d.size_label || d.size || "1.0 MB",
        }));
        return {
          totalDocuments: documents.length,
          pendingReviewCount: documents.filter((d: any) => d.status === "review_required").length,
          verifiedCount: documents.filter((d: any) => d.status === "verified").length,
          documents,
        };
      }
    }
  } catch {
    // Fallback
  }

  return {
    totalDocuments: 0,
    pendingReviewCount: 0,
    verifiedCount: 0,
    documents: [],
  };
}

export async function getAuditorRequestsSummary(): Promise<AuditorRequestsSummary> {
  try {
    const authHeaders = await getAuthHeaders();
    const res = await fetch(`${API_URL}/api/auditor/requests`, {
      headers: authHeaders,
      cache: "no-store",
    });
    if (res.ok) {
      const data = await res.json();
      const statusMap: Record<string, "pending" | "responded" | "resolved"> = {
        PENDING: "pending",
        RESPONDED: "responded",
        RESOLVED: "resolved",
        pending: "pending",
        responded: "responded",
        resolved: "resolved",
      };

      const requests = (data.requests || []).map((r: any) => ({
        id: String(r.id),
        requestId: r.reference_code || r.id,
        companyName: r.company_name || "Company",
        title: r.title,
        description: r.description,
        category: r.category,
        status: statusMap[r.status] || "pending",
        priority: (r.priority?.toLowerCase() === "high" ? "high" : r.priority?.toLowerCase() === "medium" ? "medium" : "low") as any,
        requestedDate: "Today",
        dueDate: r.due_date || "30 Aug 2026",
      }));

      return {
        totalRequests: data.total_requests ?? requests.length,
        pendingCount: data.awaiting_response ?? 0,
        respondedCount: data.responses_received ?? 0,
        resolvedCount: data.resolved ?? 0,
        requests,
      };
    }
  } catch {
    // Fallback
  }

  return {
    totalRequests: 0,
    pendingCount: 0,
    respondedCount: 0,
    resolvedCount: 0,
    requests: [],
  };
}

export async function getAuditorDiscussionsSummary(): Promise<AuditorDiscussionsSummary> {
  try {
    const authHeaders = await getAuthHeaders();
    const res = await fetch(`${API_URL}/api/discussions`, {
      headers: authHeaders,
      cache: "no-store",
    });

    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data) && data.length > 0) {
        const threads = data.map((t: any) => ({
          id: String(t.id),
          companyName: t.company_name || "Company",
          topic: t.topic,
          lastMessage: t.last_message || "",
          lastUpdated: t.last_updated || "Recently",
          unreadCount: t.unread_count ?? 0,
          status: (t.status === "Closed" ? "Closed" : "Open") as any,
          messages: Array.isArray(t.messages)
            ? t.messages.map((m: any) => ({
                id: String(m.id),
                sender: m.sender_name || "User",
                senderRole: (m.is_auditor || m.sender_role === "Auditor" ? "Auditor" : "Company") as any,
                text: m.message || "",
                timestamp: m.timestamp || "Recently",
              }))
            : [],
        }));
        return { threads };
      }
    }
  } catch {
    // Fallback
  }

  return {
    threads: [],
  };
}

let MOCK_RESPONSES: ClientResponseItem[] = [];

export async function getAuditorResponsesSummary(): Promise<AuditorResponsesSummary> {
  try {
    const authHeaders = await getAuthHeaders();
    const res = await fetch(`${API_URL}/api/auditor/responses`, {
      headers: authHeaders,
      cache: "no-store",
    });

    if (res.ok) {
      const data = await res.json();
      if (data && Array.isArray(data.responses)) {
        return data;
      }
    }
  } catch {
    // Fallback to local mock data
  }

  const unreviewedCount = MOCK_RESPONSES.filter((r) => r.status === "unreviewed").length;
  const resolvedCount = MOCK_RESPONSES.filter((r) => r.status === "resolved").length;
  const revisionCount = MOCK_RESPONSES.filter((r) => r.status === "revision_requested").length;

  return {
    totalResponses: MOCK_RESPONSES.length,
    unreviewedCount,
    resolvedCount,
    revisionCount,
    responses: [...MOCK_RESPONSES],
  };
}

export async function resolveAuditorResponse(responseId: string): Promise<{ success: boolean }> {
  try {
    const authHeaders = await getAuthHeaders();
    await fetch(`${API_URL}/api/auditor/responses/${responseId}/resolve`, {
      method: "POST",
      headers: authHeaders,
    });
  } catch {
    // fallback
  }

  MOCK_RESPONSES = MOCK_RESPONSES.map((r) =>
    r.id === responseId ? { ...r, status: "resolved" } : r
  );
  return { success: true };
}

export async function requestAuditorRevision(
  responseId: string,
  revisionNote: string
): Promise<{ success: boolean }> {
  try {
    const authHeaders = await getAuthHeaders();
    await fetch(`${API_URL}/api/auditor/responses/${responseId}/revision`, {
      method: "POST",
      headers: authHeaders,
      body: JSON.stringify({ note: revisionNote }),
    });
  } catch {
    // fallback
  }

  MOCK_RESPONSES = MOCK_RESPONSES.map((r) =>
    r.id === responseId
      ? { ...r, status: "revision_requested", revisionNote }
      : r
  );
  return { success: true };
}

