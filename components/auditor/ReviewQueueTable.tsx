"use client";

import { useState, useMemo } from "react";
import clsx from "clsx";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import ProgressBar from "@/components/ui/ProgressBar";
import IssueCountPair from "@/components/auditor/IssueCountPair";
import { ReviewQueueFilter, ReviewQueueRow } from "@/lib/types";

const FILTERS: ReviewQueueFilter[] = [
  "All",
  "Pending",
  "In Progress",
  "Waiting for Company",
  "Ready for Approval",
  "Completed",
];

// Filtering the queue by status needs client-side state, so this whole
// table (tabs + rows) is a Client Component. The page fetches the raw
// rows on the server and passes them in as a prop.
export default function ReviewQueueTable({ rows }: { rows: ReviewQueueRow[] }) {
  const [filter, setFilter] = useState<ReviewQueueFilter>("All");
  const [tableRows, setTableRows] = useState<ReviewQueueRow[]>(rows);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  async function handleUpdateStatus(companyId: string, newStatus: string) {
    setUpdatingId(companyId);
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
      const token = typeof window !== "undefined" ? localStorage.getItem("taxease_token") : null;
      const headers: Record<string, string> = {};
      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }
      const res = await fetch(`${apiUrl}/api/auditor/review-queue/${companyId}/status?new_status=${encodeURIComponent(newStatus)}`, {
        method: "PATCH",
        headers,
      });
      if (res.ok) {
        setTableRows((prev) =>
          prev.map((r) =>
            r.id === companyId
              ? {
                  ...r,
                  status: newStatus as any,
                  progressPercent: newStatus === "Approved" ? 100 : r.progressPercent,
                }
              : r
          )
        );
      }
    } catch (err) {
      console.error("Failed to update status:", err);
    } finally {
      setUpdatingId(null);
    }
  }

  const filteredRows = useMemo(() => {
    if (filter === "All") return tableRows;
    return tableRows.filter((r) => r.status === filter);
  }, [tableRows, filter]);

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
            <th className="px-5 py-3">Company</th>
            <th className="px-5 py-3">Status</th>
            <th className="px-5 py-3">Issues</th>
            <th className="px-5 py-3">Progress</th>
            <th className="px-5 py-3">Due</th>
            <th className="px-5 py-3 text-right">Action</th>
          </tr>
        </thead>
        <tbody>
          {filteredRows.length === 0 && (
            <tr>
              <td colSpan={6} className="px-5 py-10 text-center text-sm text-gray-400">
                No companies in this status.
              </td>
            </tr>
          )}
          {filteredRows.map((row) => (
            <tr
              key={row.id}
              className="border-b border-gray-50 last:border-0 hover:bg-gray-50/60"
            >
              <td className="px-5 py-3.5">
                <p className="font-medium text-gray-900">{row.companyName}</p>
                <p className="text-xs text-gray-400">{row.tin}</p>
              </td>
              <td className="px-5 py-3.5 text-gray-600">{row.status}</td>
              <td className="px-5 py-3.5">
                <IssueCountPair critical={row.criticalCount} warnings={row.warningsCount} />
              </td>
              <td className="px-5 py-3.5">
                <div className="flex items-center gap-2">
                  <div className="w-20">
                    <ProgressBar value={row.progressPercent} />
                  </div>
                  <span className="text-xs text-gray-500">{row.progressPercent}%</span>
                </div>
              </td>
              <td className="px-5 py-3.5 text-gray-600">{row.dueDate}</td>
              <td className="px-5 py-3.5 text-right">
                <div className="flex items-center justify-end gap-2">
                  <a href="/issues">
                    <Button variant="secondary">Review</Button>
                  </a>
                  {row.status !== "Approved" && (
                    <Button
                      variant="primary"
                      disabled={updatingId === row.id}
                      onClick={() => handleUpdateStatus(row.id, "Approved")}
                    >
                      {updatingId === row.id ? "Approving..." : "Approve"}
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

