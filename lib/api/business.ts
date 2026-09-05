import {
  DashboardSummary,
  DocumentsSummary,
  FinancialsSummary,
  AuditorReviewSummary,
  CompanySettings,
} from "@/lib/types";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

// --- DATA LAYER (Business portal) ---------------------------------------
// Fetches data for business portal views. Falls back gracefully to mock
// data if the backend server is not running or returns an error.
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
      // Ignore outside request lifecycle
    }
  }
  return headers;
}

function formatLKR(val: any, fallback: string): string {
  if (typeof val === "number") {
    if (val >= 1_000_000) {
      const millions = val / 1_000_000;
      return `Rs. ${millions.toFixed(millions % 1 === 0 ? 1 : 2)}M`;
    }
    if (val >= 1_000) {
      return `Rs. ${(val / 1_000).toFixed(1)}K`;
    }
    return `Rs. ${val.toLocaleString()}`;
  }
  if (typeof val === "string" && val.trim() !== "") {
    return val.startsWith("Rs.") ? val : `Rs. ${val}`;
  }
  return fallback;
}

export async function getDashboardSummary(): Promise<DashboardSummary> {
  try {
    const authHeaders = await getAuthHeaders();
    const dashRes = await fetch(`${API_URL}/api/dashboard`, {
      cache: "no-store",
      headers: authHeaders,
    });


    if (dashRes.ok) {
      const backendData = await dashRes.json();

      let attentionItems: { severity: "critical" | "warning"; title: string; description: string }[] = [];
      if (Array.isArray(backendData.attention_items)) {
        attentionItems = backendData.attention_items.map((i: any) => ({
          severity: (i.type === "critical" || i.severity === "critical") ? "critical" : "warning",
          title: i.title,
          description: i.message || i.description || "",
        }));
      }

      const rawAuditorStatus = (backendData.metrics?.auditor_status || backendData.auditor_status || "waiting").toLowerCase();
      const auditorStatus =
        rawAuditorStatus === "pending" || rawAuditorStatus === "waiting"
          ? "Waiting"
          : rawAuditorStatus === "approved"
          ? "Approved"
          : rawAuditorStatus.includes("review")
          ? "Under Review"
          : "Waiting";

      const steps = [
        { label: "Financial Data", state: backendData.steps?.financial_data ? ("done" as const) : ("pending" as const) },
        { label: "AI Extraction", state: backendData.steps?.ai_extraction ? ("done" as const) : ("pending" as const) },
        { label: "Calculation", state: backendData.steps?.calculation ? ("done" as const) : ("pending" as const) },
        {
          label: "Validation",
          state: backendData.steps?.validation ? ("done" as const) : ("warning" as const),
        },
        {
          label: "Auditor Review",
          state:
            auditorStatus === "Approved"
              ? ("done" as const)
              : auditorStatus === "Under Review"
              ? ("warning" as const)
              : ("pending" as const),
        },
      ];

      const docRatio = backendData.metrics?.documents_ratio || "7 / 10";
      const docParts = String(docRatio).split("/").map((s) => parseInt(s.trim(), 10));
      const documentsUploaded = !isNaN(docParts[0]) ? docParts[0] : 7;
      const documentsTotal = !isNaN(docParts[1]) ? docParts[1] : 10;

      return {
        progressPercent: backendData.progress_percent ?? 82,
        progressUpdatedAt: backendData.updated_at || "Just now",
        steps,
        documentsUploaded,
        documentsTotal,
        accountingProfit: formatLKR(backendData.metrics?.accounting_profit, "Rs. 25.4M"),
        taxableIncome: formatLKR(backendData.metrics?.taxable_income, "Rs. 26.1M"),
        estCitLiability: formatLKR(backendData.metrics?.estimated_cit_liability, "Rs. 7.83M"),
        auditorStatus,
        attentionItems: attentionItems.length > 0 ? attentionItems : [
          {
            severity: "critical",
            title: "Critical: Taxable income mismatch",
            description: "Calculated taxable income does not reconcile with underlying financial data.",
          },
          {
            severity: "warning",
            title: "Warning: Fixed Asset Schedule requires confirmation",
            description: "AI confidence 87% — manual review recommended before proceeding.",
          },
          {
            severity: "warning",
            title: "Warning: Entertainment expense documentation missing",
            description: "Supporting documents required for Rs. 300,000 entertainment expense claim.",
          },
        ],
      };
    }
  } catch {
    // Backend is offline or unreachable — gracefully fall back to mock data
  }

  return {
    progressPercent: 87,
    progressUpdatedAt: "16 Aug 2026 at 11:05",
    steps: [
      { label: "Financial Data", state: "done" },
      { label: "AI Extraction", state: "done" },
      { label: "Calculation", state: "done" },
      { label: "Validation", state: "warning" },
      { label: "Auditor Review", state: "pending" },
    ],
    documentsUploaded: 7,
    documentsTotal: 10,
    accountingProfit: "Rs. 25.4M",
    taxableIncome: "Rs. 26.1M",
    estCitLiability: "Rs. 7.83M",
    auditorStatus: "Waiting",
    attentionItems: [
      {
        severity: "critical",
        title: "Critical: Taxable income mismatch",
        description:
          "Calculated taxable income does not reconcile with underlying financial data.",
      },
      {
        severity: "warning",
        title: "Warning: Fixed Asset Schedule requires confirmation",
        description:
          "AI confidence 87% — manual review recommended before proceeding.",
      },
      {
        severity: "warning",
        title: "Warning: Entertainment expense documentation missing",
        description:
          "Supporting documents required for Rs. 300,000 entertainment expense claim.",
      },
    ],
  };
}

