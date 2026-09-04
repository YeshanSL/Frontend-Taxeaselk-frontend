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
} from "@/lib/types";

// --- DATA LAYER (Auditor portal) -----------------------------------------
// Same pattern as lib/api/business.ts: every function here stands in for
// a future FastAPI call. Swap the body, keep the signature, and every
// page that calls it keeps working unchanged.
// -------------------------------------------------------------------------

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
    const [summaryRes, workloadRes] = await Promise.all([
      fetch(`${API_URL}/auditor/dashboard/summary`, { cache: "no-store" }),
      fetch(`${API_URL}/auditor/dashboard/workload`, { cache: "no-store" }).catch(() => null),
    ]);

    if (summaryRes.ok) {
      const summary = await summaryRes.json();
      let workload = {
        pending: 4,
        inProgress: 2,
        waitingForCompany: 1,
        readyForApproval: 1,
        completed: 8,
      };

      if (workloadRes && workloadRes.ok) {
        const wlData = await workloadRes.json();
        workload = {
          pending: wlData.pending ?? 4,
          inProgress: wlData.in_progress ?? 2,
          waitingForCompany: wlData.waiting_for_company ?? 1,
          readyForApproval: wlData.ready_for_approval ?? 1,
          completed: wlData.completed ?? 8,
        };
      }

      return {
        companiesAssigned: summary.companies_assigned ?? 12,
        pendingReviews: summary.pending_reviews ?? 4,
        criticalIssues: summary.critical_issues ?? 2,
        completedThisPeriod: summary.completed ?? 8,
        priorityReviews: [
          {
            companyName: "ABC (Pvt) Ltd",
            tag: "critical",
            tagLabel: "CRITICAL",
            detail: "CIT Review Required — 1 Critical Issue • 2 Warnings",
            progressPercent: 70,
            dueDate: "30 Sep",
          },
          {
            companyName: "Ceylon Tea Exports Ltd",
            tag: "attention",
            tagLabel: "ATTENTION REQUIRED",
            detail: "2 Critical Issues • 3 Warnings",
            progressPercent: 85,
            dueDate: "20 Sep",
          },
          {
            companyName: "Lanka Retail Holdings",
            tag: "ready",
            tagLabel: "READY FOR APPROVAL",
            detail: "Validation checks in progress — 0 Critical • 1 Warning",
            progressPercent: 35,
            dueDate: "15 Oct",
          },
        ],
        workload,
        recentActivity: [
          {
            title: "CIT Computation Submitted",
            company: "ABC (Pvt) Ltd",
            timeAgo: "10 minutes ago",
          },
        ],
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
    const res = await fetch(`${API_URL}/auditor/companies`, { cache: "no-store" });
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data) && data.length > 0) {
        const citMap: Record<string, "Draft" | "Under Review" | "Ready for Auditor" | "Approved" | "Waiting for Company"> = {
          draft: "Draft",
          under_review: "Under Review",
          ready_for_auditor: "Ready for Auditor",
          approved: "Approved",
          waiting_for_company: "Waiting for Company",
        };
        const revMap: Record<string, string> = {
          not_started: "Not Started",
          pending: "Pending",
          in_progress: "In Progress",
          waiting_for_company: "Waiting for Company",
          ready_for_approval: "Ready for Approval",
          completed: "Completed",
        };

        const companies = data.map((c: any) => ({
          id: String(c.id),
          name: c.name,
          tin: c.tin,
          financialYear: c.financial_year || "2025/26",
          citStatus: citMap[c.cit_status] || "Under Review",
          subStatusLabel: revMap[c.review_status] || "In Progress",
          criticalCount: c.critical_issues_count || 0,
          warningsCount: c.warnings_count || 0,
          progressPercent: c.progress_percent || 0,
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
  // TODO (Week 2): fetch(`${API_BASE_URL}/auditor/review-queue`)
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
  // TODO (Week 2): fetch(`${API_BASE_URL}/auditor/issues`)
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
  // TODO (Week 2): fetch(`${API_BASE_URL}/auditor/audit-log`)
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
  // TODO (Week 2): fetch(`${API_BASE_URL}/auditor/profile`)
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

