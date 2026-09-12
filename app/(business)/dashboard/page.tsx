import Link from "next/link";
import { Upload, Sparkles, FileBarChart, AlertTriangle, CheckCircle2 } from "lucide-react";
import Card from "@/components/ui/Card";
import StatCard from "@/components/ui/StatCard";
import Button from "@/components/ui/Button";
import T from "@/components/layout/T";
import DashboardSubtitle from "@/components/business/DashboardSubtitle";
import DashboardPipelineProgress from "@/components/business/DashboardPipelineProgress";
import { getDashboardSummary, getCompanySettings } from "@/lib/api/business";

// Server Component: fetches through the data layer (lib/api/business.ts)
// so this page has no idea whether the data is mocked or coming from
// the real FastAPI backend.
export default async function DashboardPage() {
  const [data, settings] = await Promise.all([
    getDashboardSummary(),
    getCompanySettings(),
  ]);

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900">
        <T k="pages.dashboard.title" />
      </h1>
      <DashboardSubtitle
        initialCompanyName={settings.companyName}
        initialFinancialYear={settings.financialYear}
      />

      {/* Real Multi-Stage Pipeline Progress Card */}
      <DashboardPipelineProgress summary={data} />

      {/* Stat tiles */}
      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard
          label={<T k="business.dashboard.documents" />}
          value={`${data.documentsUploaded} / ${data.documentsTotal}`}
          hint={
            <T
              k="business.dashboard.pendingUpload"
              params={{ count: data.documentsTotal - data.documentsUploaded }}
            />
          }
        />
        <StatCard
          label={<T k="business.dashboard.accountingProfit" />}
          value={data.accountingProfit}
          hint={<T k="business.dashboard.fromFinancialStatements" />}
        />
        <StatCard
          label={<T k="business.dashboard.auditorStatus" />}
          value={data.auditorStatus}
          hint={
            data.auditorStatus === "Approved" ? (
              <T k="business.dashboard.signOffCompleted" />
            ) : data.auditorStatus === "Under Review" ? (
              <T k="business.dashboard.auditorReviewing" />
            ) : (
              <T k="business.dashboard.pendingSubmission" />
            )
          }
        />
      </div>

      {/* Quick actions + attention */}
      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-[320px_1fr]">
        <Card className="p-5">
          <p className="mb-4 font-semibold text-gray-800">
            <T k="business.dashboard.quickActions" />
          </p>
          <div className="flex flex-col gap-2.5">
            <Link href="/documents">
              <Button icon={<Upload className="h-4 w-4" />} className="w-full justify-start">
                <T k="business.dashboard.uploadDocuments" />
              </Button>
            </Link>
            <Button
              variant="secondary"
              icon={<Sparkles className="h-4 w-4 text-brand-blue" />}
              className="justify-start bg-blue-50 text-brand-blue"
              title="AI Guidance is on the roadmap — not built yet"
            >
              <T k="business.dashboard.aiGuidance" />
            </Button>
            <Link href="/financials">
              <Button
                variant="secondary"
                icon={<FileBarChart className="h-4 w-4" />}
                className="w-full justify-start"
              >
                <T k="business.dashboard.viewFinancials" />
              </Button>
            </Link>
          </div>
        </Card>

        <Card className="p-5">
          <p className="mb-4 font-semibold text-gray-800">
            <T k="business.dashboard.requiresAttention" />
          </p>
          <div className="flex flex-col gap-3">
            {(!data.attentionItems || data.attentionItems.length === 0) ? (
              <div className="flex items-center gap-3 rounded-lg border border-emerald-100 bg-emerald-50/60 p-4">
                <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-600" />
                <div>
                  <p className="text-sm font-semibold text-emerald-900">All Caught Up</p>
                  <p className="mt-0.5 text-xs text-emerald-700/80">
                    No urgent action items. Your corporate tax return filing is on schedule.
                  </p>
                </div>
              </div>
            ) : (
              data.attentionItems.map((item) => (
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
                      href={item.link || `/auditor-review?issue=${item.issueId || item.id || ""}`}
                      className="shrink-0 text-xs font-medium text-brand-blue whitespace-nowrap hover:underline"
                    >
                      <T k="business.dashboard.reviewLink" />
                    </Link>
                  </div>
                </div>
              ))
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}
