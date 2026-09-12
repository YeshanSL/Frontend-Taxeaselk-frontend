import DocumentsManager from "@/components/business/DocumentsManager";
import SubmitToAuditorButton from "@/components/business/SubmitToAuditorButton";
import T from "@/components/layout/T";
import { getDocumentsSummary, getCompanySettings } from "@/lib/api/business";

export default async function DocumentsPage() {
  const [initialDocs, settings] = await Promise.all([
    getDocumentsSummary(),
    getCompanySettings(),
  ]);

  const data = (initialDocs.documents.length === 0 && settings.companyName)
    ? await getDocumentsSummary(settings.companyName)
    : initialDocs;

  return (
    <div>
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            <T k="pages.documents.title" />
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            <T k="pages.documents.subtitle" />
          </p>
        </div>
        <SubmitToAuditorButton />
      </div>

      <DocumentsManager initial={data} />
    </div>
  );
}
