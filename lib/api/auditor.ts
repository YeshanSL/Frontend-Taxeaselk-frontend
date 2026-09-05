import {
  AuditorDashboardSummary,
  CompaniesSummary,
  ReviewQueueSummary,
  IssuesSummary,
  AuditLogSummary,
  AuditorProfileSettings,
  AuditorDocumentsSummary,
  AuditorRequestsSummary,
  AuditorDiscussionsSummary,
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

const SHARED_COMPANIES = [
  {
    id: "co_1",
    name: "ABC Holdings (Pvt) Ltd",
    tin: "TIN134578291",
    financialYear: "2025/26",
    citStatus: "Under Review" as const,
    subStatusLabel: "In Progress",
    criticalCount: 2,
    warningsCount: 3,
    progressPercent: 82,
    dueDate: "18 Aug",
  },
  {
    id: "co_2",
    name: "Lanka Trading (Pvt) Ltd",
    tin: "TIN298471023",
    financialYear: "2025/26",
    citStatus: "Under Review" as const,
    subStatusLabel: "In Progress",
    criticalCount: 0,
    warningsCount: 5,
    progressPercent: 74,
    dueDate: "20 Aug",
  },
  {
    id: "co_3",
    name: "Ocean Foods (Pvt) Ltd",
    tin: "TIN847302916",
    financialYear: "2025/26",
    citStatus: "Ready for Auditor" as const,
    subStatusLabel: "Ready for Approval",
    criticalCount: 0,
    warningsCount: 0,
    progressPercent: 98,
    dueDate: "22 Aug",
  },
  {
    id: "co_4",
    name: "ABC Manufacturing (Pvt) Ltd",
    tin: "TIN019283746",
    financialYear: "2025/26",
    citStatus: "Approved" as const,
    subStatusLabel: "Approved",
    criticalCount: 0,
    warningsCount: 0,
    progressPercent: 100,
    dueDate: "15 Aug",
  },
  {
    id: "co_5",
    name: "Tech Solutions (Pvt) Ltd",
    tin: "TIN562019384",
    financialYear: "2025/26",
    citStatus: "Waiting for Company" as const,
    subStatusLabel: "Waiting for Company",
    criticalCount: 1,
    warningsCount: 2,
    progressPercent: 61,
    dueDate: "25 Aug",
  },
  {
    id: "co_6",
    name: "Green Valley Exports (Pvt) Ltd",
    tin: "TIN730194820",
    financialYear: "2025/26",
    citStatus: "Draft" as const,
    subStatusLabel: "Pending",
    criticalCount: 0,
    warningsCount: 1,
    progressPercent: 40,
    dueDate: "30 Aug",
  },
  {
    id: "co_7",
    name: "Sunrise Hotels (Pvt) Ltd",
    tin: "TIN481920374",
    financialYear: "2025/26",
    citStatus: "Draft" as const,
    subStatusLabel: "Not Started",
    criticalCount: 0,
    warningsCount: 0,
    progressPercent: 28,
    dueDate: "1 Sep",
  },
];

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

      const priorityReviews = Array.isArray(summary.priority_reviews) && summary.priority_reviews.length > 0
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
              progressPercent: c.progress_percent ?? 70,
              dueDate: c.due_date || "30 Sep",
            };
          })
        : [
            {
              companyName: "ABC Holdings (Pvt) Ltd",
              tag: "critical" as const,
              tagLabel: "CRITICAL",
              detail: "CIT Review Required — 2 Critical Issues • 3 Warnings",
              progressPercent: 82,
              dueDate: "18 Aug",
            },
            {
              companyName: "Lanka Trading (Pvt) Ltd",
              tag: "attention" as const,
              tagLabel: "ATTENTION REQUIRED",
              detail: "5 Warnings",
              progressPercent: 74,
              dueDate: "20 Aug",
            },
            {
              companyName: "Ocean Foods (Pvt) Ltd",
              tag: "ready" as const,
              tagLabel: "READY FOR APPROVAL",
              detail: "All validation checks passed — 0 Critical • 0 Warnings",
              progressPercent: 98,
              dueDate: "22 Aug",
            },
          ];

      const recentActivity = Array.isArray(summary.recent_activity) && summary.recent_activity.length > 0
        ? summary.recent_activity.map((a: any) => ({
            title: a.title,
            company: a.company_name || a.company || "Assigned Company",
            timeAgo: a.timestamp || "Recently",
          }))
        : [
            {
              title: "CIT Computation Approved",
              company: "ABC Manufacturing (Pvt) Ltd",
              timeAgo: "10 minutes ago",
            },
          ];

      return {
        companiesAssigned: summary.companies_assigned ?? 12,
        pendingReviews: summary.pending_reviews ?? 4,
        criticalIssues: summary.critical_issues ?? 2,
        completedThisPeriod: summary.completed_reviews ?? 8,
        priorityReviews,
        workload: {
          pending: wl["Pending"] ?? wl.pending ?? 4,
          inProgress: wl["In Progress"] ?? wl.in_progress ?? 2,
          waitingForCompany: wl["Waiting for Company"] ?? wl.waiting_for_company ?? 1,
          readyForApproval: wl["Ready for Approval"] ?? wl.ready_for_approval ?? 1,
          completed: wl["Completed"] ?? wl.completed ?? 8,
        },
        recentActivity,
      };
    }
  } catch {
    // Graceful fallback
  }

  return {
    companiesAssigned: 12,
    pendingReviews: 4,
    criticalIssues: 2,
    completedThisPeriod: 8,
    priorityReviews: [
      {
        companyName: "ABC Holdings (Pvt) Ltd",
        tag: "critical",
        tagLabel: "CRITICAL",
        detail: "CIT Review Required — 2 Critical Issues • 3 Warnings",
        progressPercent: 82,
        dueDate: "18 Aug",
      },
      {
        companyName: "Lanka Trading (Pvt) Ltd",
        tag: "attention",
        tagLabel: "ATTENTION REQUIRED",
        detail: "5 Warnings",
        progressPercent: 74,
        dueDate: "20 Aug",
      },
      {
        companyName: "Ocean Foods (Pvt) Ltd",
        tag: "ready",
        tagLabel: "READY FOR APPROVAL",
        detail: "All validation checks passed — 0 Critical • 0 Warnings",
        progressPercent: 98,
        dueDate: "22 Aug",
      },
    ],
    workload: {
      pending: 4,
      inProgress: 2,
      waitingForCompany: 1,
      readyForApproval: 1,
      completed: 8,
    },
    recentActivity: [
      {
        title: "CIT Computation Approved",
        company: "ABC Manufacturing (Pvt) Ltd",
        timeAgo: "10 minutes ago",
      },
    ],
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
          tin: c.tin_number || c.tin || "TIN000000000",
          financialYear: c.current_fiscal_year || c.financial_year || "2025/26",
          citStatus: citMap[c.cit_status_badge] || citMap[c.status] || "Under Review",
          subStatusLabel: c.status || "In Progress",
          criticalCount: c.critical_count ?? c.critical_issues_count ?? 0,
          warningsCount: c.warnings_count ?? 0,
          progressPercent: c.progress_percent ?? 0,
          dueDate: c.due_date || "30 Sep",
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
          company: "ABC Holdings",
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
          criticalCount: criticalCount || 2,
          warningsCount: warningsCount || 3,
          informationCount: informationCount || 4,
          resolvedCount: resolvedCount || 12,
          issues,
        };
      }
    }
  } catch {
    // Fallback
  }

  return {
    criticalCount: 2,
    warningsCount: 3,
    informationCount: 4,
    resolvedCount: 12,
    issues: [
      {
        id: "iss_1",
        title: "Tax calculation mismatch",
        company: "ABC Holdings",
        amount: "Rs. 45,000",
        severity: "Critical",
        status: "Open",
        source: "CIT",
      },
      {
        id: "iss_2",
        title: "Entertainment expense classification",
        company: "ABC Holdings",
        amount: "Rs. 300,000",
        severity: "Warning",
        status: "Open",
        source: "Page 14",
      },
      {
        id: "iss_3",
        title: "Depreciation rate variance",
        company: "Lanka Trading",
        amount: "Rs. 12,000",
        severity: "Warning",
        status: "Open",
        source: "Fixed Assets",
      },
      {
        id: "iss_4",
        title: "Capital allowance computation",
        company: "Eastern Cement",
        amount: "Rs. 85,000",
        severity: "Critical",
        status: "Open",
        source: "CIT",
      },
      {
        id: "iss_5",
        title: "Interest income classification",
        company: "Tech Solutions",
        amount: "Rs. 28,000",
        severity: "Information",
        status: "Open",
        source: "Income Statement",
      },
      {
        id: "iss_6",
        title: "Prior year adjustment",
        company: "Colombo Textiles",
        amount: "Rs. 9,500",
        severity: "Information",
        status: "Open",
        source: "Balance Sheet",
      },
      {
        id: "iss_7",
        title: "Revenue recognition timing",
        company: "ABC Manufacturing",
        amount: "Rs. 0",
        severity: "Resolved",
        status: "Resolved",
        source: "Revenue",
      },
    ],
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
          timestamp: l.timestamp || "16 Aug 2026, 10:42",
          company: l.company_name || l.company || "ABC Holdings (Pvt) Ltd",
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
    entries: [
      {
        id: "log_1",
        timestamp: "16 Aug 2026, 10:42",
        company: "ABC Holdings (Pvt) Ltd",
        user: "Auditor",
        action: "CIT Computation Approved",
        actionTone: "success",
        details: "Final approval granted",
      },
      {
        id: "log_2",
        timestamp: "16 Aug 2026, 09:18",
        company: "ABC Holdings (Pvt) Ltd",
        user: "Auditor",
        action: "Issue Reviewed",
        actionTone: "warning",
        details: "Entertainment classification",
      },
      {
        id: "log_3",
        timestamp: "16 Aug 2026, 08:55",
        company: "Lanka Trading (Pvt) Ltd",
        user: "AI System",
        action: "Document Extracted",
        actionTone: "info",
        details: "Trial Balance.xlsx processed",
      },
      {
        id: "log_4",
        timestamp: "15 Aug 2026, 16:22",
        company: "Ocean Foods (Pvt) Ltd",
        user: "AI System",
        action: "Validation Completed",
        actionTone: "info",
        details: "24 validation checks passed",
      },
      {
        id: "log_5",
        timestamp: "15 Aug 2026, 14:07",
        company: "Tech Solutions (Pvt) Ltd",
        user: "Auditor",
        action: "Information Requested",
        actionTone: "pending",
        details: "Requested clarification",
      },
      {
        id: "log_6",
        timestamp: "15 Aug 2026, 11:33",
        company: "ABC Holdings (Pvt) Ltd",
        user: "Company User",
        action: "Supporting Document Uploaded",
        actionTone: "info",
        details: "Entertainment expense invoice",
      },
      {
        id: "log_7",
        timestamp: "14 Aug 2026, 17:44",
        company: "Colombo Textiles (Pvt) Ltd",
        user: "AI System",
        action: "CIT Calculation Generated",
        actionTone: "info",
        details: "Estimated CIT liability computed",
      },
      {
        id: "log_8",
        timestamp: "14 Aug 2026, 15:20",
        company: "Eastern Cement (Pvt) Ltd",
        user: "Auditor",
        action: "Issue Flagged",
        actionTone: "warning",
        details: "Capital allowance discrepancy",
      },
    ],
  };
}

