import {
  AuditorDashboardSummary,
  CompaniesSummary,
  ReviewQueueSummary,
  IssuesSummary,
  AuditLogSummary,
  AuditorProfileSettings,
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

export async function getAuditorDashboardSummary(): Promise<AuditorDashboardSummary> {
  // TODO (Week 2): fetch(`${API_BASE_URL}/auditor/dashboard`)
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
  // TODO (Week 2): fetch(`${API_BASE_URL}/auditor/companies`)
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
