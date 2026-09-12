import { getFinancialsSummary, generateAiFinancialReport, getCompanySettings } from "@/lib/api/business";
import FinancialsView from "@/components/business/FinancialsView";

// Executive Financial & Statutory Tax Intelligence Hub
export default async function FinancialsPage() {
  const settings = await getCompanySettings();
  const [data, report] = await Promise.all([
    getFinancialsSummary(settings?.companyName),
    generateAiFinancialReport(),
  ]);

  return <FinancialsView data={data} initialReport={report} />;
}
