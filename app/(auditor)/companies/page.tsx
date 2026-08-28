import { Search, Plus, Upload, MoreVertical } from "lucide-react";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import ProgressBar from "@/components/ui/ProgressBar";
import CitStatusBadge from "@/components/auditor/CitStatusBadge";
import IssueCountPair from "@/components/auditor/IssueCountPair";
import T from "@/components/layout/T";
import { getCompaniesSummary } from "@/lib/api/auditor";

// Matches the "Companies" Figma screen: search/filters bar, "Add
// Company" action, and a table of every assigned company with status,
// issues, and progress.
export default async function CompaniesPage() {
  const data = await getCompaniesSummary();

  return (
    <div>
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            <T k="pages.companies.title" />
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            <T k="pages.companies.subtitle" />
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="secondary" icon={<Upload className="h-4 w-4" />}>
            Import Companies
          </Button>
          <Button icon={<Plus className="h-4 w-4" />}>Add Company</Button>
        </div>
      </div>

      <Card className="mt-6 p-4">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input
            type="search"
            placeholder="Search company..."
            className="w-full rounded-lg border border-gray-200 py-2.5 pl-9 pr-3 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-1 focus:ring-brand-blue"
          />
        </div>
      </Card>

      <Card className="mt-4 overflow-x-auto">
        <table className="w-full min-w-[900px] text-left text-sm">
          <thead>
            <tr className="border-b border-gray-100 text-xs font-medium uppercase tracking-wide text-gray-400">
              <th className="px-5 py-3">Company</th>
              <th className="px-5 py-3">TIN</th>
              <th className="px-5 py-3">FY</th>
              <th className="px-5 py-3">CIT Status</th>
              <th className="px-5 py-3">Issues</th>
              <th className="px-5 py-3">Progress</th>
              <th className="px-5 py-3">Due Date</th>
              <th className="px-5 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {data.companies.map((c) => (
              <tr
                key={c.id}
                className="border-b border-gray-50 last:border-0 hover:bg-gray-50/60"
              >
                <td className="px-5 py-3.5">
                  <p className="font-medium text-gray-900">{c.name}</p>
                  <p className="text-xs text-gray-400">{c.subStatusLabel}</p>
                </td>
                <td className="px-5 py-3.5 text-gray-600">{c.tin}</td>
                <td className="px-5 py-3.5 text-gray-600">{c.financialYear}</td>
                <td className="px-5 py-3.5">
                  <CitStatusBadge status={c.citStatus} />
                </td>
                <td className="px-5 py-3.5">
                  <IssueCountPair critical={c.criticalCount} warnings={c.warningsCount} />
                </td>
                <td className="px-5 py-3.5">
                  <div className="flex items-center gap-2">
                    <div className="w-20">
                      <ProgressBar value={c.progressPercent} />
                    </div>
                    <span className="text-xs text-gray-500">
                      {c.progressPercent}%
                    </span>
                  </div>
                </td>
                <td className="px-5 py-3.5 text-gray-600">{c.dueDate}</td>
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
