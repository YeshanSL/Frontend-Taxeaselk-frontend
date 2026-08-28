import { UserCheck } from "lucide-react";
import StatCard from "@/components/ui/StatCard";
import Button from "@/components/ui/Button";
import FinancialsTable from "@/components/business/FinancialsTable";
import T from "@/components/layout/T";
import { getFinancialsSummary } from "@/lib/api/business";

// Matches the "Financials" Figma screen: 4 summary tiles, a
// "Submit to Auditor" action, and a tabbed table of line items.
export default async function FinancialsPage() {
  const data = await getFinancialsSummary();

  return (
    <div>
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            <T k="pages.financials.title" />
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            <T k="pages.financials.subtitle" />
          </p>
        </div>
        <Button icon={<UserCheck className="h-4 w-4" />}>
          Submit to Auditor
        </Button>
      </div>

      <div className="mt-6 grid grid-cols-2 gap-4 md:grid-cols-4">
        <StatCard label="Revenue" value={data.revenue} />
        <StatCard label="Expenses" value={data.expenses} />
        <StatCard label="Accounting Profit" value={data.accountingProfit} />
        <StatCard label="Tax Adjustments" value={data.taxAdjustments} />
      </div>

      <FinancialsTable data={data} />
    </div>
  );
}
