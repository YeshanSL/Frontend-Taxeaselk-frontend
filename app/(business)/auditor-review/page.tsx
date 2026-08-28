import { User, AlertTriangle } from "lucide-react";
import Card from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";
import ProgressBar from "@/components/ui/ProgressBar";
import SummaryCountRow from "@/components/business/SummaryCountRow";
import T from "@/components/layout/T";
import { getAuditorReviewSummary } from "@/lib/api/business";

// Matches the "Auditor Review" Figma screen: assigned auditor card +
// review summary counts, then a list of auditor comments/issues.
export default async function AuditorReviewPage() {
  const data = await getAuditorReviewSummary();

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900">
        <T k="pages.auditorReview.title" />
      </h1>
      <p className="mt-1 text-sm text-gray-500">
        <T k="pages.auditorReview.subtitle" />
      </p>

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-[1fr_300px]">
        <Card className="p-6">
          <div className="flex items-start gap-4">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-blue-50">
              <User className="h-6 w-6 text-brand-blue" />
            </div>
            <div className="flex-1">
              <p className="font-semibold text-gray-900">Assigned Auditor</p>
              <p className="text-sm text-gray-500">
                {data.auditorName} ({data.auditorFirm})
              </p>

              <div className="mt-4 flex flex-wrap gap-8">
                <div>
                  <p className="text-xs text-gray-400">Status</p>
                  <Badge tone="warning">{data.reviewStatus}</Badge>
                </div>
                <div>
                  <p className="text-xs text-gray-400">Submitted</p>
                  <p className="text-sm font-medium text-gray-700">
                    {data.submittedDate}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-400">Expected by</p>
                  <p className="text-sm font-medium text-gray-700">
                    {data.expectedByDate}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-5">
            <div className="mb-1.5 flex justify-between text-xs text-gray-400">
              <span>Reviewed by</span>
              <span>{data.reviewedPercent}%</span>
            </div>
            <ProgressBar value={data.reviewedPercent} />
          </div>
        </Card>

        <Card className="p-5">
          <p className="mb-2 font-semibold text-gray-800">Review Summary</p>
          <div className="divide-y divide-gray-50">
            <SummaryCountRow label="Approved" count={data.approvedCount} tone="success" />
            <SummaryCountRow label="Warnings" count={data.warningsCount} tone="warning" />
            <SummaryCountRow label="Critical" count={data.criticalCount} tone="critical" />
            <SummaryCountRow label="Pending" count={data.pendingCount} tone="neutral" />
          </div>
        </Card>
      </div>

      <Card className="mt-6 p-6">
        <p className="mb-4 font-semibold text-gray-800">
          Auditor Comments &amp; Issues
        </p>
        <div className="divide-y divide-gray-50">
          {data.issues.map((issue) => (
            <div key={issue.id} className="flex gap-3 py-5 first:pt-0 last:pb-0">
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
                  <div className="flex items-center gap-2">
                    <Badge tone={issue.status === "action_required" ? "critical" : "warning"}>
                      {issue.status === "action_required"
                        ? "Action Required"
                        : "Pending Clarification"}
                    </Badge>
                    <p className="font-semibold text-gray-900">{issue.title}</p>
                  </div>
                  <button className="text-sm font-medium text-brand-blue">
                    View Issue →
                  </button>
                </div>
                <p className="mt-2 rounded-lg bg-gray-50 p-3 text-sm text-gray-600">
                  &ldquo;{issue.comment}&rdquo;
                </p>
                <p className="mt-2 text-xs text-gray-400">
                  Source: {issue.source}
                </p>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
