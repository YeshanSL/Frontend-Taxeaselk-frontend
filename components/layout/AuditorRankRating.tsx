"use client";

import { useState, useEffect, useRef } from "react";
import { Trophy, Star, ShieldCheck, CheckCircle2, ChevronDown } from "lucide-react";
import { useLanguage } from "@/lib/i18n/LanguageContext";

export interface ClientReview {
  id: string;
  companyName: string;
  rating: number;
  date: string;
  comment: string;
  service: string;
}

export interface AuditorRatingState {
  rankLabel: string;
  overallRating: number;
  totalReviews: number;
  completedAudits: number;
  onTimeSignOffRate: number;
  breakdown: {
    accuracy: number;
    responsiveness: number;
    turnaround: number;
  };
  recentReviews: ClientReview[];
}

const DEFAULT_RATING_DATA: AuditorRatingState = {
  rankLabel: "Rank #1",
  overallRating: 4.9,
  totalReviews: 48,
  completedAudits: 142,
  onTimeSignOffRate: 99.2,
  breakdown: {
    accuracy: 99.5,
    responsiveness: 98.6,
    turnaround: 98.2,
  },
  recentReviews: [
    {
      id: "rev_1",
      companyName: "ABC Holdings (Pvt) Ltd",
      rating: 5.0,
      date: "2 days ago",
      comment: "Flawless CIT tax computation & rapid clearance of GL variance queries.",
      service: "Corporate Income Tax (CIT) 2025/26",
    },
    {
      id: "rev_2",
      companyName: "Lanka Trading (Pvt) Ltd",
      rating: 4.8,
      date: "1 week ago",
      comment: "Prompt advisory on asset depreciation schedule and RAMIS compliance.",
      service: "Annual Tax Return Review",
    },
    {
      id: "rev_3",
      companyName: "Ocean Foods (Pvt) Ltd",
      rating: 5.0,
      date: "2 weeks ago",
      comment: "Exceptionally organized audit pack review. Certified within 48 hours.",
      service: "CIT Sign-Off & Submission",
    },
  ],
};

