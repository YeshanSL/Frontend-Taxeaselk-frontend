import ReviewQueueTable from "@/components/auditor/ReviewQueueTable";
import T from "@/components/layout/T";
import { getReviewQueueSummary } from "@/lib/api/auditor";

// Matches the "Review Queue" Figma screen. Data is fetched here on the
// server; the filter tabs + table are a Client Component since the
// active filter is local UI state.
export default async function ReviewQueuePage() {
  const data = await getReviewQueueSummary();

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900">
        <T k="pages.reviewQueue.title" />
      </h1>
      <p className="mt-1 text-sm text-gray-500">
        <T k="pages.reviewQueue.subtitle" />
      </p>

      <ReviewQueueTable rows={data.rows} />
    </div>
  );
}
