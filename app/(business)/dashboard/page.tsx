import Link from "next/link";
import { CheckCircle2, AlertTriangle, Circle, Upload, Sparkles, FileBarChart } from "lucide-react";
import Card from "@/components/ui/Card";
import ProgressBar from "@/components/ui/ProgressBar";
import StatCard from "@/components/ui/StatCard";
import Button from "@/components/ui/Button";
import T from "@/components/layout/T";
import { getDashboardSummary } from "@/lib/api/business";

// Server Component: fetches through the data layer (lib/api/business.ts)
// so this page has no idea whether the data is mocked or coming from
// the real FastAPI backend.
export default async function DashboardPage() {
  const data = await getDashboardSummary();

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900">
        <T k="pages.dashboard.title" />
      </h1>
      <p className="mt-1 text-sm text-gray-500">
        <T k="pages.dashboard.subtitle" />
      </p>

      {/* Progress card */}
      <Card className="mt-6 p-6">
        <div className="flex items-start justify-between">
          <div>
            <p className="font-semibold text-gray-800">Progress</p>
            <p className="text-xs text-gray-400">
              Updated {data.progressUpdatedAt}
            </p>
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold text-brand-blue">
              {data.progressPercent}%
            </p>
            <p className="text-xs text-gray-400">Complete</p>
          </div>
        </div>

        <div className="mt-4">
          <ProgressBar value={data.progressPercent} />
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          {data.steps.map((step) => (
            <span
              key={step.label}
              className="inline-flex items-center gap-1.5 rounded-md border border-gray-100 bg-gray-50 px-3 py-1.5 text-xs font-medium text-gray-600"
            >
              {step.state === "done" && (
                <CheckCircle2 className="h-3.5 w-3.5 text-status-success" />
              )}
              {step.state === "warning" && (
                <AlertTriangle className="h-3.5 w-3.5 text-status-warning" />
              )}
              {step.state === "pending" && (
                <Circle className="h-3.5 w-3.5 text-gray-300" />
              )}
              {step.label}
            </span>
          ))}
        </div>
      </Card>

      {/* Stat tiles */}
      <div className="mt-6 grid grid-cols-2 gap-4 md:grid-cols-5">
        <StatCard
          label="Documents"
          value={`${data.documentsUploaded} / ${data.documentsTotal}`}
          hint={`${data.documentsTotal - data.documentsUploaded} pending upload`}
        />
        <StatCard
          label="Accounting Profit"
          value={data.accountingProfit}
          hint="From Financial Statements"
        />
        <StatCard
          label="Taxable Income"
          value={data.taxableIncome}
          hint="After adjustments"
        />
        <StatCard
          label="Est. CIT Liability"
          value={data.estCitLiability}
          hint="Rate per tax rule v2026-1"
        />
        <StatCard
          label="Auditor Status"
          value={data.auditorStatus}
          hint="Pending submission"
        />
      </div>

      {/* Quick actions + attention */}
      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-[320px_1fr]">
        <Card className="p-5">
          <p className="mb-4 font-semibold text-gray-800">Quick Actions</p>
          <div className="flex flex-col gap-2.5">
            <Link href="/documents">
              <Button icon={<Upload className="h-4 w-4" />} className="w-full justify-start">
                Upload Documents
              </Button>
            </Link>
            <Button
              variant="secondary"
              icon={<Sparkles className="h-4 w-4 text-brand-blue" />}
              className="justify-start bg-blue-50 text-brand-blue"
              title="AI Guidance is on the roadmap — not built yet"
            >
              AI Guidance
            </Button>
            <Link href="/financials">
              <Button
                variant="secondary"
                icon={<FileBarChart className="h-4 w-4" />}
                className="w-full justify-start"
              >
                View Reports
              </Button>
            </Link>
          </div>
        </Card>

        <Card className="p-5">
          <p className="mb-4 font-semibold text-gray-800">
            Requires Your Attention
          </p>
          <div className="flex flex-col gap-3">
            {data.attentionItems.map((item) => (
              <div
                key={item.title}
                className={
                  item.severity === "critical"
                    ? "rounded-lg border border-red-100 bg-red-50 p-3"
                    : "rounded-lg border border-amber-100 bg-amber-50 p-3"
                }
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-2">
                    <AlertTriangle
                      className={
                        item.severity === "critical"
                          ? "mt-0.5 h-4 w-4 shrink-0 text-status-critical"
                          : "mt-0.5 h-4 w-4 shrink-0 text-status-warning"
                      }
                    />
                    <div>
                      <p
                        className={
                          item.severity === "critical"
                            ? "text-sm font-semibold text-status-critical"
                            : "text-sm font-semibold text-status-warning"
                        }
                      >
                        {item.title}
                      </p>
                      <p className="mt-0.5 text-xs text-gray-500">
                        {item.description}
                      </p>
                    </div>
                  </div>
                  <Link
                    href="/financials"
                    className="shrink-0 text-xs font-medium text-brand-blue whitespace-nowrap hover:underline"
                  >
                    Review →
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
