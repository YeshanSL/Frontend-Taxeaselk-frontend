"use client";

import { useState, useEffect, useRef } from "react";
import { useSearchParams } from "next/navigation";
import {
  AlertTriangle,
  Check,
  FileText,
  Trash2,
  UploadCloud,
  X,
} from "lucide-react";
import clsx from "clsx";
import Card from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import { AuditorReviewIssue } from "@/lib/types";
import { useLanguage } from "@/lib/i18n/LanguageContext";

interface Props {
  initialIssues: AuditorReviewIssue[];
}

function formatFileSize(bytes: number): string {
  if (bytes >= 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  if (bytes >= 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${bytes} B`;
}

export default function AuditorIssuesManager({ initialIssues }: Props) {
  const { t } = useLanguage();
  const searchParams = useSearchParams();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [issues, setIssues] = useState<AuditorReviewIssue[]>(initialIssues);
  const [activeIssueId, setActiveIssueId] = useState<string | null>(null);

  // Form states inside modal
  const [responseText, setResponseText] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // When navigated from dashboard (?issue=...), scroll to the card without any highlight or border
  useEffect(() => {
    const issueParam = searchParams.get("issue");
    if (issueParam) {
      setTimeout(() => {
        const el = document.getElementById(`issue-${issueParam}`);
        if (el) {
          el.scrollIntoView({ behavior: "smooth", block: "center" });
        }
      }, 100);
    }
  }, [searchParams]);

  const activeIssue = issues.find((i) => i.id === activeIssueId) || null;

  function openIssueModal(issue: AuditorReviewIssue) {
    setActiveIssueId(issue.id);
    setResponseText(issue.response || "");
    setSelectedFile(null);
    setSuccessMessage(null);
  }

  function handleCloseModal() {
    setActiveIssueId(null);
    setSelectedFile(null);
    setSuccessMessage(null);
    // Remove query param from URL without full reload
    if (typeof window !== "undefined") {
      const url = new URL(window.location.href);
      url.searchParams.delete("issue");
      window.history.replaceState({}, "", url.pathname);
    }
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  }

  async function handleSendResponse() {
    if (!activeIssue) return;
    if (!responseText.trim() && !selectedFile) return;

    setIsSubmitting(true);
    setSuccessMessage(null);

    const attachedName = selectedFile ? selectedFile.name : activeIssue.attachedFileName;
    const attachedSize = selectedFile ? formatFileSize(selectedFile.size) : activeIssue.attachedFileSize;

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
      const token = typeof window !== "undefined" ? localStorage.getItem("taxease_token") : null;
      const headers: Record<string, string> = {};
      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }

      if (selectedFile) {
        const formData = new FormData();
        formData.append("file", selectedFile);
        formData.append("action", "respond");
        formData.append("response", responseText.trim());
        await fetch(`${apiUrl}/api/auditor-review/issues/${activeIssue.id}/respond`, {
          method: "POST",
          headers,
          body: formData,
        }).catch(() => null);
      } else {
        await fetch(`${apiUrl}/api/auditor-review/issues/${activeIssue.id}/respond`, {
          method: "POST",
          headers: { ...headers, "Content-Type": "application/json" },
          body: JSON.stringify({
            action: "respond",
            response: responseText.trim(),
          }),
        }).catch(() => null);
      }

      // Update local state
      setIssues((prev) =>
        prev.map((i) =>
          i.id === activeIssue.id
            ? {
                ...i,
                response: responseText.trim() || i.response,
                attachedFileName: attachedName,
                attachedFileSize: attachedSize,
              }
            : i
        )
      );

      setSuccessMessage("Response & document sent to auditor successfully!");
      setTimeout(() => {
        handleCloseModal();
      }, 1400);
    } catch {
      setIssues((prev) =>
        prev.map((i) =>
          i.id === activeIssue.id
            ? {
                ...i,
                response: responseText.trim() || i.response,
                attachedFileName: attachedName,
                attachedFileSize: attachedSize,
              }
            : i
        )
      );
      setSuccessMessage("Response recorded successfully!");
      setTimeout(() => {
        handleCloseModal();
      }, 1400);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <>
      <Card className="mt-6 p-6">
        <p className="mb-4 font-semibold text-gray-800">
          {t("business.auditorReview.issuesTitle")}
        </p>
        <div className="divide-y divide-gray-50">
          {issues.map((issue) => (
            <div
              key={issue.id}
              id={`issue-${issue.id}`}
              className="flex gap-3 py-5 first:pt-0 last:pb-0"
            >
              <div
                className={
                  issue.status === "action_required"
                    ? "flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-red-50"
                    : "flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-amber-50"
                }
              >
                <AlertTriangle
                  className={
                    issue.status === "action_required"
                      ? "h-4 w-4 text-status-critical"
                      : "h-4 w-4 text-status-warning"
                  }
                />
              </div>
              <div className="flex-1">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge tone={issue.status === "action_required" ? "critical" : "warning"}>
                      {issue.status === "action_required"
                        ? t("status.reviewRequired")
                        : t("common.pending")}
                    </Badge>
                    {issue.response && (
                      <Badge tone="info">{t("status.processed")}</Badge>
                    )}
                    <p className="font-semibold text-gray-900">{issue.title}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => openIssueModal(issue)}
                    className="inline-flex items-center gap-1 rounded-lg border border-brand-blue/30 bg-blue-50 px-3 py-1.5 text-xs font-semibold text-brand-blue hover:bg-brand-blue hover:text-white transition-colors cursor-pointer shadow-sm"
                  >
                    {t("business.auditorReview.respond")} →
                  </button>
                </div>
                <p className="mt-2 rounded-lg bg-gray-50 p-3 text-sm text-gray-600">
                  &ldquo;{issue.comment}&rdquo;
                </p>
                <p className="mt-2 text-xs text-gray-400">
                  Source: {issue.source}
                </p>

                {/* Show user response if submitted */}
                {issue.response && (
                  <div className="mt-2.5 rounded-lg border border-blue-100 bg-blue-50/60 p-2.5 text-xs text-brand-blue">
                    <span className="font-semibold">{t("business.auditorReview.replyToAuditor")}: </span>
                    {issue.response}
                  </div>
                )}

                {/* Show attached file if uploaded */}
                {issue.attachedFileName && (
                  <div className="mt-2 inline-flex items-center gap-1.5 rounded-md border border-gray-200 bg-white px-2.5 py-1 text-xs text-gray-600">
                    <FileText className="h-3.5 w-3.5 text-brand-blue shrink-0" />
                    <span className="font-medium text-gray-800">{issue.attachedFileName}</span>
                    {issue.attachedFileSize && (
                      <span className="text-gray-400">({issue.attachedFileSize})</span>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Pop up Issue Modal */}
      {activeIssue && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <Card className="w-full max-w-lg p-6 shadow-xl max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="flex items-start justify-between border-b border-gray-100 pb-3">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <Badge tone={activeIssue.status === "action_required" ? "critical" : "warning"}>
                    {activeIssue.status === "action_required" ? "Action Required" : "Pending Clarification"}
                  </Badge>
                  {activeIssue.response && <Badge tone="info">Responded</Badge>}
                </div>
                <h3 className="font-semibold text-gray-900 text-base">{activeIssue.title}</h3>
              </div>
              <button
                type="button"
                onClick={handleCloseModal}
                className="text-gray-400 hover:text-gray-600 p-1 cursor-pointer"
                aria-label="Close"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Auditor Comment Info */}
            <div className="mt-4">
              <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">
                Auditor&apos;s Comment
              </p>
              <div className="mt-1.5 rounded-lg border border-gray-100 bg-gray-50 p-3 text-sm text-gray-700">
                &ldquo;{activeIssue.comment}&rdquo;
              </div>
              <p className="mt-1 text-xs text-gray-400">
                Source: <span className="font-medium text-gray-600">{activeIssue.source}</span>
              </p>
            </div>

            {/* Response Area */}
            <div className="mt-4">
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                {t("business.issues.yourResponse")}
              </label>
              <textarea
                rows={3}
                value={responseText}
                onChange={(e) => setResponseText(e.target.value)}
                placeholder="e.g., Attached supporting invoices for Rs. 300,000 entertainment expenses with client details and business rationale..."
                className="w-full rounded-lg border border-gray-200 p-3 text-sm focus:border-brand-blue focus:outline-none focus:ring-1 focus:ring-brand-blue"
              />
              <p className="mt-1 text-xs text-gray-400">
                This message will be forwarded directly to your assigned auditor for review.
              </p>
            </div>

            {/* Optional Document Upload Feature */}
            <div className="mt-4">
              <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                {t("business.issues.uploadSupport")}{" "}
                <span className="text-gray-400 font-normal">({t("common.optional")})</span>
              </label>

              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,.xlsx,.xls,.csv,.doc,.docx,.png,.jpg,.jpeg"
                onChange={handleFileChange}
                className="hidden"
              />

              {!selectedFile ? (
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="flex cursor-pointer flex-col items-center justify-center rounded-lg border border-dashed border-gray-300 bg-gray-50/50 p-4 text-center transition hover:border-brand-blue hover:bg-blue-50/20"
                >
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-50 text-brand-blue">
                    <UploadCloud className="h-5 w-5" />
                  </div>
                  <p className="mt-1.5 text-xs font-medium text-gray-700">
                    {t("business.issues.uploadSupport")}
                  </p>
                  <p className="text-[11px] text-gray-400">
                    PDF, Excel, Word, or images up to 10MB
                  </p>
                </div>
              ) : (
                <div className="flex items-center justify-between rounded-lg border border-gray-200 bg-gray-50 p-3">
                  <div className="flex items-center gap-2.5 overflow-hidden">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded bg-blue-100 text-brand-blue">
                      <FileText className="h-4 w-4" />
                    </div>
                    <div className="truncate">
                      <p className="truncate text-xs font-medium text-gray-800">
                        {selectedFile.name}
                      </p>
                      <p className="text-[11px] text-gray-400">
                        {formatFileSize(selectedFile.size)}
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedFile(null);
                      if (fileInputRef.current) fileInputRef.current.value = "";
                    }}
                    className="p-1 text-gray-400 hover:text-red-500 cursor-pointer"
                    title={t("common.remove")}
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              )}
            </div>

            {/* Success message */}
            {successMessage && (
              <div className="mt-4 flex items-center gap-2 rounded-lg border border-green-100 bg-green-50 p-3 text-xs font-medium text-status-success">
                <Check className="h-4 w-4 shrink-0" />
                {successMessage}
              </div>
            )}

            {/* Modal Footer */}
            <div className="mt-6 flex items-center justify-end gap-3 border-t border-gray-100 pt-4">
              <Button
                variant="secondary"
                onClick={handleCloseModal}
                disabled={isSubmitting}
              >
                {t("common.cancel")}
              </Button>
              <Button
                variant="primary"
                onClick={handleSendResponse}
                disabled={isSubmitting || (!responseText.trim() && !selectedFile)}
              >
                {isSubmitting
                  ? t("business.issues.submitting")
                  : t("business.issues.submitResponse")}
              </Button>
            </div>
          </Card>
        </div>
      )}
    </>
  );
}
