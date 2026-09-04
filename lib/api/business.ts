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
    const [dashRes, issuesRes] = await Promise.all([
      fetch(`${API_URL}/business/dashboard`, { cache: "no-store" }),
      fetch(`${API_URL}/business/action-required`, { cache: "no-store" }).catch(() => null),
    ]);

    if (dashRes.ok) {
      const backendData = await dashRes.json();
      let attentionItems: { severity: "critical" | "warning"; title: string; description: string }[] = [];

      if (issuesRes && issuesRes.ok) {
        const issuesData = await issuesRes.json();
        if (Array.isArray(issuesData.issues) && issuesData.issues.length > 0) {
          attentionItems = issuesData.issues.map((i: any) => ({
            severity: i.severity === "critical" ? "critical" : "warning",
            title: i.title,
            description: i.description,
          }));
        }
      }

      if (attentionItems.length === 0) {
        attentionItems = [
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
        ];
      }

      const rawAuditorStatus = (backendData.auditor_status || "waiting").toLowerCase();
      const auditorStatus =
        rawAuditorStatus === "pending" || rawAuditorStatus === "waiting"
          ? "Waiting"
          : rawAuditorStatus === "approved"
          ? "Approved"
          : rawAuditorStatus === "in_review"
          ? "Under Review"
          : "Waiting";

      return {
        progressPercent: backendData.progress ?? 70,
        progressUpdatedAt: "Just now",
        steps: [
          { label: "Financial Data", state: "done" },
          { label: "AI Extraction", state: "done" },
          { label: "Calculation", state: "done" },
          { label: "Validation", state: "warning" },
          { label: "Auditor Review", state: "pending" },
        ],
        documentsUploaded: backendData.documents?.uploaded ?? 7,
        documentsTotal: backendData.documents?.total ?? 10,
        accountingProfit: formatLKR(backendData.accounting_profit, "Rs. 25.4M"),
        taxableIncome: formatLKR(backendData.taxable_income, "Rs. 26.1M"),
        estCitLiability: formatLKR(backendData.estimated_cit, "Rs. 7.83M"),
        auditorStatus,
        attentionItems,
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
    const res = await fetch(`${API_URL}/documents`, { cache: "no-store" });
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data.documents) && data.documents.length > 0) {
        let uploaded = 0;
        let processed = 0;
        let reviewRequired = 0;
        let missing = 0;

        const docs = data.documents.map((d: any) => {
          let status: "processed" | "review_required" | "missing" = "missing";
          let confidence: number | null = null;
          let dateStr: string | null = null;

          if (d.is_uploaded) {
            uploaded++;
            if (d.status === "needs_review") {
              status = "review_required";
              reviewRequired++;
              confidence = 87;
            } else {
              status = "processed";
              processed++;
              confidence = 99;
            }
            dateStr = d.uploaded_at
              ? new Date(d.uploaded_at).toLocaleDateString("en-GB", {
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                })
              : "Today";
          } else {
            missing++;
          }

          return {
            id: String(d.id),
            name: d.name,
            type: d.doc_type
              .split("_")
              .map((w: string) => w.charAt(0).toUpperCase() + w.slice(1))
              .join(" "),
            status,
            aiConfidencePercent: confidence,
            uploadedDate: dateStr,
          };
        });

        return {
          uploadedCount: uploaded,
          processedCount: processed,
          reviewRequiredCount: reviewRequired,
          missingCount: missing,
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
    const res = await fetch(`${API_URL}/settings/company`, { cache: "no-store" });
    if (res.ok) {
      const data = await res.json();
      return {
        companyName: data.company_name || "ABC (Pvt) Ltd",
        registrationNumber: data.registration_number || "PV-12345",
        tinNumber: data.tin || "123456789",
        financialYear: "2025/26",
        contactEmail: data.email || "admin@abc.lk",
        contactPhone: data.phone || "+94 11 234 5678",
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