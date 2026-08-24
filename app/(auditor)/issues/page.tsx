import StatCard from "@/components/ui/StatCard";
import IssuesTable from "@/components/auditor/IssuesTable";
import { getIssuesSummary } from "@/lib/api/auditor";

// Matches the "Issues" Figma screen: 4 count tiles, then filterable
// table of every issue across all assigned companies.
export default async function IssuesPage() {
  const data = await getIssuesSummary();

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900">Issues</h1>
      <p className="mt-1 text-sm text-gray-500">
        Review and resolve issues across all assigned companies.
      </p>

      <div className="mt-6 grid grid-cols-2 gap-4 md:grid-cols-4">
        <StatCard
          label="Critical"
          value={String(data.criticalCount)}
          valueClassName="text-status-critical"
        />
        <StatCard
          label="Warnings"
          value={String(data.warningsCount)}
          valueClassName="text-status-warning"
        />
        <StatCard
          label="Information"
          value={String(data.informationCount)}
          valueClassName="text-status-info"
        />
        <StatCard
          label="Resolved"
          value={String(data.resolvedCount)}
          valueClassName="text-status-success"
        />
      </div>

      <IssuesTable issues={data.issues} />
    </div>
  );
}
