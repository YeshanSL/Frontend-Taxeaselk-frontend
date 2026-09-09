import Link from "next/link";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import AuditorPriorityReviews from "@/components/auditor/AuditorPriorityReviews";
import AuditorRecentActivityCard from "@/components/auditor/AuditorRecentActivityCard";
import T from "@/components/layout/T";
import { getAuditorDashboardSummary } from "@/lib/api/auditor";

// Matches the auditor's home Dashboard Figma screen: 4 overview tiles,
// a priority reviews list, and a workload + recent activity sidebar.
export default async function AuditorDashboardPage() {
  const data = await getAuditorDashboardSummary();

  return (
    <div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Card className="p-5">
          <p className="font-semibold text-gray-800">
            <T k="auditor.dashboard.activeClients" />
          </p>
          <p className="mt-1 text-sm text-gray-400">Active companies under your review</p>
          <p className="mt-3 text-3xl font-bold text-gray-900">{data.companiesAssigned}</p>
          <Link href="/companies">
            <Button variant="secondary" className="mt-4 w-full">
              <T k="sidebar.companies" />
            </Button>
          </Link>
        </Card>

        <Card className="p-5">
          <p className="font-semibold text-gray-800">
            <T k="auditor.dashboard.pendingReviewCount" />
          </p>
          <p className="mt-1 text-sm text-gray-400">
            CIT computations currently under review
          </p>
          <p className="mt-3 text-3xl font-bold text-brand-blue">
            {data.underReview ?? data.pendingReviews}
          </p>
          <Link href="/review-queue">
            <Button variant="secondary" className="mt-4 w-full">
              <T k="sidebar.reviewQueue" />
            </Button>
          </Link>
        </Card>

        <Card className="p-5">
          <p className="font-semibold text-gray-800">
            <T k="common.completed" />
          </p>
          <p className="mt-1 text-sm text-gray-400">Reviews completed this period</p>
          <p className="mt-3 text-3xl font-bold text-status-success">
            {data.completedThisPeriod}
          </p>
          <Link href="/review-queue">
            <Button variant="secondary" className="mt-4 w-full">
              <T k="common.viewAll" />
            </Button>
          </Link>
        </Card>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-[1fr_320px]">
        <AuditorPriorityReviews initialReviews={data.priorityReviews} />

        <div className="flex flex-col gap-6">
          <Card className="p-5">
            <p className="mb-3 font-semibold text-gray-800">
              <T k="auditor.reviewQueue.queueTitle" />
            </p>
            <div className="space-y-2 text-sm">
              <WorkloadRow label={<T k="common.pending" />} value={data.workload.pending} />
              <WorkloadRow label={<T k="status.underReview" />} value={data.workload.inProgress} />
              <WorkloadRow
                label={<T k="status.waitingForCompany" />}
                value={data.workload.waitingForCompany}
              />
              <WorkloadRow
                label={<T k="status.readyForAuditor" />}
                value={data.workload.readyForApproval}
              />
              <WorkloadRow label={<T k="common.completed" />} value={data.workload.completed} />
            </div>
            <Link href="/review-queue">
              <Button className="mt-4 w-full">
                <T k="sidebar.reviewQueue" />
              </Button>
            </Link>
          </Card>

          <AuditorRecentActivityCard initialActivities={data.recentActivity} />
        </div>
      </div>
    </div>
  );
}

function WorkloadRow({ label, value }: { label: React.ReactNode; value: number }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-gray-600">{label}</span>
      <span className="font-semibold text-gray-800">{value}</span>
    </div>
  );
}
