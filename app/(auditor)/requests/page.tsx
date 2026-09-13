import RequestsManager from "@/components/auditor/RequestsManager";
import { getAuditorRequestsSummary, getCompaniesSummary } from "@/lib/api/auditor";

export default async function RequestsPage() {
  const [data, companiesData] = await Promise.all([
    getAuditorRequestsSummary(),
    getCompaniesSummary(),
  ]);

  return <RequestsManager initial={data} companies={companiesData.companies} />;
}
