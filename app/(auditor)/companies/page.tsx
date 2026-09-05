import CompaniesManager from "@/components/auditor/CompaniesManager";
import { getCompaniesSummary } from "@/lib/api/auditor";

// Matches the "Companies" Figma screen: search/filters bar, "Add
// Company" action, and a table of every assigned company with status,
// issues, and progress.
export default async function CompaniesPage() {
  const data = await getCompaniesSummary();

  return <CompaniesManager initial={data} />;
}

