import { Search, Plus, Clock, CheckCircle2, AlertTriangle, Send } from "lucide-react";
import Card from "@/components/ui/Card";
import StatCard from "@/components/ui/StatCard";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import T from "@/components/layout/T";
import { getAuditorRequestsSummary } from "@/lib/api/auditor";

export default async function RequestsPage() {
  const data = await getAuditorRequestsSummary();

  return (
    <div>
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            <T k="pages.requests.title" />
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            <T k="pages.requests.subtitle" />
          </p>
        </div>
        <div className="flex gap-2">
          <Button icon={<Plus className="h-4 w-4" />}>Create New Request</Button>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-4">
        <StatCard
          label="Total Requests"
          value={String(data.totalRequests)}
          hint="All client requests"
        />
        <StatCard
          label="Awaiting Response"
          value={String(data.pendingCount)}
          valueClassName={data.pendingCount > 0 ? "text-amber-600" : ""}
          hint="Action required by company"
        />
        <StatCard
          label="Responses Received"
          value={String(data.respondedCount)}
          valueClassName="text-blue-600"
          hint="Ready for auditor review"
        />
        <StatCard
          label="Resolved"
          value={String(data.resolvedCount)}
          valueClassName="text-green-600"
          hint="Closed inquiries"
        />
      </div>

      <Card className="mt-6 p-4">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input
            type="search"
            placeholder="Search requests by title, reference, or company..."
            className="w-full rounded-lg border border-gray-200 py-2.5 pl-9 pr-3 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-1 focus:ring-brand-blue"
          />
        </div>
      </Card>

      <Card className="mt-4 overflow-x-auto">
        <table className="w-full min-w-[900px] text-left text-sm">
          <thead>
            <tr className="border-b border-gray-100 text-xs font-medium uppercase tracking-wide text-gray-400">
              <th className="px-5 py-3">Reference</th>
              <th className="px-5 py-3">Company</th>
              <th className="px-5 py-3">Request Details</th>
              <th className="px-5 py-3">Priority</th>
              <th className="px-5 py-3">Status</th>
              <th className="px-5 py-3">Due Date</th>
              <th className="px-5 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {data.requests.map((req) => (
              <tr key={req.id} className="hover:bg-gray-50/50">
                <td className="px-5 py-4 font-mono text-xs font-semibold text-gray-500">
                  {req.requestId}
                </td>
                <td className="px-5 py-4 font-medium text-gray-800">
                  {req.companyName}
                </td>
                <td className="px-5 py-4 max-w-sm">
                  <p className="font-semibold text-gray-900">{req.title}</p>
                  <p className="mt-0.5 text-xs text-gray-500 line-clamp-1">
                    {req.description}
                  </p>
                  <span className="mt-1 inline-block rounded bg-gray-100 px-2 py-0.5 text-[11px] font-medium text-gray-600">
                    {req.category}
                  </span>
                </td>
                <td className="px-5 py-4">
                  {req.priority === "high" && (
                    <Badge tone="critical" className="inline-flex items-center gap-1">
                      <AlertTriangle className="h-3 w-3" />
                      High
                    </Badge>
                  )}
                  {req.priority === "medium" && (
                    <Badge tone="warning">Medium</Badge>
                  )}
                  {req.priority === "low" && (
                    <Badge tone="neutral">Low</Badge>
                  )}
                </td>
                <td className="px-5 py-4">
                  {req.status === "pending" && (
                    <Badge tone="warning" className="inline-flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      Pending
                    </Badge>
                  )}
                  {req.status === "responded" && (
                    <Badge tone="info" className="inline-flex items-center gap-1">
                      <Send className="h-3 w-3" />
                      Responded
                    </Badge>
                  )}
                  {req.status === "resolved" && (
                    <Badge tone="success" className="inline-flex items-center gap-1">
                      <CheckCircle2 className="h-3 w-3" />
                      Resolved
                    </Badge>
                  )}
                </td>
                <td className="px-5 py-4 text-gray-500">{req.dueDate}</td>
                <td className="px-5 py-4 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <Button variant="secondary" className="px-2.5 py-1 text-xs">
                      View
                    </Button>
                    {req.status === "pending" && (
                      <Button variant="secondary" className="px-2.5 py-1 text-xs text-brand-blue">
                        Remind
                      </Button>
                    )}
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

