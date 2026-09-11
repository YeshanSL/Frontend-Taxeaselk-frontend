import { getFinancialsSummary, generateAiFinancialReport } from "@/lib/api/business";
import FinancialsView from "@/components/business/FinancialsView";

// Executive Financial & Statutory Tax Intelligence Hub
export default async function FinancialsPage() {
  const [data, report] = await Promise.all([
    getFinancialsSummary(),
    generateAiFinancialReport(),
  ]);

  return <FinancialsView data={data} initialReport={report} />;
}