export async function getDocumentsSummary(): Promise<DocumentsSummary> {
  try {
    const authHeaders = await getAuthHeaders();
    const res = await fetch(`${API_URL}/api/documents`, {
      cache: "no-store",
      headers: authHeaders,
    });


    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data.documents) && data.documents.length > 0) {
        const docs = data.documents.map((d: any) => {
          let status: "processed" | "review_required" | "missing" = "processed";
          const rawStatus = String(d.status || "").toLowerCase();
          if (rawStatus.includes("review")) {
            status = "review_required";
          } else if (rawStatus.includes("missing")) {
            status = "missing";
          } else {
            status = "processed";
          }

          return {
            id: String(d.id),
            name: d.name,
            type: d.type || d.doc_type || "Financial Statements",
            status,
            aiConfidencePercent: d.ai_confidence_percent ?? 99,
            uploadedDate: d.uploaded_date || "16 Aug 2026",
          };
        });

        const uploadedCount = data.uploaded_count ?? docs.filter((x: any) => x.status !== "missing").length;
        const processedCount = data.processed_count ?? docs.filter((x: any) => x.status === "processed").length;
        const reviewRequiredCount = data.review_required_count ?? docs.filter((x: any) => x.status === "review_required").length;
        const missingCount = data.missing_count ?? Math.max(0, 10 - uploadedCount);

        return {
          uploadedCount,
          processedCount,
          reviewRequiredCount,
          missingCount,
          documents: docs,
        };
      }
    }
  } catch {
    // Graceful fallback
  }

  return {
    uploadedCount: 7,
    processedCount: 6,
    reviewRequiredCount: 1,
    missingCount: 2,
    documents: [
      {
        id: "doc_1",
        name: "Financial Statements.pdf",
        type: "Financial Statements",
        status: "processed",
        aiConfidencePercent: 99,
        uploadedDate: "16 Aug 2026",
      },
      {
        id: "doc_2",
        name: "Trial Balance.xlsx",
        type: "Trial Balance",
        status: "processed",
        aiConfidencePercent: 99,
        uploadedDate: "16 Aug 2026",
      },
      {
        id: "doc_3",
        name: "General Ledger.xlsx",
        type: "General Ledger",
        status: "review_required",
        aiConfidencePercent: 91,
        uploadedDate: "16 Aug 2026",
      },
      {
        id: "doc_4",
        name: "Fixed Asset Schedule.xlsx",
        type: "Fixed Assets",
        status: "review_required",
        aiConfidencePercent: 87,
        uploadedDate: "16 Aug 2026",
      },
      {
        id: "doc_5",
        name: "Previous CIT Return.pdf",
        type: "Previous CIT",
        status: "processed",
        aiConfidencePercent: 99,
        uploadedDate: "16 Aug 2026",
      },
      {
        id: "doc_6",
        name: "Board Resolution.pdf",
        type: "Board Resolution",
        status: "processed",
        aiConfidencePercent: 99,
        uploadedDate: "16 Aug 2026",
      },
      {
        id: "doc_7",
        name: "Bank Reconciliation.xlsx",
        type: "Bank Reconciliation",
        status: "processed",
        aiConfidencePercent: 99,
        uploadedDate: "16 Aug 2026",
      },
    ],
  };
}

