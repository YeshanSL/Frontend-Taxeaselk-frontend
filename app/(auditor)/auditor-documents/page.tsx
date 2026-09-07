import { Suspense } from "react";
import AuditorDocumentsManager from "@/components/auditor/AuditorDocumentsManager";
import { getAuditorDocumentsSummary } from "@/lib/api/auditor";

export const metadata = {
  title: "Client Documents | TaxEaseLK",
};

export default async function AuditorDocumentsPage() {
  const data = await getAuditorDocumentsSummary();

  return (
    <Suspense
      fallback={
        <div className="h-[600px] w-full animate-pulse rounded-xl bg-gray-100/70" />
      }
    >
      <AuditorDocumentsManager initialData={data} />
    </Suspense>
  );
}
