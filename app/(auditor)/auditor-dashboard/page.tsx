import Link from "next/link";
import { CheckCircle2 } from "lucide-react";
import Card from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import ProgressBar from "@/components/ui/ProgressBar";
import { getAuditorDashboardSummary } from "@/lib/api/auditor";

const TAG_TONE = {
  critical: "critical",
  attention: "warning",
  ready: "success",
} as const;

// Matches the auditor's home Dashboard Figma screen: 4 overview tiles,
// a priority reviews list, and a workload + recent activity sidebar.
export default async function AuditorDashboardPage() {
  const data = await getAuditorDashboardSummary();

  return (
    <div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="p-5">
          <p className="font-semibold text-gray-800">Companies Assigned</p>
          <p className="mt-1 text-sm text-gray-400">Active companies under your review</p>
          <p className="mt-3 text-3xl font-bold text-gray-900">{data.companiesAssigned}</p>
          <Link href="/companies">
            <Button variant="secondary" className="mt-4 w-full">
              View Companies
            </Button>
          </Link>
        </Card>

        <Card className="p-5">
          <p className="font-semibold text-gray-800">Pending Reviews</p>
          <p className="mt-1 text-sm text-gray-400">
            CIT computations waiting for review
          </p>
          <p className="mt-3 text-3xl font-bold text-gray-900">{data.pendingReviews}</p>
          <Link href="/review-queue">
            <Button variant="secondary" className="mt-4 w-full">
              Open Review Queue
            </Button>
          </Link>
        </Card>

        <Card className="p-5">
          <p className="font-semibold text-gray-800">Critical Issues</p>
          <p className="mt-1 text-sm text-gray-400">Issues requiring immediate attention</p>
          <p className="mt-3 text-3xl font-bold text-status-critical">
            {data.criticalIssues}
          </p>
          <Link href="/issues">
            <Button variant="secondary" className="mt-4 w-full">
              View Critical Issues
            </Button>
          </Link>
        </Card>

        <Card className="p-5">
          <p className="font-semibold text-gray-800">Completed</p>
          <p className="mt-1 text-sm text-gray-400">Reviews completed this period</p>
          <p className="mt-3 text-3xl font-bold text-status-success">
            {data.completedThisPeriod}
          </p>
          <Button variant="secondary" className="mt-4 w-full">
            View Completed
          </Button>
        </Card>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-[1fr_320px]">
        <Card className="p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-semibold text-gray-800">Priority Reviews</p>
              <p className="text-sm text-gray-400">
                Companies requiring your attention.
              </p>
            </div>
            <Link
              href="/review-queue"
              className="text-sm font-medium text-brand-blue"
            >
              View All Reviews →
            </Link>
          </div>

          <div className="mt-4 divide-y divide-gray-50">
            {data.priorityReviews.map((review) => (
              <div
                key={review.companyName}
                className="flex flex-col gap-3 py-5 first:pt-2 last:pb-0 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="flex-1">
                  <Badge tone={TAG_TONE[review.tag]}>{review.tagLabel}</Badge>
                  <p className="mt-1.5 font-semibold text-gray-900">
                    {review.companyName}
                  </p>
                  <p className="text-sm text-gray-500">{review.detail}</p>
                  <div className="mt-2 flex items-center gap-3">
                    <span className="text-xs text-gray-400">
                      Due: {review.dueDate}
                    </span>
                    <div className="w-32">
                      <ProgressBar value={review.progressPercent} />
                    </div>
                    <span className="text-xs text-gray-500">
                      {review.progressPercent}%
                    </span>
                  </div>
                </div>
                <div className="flex shrink-0 gap-2">
                  <Link href={review.tag === "ready" ? "/review-queue" : "/issues"}>
                    <Button variant={review.tag === "ready" ? "success" : "primary"}>
                      {review.tag === "ready" ? "Approve" : "Review"}
                    </Button>
                  </Link>
                  <Link href="/companies">
                    <Button variant="secondary">View Company</Button>
                  </Link>
                </div>

              </div>
            ))}
          </div>
        </Card>

        <div className="flex flex-col gap-6">
          <Card className="p-5">
            <p className="mb-3 font-semibold text-gray-800">My Review Workload</p>
            <div className="space-y-2 text-sm">
              <WorkloadRow label="Pending" value={data.workload.pending} />
              <WorkloadRow label="In Progress" value={data.workload.inProgress} />
              <WorkloadRow
                label="Waiting for Company"
                value={data.workload.waitingForCompany}
              />
              <WorkloadRow
                label="Ready for Approval"
                value={data.workload.readyForApproval}
              />
              <WorkloadRow label="Completed" value={data.workload.completed} />
            </div>
            <Link href="/review-queue">
              <Button className="mt-4 w-full">Open Review Queue</Button>
            </Link>
          </Card>

          <Card className="p-5">
            <p className="mb-3 font-semibold text-gray-800">Recent Activity</p>
            {data.recentActivity.map((activity) => (
              <div key={activity.title} className="flex items-start gap-2.5">
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-status-success" />
                <div>
                  <p className="text-sm font-medium text-gray-800">
                    {activity.title}
                  </p>
                  <p className="text-xs text-brand-blue">{activity.company}</p>
                  <p className="text-xs text-gray-400">{activity.timeAgo}</p>
                </div>
              </div>
            ))}
          </Card>
        </div>
      </div>
    </div>
  );
}

function WorkloadRow({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-gray-600">{label}</span>
      <span className="font-semibold text-gray-800">{value}</span>
    </div>
  );
}
