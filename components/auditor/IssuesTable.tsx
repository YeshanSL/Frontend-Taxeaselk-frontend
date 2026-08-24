"use client";

import { useState, useMemo } from "react";
import clsx from "clsx";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Badge, { BadgeTone } from "@/components/ui/Badge";
import { IssueRow, IssueSeverity } from "@/lib/types";

const FILTERS = ["All", "Critical", "Warnings", "Information", "Resolved"] as const;
type Filter = (typeof FILTERS)[number];

const SEVERITY_TONE: Record<IssueSeverity, BadgeTone> = {
  Critical: "critical",
  Warning: "warning",
  Information: "info",
  Resolved: "success",
};

// Same filter-tabs-over-a-table pattern as ReviewQueueTable. Kept as a
// separate component (rather than reused) because the filter values
// and columns differ enough that sharing one generic component would
// need more props than it saves lines.
export default function IssuesTable({ issues }: { issues: IssueRow[] }) {
  const [filter, setFilter] = useState<Filter>("All");

  const filteredIssues = useMemo(() => {
    if (filter === "All") return issues;
    if (filter === "Warnings") return issues.filter((i) => i.severity === "Warning");
    return issues.filter((i) => i.severity === filter);
  }, [issues, filter]);

  return (
    <Card className="mt-4 overflow-hidden">
      <div className="flex flex-wrap gap-2 border-b border-gray-100 p-4">
        {FILTERS.map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={clsx(
              "rounded-lg px-3.5 py-2 text-sm font-medium transition-colors",
              filter === f
                ? "bg-brand-blue text-white"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            )}
          >
            {f}
          </button>
        ))}
      </div>

      <table className="w-full min-w-[800px] text-left text-sm">
        <thead>
          <tr className="border-b border-gray-100 text-xs font-medium uppercase tracking-wide text-gray-400">
            <th className="px-5 py-3">Issue</th>
            <th className="px-5 py-3">Company</th>
            <th className="px-5 py-3">Amount</th>
            <th className="px-5 py-3">Severity</th>
            <th className="px-5 py-3">Status</th>
            <th className="px-5 py-3">Source</th>
            <th className="px-5 py-3 text-right">Action</th>
          </tr>
        </thead>
        <tbody>
          {filteredIssues.map((issue) => (
            <tr
              key={issue.id}
              className="border-b border-gray-50 last:border-0 hover:bg-gray-50/60"
            >
              <td className="px-5 py-3.5 font-medium text-gray-900">{issue.title}</td>
              <td className="px-5 py-3.5 text-gray-600">{issue.company}</td>
              <td className="px-5 py-3.5 text-gray-600">{issue.amount}</td>
              <td className="px-5 py-3.5">
                <Badge tone={SEVERITY_TONE[issue.severity]}>{issue.severity}</Badge>
              </td>
              <td className="px-5 py-3.5">
                <Badge tone={issue.status === "Open" ? "neutral" : "success"}>
                  {issue.status}
                </Badge>
              </td>
              <td className="px-5 py-3.5 text-gray-500">{issue.source}</td>
              <td className="px-5 py-3.5 text-right">
                <div className="flex justify-end gap-2">
                  <Button variant="primary" className="px-3 py-1.5 text-xs">
                    Review
                  </Button>
                  {issue.status === "Open" && (
                    <Button variant="secondary" className="px-3 py-1.5 text-xs">
                      Resolve
                    </Button>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </Card>
  );
}
