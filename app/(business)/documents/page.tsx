import DocumentsManager from "@/components/business/DocumentsManager";
import { getDocumentsSummary } from "@/lib/api/business";

// Matches the "Documents" Figma screen. The interactive parts (upload,
// live stats, remove) need client-side state, so they live in
// DocumentsManager — this page just fetches the initial data.
export default async function DocumentsPage() {
  const data = await getDocumentsSummary();

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900">Documents</h1>
      <p className="mt-1 text-sm text-gray-500">
        Manage financial documents used for Corporate Income Tax preparation.
      </p>

      <DocumentsManager initial={data} />
    </div>
  );
}