export async function getFinancialsSummary(): Promise<FinancialsSummary> {
  try {
    const authHeaders = await getAuthHeaders();
    const res = await fetch(`${API_URL}/api/financials`, {
      cache: "no-store",
      headers: authHeaders,
    });


    if (res.ok) {
      const data = await res.json();
      return {
        revenue: data.revenue || "Rs. 25.0M",
        expenses: data.expenses || "Rs. 20.4M",
        accountingProfit: data.accounting_profit || "Rs. 4.6M",
        taxAdjustments: data.tax_adjustments || "Rs. 0.7M",
        tabs: data.tabs || {},
      };
    }
  } catch {
    // Fallback
  }

  return {
    revenue: "Rs. 25.0M",
    expenses: "Rs. 20.4M",
    accountingProfit: "Rs. 4.6M",
    taxAdjustments: "Rs. 0.7M",
    tabs: {
      "Income Statement": [
        { item: "Revenue from Operations", amount: "25,000,000", source: "Financial Statements.pdf" },
        { item: "Cost of Sales", amount: "(15,200,000)", source: "Financial Statements.pdf" },
        { item: "Gross Profit", amount: "9,800,000", source: "Calculated" },
        { item: "Administrative Expenses", amount: "(3,100,000)", source: "General Ledger.xlsx" },
        { item: "Entertainment Expenses", amount: "(300,000)", source: "General Ledger.xlsx" },
        { item: "Depreciation", amount: "(1,800,000)", source: "Fixed Asset Schedule.xlsx" },
        { item: "Accounting Profit", amount: "4,600,000", source: "Calculated" },
      ],
      "Balance Sheet": [
        { item: "Property, Plant & Equipment", amount: "18,400,000", source: "Fixed Asset Schedule.xlsx" },
        { item: "Trade Receivables", amount: "6,200,000", source: "Trial Balance.xlsx" },
        { item: "Cash & Bank Balances", amount: "3,050,000", source: "Bank Reconciliation.xlsx" },
        { item: "Trade Payables", amount: "(4,700,000)", source: "Trial Balance.xlsx" },
        { item: "Retained Earnings", amount: "16,300,000", source: "Financial Statements.pdf" },
      ],
      "Trial Balance": [
        { item: "Sales", amount: "25,000,000", source: "Trial Balance.xlsx" },
        { item: "Purchases", amount: "15,200,000", source: "Trial Balance.xlsx" },
        { item: "Salaries & Wages", amount: "2,400,000", source: "Trial Balance.xlsx" },
        { item: "Rent Expense", amount: "700,000", source: "Trial Balance.xlsx" },
        { item: "Bank Balance", amount: "3,050,000", source: "Trial Balance.xlsx" },
      ],
      "General Ledger": [
        { item: "Nov 2025 — Office Supplies", amount: "120,000", source: "General Ledger.xlsx" },
        { item: "Dec 2025 — Utilities", amount: "95,000", source: "General Ledger.xlsx" },
        { item: "Jan 2026 — Entertainment", amount: "300,000", source: "General Ledger.xlsx" },
        { item: "Feb 2026 — Repairs", amount: "210,000", source: "General Ledger.xlsx" },
      ],
      "Fixed Assets": [
        { item: "Motor Vehicles (WDV)", amount: "6,200,000", source: "Fixed Asset Schedule.xlsx" },
        { item: "Office Equipment (WDV)", amount: "2,100,000", source: "Fixed Asset Schedule.xlsx" },
        { item: "Buildings (WDV)", amount: "10,100,000", source: "Fixed Asset Schedule.xlsx" },
        { item: "Current Year Depreciation", amount: "1,800,000", source: "Fixed Asset Schedule.xlsx" },
      ],
    },
  };
}

