// Shared types used across the app. Keeping these in one file makes it
// easy to see the full shape of our data model at a glance, and this is
// the file to update first once the FastAPI backend is wired up.

export type Role = "business" | "auditor";

export interface DashboardSummary {
  progressPercent: number;
  progressUpdatedAt: string;
  steps: { label: string; state: "done" | "warning" | "pending" }[];
  documentsUploaded: number;
  documentsTotal: number;
  accountingProfit: string;
  taxableIncome: string;
  estCitLiability: string;
  auditorStatus: string;
  attentionItems: {
    severity: "critical" | "warning";
    title: string;
    description: string;
  }[];
}

// --- Documents page ---

export type DocumentStatus = "processed" | "review_required" | "missing";

export interface DocumentRow {
  id: string;
  name: string;
  type: string; // e.g. "Financial Statements", "Trial Balance"
  status: DocumentStatus;
  aiConfidencePercent: number | null; // null when status is "missing"
  uploadedDate: string | null; // null when status is "missing"
}

export interface DocumentsSummary {
  uploadedCount: number;
  processedCount: number;
  reviewRequiredCount: number;
  missingCount: number;
  documents: DocumentRow[];
}

// --- Financials page ---

export type FinancialsTab =
  | "Income Statement"
  | "Balance Sheet"
  | "Trial Balance"
  | "General Ledger"
  | "Fixed Assets";

export interface FinancialLineItem {
  item: string;
  amount: string;
  source: string;
}

export interface FinancialsSummary {
  revenue: string;
  expenses: string;
  accountingProfit: string;
  taxAdjustments: string;
  tabs: Record<FinancialsTab, FinancialLineItem[]>;
}

// --- Auditor Review page (business side) ---

export interface AuditorReviewIssue {
  id: string;
  status: "action_required" | "pending_clarification";
  title: string;
  comment: string;
  source: string;
}

export interface AuditorReviewSummary {
  auditorName: string;
  auditorFirm: string;
  reviewStatus: string; // e.g. "Waiting for Review"
  submittedDate: string;
  expectedByDate: string;
  reviewedPercent: number;
  approvedCount: number;
  warningsCount: number;
  criticalCount: number;
  pendingCount: number;
  issues: AuditorReviewIssue[];
}

// --- Settings page (business side) ---

export interface CompanySettings {
  companyName: string;
  registrationNumber: string;
  tinNumber: string;
  financialYear: string;
  contactEmail: string;
  contactPhone: string;
}