export default function AuditorRankRating() {
  const { t } = useLanguage();
  const [data, setData] = useState<AuditorRatingState>(DEFAULT_RATING_DATA);
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function syncRating() {
      try {
        const saved = localStorage.getItem("taxease_auditor_rating");
        if (saved) {
          const parsed = JSON.parse(saved);
          setData({
            ...DEFAULT_RATING_DATA,
            ...parsed,
          });
          return;
        }
      } catch {
        // Fallback to default state
      }
    }

    syncRating();

    window.addEventListener("storage", syncRating);
    window.addEventListener("taxease_auditor_rating_updated", syncRating);

    return () => {
      window.removeEventListener("storage", syncRating);
      window.removeEventListener("taxease_auditor_rating_updated", syncRating);
    };
  }, []);

  // Close popover when clicking outside
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    if (open) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [open]);

  // Star fill renderer
  const renderStars = (rating: number, max = 5, sizeClass = "h-3.5 w-3.5") => {
    return Array.from({ length: max }).map((_, index) => {
      const starNumber = index + 1;
      const isFilled = rating >= starNumber;
      const isHalf = !isFilled && rating >= starNumber - 0.5;

      return (
        <span key={index} className="relative inline-block">
          <Star
            className={`${sizeClass} ${
              isFilled
                ? "text-amber-400 fill-amber-400"
                : isHalf
                ? "text-amber-400 fill-amber-200"
                : "text-gray-200 fill-gray-100"
            } transition-colors`}
          />
        </span>
      );
    });
  };

  return (
    <div className="relative" ref={containerRef}>
      {/* TopBar Interactive Badge */}
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        aria-expanded={open}
        aria-label="View auditor ranking and client reviews"
        className="flex items-center gap-2 rounded-lg border border-amber-200/90 bg-amber-50/70 hover:bg-amber-100/70 px-3 py-1.5 text-left transition-all duration-150 hover:shadow-sm focus:outline-none focus:ring-2 focus:ring-amber-400/40"
      >
        {/* Rank Badge */}
        <div className="flex items-center gap-1.5">
          <div className="flex h-5 w-5 items-center justify-center rounded-full bg-amber-500 text-white shadow-xs">
            <Trophy className="h-3 w-3 fill-white" />
          </div>
          <div className="flex flex-col">
            <span className="text-[11px] font-bold uppercase tracking-wider text-amber-900 leading-none">
              {data.rankLabel}
            </span>
            <span className="text-[9px] font-medium text-amber-700 leading-none mt-0.5">
              {t("auditor.topBar.tier")}
            </span>
          </div>
        </div>

        {/* Vertical Divider */}
        <div className="h-4 w-px bg-amber-300/80 mx-0.5" />

        {/* Star Rating Display */}
        <div className="flex items-center gap-1.5">
          <div className="flex items-center gap-0.5">{renderStars(data.overallRating, 5, "h-3.5 w-3.5")}</div>
          <span className="text-xs font-bold text-gray-900">{data.overallRating.toFixed(1)}</span>
          <span className="hidden sm:inline text-[11px] font-medium text-amber-800/80">
            ({data.totalReviews})
          </span>
          <ChevronDown className={`h-3 w-3 text-amber-700 transition-transform duration-200 ${open ? "rotate-180" : ""}`} />
        </div>
      </button>

      {/* Client Rating Breakdown Popover */}
      {open && (
        <div className="absolute left-0 sm:right-0 sm:left-auto top-full mt-2 w-80 sm:w-96 rounded-xl border border-gray-200 bg-white p-4 shadow-xl z-50 animate-in fade-in slide-in-from-top-2 duration-150">
          {/* Header */}
          <div className="flex items-start justify-between border-b border-gray-100 pb-3">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-100 text-amber-700">
                <ShieldCheck className="h-4 w-4" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-gray-900 uppercase tracking-wide">
                  {t("auditor.topBar.ratingTitle")}
                </h4>
                <p className="text-[11px] text-gray-500">
                  {data.rankLabel} • Certified Sri Lanka Tax Practitioner
                </p>
              </div>
            </div>
            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold text-emerald-700 border border-emerald-200">
              <CheckCircle2 className="h-3 w-3" />
              Verified Clients
            </span>
          </div>

          {/* Aggregate Rating Hero */}
          <div className="mt-3 flex items-center justify-between rounded-lg bg-amber-50/60 border border-amber-100 p-3">
            <div>
              <div className="flex items-baseline gap-1.5">
                <span className="text-2xl font-black text-gray-900">{data.overallRating.toFixed(1)}</span>
                <span className="text-xs text-gray-500 font-medium">/ 5.0</span>
              </div>
              <div className="flex items-center gap-0.5 mt-0.5">{renderStars(data.overallRating, 5, "h-3.5 w-3.5")}</div>
              <p className="text-[10px] text-gray-500 mt-1">
                Based on {data.totalReviews} verified client ratings
              </p>
            </div>

            <div className="text-right space-y-1 border-l border-amber-200/60 pl-3">
              <div>
                <div className="text-xs font-bold text-gray-900">{data.completedAudits}+</div>
                <div className="text-[10px] text-gray-500">{t("auditor.topBar.completedAudits")}</div>
              </div>
              <div>
                <div className="text-xs font-bold text-emerald-600">{data.onTimeSignOffRate}%</div>
                <div className="text-[10px] text-gray-500">{t("auditor.topBar.onTimeFiling")}</div>
              </div>
            </div>
          </div>

          {/* Performance Pillars */}
          <div className="mt-3 space-y-1.5 text-xs">
            <div className="flex items-center justify-between text-[11px]">
              <span className="text-gray-600">Tax Accuracy & Compliance</span>
              <span className="font-semibold text-gray-900">{data.breakdown.accuracy}%</span>
            </div>
            <div className="h-1.5 w-full rounded-full bg-gray-100 overflow-hidden">
              <div
                className="h-full rounded-full bg-amber-500 transition-all duration-500"
                style={{ width: `${data.breakdown.accuracy}%` }}
              />
            </div>

            <div className="flex items-center justify-between text-[11px] pt-1">
              <span className="text-gray-600">Auditor Responsiveness</span>
              <span className="font-semibold text-gray-900">{data.breakdown.responsiveness}%</span>
            </div>
            <div className="h-1.5 w-full rounded-full bg-gray-100 overflow-hidden">
              <div
                className="h-full rounded-full bg-amber-500 transition-all duration-500"
                style={{ width: `${data.breakdown.responsiveness}%` }}
              />
            </div>
          </div>

          {/* Client Feedback Snippets */}
          <div className="mt-3 border-t border-gray-100 pt-2.5">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-gray-700">
                {t("auditor.topBar.clientReviews")}
              </span>
              <span className="text-[10px] text-gray-400">Latest submissions</span>
            </div>

            <div className="space-y-2 max-h-44 overflow-y-auto pr-1">
              {data.recentReviews.map((rev) => (
                <div key={rev.id} className="rounded-md bg-gray-50/80 p-2 text-left border border-gray-100">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-semibold text-gray-800 truncate max-w-[170px]">
                      {rev.companyName}
                    </span>
                    <div className="flex items-center gap-1">
                      <Star className="h-2.5 w-2.5 fill-amber-400 text-amber-400" />
                      <span className="text-[10px] font-bold text-gray-700">{rev.rating.toFixed(1)}</span>
                    </div>
                  </div>
                  <p className="text-[11px] text-gray-600 line-clamp-2 mt-0.5">
                    &ldquo;{rev.comment}&rdquo;
                  </p>
                  <div className="flex items-center justify-between mt-1 text-[9px] text-gray-400">
                    <span className="truncate max-w-[180px]">{rev.service}</span>
                    <span>{rev.date}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

