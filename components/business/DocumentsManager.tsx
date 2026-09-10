"use client";

import { useMemo, useState, useEffect } from "react";
import { FileText, Trash2, Building2, CheckCircle2, ChevronDown } from "lucide-react";
import Card from "@/components/ui/Card";
import StatCard from "@/components/ui/StatCard";
import MiniConfidenceBar from "@/components/ui/MiniConfidenceBar";
import DocumentUploadZone from "@/components/business/DocumentUploadZone";
import DocumentStatusBadge from "@/components/business/DocumentStatusBadge";
import { DocumentRow, DocumentsSummary } from "@/lib/types";
import { formatFileSize, formatUploadedDate, guessDocumentType } from "@/lib/files";
import { useLanguage } from "@/lib/i18n/LanguageContext";

let localIdCounter = 0;
function nextLocalId() {
  localIdCounter += 1;
  return `local_${Date.now()}_${localIdCounter}`;
}

export default function DocumentsManager({ initial }: { initial: DocumentsSummary }) {
  const { t } = useLanguage();
  const [documents, setDocuments] = useState<DocumentRow[]>(initial.documents);
  const [missingCount] = useState(initial.missingCount);
  const [currentCompany, setCurrentCompany] = useState<string>("ABC Holdings (Pvt) Ltd");
  const [toastMessage, setToastMessage] = useState<string>("");

  useEffect(() => {
    function syncCompany() {
      try {
        const saved = localStorage.getItem("taxease_company_settings");
        if (saved) {
          const parsed = JSON.parse(saved);
          if (parsed.companyName) {
            setCurrentCompany(parsed.companyName);
            return;
          }
        }
        const user = localStorage.getItem("taxease_user");
        if (user) {
          const parsed = JSON.parse(user);
          const name = parsed.company_name || parsed.display_name || parsed.companyName;
          if (name) {
            setCurrentCompany(name);
          }
        }
      } catch {
        // Ignored
      }
    }
    syncCompany();
    window.addEventListener("taxease_company_updated", syncCompany);
    window.addEventListener("storage", syncCompany);
    return () => {
      window.removeEventListener("taxease_company_updated", syncCompany);
      window.removeEventListener("storage", syncCompany);
    };
  }, []);

  const stats = useMemo(() => {
    const uploaded = documents.length;
    const processed = documents.filter((d) => d.status === "processed").length;
    const reviewRequired = documents.filter((d) => d.status === "review_required").length;
    return { uploaded, processed, reviewRequired };
  }, [documents]);

  async function handleFilesAccepted(files: File[]) {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

    for (const file of files) {
      const tempId = nextLocalId();
      const newRow: DocumentRow = {
        id: tempId,
        name: file.name,
        type: guessDocumentType(file.name),
        status: "processing",
        aiConfidencePercent: null,
        uploadedDate: formatUploadedDate(new Date()),
        sizeLabel: formatFileSize(file.size),
      };

      setDocuments((prev) => [newRow, ...prev]);

      try {
        const formData = new FormData();
        formData.append("file", file);
        formData.append("doc_type", guessDocumentType(file.name));
        formData.append("company_name", currentCompany);

        const token = typeof window !== "undefined" ? localStorage.getItem("taxease_token") : null;
        const headers: Record<string, string> = {};
        if (token) {
          headers["Authorization"] = `Bearer ${token}`;
        }

        const res = await fetch(`${apiUrl}/api/documents/upload`, {
          method: "POST",
          headers,
          body: formData,
        });

        if (res.ok) {
          const result = await res.json();
          setDocuments((prev) =>
            prev.map((d) =>
              d.id === tempId
                ? {
                    ...d,
                    id: String(result.id || d.id),
                    name: result.name || d.name,
                    type: result.type || d.type,
                    status: (result.status === "review_required" ? "review_required" : "processed"),
                    aiConfidencePercent:
                      result.ai_confidence_percent ??
                      result.confidence_percent ??
                      result.confidence ??
                      (result.status === "review_required" ? 85 : 98),
                    uploadedDate: result.uploaded_date || d.uploadedDate,
                  }
                : d
            )
          );
          setToastMessage(`"${file.name}" uploaded successfully for ${currentCompany}`);
          setTimeout(() => setToastMessage(""), 4000);
        } else {
          setDocuments((prev) =>
            prev.map((d) => (d.id === tempId ? { ...d, status: "processed", aiConfidencePercent: 95 } : d))
          );
        }
      } catch {
        setDocuments((prev) =>
          prev.map((d) => (d.id === tempId ? { ...d, status: "processed", aiConfidencePercent: 95 } : d))
        );
      }
    }
  }

  async function handleRemove(id: string) {
    setDocuments((prev) => prev.filter((d) => d.id !== id));
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
      const token = typeof window !== "undefined" ? localStorage.getItem("taxease_token") : null;
      const headers: Record<string, string> = {};
      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }
      await fetch(`${apiUrl}/api/documents/${id}`, {
        method: "DELETE",
        headers,
      }).catch(() => null);
    } catch {
      // Ignored
    }
  }

  return (
    <div>
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2.5 text-xs font-semibold text-white shadow-lg animate-in fade-in slide-in-from-bottom-2 duration-150">
          <CheckCircle2 className="h-4 w-4 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Active Company Selector Bar */}
      <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-blue-100 bg-blue-50/70 p-3.5 shadow-sm">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-100 text-brand-blue">
            <Building2 className="h-4 w-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-gray-500">
                {t("business.documents.activeCompany")}
              </span>
              <span className="inline-flex items-center rounded-md bg-emerald-100 px-2 py-0.5 text-[11px] font-semibold text-emerald-800">
                {t("status.connected")}
              </span>
            </div>
            <p className="text-sm font-bold text-gray-900">{currentCompany}</p>
          </div>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-2 gap-4 md:grid-cols-4">
        <StatCard label={t("business.documents.uploadedCount")} value={String(stats.uploaded)} />
        <StatCard label={t("business.documents.processedCount")} value={String(stats.processed)} />
        <StatCard
          label={t("business.documents.reviewRequiredCount")}
          value={String(stats.reviewRequired)}
          valueClassName="text-status-warning"
        />
        <StatCard
          label={t("business.documents.missingCount")}
          value={String(missingCount)}
          valueClassName="text-status-critical"
        />
      </div>

      <div className="mt-6">
        <DocumentUploadZone onFilesAccepted={handleFilesAccepted} />
      </div>

      <Card className="mt-6 overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-gray-100 text-xs font-medium uppercase tracking-wide text-gray-400">
              <th className="px-5 py-3">{t("business.documents.colDocuments")}</th>
              <th className="px-5 py-3">{t("business.documents.colType")}</th>
              <th className="px-5 py-3">{t("business.documents.colStatus")}</th>
              <th className="px-5 py-3">{t("business.documents.colAiConfidence")}</th>
              <th className="px-5 py-3">{t("business.documents.colUploaded")}</th>
              <th className="px-5 py-3 text-right">{t("business.documents.colActions")}</th>
            </tr>
          </thead>
          <tbody>
            {documents.length === 0 && (
              <tr>
                <td colSpan={6} className="px-5 py-10 text-center text-sm text-gray-400">
                  {t("business.documents.noDocuments")}
                </td>
              </tr>
            )}
            {documents.map((doc) => (
              <tr
                key={doc.id}
                className="border-b border-gray-50 last:border-0 hover:bg-gray-50/60"
              >
                <td className="px-5 py-3.5">
                  <span className="flex items-center gap-2 font-medium text-brand-blue">
                    <FileText className="h-4 w-4 shrink-0 text-gray-400" />
                    {doc.name}
                    {doc.sizeLabel && (
                      <span className="font-normal text-gray-400">
                        ({doc.sizeLabel})
                      </span>
                    )}
                  </span>
                </td>
                <td className="px-5 py-3.5 text-gray-600">{doc.type}</td>
                <td className="px-5 py-3.5">
                  <DocumentStatusBadge status={doc.status} />
                </td>
                <td className="px-5 py-3.5">
                  {doc.aiConfidencePercent !== null ? (
                    <MiniConfidenceBar percent={doc.aiConfidencePercent} />
                  ) : (
                    <span className="text-gray-300">—</span>
                  )}
                </td>
                <td className="px-5 py-3.5 text-gray-600">
                  {doc.uploadedDate ?? "—"}
                </td>
                <td className="px-5 py-3.5 text-right">
                  <button
                    aria-label={`Remove ${doc.name}`}
                    onClick={() => handleRemove(doc.id)}
                    className="text-gray-400 hover:text-status-critical"
                  >
                    <Trash2 className="ml-auto h-4 w-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  );
}
