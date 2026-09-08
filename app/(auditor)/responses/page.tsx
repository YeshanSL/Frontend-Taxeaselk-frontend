import AuditorResponsesManager from "@/components/auditor/AuditorResponsesManager";
import { getAuditorResponsesSummary } from "@/lib/api/auditor";

export default async function ResponsesPage() {
  const data = await getAuditorResponsesSummary();

  return <AuditorResponsesManager initial={data} />;
}
