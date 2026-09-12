"use client";

import { useState } from "react";
import { Star, X, Check, ShieldCheck } from "lucide-react";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import { useLanguage } from "@/lib/i18n/LanguageContext";

interface RateAuditorModalProps {
  open: boolean;
  onClose: () => void;
  auditorName: string;
  auditorFirm: string;
  auditorEmail?: string;
  companyName?: string;
  initialRating?: number;
  onSuccess?: (newRating: number) => void;
}

export default function RateAuditorModal({
  open,
  onClose,
  auditorName,
  auditorFirm,
  auditorEmail = "",
  companyName = "",
  initialRating = 5,
  onSuccess,
}: RateAuditorModalProps) {
  const { t } = useLanguage();
  const [rating, setRating] = useState<number>(initialRating);
  const [hoverRating, setHoverRating] = useState<number>(0);
  const [timeliness, setTimeliness] = useState<number>(5);
  const [communication, setCommunication] = useState<number>(5);
  const [technicalRigor, setTechnicalRigor] = useState<number>(5);
  const [comment, setComment] = useState<string>("");
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [submitted, setSubmitted] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  if (!open) return null;

  const ratingDescriptions: Record<number, string> = {
    1: "Needs Improvement - Significant delays or compliance gaps",
    2: "Fair - Met baseline requirements with notable friction",
    3: "Good - Professional and dependable statutory review",
    4: "Very Good - Highly proactive with clear tax optimizations",
    5: "Exceptional - Outstanding audit rigor, rapid RAMIS clearance & advice",
  };

  const handleStarClick = (val: number) => {
    setRating(val);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
    const payload = {
      auditor_email: auditorEmail,
      auditor_name: auditorName,
      auditor_firm: auditorFirm,
      company_name: companyName,
      tax_year: "2025/26",
      rating: rating,
      timeliness_rating: timeliness,
      communication_rating: communication,
      technical_rating: technicalRigor,
      review_comment: comment,
      client_reviewer_name: "Finance Director",
    };

    try {
      const token = typeof window !== "undefined" ? localStorage.getItem("taxease_token") : null;
      const headers: Record<string, string> = { "Content-Type": "application/json" };
      if (token) headers["Authorization"] = `Bearer ${token}`;

      const res = await fetch(`${apiUrl}/api/auditors/rate`, {
        method: "POST",
        headers,
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.detail || "Failed to submit rating.");
      }

      // Update auditor topbar state in localStorage
      try {
        const savedRating = localStorage.getItem("taxease_auditor_rating");
        let currentReviewsCount = 48;
        if (savedRating) {
          const parsed = JSON.parse(savedRating);
          if (parsed.totalReviews) currentReviewsCount = parsed.totalReviews;
        }

        const newReviewData = {
          rankLabel: "Rank #1",
          overallRating: Number(((4.9 * currentReviewsCount + rating) / (currentReviewsCount + 1)).toFixed(1)),
          totalReviews: currentReviewsCount + 1,
          completedAudits: 143,
          onTimeSignOffRate: 99.4,
          breakdown: {
            accuracy: 99.6,
            responsiveness: 98.9,
            turnaround: 98.5,
          },
          recentReviews: [
            {
              id: `rev_client_${Date.now()}`,
              companyName: companyName,
              rating: Number(rating.toFixed(1)),
              date: "Just now",
              comment: comment || "Verified statutory CIT review and seamless audit coordination.",
              service: "Corporate Income Tax (CIT) 2025/26",
            },
          ],
        };

        localStorage.setItem("taxease_auditor_rating", JSON.stringify(newReviewData));
        localStorage.setItem(`taxease_auditor_review_${companyName}_${auditorEmail}`, JSON.stringify(payload));
        window.dispatchEvent(new CustomEvent("taxease_auditor_rating_updated", { detail: newReviewData }));
      } catch (storageErr) {
        console.warn("Could not save to localStorage", storageErr);
      }

      setSubmitted(true);
      if (onSuccess) onSuccess(rating);
      setTimeout(() => {
        setSubmitted(false);
        onClose();
      }, 1600);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "An unexpected error occurred while submitting your review.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm animate-in fade-in duration-200">
      <Card className="w-full max-w-xl overflow-hidden p-0 shadow-2xl border-gray-200 bg-white">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-100 bg-gradient-to-r from-blue-50/70 via-indigo-50/40 to-white px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-blue/10 text-brand-blue ring-4 ring-blue-50">
              <Star className="h-5 w-5 fill-amber-400 text-amber-500" />
            </div>
            <div>
              <h2 className="text-base font-bold text-gray-900">
                Rate Your Appointed Auditor
              </h2>
              <p className="text-xs text-gray-500">
                {auditorName} • {auditorFirm}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {submitted ? (
          <div className="flex flex-col items-center justify-center py-14 px-6 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-50 text-emerald-600 ring-8 ring-emerald-50/50">
              <Check className="h-8 w-8" />
            </div>
            <h3 className="mt-4 text-xl font-bold text-gray-900">Rating Submitted!</h3>
            <p className="mt-1.5 max-w-sm text-sm text-gray-600">
              Thank you for providing verified feedback for <span className="font-semibold text-gray-800">{auditorName}</span>. Your rating updates the auditor&apos;s verified public score and platform ranking.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {error && (
              <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-xs text-red-700">
                {error}
              </div>
            )}

            {/* Overall Star Rating */}
            <div className="text-center rounded-xl bg-gray-50/80 p-5 border border-gray-100">
              <p className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-2">
                Overall Auditor Satisfaction
              </p>
              <div className="flex items-center justify-center gap-2">
                {[1, 2, 3, 4, 5].map((star) => {
                  const active = (hoverRating || rating) >= star;
                  return (
                    <button
                      key={star}
                      type="button"
                      onMouseEnter={() => setHoverRating(star)}
                      onMouseLeave={() => setHoverRating(0)}
                      onClick={() => handleStarClick(star)}
                      className="p-1 transition-transform hover:scale-110 focus:outline-none"
                    >
                      <Star
                        className={`h-9 w-9 ${
                          active
                            ? "fill-amber-400 text-amber-400"
                            : "fill-gray-200 text-gray-300"
                        } transition-colors`}
                      />
                    </button>
                  );
                })}
              </div>
              <p className="mt-2 text-xs font-medium text-brand-blue">
                {ratingDescriptions[hoverRating || rating]}
              </p>
            </div>

            {/* Category Sub-Ratings */}
            <div className="space-y-3 pt-1">
              <p className="text-xs font-semibold text-gray-700">Audit Performance Dimensions</p>
              
              <div className="grid grid-cols-3 gap-3">
                {/* Timeliness */}
                <div className="rounded-lg border border-gray-100 bg-white p-3 shadow-sm">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-xs text-gray-600 font-medium">Timeliness</span>
                    <span className="text-xs font-bold text-amber-600">{timeliness} ★</span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="5"
                    value={timeliness}
                    onChange={(e) => setTimeliness(Number(e.target.value))}
                    className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-brand-blue"
                  />
                  <span className="text-[10px] text-gray-400 mt-1 block">SLA & RAMIS deadlines</span>
                </div>

                {/* Communication */}
                <div className="rounded-lg border border-gray-100 bg-white p-3 shadow-sm">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-xs text-gray-600 font-medium">Communication</span>
                    <span className="text-xs font-bold text-amber-600">{communication} ★</span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="5"
                    value={communication}
                    onChange={(e) => setCommunication(Number(e.target.value))}
                    className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-brand-blue"
                  />
                  <span className="text-[10px] text-gray-400 mt-1 block">Inquiry clarity & support</span>
                </div>

                {/* Technical Rigor */}
                <div className="rounded-lg border border-gray-100 bg-white p-3 shadow-sm">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-xs text-gray-600 font-medium">Tax Rigor</span>
                    <span className="text-xs font-bold text-amber-600">{technicalRigor} ★</span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="5"
                    value={technicalRigor}
                    onChange={(e) => setTechnicalRigor(Number(e.target.value))}
                    className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-brand-blue"
                  />
                  <span className="text-[10px] text-gray-400 mt-1 block">Statutory accuracy & compliance</span>
                </div>
              </div>
            </div>

            {/* Review Comment */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                Client Review & Feedback (Optional)
              </label>
              <textarea
                rows={3}
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Share specific feedback regarding your statutory CIT audit review, document inquiries, or recommendations..."
                className="w-full rounded-lg border border-gray-300 p-2.5 text-xs text-gray-900 placeholder:text-gray-400 focus:border-brand-blue focus:outline-none focus:ring-1 focus:ring-brand-blue"
              />
            </div>

            {/* Legal Notice */}
            <div className="flex items-start gap-2 rounded-lg bg-blue-50/50 p-2.5 text-[11px] text-blue-800 border border-blue-100/60">
              <ShieldCheck className="h-4 w-4 shrink-0 text-brand-blue mt-0.5" />
              <span>
                Verified Review: Submitted on behalf of <strong className="font-semibold">{companyName}</strong> as an officially appointed client.
              </span>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-3 pt-2">
              <Button type="button" variant="secondary" onClick={onClose} disabled={submitting}>
                Cancel
              </Button>
              <Button type="submit" variant="primary" disabled={submitting}>
                {submitting ? "Submitting..." : `Submit ${rating}★ Review`}
              </Button>
            </div>
          </form>
        )}
      </Card>
    </div>
  );
}