export async function getAuditorProfileSettings(): Promise<AuditorProfileSettings> {
  try {
    const authHeaders = await getAuthHeaders();
    const res = await fetch(`${API_URL}/api/auth/me`, {
      headers: authHeaders,
      cache: "no-store",
    });
    if (res.ok) {
      const data = await res.json();
      return {
        fullName: data.display_name || data.fullName || "Professional Auditor",
        email: data.email || "auditor@example.com",
        phone: data.phone || "+94 77 000 0000",
        licenseNumber: data.license_number || data.licenseNumber || "CA-XXXX-XXXX",
        organization: data.company_name || data.organization || "Audit Firm Name",
        designation: data.role === "AUDITOR_PARTNER" ? "Partner / Senior Auditor" : (data.designation || "Senior Auditor"),
      };
    }
  } catch {
    // Fallback
  }

  return {
    fullName: "Professional Auditor",
    email: "auditor@example.com",
    phone: "+94 77 000 0000",
    licenseNumber: "CA-XXXX-XXXX",
    organization: "Audit Firm Name",
    designation: "Senior Auditor",
  };
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
      if (Array.isArray(data) && data.length > 0) {
        const documents = data.map((d: any) => ({
          id: String(d.id),
          companyName: "ABC Holdings (Pvt) Ltd",
          documentName: d.name,
          documentType: d.category || d.type || "Financial Statements",
          status: (d.status === "VERIFIED" ? "verified" : d.status === "PENDING" ? "review_required" : "processed") as any,
          aiConfidencePercent: 95,
          uploadedDate: d.uploaded_at || "16 Aug 2026",
          sizeLabel: d.size || "2.1 MB",
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
    totalDocuments: 18,
    pendingReviewCount: 4,
    verifiedCount: 14,
    documents: [
      {
        id: "aud_doc_1",
        companyName: "ABC Holdings (Pvt) Ltd",
        documentName: "Audited Financial Statements 2025/26.pdf",
        documentType: "Financial Statements",
        status: "verified",
        aiConfidencePercent: 99,
        uploadedDate: "16 Aug 2026",
        sizeLabel: "4.2 MB",
      },
      {
        id: "aud_doc_2",
        companyName: "ABC Holdings (Pvt) Ltd",
        documentName: "Trial Balance FY2026.xlsx",
        documentType: "Trial Balance",
        status: "review_required",
        aiConfidencePercent: 88,
        uploadedDate: "16 Aug 2026",
        sizeLabel: "1.8 MB",
      },
      {
        id: "aud_doc_3",
        companyName: "Lanka Trading (Pvt) Ltd",
        documentName: "General Ledger 2025.xlsx",
        documentType: "General Ledger",
        status: "review_required",
        aiConfidencePercent: 91,
        uploadedDate: "15 Aug 2026",
        sizeLabel: "3.5 MB",
      },
      {
        id: "aud_doc_4",
        companyName: "Ocean Foods (Pvt) Ltd",
        documentName: "Fixed Asset Schedule.xlsx",
        documentType: "Fixed Assets",
        status: "verified",
        aiConfidencePercent: 97,
        uploadedDate: "15 Aug 2026",
        sizeLabel: "820 KB",
      },
      {
        id: "aud_doc_5",
        companyName: "ABC Manufacturing (Pvt) Ltd",
        documentName: "Bank Reconciliation Statements.pdf",
        documentType: "Bank Reconciliation",
        status: "verified",
        aiConfidencePercent: 99,
        uploadedDate: "14 Aug 2026",
        sizeLabel: "2.1 MB",
      },
      {
        id: "aud_doc_6",
        companyName: "Tech Solutions (Pvt) Ltd",
        documentName: "Board Resolution for Dividends.pdf",
        documentType: "Board Resolution",
        status: "review_required",
        aiConfidencePercent: 85,
        uploadedDate: "14 Aug 2026",
        sizeLabel: "540 KB",
      },
      {
        id: "aud_doc_7",
        companyName: "Green Valley Exports (Pvt) Ltd",
        documentName: "Previous CIT Return 2024/25.pdf",
        documentType: "Previous CIT",
        status: "verified",
        aiConfidencePercent: 98,
        uploadedDate: "13 Aug 2026",
        sizeLabel: "1.2 MB",
      },
    ],
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
        requestedDate: "16 Aug 2026",
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
    totalRequests: 8,
    pendingCount: 3,
    respondedCount: 3,
    resolvedCount: 2,
    requests: [
      {
        id: "req_1",
        requestId: "REQ-2026-001",
        companyName: "ABC Holdings (Pvt) Ltd",
        title: "Supporting invoices for Rs. 300,000 entertainment expenses",
        description: "Please provide itemized tax invoices and business justification for entertainment claims.",
        category: "Entertainment Expenses",
        status: "pending",
        priority: "high",
        requestedDate: "16 Aug 2026",
        dueDate: "20 Aug 2026",
      },
      {
        id: "req_2",
        requestId: "REQ-2026-002",
        companyName: "Lanka Trading (Pvt) Ltd",
        title: "Fixed Asset depreciation schedule clarification",
        description: "Reconcile depreciation rate used for plant & machinery with prior year method.",
        category: "Fixed Assets",
        status: "responded",
        priority: "medium",
        requestedDate: "15 Aug 2026",
        dueDate: "22 Aug 2026",
      },
      {
        id: "req_3",
        requestId: "REQ-2026-003",
        companyName: "Tech Solutions (Pvt) Ltd",
        title: "Bank confirmation letter for primary commercial account",
        description: "Direct bank confirmation required for end of year foreign currency balance.",
        category: "Bank Confirmation",
        status: "pending",
        priority: "high",
        requestedDate: "15 Aug 2026",
        dueDate: "19 Aug 2026",
      },
      {
        id: "req_4",
        requestId: "REQ-2026-004",
        companyName: "Ocean Foods (Pvt) Ltd",
        title: "Inventory valuation methodology sign-off",
        description: "Stock take certificate and valuation summary signed by CFO.",
        category: "Inventory",
        status: "resolved",
        priority: "low",
        requestedDate: "12 Aug 2026",
        dueDate: "18 Aug 2026",
      },
      {
        id: "req_5",
        requestId: "REQ-2026-005",
        companyName: "Green Valley Exports (Pvt) Ltd",
        title: "Withholding tax deduction receipts for export services",
        description: "Submit certificate of WHT credits claimed against income tax liability.",
        category: "Withholding Tax",
        status: "pending",
        priority: "medium",
        requestedDate: "14 Aug 2026",
        dueDate: "24 Aug 2026",
      },
    ],
  };
}

export async function getAuditorDiscussionsSummary(): Promise<AuditorDiscussionsSummary> {
  try {
    const authHeaders = await getAuthHeaders();
    const res = await fetch(`${API_URL}/api/auditor/discussions`, {
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
    threads: [
      {
        id: "disc_1",
        companyName: "ABC Holdings (Pvt) Ltd",
        topic: "Reconciliation of Taxable Income & GL Variance",
        lastMessage: "We have attached the updated breakdown for the November discrepancy.",
        lastUpdated: "10 mins ago",
        unreadCount: 2,
        status: "Open",
        messages: [
          {
            id: "m_1",
            sender: "Professional Auditor",
            senderRole: "Auditor",
            text: "Hello ABC team, we noticed a minor variance in November 2025 General Ledger reconciliation. Could you clarify the entries on line 42?",
            timestamp: "Yesterday, 14:30",
          },
          {
            id: "m_2",
            sender: "Admin User (ABC Holdings)",
            senderRole: "Company",
            text: "Hello! Our finance team reviewed the ledger. It was a timing difference in supplier invoice recognition.",
            timestamp: "Today, 09:15",
          },
          {
            id: "m_3",
            sender: "Admin User (ABC Holdings)",
            senderRole: "Company",
            text: "We have attached the updated breakdown for the November discrepancy.",
            timestamp: "10 mins ago",
          },
        ],
      },
      {
        id: "disc_2",
        companyName: "Lanka Trading (Pvt) Ltd",
        topic: "Depreciation Rates Confirmation for FY2025/26",
        lastMessage: "Auditor: Please confirm if straight-line basis was maintained.",
        lastUpdated: "2 hours ago",
        unreadCount: 0,
        status: "Open",
        messages: [
          {
            id: "m_4",
            sender: "Professional Auditor",
            senderRole: "Auditor",
            text: "Please confirm if straight-line basis was maintained consistently with the previous financial year.",
            timestamp: "2 hours ago",
          },
        ],
      },
      {
        id: "disc_3",
        companyName: "Ocean Foods (Pvt) Ltd",
        topic: "Tax Exemption Certificate Submission",
        lastMessage: "Auditor: Verified and approved. Thank you!",
        lastUpdated: "1 day ago",
        unreadCount: 0,
        status: "Closed",
        messages: [
          {
            id: "m_5",
            sender: "Ocean Foods Accountant",
            senderRole: "Company",
            text: "We have uploaded our BOI tax exemption certificate for fisheries export.",
            timestamp: "2 days ago",
          },
          {
            id: "m_6",
            sender: "Professional Auditor",
            senderRole: "Auditor",
            text: "Verified and approved. Thank you!",
            timestamp: "1 day ago",
          },
        ],
      },
    ],
  };
}

