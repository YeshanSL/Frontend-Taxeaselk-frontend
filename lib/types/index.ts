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

// "processing" is a client-only transient state used right after a
// browser upload, before we know whether the file needs review — it's
// never returned by the mock/real API for existing documents.
export type DocumentStatus = "processed" | "review_required" | "missing" | "processing";

export interface DocumentRow {
  id: string;
  name: string;
  type: string; // e.g. "Financial Statements", "Trial Balance"
  status: DocumentStatus;
  aiConfidencePercent: number | null; // null when status is "missing" or "processing"
  uploadedDate: string | null; // null when status is "missing"
  sizeLabel?: string; // e.g. "2.4 MB" — only set for files uploaded client-side
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

// --- Auditor portal: shared ---

export type CitStatus =
  | "Draft"
  | "Under Review"
  | "Ready for Auditor"
  | "Approved"
  | "Waiting for Company";

export interface CompanyRow {
  id: string;
  name: string;
  tin: string;
  financialYear: string;
  citStatus: CitStatus;
  subStatusLabel: string; // e.g. "In Progress", "Not Started"
  criticalCount: number;
  warningsCount: number;
  progressPercent: number;
  dueDate: string;
}

// --- Auditor Dashboard (home) ---

export interface AuditorDashboardSummary {
  companiesAssigned: number;
  pendingReviews: number;
  criticalIssues: number;
  completedThisPeriod: number;
  priorityReviews: {
    companyName: string;
    tag: "critical" | "attention" | "ready";
    tagLabel: string;
    detail: string;
    progressPercent: number;
    dueDate: string;
  }[];
  workload: {
    pending: number;
    inProgress: number;
    waitingForCompany: number;
    readyForApproval: number;
    completed: number;
  };
  recentActivity: { title: string; company: string; timeAgo: string }[];
}

// --- Companies page ---

export interface CompaniesSummary {
  companies: CompanyRow[];
}

// --- Review Queue page ---

export type ReviewQueueFilter =
  | "All"
  | "Pending"
  | "In Progress"
  | "Waiting for Company"
  | "Ready for Approval"
  | "Completed";

export interface ReviewQueueRow {
  id: string;
  companyName: string;
  tin: string;
  status: string;
  criticalCount: number;
  warningsCount: number;
  progressPercent: number;
  dueDate: string;
}

export interface ReviewQueueSummary {
  rows: ReviewQueueRow[];
}

// --- Issues page ---

export type IssueSeverity = "Critical" | "Warning" | "Information" | "Resolved";

export interface IssueRow {
  id: string;
  title: string;
  company: string;
  amount: string;
  severity: IssueSeverity;
  status: "Open" | "Resolved";
  source: string;
}

export interface IssuesSummary {
  criticalCount: number;
  warningsCount: number;
  informationCount: number;
  resolvedCount: number;
  issues: IssueRow[];
}

// --- Audit Log page ---

export interface AuditLogRow {
  id: string;
  timestamp: string;
  company: string;
  user: string;
  action: string;
  actionTone: "success" | "warning" | "info" | "pending";
  details: string;
}

export interface AuditLogSummary {
  entries: AuditLogRow[];
}

// --- Auditor Settings page ---

export interface AuditorProfileSettings {
  fullName: string;
  email: string;
  phone: string;
  licenseNumber: string;
  organization: string;
  designation: string;
}

// --- Auditor Documents page ---

export interface AuditorDocumentRow {
  id: string;
  companyName: string;
  documentName: string;
  documentType: string;
  status: "processed" | "review_required" | "verified";
  aiConfidencePercent: number;
  uploadedDate: string;
  sizeLabel: string;
}

export interface AuditorDocumentsSummary {
  totalDocuments: number;
  pendingReviewCount: number;
  verifiedCount: number;
  documents: AuditorDocumentRow[];
}

// --- Auditor Requests page ---

export interface AuditorRequestRow {
  id: string;
  requestId: string;
  companyName: string;
  title: string;
  description: string;
  category: string;
  status: "pending" | "responded" | "resolved";
  priority: "high" | "medium" | "low";
  requestedDate: string;
  dueDate: string;
}

export interface AuditorRequestsSummary {
  totalRequests: number;
  pendingCount: number;
  respondedCount: number;
  resolvedCount: number;
  requests: AuditorRequestRow[];
}

// --- Auditor Discussions page ---

export interface DiscussionMessage {
  id: string;
  sender: string;
  senderRole: "Auditor" | "Company";
  text: string;
  timestamp: string;
}

export interface DiscussionThread {
  id: string;
  companyName: string;
  topic: string;
  lastMessage: string;
  lastUpdated: string;
  unreadCount: number;
  status: "Open" | "Closed";
  messages: DiscussionMessage[];
}

export interface AuditorDiscussionsSummary {
  threads: DiscussionThread[];
}

