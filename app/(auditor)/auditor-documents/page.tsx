import { Search, Download, Eye, CheckCircle2, AlertCircle, FileText } from "lucide-react";
import Card from "@/components/ui/Card";
import StatCard from "@/components/ui/StatCard";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import MiniConfidenceBar from "@/components/ui/MiniConfidenceBar";
import T from "@/components/layout/T";
import { getAuditorDocumentsSummary } from "@/lib/api/auditor";

export default async function AuditorDocumentsPage() {
  const data = await getAuditorDocumentsSummary();

  return (
    <div>
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            <T k="pages.auditorDocuments.title" />
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            <T k="pages.auditorDocuments.subtitle" />
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="secondary" icon={<Download className="h-4 w-4" />}>
            Export Audit Archive
          </Button>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard
          label="Total Uploaded Documents"
          value={String(data.totalDocuments)}
          hint="Across all assigned companies"
        />
        <StatCard
          label="Pending Review"
          value={String(data.pendingReviewCount)}
          valueClassName={data.pendingReviewCount > 0 ? "text-amber-600" : ""}
          hint="AI flagged for verification"
        />
        <StatCard
          label="Verified & Approved"
          value={String(data.verifiedCount)}
          valueClassName="text-green-600"
          hint="Auditor checked"
        />
      </div>

      <Card className="mt-6 p-4">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input
            type="search"
            placeholder="Search documents by company or filename..."
            className="w-full rounded-lg border border-gray-200 py-2.5 pl-9 pr-3 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-1 focus:ring-brand-blue"
          />
        </div>
      </Card>

      <Card className="mt-4 overflow-x-auto">
        <table className="w-full min-w-[850px] text-left text-sm">
          <thead>
            <tr className="border-b border-gray-100 text-xs font-medium uppercase tracking-wide text-gray-400">
              <th className="px-5 py-3">Document</th>
              <th className="px-5 py-3">Company</th>
              <th className="px-5 py-3">Type</th>
              <th className="px-5 py-3">Status</th>
              <th className="px-5 py-3">AI Confidence</th>
              <th className="px-5 py-3">Uploaded Date</th>
              <th className="px-5 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {data.documents.map((doc) => (
              <tr key={doc.id} className="hover:bg-gray-50/50">
                <td className="px-5 py-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-brand-blue">
                      <FileText className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-800">{doc.documentName}</p>
                      <p className="text-xs text-gray-400">{doc.sizeLabel}</p>
                    </div>
                  </div>
                </td>
                <td className="px-5 py-4 font-medium text-gray-700">{doc.companyName}</td>
                <td className="px-5 py-4 text-gray-500">{doc.documentType}</td>
                <td className="px-5 py-4">
                  {doc.status === "verified" && (
                    <Badge tone="success" className="inline-flex items-center gap-1">
                      <CheckCircle2 className="h-3 w-3" />
                      Verified
                    </Badge>
                  )}
                  {doc.status === "review_required" && (
                    <Badge tone="warning" className="inline-flex items-center gap-1">
                      <AlertCircle className="h-3 w-3" />
                      Review Needed
                    </Badge>
                  )}
                  {doc.status === "processed" && (
                    <Badge tone="info">Processed</Badge>
                  )}
                </td>
                <td className="px-5 py-4">
                  <MiniConfidenceBar percent={doc.aiConfidencePercent} />
                </td>
                <td className="px-5 py-4 text-gray-500">{doc.uploadedDate}</td>
                <td className="px-5 py-4 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <button
                      title="Preview Document"
                      className="rounded p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
                    >
                      <Eye className="h-4 w-4" />
                    </button>
                    <button
                      title="Download"
                      className="rounded p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
                    >
                      <Download className="h-4 w-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  );
}

