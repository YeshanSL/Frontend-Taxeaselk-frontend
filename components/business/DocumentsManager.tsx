"use client";

import { useMemo, useState } from "react";
import { FileText, Trash2 } from "lucide-react";
import Card from "@/components/ui/Card";
import StatCard from "@/components/ui/StatCard";
import MiniConfidenceBar from "@/components/ui/MiniConfidenceBar";
import DocumentUploadZone from "@/components/business/DocumentUploadZone";
import DocumentStatusBadge from "@/components/business/DocumentStatusBadge";
import { DocumentRow, DocumentsSummary } from "@/lib/types";
import { formatFileSize, formatUploadedDate, guessDocumentType } from "@/lib/files";

let localIdCounter = 0;
function nextLocalId() {
  localIdCounter += 1;
  return `local_${Date.now()}_${localIdCounter}`;
}

// Owns the live document list in React state, seeded from the server-
// fetched mock/API data. Files picked via DocumentUploadZone are added
// here immediately (real local file access — no backend needed for
// this to work), run through a short "Processing" simulation, then
// settle into Processed or Review Required, mirroring what the real
// AI extraction pipeline will eventually do.
//
// TODO (Week 2): once the FastAPI backend exists, replace the
// simulateProcessing() call below with a real upload:
//   const formData = new FormData();
//   formData.append("file", file);
//   const res = await fetch(`${API_BASE_URL}/documents/upload`, { method: "POST", body: formData });
//   const result = await res.json(); // { status, aiConfidencePercent, ... }
export default function DocumentsManager({ initial }: { initial: DocumentsSummary }) {
  const [documents, setDocuments] = useState<DocumentRow[]>(initial.documents);
  const [missingCount] = useState(initial.missingCount);

  const stats = useMemo(() => {
    const uploaded = documents.length;
    const processed = documents.filter((d) => d.status === "processed").length;
    const reviewRequired = documents.filter((d) => d.status === "review_required").length;
    return { uploaded, processed, reviewRequired };
  }, [documents]);

  function handleFilesAccepted(files: File[]) {
    const newRows: DocumentRow[] = files.map((file) => ({
      id: nextLocalId(),
      name: file.name,
      type: guessDocumentType(file.name),
      status: "processing",
      aiConfidencePercent: null,
      uploadedDate: formatUploadedDate(new Date()),
      sizeLabel: formatFileSize(file.size),
    }));

    // Show the new rows immediately (this is the real local-file part —
    // the file is already selected/dropped and on the page right away).
    setDocuments((prev) => [...newRows, ...prev]);

    // Simulate the AI extraction step finishing, since there's no
    // backend yet to actually process the file. Each file resolves
    // independently after a short, slightly randomized delay so
    // multiple uploads don't all flip at once.
    newRows.forEach((row) => {
      const delay = 1200 + Math.random() * 1200;
      setTimeout(() => {
        setDocuments((prev) =>
          prev.map((d) => {
            if (d.id !== row.id) return d;
            const needsReview = Math.random() < 0.25;
            const confidence = needsReview
              ? 80 + Math.floor(Math.random() * 10) // 80-89%
              : 95 + Math.floor(Math.random() * 5); // 95-99%
            return {
              ...d,
              status: needsReview ? "review_required" : "processed",
              aiConfidencePercent: confidence,
            };
          })
        );
      }, delay);
    });
  }

  function handleRemove(id: string) {
    setDocuments((prev) => prev.filter((d) => d.id !== id));
  }

  return (
    <div>
      <div className="mt-6 grid grid-cols-2 gap-4 md:grid-cols-4">
        <StatCard label="Documents Uploaded" value={String(stats.uploaded)} />
        <StatCard label="Processed" value={String(stats.processed)} />
        <StatCard
          label="Review Required"
          value={String(stats.reviewRequired)}
          valueClassName="text-status-warning"
        />
        <StatCard
          label="Missing"
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
              <th className="px-5 py-3">Documents</th>
              <th className="px-5 py-3">Type</th>
              <th className="px-5 py-3">Status</th>
              <th className="px-5 py-3">AI Confidence</th>
              <th className="px-5 py-3">Uploaded</th>
              <th className="px-5 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {documents.length === 0 && (
              <tr>
                <td colSpan={6} className="px-5 py-10 text-center text-sm text-gray-400">
                  No documents uploaded yet.
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
