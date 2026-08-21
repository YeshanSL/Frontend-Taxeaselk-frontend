import { FileText, MoreVertical } from "lucide-react";
import Card from "@/components/ui/Card";
import StatCard from "@/components/ui/StatCard";
import MiniConfidenceBar from "@/components/ui/MiniConfidenceBar";
import DocumentUploadZone from "@/components/business/DocumentUploadZone";
import DocumentStatusBadge from "@/components/business/DocumentStatusBadge";
import { getDocumentsSummary } from "@/lib/api/business";

// Matches the "Documents" Figma screen: stat tiles, an upload dropzone,
// and a table of uploaded documents with AI confidence + status.
export default async function DocumentsPage() {
  const data = await getDocumentsSummary();

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900">Documents</h1>
      <p className="mt-1 text-sm text-gray-500">
        Manage financial documents used for Corporate Income Tax preparation.
      </p>

      <div className="mt-6 grid grid-cols-2 gap-4 md:grid-cols-4">
        <StatCard label="Documents Uploaded" value={String(data.uploadedCount)} />
        <StatCard label="Processed" value={String(data.processedCount)} />
        <StatCard
          label="Review Required"
          value={String(data.reviewRequiredCount)}
          valueClassName="text-status-warning"
        />
        <StatCard
          label="Missing"
          value={String(data.missingCount)}
          valueClassName="text-status-critical"
        />
      </div>

      <div className="mt-6">
        <DocumentUploadZone />
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
            {data.documents.map((doc) => (
              <tr
                key={doc.id}
                className="border-b border-gray-50 last:border-0 hover:bg-gray-50/60"
              >
                <td className="px-5 py-3.5">
                  <span className="flex items-center gap-2 font-medium text-brand-blue">
                    <FileText className="h-4 w-4 shrink-0 text-gray-400" />
                    {doc.name}
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
                    aria-label="More actions"
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <MoreVertical className="ml-auto h-4 w-4" />
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