export async function getAuditorReviewSummary(): Promise<AuditorReviewSummary> {
  try {
    const authHeaders = await getAuthHeaders();
    const res = await fetch(`${API_URL}/api/auditor-review`, {
      cache: "no-store",
      headers: authHeaders,
    });

    if (res.ok) {
      const data = await res.json();
      const auditor = data.assigned_auditor || data.auditor;
      const summary = data.review_summary || data.stats;
      return {
        auditorName: auditor?.firm_name || "Mr. Karunaratne & Associates",
        auditorFirm: auditor?.designation || "Chartered Accountants",
        reviewStatus: auditor?.status || "Waiting for Review",
        submittedDate: auditor?.submitted_date || "16 Aug 2026",
        expectedByDate: auditor?.expected_date || "20 Aug 2026",
        reviewedPercent: auditor?.progress_percent ?? 80,
        approvedCount: summary?.approved ?? summary?.approved_count ?? 12,
        warningsCount: summary?.warnings ?? summary?.warnings_count ?? 3,
        criticalCount: summary?.critical ?? summary?.critical_count ?? 1,
        pendingCount: summary?.pending ?? summary?.pending_count ?? 0,
        issues: Array.isArray(data.issues)
          ? data.issues.map((i: any) => ({
              id: String(i.id),
              status: (i.status === "Action Required" || i.status === "ACTION_REQUIRED" || i.severity === "Critical" ? "action_required" : "pending_clarification") as any,
              title: i.title || "Audit Issue",
              comment: i.description || i.comment || "Please provide supporting documentation.",
              source: i.source_citation || i.source || "CIT",
            }))
          : [],
      };
    }
  } catch {
    // Fallback
  }

  return {
    auditorName: "Mr. Karunaratne & Associates",
    auditorFirm: "Chartered Accountants",
    reviewStatus: "Waiting for Review",
    submittedDate: "16 Aug 2026",
    expectedByDate: "20 Aug 2026",
    reviewedPercent: 80,
    approvedCount: 12,
    warningsCount: 3,
    criticalCount: 1,
    pendingCount: 0,
    issues: [
      {
        id: "issue_1",
        status: "action_required",
        title: "Entertainment Expense Documentation",
        comment:
          "Please provide supporting documentation for the entertainment expense. Invoices and business purpose required.",
        source: "Financial Statements — Page 14",
      },
      {
        id: "issue_2",
        status: "pending_clarification",
        title: "Fixed Asset Depreciation Method",
        comment:
          "Confirm the depreciation method applied is consistent with previous year and company accounting policy.",
        source: "Fixed Asset Schedule",
      },
      {
        id: "issue_3",
        status: "pending_clarification",
        title: "General Ledger November 2025",
        comment: "Minor discrepancy detected in November 2025. Please reconcile and confirm.",
        source: "General Ledger",
      },
    ],
  };
}

export async function getCompanySettings(): Promise<CompanySettings> {
  try {
    const authHeaders = await getAuthHeaders();
    const res = await fetch(`${API_URL}/api/settings`, {
      cache: "no-store",
      headers: authHeaders,
    });


    if (res.ok) {
      const data = await res.json();
      return {
        companyName: data.companyName || data.company_name || "ABC (Pvt) Ltd",
        registrationNumber: data.registrationNumber || data.registration_number || "PV-12345",
        tinNumber: data.tinNumber || data.tin_number || "123456789",
        financialYear: data.financialYear || data.current_fiscal_year || "2025/26",
        contactEmail: data.contactEmail || data.contact_email || "admin@abc.lk",
        contactPhone: data.contactPhone || data.contact_phone || "+94 11 234 5678",
      };
    }
  } catch {
    // Graceful fallback
  }

  return {
    companyName: "ABC (Pvt) Ltd",
    registrationNumber: "PV 00123456",
    tinNumber: "134578291",
    financialYear: "2025/26",
    contactEmail: "admin@abc.lk",
    contactPhone: "+94 11 234 5678",
  };
}