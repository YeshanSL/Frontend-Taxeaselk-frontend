// Pure helper functions for handling files picked from the user's local
// machine (via <input type="file"> or drag & drop). No backend calls —
// this is validation + display formatting only.

export const ACCEPTED_EXTENSIONS = [".pdf", ".xlsx", ".xls", ".csv"];
export const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024; // 10MB

export interface FileValidationResult {
  valid: File[];
  rejected: { fileName: string; reason: string }[];
}

// Checks each picked file against allowed type + size before we do
// anything with it. Keeping this separate from the UI makes it easy to
// unit test later and easy to swap in server-side validation rules
// once the FastAPI backend defines its own limits.
export function validateFiles(files: FileList | File[]): FileValidationResult {
  const valid: File[] = [];
  const rejected: { fileName: string; reason: string }[] = [];

  Array.from(files).forEach((file) => {
    const extension = "." + file.name.split(".").pop()?.toLowerCase();

    if (!ACCEPTED_EXTENSIONS.includes(extension)) {
      rejected.push({
        fileName: file.name,
        reason: `Unsupported file type (${extension || "unknown"}). Use PDF, XLSX, XLS, or CSV.`,
      });
      return;
    }

    if (file.size > MAX_FILE_SIZE_BYTES) {
      rejected.push({
        fileName: file.name,
        reason: `File is too large (${formatFileSize(file.size)}). Max size is 10MB.`,
      });
      return;
    }

    valid.push(file);
  });

  return { valid, rejected };
}

export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

// Maps a file extension to the human-readable "Type" column shown in
// the Documents table. Best-effort guess from the filename since we
// don't have an AI classifier on the frontend — the real classification
// will come from the FastAPI backend once a file is actually uploaded.
export function guessDocumentType(fileName: string): string {
  const lower = fileName.toLowerCase();
  if (lower.includes("trial")) return "Trial Balance";
  if (lower.includes("ledger")) return "General Ledger";
  if (lower.includes("fixed") || lower.includes("asset")) return "Fixed Assets";
  if (lower.includes("bank")) return "Bank Reconciliation";
  if (lower.includes("board")) return "Board Resolution";
  if (lower.includes("cit") || lower.includes("return")) return "Previous CIT";
  if (lower.includes("financial") || lower.includes("statement")) return "Financial Statements";

  const extension = lower.split(".").pop();
  if (extension === "pdf") return "PDF Document";
  if (extension === "csv") return "CSV Data";
  return "Spreadsheet";
}

export function formatUploadedDate(date: Date): string {
  return date.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}
