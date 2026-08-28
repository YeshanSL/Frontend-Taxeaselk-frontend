import DocumentsManager from "@/components/business/DocumentsManager";
import T from "@/components/layout/T";
import { getDocumentsSummary } from "@/lib/api/business";

// Matches the "Documents" Figma screen. The interactive parts (upload,
// live stats, remove) need client-side state, so they live in
// DocumentsManager — this page just fetches the initial data.
export default async function DocumentsPage() {
  const data = await getDocumentsSummary();

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900">
        <T k="pages.documents.title" />
      </h1>
      <p className="mt-1 text-sm text-gray-500">
        <T k="pages.documents.subtitle" />
      </p>

      <DocumentsManager initial={data} />
    </div>
  );
}
