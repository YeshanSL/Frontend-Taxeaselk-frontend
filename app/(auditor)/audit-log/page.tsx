import { ChevronDown } from "lucide-react";
import Card from "@/components/ui/Card";
import AuditActionBadge from "@/components/auditor/AuditActionBadge";
import T from "@/components/layout/T";
import { getAuditLogSummary } from "@/lib/api/auditor";

// Matches the "Audit Log" Figma screen: filter bar (visual only for
// now — see TODO) and an immutable, timestamped table of every action.
function FilterPill({ label }: { label: string }) {
  return (
    <button className="flex items-center gap-1.5 rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-600 hover:bg-gray-50">
      {label}
      <ChevronDown className="h-3.5 w-3.5 text-gray-400" />
    </button>
  );
}

export default async function AuditLogPage() {
  const data = await getAuditLogSummary();

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900">
        <T k="pages.auditLog.title" />
      </h1>
      <p className="mt-1 text-sm text-gray-500">
        <T k="pages.auditLog.subtitle" />
      </p>

      <Card className="mt-6 overflow-hidden">
        {/* TODO (Week 2): wire these to actually filter the table below
            once the log comes from the FastAPI backend (query params). */}
        <div className="flex flex-wrap gap-2 border-b border-gray-100 p-4">
          <FilterPill label="Company" />
          <FilterPill label="User" />
          <FilterPill label="Action" />
          <FilterPill label="Date" />
          <FilterPill label="Financial Year" />
        </div>

        <table className="w-full min-w-[900px] text-left text-sm">
          <thead>
            <tr className="border-b border-gray-100 text-xs font-medium uppercase tracking-wide text-gray-400">
              <th className="px-5 py-3">Timestamp</th>
              <th className="px-5 py-3">Company</th>
              <th className="px-5 py-3">User</th>
              <th className="px-5 py-3">Action</th>
              <th className="px-5 py-3">Details</th>
            </tr>
          </thead>
          <tbody>
            {data.entries.map((entry) => (
              <tr
                key={entry.id}
                className="border-b border-gray-50 last:border-0 hover:bg-gray-50/60"
              >
                <td className="px-5 py-3.5 text-gray-500">{entry.timestamp}</td>
                <td className="px-5 py-3.5 font-medium text-gray-900">
                  {entry.company}
                </td>
                <td className="px-5 py-3.5 text-gray-600">{entry.user}</td>
                <td className="px-5 py-3.5">
                  <AuditActionBadge action={entry.action} tone={entry.actionTone} />
                </td>
                <td className="px-5 py-3.5 text-gray-500">{entry.details}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  );
}
