import { Suspense } from "react";
import Card from "@/components/ui/Card";
import SummaryCountRow from "@/components/business/SummaryCountRow";
import InviteAuditorButton from "@/components/business/InviteAuditorButton";
import AuditorIssuesManager from "@/components/business/AuditorIssuesManager";
import AssignedAuditorCard from "@/components/business/AssignedAuditorCard";
import T from "@/components/layout/T";
import { getAuditorReviewSummary } from "@/lib/api/business";

// Matches the "Auditor Review" Figma screen: assigned auditor card +
// review summary counts, then a list of auditor comments/issues.
export default async function AuditorReviewPage() {
  const data = await getAuditorReviewSummary();

  return (
    <div>
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            <T k="pages.auditorReview.title" />
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            <T k="pages.auditorReview.subtitle" />
          </p>
        </div>
        <InviteAuditorButton />
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-[1fr_300px]">
        <AssignedAuditorCard
          auditorName={data.auditorName}
          auditorFirm={data.auditorFirm}
          auditorEmail="audit@karunaratne.lk"
          reviewStatus={data.reviewStatus}
          submittedDate={data.submittedDate}
          expectedByDate={data.expectedByDate}
          reviewedPercent={data.reviewedPercent}
        />

        <Card className="p-5">
          <p className="mb-2 font-semibold text-gray-800">
            <T k="business.auditorReview.citStatus" />
          </p>
          <div className="divide-y divide-gray-50">
            <SummaryCountRow label="Approved" count={data.approvedCount} tone="success" />
            <SummaryCountRow label="Warnings" count={data.warningsCount} tone="warning" />
            <SummaryCountRow label="Critical" count={data.criticalCount} tone="critical" />
            <SummaryCountRow label="Pending" count={data.pendingCount} tone="neutral" />
          </div>
        </Card>
      </div>

      <Suspense fallback={<div className="mt-6 h-48 animate-pulse rounded-lg bg-gray-50" />}>
        <AuditorIssuesManager initialIssues={data.issues} />
      </Suspense>
    </div>
  );
}
