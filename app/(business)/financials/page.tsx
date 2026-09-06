import StatCard from "@/components/ui/StatCard";
import FinancialsTable from "@/components/business/FinancialsTable";
import T from "@/components/layout/T";
import { getFinancialsSummary } from "@/lib/api/business";

// Matches the "Financials" Figma screen: 4 summary tiles
// and a tabbed table of line items.
export default async function FinancialsPage() {
  const data = await getFinancialsSummary();

  return (
    <div>
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          <T k="pages.financials.title" />
        </h1>
        <p className="mt-1 text-sm text-gray-500">
          <T k="pages.financials.subtitle" />
        </p>
      </div>


      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard label="Revenue" value={data.revenue} />
        <StatCard label="Expenses" value={data.expenses} />
        <StatCard label="Accounting Profit" value={data.accountingProfit} />
      </div>

      <FinancialsTable data={data} />
    </div>
  );
}
