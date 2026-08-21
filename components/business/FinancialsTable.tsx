"use client";

import { useState } from "react";
import clsx from "clsx";
import Card from "@/components/ui/Card";
import { FinancialsSummary, FinancialsTab } from "@/lib/types";

const TABS: FinancialsTab[] = [
  "Income Statement",
  "Balance Sheet",
  "Trial Balance",
  "General Ledger",
  "Fixed Assets",
];

// Tabs need client-side state to track which one is active, so this is
// split out from the (server) page component. The page fetches the data
// once and passes it down — this component only handles which tab is shown.
export default function FinancialsTable({ data }: { data: FinancialsSummary }) {
  const [activeTab, setActiveTab] = useState<FinancialsTab>("Income Statement");
  const rows = data.tabs[activeTab];

  return (
    <Card className="mt-6 overflow-hidden">
      <div className="flex gap-6 border-b border-gray-100 px-5 pt-2">
        {TABS.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={clsx(
              "border-b-2 px-1 py-3 text-sm font-medium transition-colors",
              activeTab === tab
                ? "border-brand-blue text-brand-blue"
                : "border-transparent text-gray-500 hover:text-gray-700"
            )}
          >
            {tab}
          </button>
        ))}
      </div>

      <table className="w-full text-left text-sm">
        <thead>
          <tr className="border-b border-gray-100 text-xs font-medium uppercase tracking-wide text-gray-400">
            <th className="px-5 py-3">Items</th>
            <th className="px-5 py-3">Amount (Rs.)</th>
            <th className="px-5 py-3">Source</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr
              key={row.item}
              className="border-b border-gray-50 last:border-0 hover:bg-gray-50/60"
            >
              <td className="px-5 py-3.5 font-medium text-gray-800">
                {row.item}
              </td>
              <td
                className={clsx(
                  "px-5 py-3.5",
                  row.amount.startsWith("(") ? "text-status-critical" : "text-gray-700"
                )}
              >
                {row.amount}
              </td>
              <td className="px-5 py-3.5 text-gray-500">{row.source}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </Card>
  );
}
