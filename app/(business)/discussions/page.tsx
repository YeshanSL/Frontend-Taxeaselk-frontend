import { Suspense } from "react";
import T from "@/components/layout/T";
import BusinessDiscussionsManager from "@/components/business/BusinessDiscussionsManager";
import { getBusinessDiscussions } from "@/lib/api/business";

export const metadata = {
  title: "Audit Discussions | TaxEaseLK",
};

export default async function BusinessDiscussionsPage() {
  const data = await getBusinessDiscussions();

  return (
    <div>
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            <T k="pages.businessDiscussions.title" />
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            <T k="pages.businessDiscussions.subtitle" />
          </p>
        </div>
      </div>

      <Suspense
        fallback={
          <div className="mt-6 h-[640px] w-full animate-pulse rounded-xl bg-gray-100/70" />
        }
      >
        <BusinessDiscussionsManager initialData={data} />
      </Suspense>
    </div>
  );
}

