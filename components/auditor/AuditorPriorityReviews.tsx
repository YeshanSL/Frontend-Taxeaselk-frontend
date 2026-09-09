"use client";

import { useState } from "react";
import Link from "next/link";
import { Check } from "lucide-react";
import Card from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import ProgressBar from "@/components/ui/ProgressBar";
import { recordAuditorActivity } from "@/lib/utils/auditorActivity";
import { useLanguage } from "@/lib/i18n/LanguageContext";

const TAG_TONE = {
  critical: "critical",
  attention: "warning",
  ready: "success",
} as const;

interface PriorityReviewItem {
  companyName: string;
  tag: "critical" | "attention" | "ready";
  tagLabel: string;
  detail: string;
  progressPercent: number;
  dueDate: string;
}

interface Props {
  initialReviews: PriorityReviewItem[];
}

export default function AuditorPriorityReviews({ initialReviews }: Props) {
  const { t } = useLanguage();
  const [reviews, setReviews] = useState(initialReviews);
  const [approvedCompanies, setApprovedCompanies] = useState<string[]>([]);

  function handleApprove(companyName: string) {
    if (approvedCompanies.includes(companyName)) return;

    setApprovedCompanies((prev) => [...prev, companyName]);
    setReviews((prev) =>
      prev.map((r) =>
        r.companyName === companyName
          ? {
              ...r,
              tagLabel: "APPROVED",
              detail: "CIT computation approved and signed off",
              progressPercent: 100,
            }
          : r
      )
    );

    // Automatically record real-time activity
    recordAuditorActivity({
      title: "CIT Computation Approved",
      company: companyName,
      type: "approval",
    });
  }

  return (
    <Card className="p-5">
      <div className="flex items-center justify-between">
        <div>
          <p className="font-semibold text-gray-800">
            {t("auditor.dashboard.priorityReviews")}
          </p>
          <p className="text-sm text-gray-400">
            Companies requiring your attention.
          </p>
        </div>
        <Link
          href="/responses"
          className="text-sm font-medium text-brand-blue hover:underline"
        >
          {t("pages.responses.title")} →
        </Link>
      </div>

      <div className="mt-4 divide-y divide-gray-50">
        {reviews.map((review) => {
          const isApproved = approvedCompanies.includes(review.companyName);

          return (
            <div
              key={review.companyName}
              className="flex flex-col gap-3 py-5 first:pt-2 last:pb-0 sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="flex-1">
                <Badge tone={isApproved ? "success" : TAG_TONE[review.tag]}>
                  {review.tagLabel}
                </Badge>
                <p className="mt-1.5 font-semibold text-gray-900">
                  {review.companyName}
                </p>
                <p className="text-sm text-gray-500">{review.detail}</p>
                <div className="mt-2 flex items-center gap-3">
                  <span className="text-xs text-gray-400">
                    Due: {review.dueDate}
                  </span>
                  <div className="w-32">
                    <ProgressBar value={review.progressPercent} />
                  </div>
                  <span className="text-xs text-gray-500">
                    {review.progressPercent}%
                  </span>
                </div>
              </div>
              <div className="flex shrink-0 gap-2">
                {review.tag === "ready" ? (
                  isApproved ? (
                    <Button variant="secondary" disabled className="gap-1 bg-green-50 text-green-700">
                      <Check className="h-4 w-4" /> Approved
                    </Button>
                  ) : (
                    <Button
                      variant="success"
                      onClick={() => handleApprove(review.companyName)}
                    >
                      Approve
                    </Button>
                  )
                ) : (
                  <Link href="/auditor-documents">
                    <Button variant="primary">Review</Button>
                  </Link>
                )}
                <Link href="/companies">
                  <Button variant="secondary">View Company</Button>
                </Link>
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
}

