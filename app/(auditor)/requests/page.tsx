import RequestsManager from "@/components/auditor/RequestsManager";
import { getAuditorRequestsSummary } from "@/lib/api/auditor";

export default async function RequestsPage() {
  const data = await getAuditorRequestsSummary();

  return <RequestsManager initial={data} />;
}

