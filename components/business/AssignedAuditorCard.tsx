"use client";

import { useState, useEffect } from "react";
import { User, Star, ShieldCheck, Award, MessageSquare, CheckCircle2 } from "lucide-react";
import Card from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import ProgressBar from "@/components/ui/ProgressBar";
import RateAuditorModal from "@/components/business/RateAuditorModal";

interface AssignedAuditorCardProps {
  auditorName: string;
  auditorFirm: string;
  auditorEmail?: string;
  reviewStatus: string;
  submittedDate: string;
  expectedByDate: string;
  reviewedPercent: number;
}

export default function AssignedAuditorCard({
  auditorName,
  auditorFirm,
  auditorEmail = "",
  reviewStatus,
  submittedDate,
  expectedByDate,
  reviewedPercent,
}: AssignedAuditorCardProps) {
  const [rateModalOpen, setRateModalOpen] = useState(false);
  const [clientRating, setClientRating] = useState<number | null>(null);
  const [companyName, setCompanyName] = useState<string>("");
  const [currentStatus, setCurrentStatus] = useState<string>(reviewStatus);
  const [currentReviewedPercent, setCurrentReviewedPercent] = useState<number>(reviewedPercent);

  useEffect(() => {
    function loadExistingRating() {
      try {
        let company = "";
        const savedSettings = localStorage.getItem("taxease_company_settings");
        if (savedSettings) {
          const parsed = JSON.parse(savedSettings);
          if (parsed.companyName) company = parsed.companyName;
        }
        if (!company) {
          const savedUser = localStorage.getItem("taxease_user");
          if (savedUser) {
            const parsedUser = JSON.parse(savedUser);
            company = parsedUser.company_name || parsedUser.display_name || "";
          }
        }
        setCompanyName(company);

        // Check for client review in localStorage
        if (auditorEmail) {
          const savedReview = localStorage.getItem(`taxease_auditor_review_${company}_${auditorEmail}`);
          if (savedReview) {
            const parsedReview = JSON.parse(savedReview);
            if (parsedReview.rating) {
              setClientRating(parsedReview.rating);
            }
          }
        }

        // Check for auditor status override in localStorage
        const savedStatus =
          localStorage.getItem(`taxease_audit_status_${company}`) ||
          localStorage.getItem("taxease_last_audit_status");
        if (savedStatus) {
          setCurrentStatus(savedStatus);
          if (savedStatus === "Approved") {
            setCurrentReviewedPercent(100);
          }
        }
      } catch (err) {
        console.error("Failed to load review state:", err);
      }
    }

    function handleStatusUpdate(e: any) {
      if (e.detail && e.detail.status) {
        setCurrentStatus(e.detail.status);
        if (e.detail.status === "Approved") {
          setCurrentReviewedPercent(100);
        }
      }
    }

    loadExistingRating();
    window.addEventListener("taxease_auditor_rating_updated", loadExistingRating);
    window.addEventListener("taxease_audit_status_updated", handleStatusUpdate);
    return () => {
      window.removeEventListener("taxease_auditor_rating_updated", loadExistingRating);
      window.removeEventListener("taxease_audit_status_updated", handleStatusUpdate);
    };
  }, [auditorEmail]);

  if (!auditorName || auditorName.trim() === "" || auditorName === "Not Assigned") {
    return (
      <Card className="p-6 relative overflow-hidden border-dashed border-gray-300 bg-gray-50/50">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gray-100 text-gray-400">
              <User className="h-6 w-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-gray-900 text-base">No Statutory Auditor Appointed Yet</h3>
                <span className="inline-flex items-center rounded-md bg-gray-100 px-2 py-0.5 text-[11px] font-semibold text-gray-600">
                  Unassigned
                </span>
              </div>
              <p className="text-xs text-gray-500 mt-1 max-w-xl">
                Under Sec. 154 of the Sri Lanka Companies Act, every company must appoint a licensed auditor. Invite your auditor using the &quot;Invite Statutory Auditor&quot; button above to begin document review and sign-off.
              </p>
            </div>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <>
      <Card className="p-6 relative overflow-hidden border-gray-200">
        <div className="flex flex-col sm:flex-row items-start justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white shadow-md shadow-blue-500/20 ring-4 ring-blue-50">
              <User className="h-7 w-7 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <p className="font-bold text-gray-900 text-base">
                  {auditorName}
                </p>
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-700 border border-emerald-200/60">
                  <ShieldCheck className="h-3 w-3 text-emerald-600" />
                  Appointed Statutory Auditor
                </span>
              </div>
              <p className="text-xs text-gray-500 font-medium mt-0.5">
                {auditorFirm} • Chartered Accountants (Sri Lanka)
              </p>

              {/* Single Auditor Law Indicator */}
              <p className="mt-1 text-[11px] text-gray-400 flex items-center gap-1">
                <CheckCircle2 className="h-3 w-3 text-brand-blue" />
                Sole appointed auditor for Tax Year 2025/26 (Sec. 154 Companies Act)
              </p>
            </div>
          </div>

          {/* Rate Auditor Trigger */}
          <div className="shrink-0 flex items-center gap-2 self-stretch sm:self-auto justify-end">
            <Button
              type="button"
              variant={clientRating ? "secondary" : "primary"}
              icon={<Star className={`h-4 w-4 ${clientRating ? "fill-amber-400 text-amber-500" : "text-white"}`} />}
              className="text-xs py-2 px-3.5 shadow-sm"
              onClick={() => setRateModalOpen(true)}
            >
              {clientRating ? `Rated ${clientRating} ★ (Update)` : "Rate Assigned Auditor"}
            </Button>
          </div>
        </div>

        {/* Audit Progress & Timelines */}
        <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-4 border-t border-gray-100 pt-5">
          <div>
            <p className="text-[11px] font-medium text-gray-400 uppercase tracking-wider">
              Engagement Status
            </p>
            <div className="mt-1">
              <Badge
                tone={
                  currentStatus.toLowerCase().includes("approved")
                    ? "success"
                    : currentStatus.toLowerCase().includes("waiting")
                    ? "critical"
                    : "warning"
                }
              >
                {currentStatus}
              </Badge>
            </div>
          </div>
          <div>
            <p className="text-[11px] font-medium text-gray-400 uppercase tracking-wider">
              Submitted to Auditor
            </p>
            <p className="mt-1 text-sm font-semibold text-gray-700">
              {submittedDate}
            </p>
          </div>
          <div>
            <p className="text-[11px] font-medium text-gray-400 uppercase tracking-wider">
              RAMIS Sign-off Target
            </p>
            <p className="mt-1 text-sm font-semibold text-gray-700">
              {expectedByDate}
            </p>
          </div>
          <div>
            <p className="text-[11px] font-medium text-gray-400 uppercase tracking-wider">
              Your Client Rating
            </p>
            <div className="mt-1 flex items-center gap-1">
              {clientRating ? (
                <>
                  <div className="flex items-center text-amber-500 font-bold text-sm">
                    {clientRating}.0 <Star className="h-3.5 w-3.5 fill-amber-400 ml-0.5" />
                  </div>
                  <span className="text-[10px] text-emerald-600 font-medium ml-1">Verified</span>
                </>
              ) : (
                <span className="text-xs text-gray-400 italic">Not rated yet</span>
              )}
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mt-5">
          <div className="mb-1.5 flex justify-between text-xs text-gray-500 font-medium">
            <span>Statutory Audit Completion Progress</span>
            <span className="font-bold text-gray-800">{currentReviewedPercent}%</span>
          </div>
          <ProgressBar value={currentReviewedPercent} />
        </div>
      </Card>

      {/* Modal */}
      <RateAuditorModal
        open={rateModalOpen}
        onClose={() => setRateModalOpen(false)}
        auditorName={auditorName}
        auditorFirm={auditorFirm}
        auditorEmail={auditorEmail}
        companyName={companyName}
        initialRating={clientRating || 5}
        onSuccess={(newRating) => setClientRating(newRating)}
      />
    </>
  );
}
