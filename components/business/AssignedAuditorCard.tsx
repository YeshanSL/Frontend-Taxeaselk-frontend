"use client";

import { useState, useEffect, useCallback } from "react";
import { User, Star, ShieldCheck, Award, MessageSquare, CheckCircle2, Clock, XCircle, Loader2, AlertTriangle, X } from "lucide-react";
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

  const [currentAuditorName, setCurrentAuditorName] = useState<string>(auditorName);
  const [currentAuditorFirm, setCurrentAuditorFirm] = useState<string>(auditorFirm);
  const [currentAuditorEmail, setCurrentAuditorEmail] = useState<string>(auditorEmail);
  const [currentStatus, setCurrentStatus] = useState<string>(reviewStatus);
  const [currentReviewedPercent, setCurrentReviewedPercent] = useState<number>(reviewedPercent);
  const [currentSubmittedDate, setCurrentSubmittedDate] = useState<string>(submittedDate);
  const [currentExpectedDate, setCurrentExpectedDate] = useState<string>(expectedByDate);

  // Cancellation State
  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);
  const [cancelError, setCancelError] = useState("");

  const loadAuditorData = useCallback(async () => {
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

      // 1. Fetch live from backend
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
      const token = typeof window !== "undefined" ? localStorage.getItem("taxease_token") : null;
      const headers: Record<string, string> = {};
      if (token) headers["Authorization"] = `Bearer ${token}`;

      const q = company ? `?company_name=${encodeURIComponent(company)}` : "";
      const res = await fetch(`${apiUrl}/api/auditor-review${q}`, { headers, cache: "no-store" });
      if (res.ok) {
        const data = await res.json();
        if (data && data.assigned_auditor) {
          const a = data.assigned_auditor;
          setCurrentAuditorName(a.auditor_name || a.firm_name || "");
          setCurrentAuditorFirm(a.firm_name || a.designation || "");
          setCurrentAuditorEmail(a.auditor_email || "");
          setCurrentStatus(a.status || "Active");
          setCurrentReviewedPercent(a.progress_percent ?? 45);
          setCurrentSubmittedDate(a.submitted_date || "Recently");
          setCurrentExpectedDate(a.expected_date || "15 Nov 2026");
          return;
        }
      }

      // 2. Check local assigned auditor fallback if backend returned none
      const localAssigned = company ? localStorage.getItem(`taxease_assigned_auditor_${company}`) : null;
      if (localAssigned) {
        const p = JSON.parse(localAssigned);
        setCurrentAuditorName(p.auditor_name || p.firm_name || "");
        setCurrentAuditorFirm(p.firm_name || "");
        setCurrentAuditorEmail(p.auditor_email || "");
        setCurrentStatus(p.status || "Pending Acceptance");
      }
    } catch (err) {
      console.error("Failed to load assigned auditor state:", err);
    }
  }, []);

  useEffect(() => {
    loadAuditorData();

    function handleAuditorEvent(e: any) {
      if (e.detail) {
        if (e.detail.auditor_name || e.detail.firm_name) {
          setCurrentAuditorName(e.detail.auditor_name || e.detail.firm_name);
        }
        if (e.detail.firm_name) {
          setCurrentAuditorFirm(e.detail.firm_name);
        }
        if (e.detail.status) {
          setCurrentStatus(e.detail.status);
        }
      }
      loadAuditorData();
    }

    window.addEventListener("taxease_auditor_assigned", handleAuditorEvent);
    window.addEventListener("taxease_auditor_updated", handleAuditorEvent);
    window.addEventListener("taxease_audit_status_updated", handleAuditorEvent);
    window.addEventListener("taxease_notifications_updated", loadAuditorData);
    window.addEventListener("storage", loadAuditorData);

    return () => {
      window.removeEventListener("taxease_auditor_assigned", handleAuditorEvent);
      window.removeEventListener("taxease_auditor_updated", handleAuditorEvent);
      window.removeEventListener("taxease_audit_status_updated", handleAuditorEvent);
      window.removeEventListener("taxease_notifications_updated", loadAuditorData);
      window.removeEventListener("storage", loadAuditorData);
    };
  }, [loadAuditorData]);

  const isUnassigned =
    !currentAuditorName ||
    currentAuditorName.trim() === "" ||
    currentAuditorName === "Not Assigned" ||
    currentStatus.toLowerCase() === "no auditor assigned";

  if (isUnassigned) {
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

  async function handleCancelInvitation() {
    setIsCancelling(true);
    setCancelError("");
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
      const token = typeof window !== "undefined" ? localStorage.getItem("taxease_token") : null;
      const headers: Record<string, string> = { "Content-Type": "application/json" };
      if (token) headers["Authorization"] = `Bearer ${token}`;

      const res = await fetch(`${apiUrl}/api/business/auditor/invite/cancel`, {
        method: "POST",
        headers,
        body: JSON.stringify({ company_name: companyName }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.detail || "Failed to cancel invitation.");
      }

      // Clear local storage and state
      if (companyName) {
        localStorage.removeItem(`taxease_assigned_auditor_${companyName}`);
      }
      localStorage.removeItem("taxease_last_assigned_auditor");
      setCurrentAuditorName("");
      setCurrentAuditorFirm("");
      setCurrentAuditorEmail("");
      setCurrentStatus("No Auditor Assigned");
      setCancelModalOpen(false);

      window.dispatchEvent(new CustomEvent("taxease_auditor_updated", {
        detail: { status: "No Auditor Assigned", auditor_name: "", firm_name: "" }
      }));
      window.dispatchEvent(new Event("taxease_notifications_updated"));
    } catch (err: any) {
      setCancelError(err.message || "Failed to cancel invitation.");
    } finally {
      setIsCancelling(false);
    }
  }

  const isPending = currentStatus.toLowerCase().includes("pending");

  return (
    <>
      <Card className="p-6 relative overflow-hidden border-gray-200">
        <div className="flex flex-col sm:flex-row items-start justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl ${
              isPending
                ? "bg-gradient-to-br from-amber-500 to-orange-600 shadow-amber-500/20 ring-amber-50"
                : "bg-gradient-to-br from-blue-500 to-indigo-600 shadow-blue-500/20 ring-blue-50"
            } text-white shadow-md ring-4`}>
              <User className="h-7 w-7 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <p className="font-bold text-gray-900 text-base">
                  {currentAuditorName}
                </p>
                {isPending ? (
                  <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-0.5 text-[11px] font-semibold text-amber-700 border border-amber-200/60">
                    <Clock className="h-3 w-3 text-amber-600" />
                    Invitation Sent — Awaiting Auditor Acceptance
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-700 border border-emerald-200/60">
                    <ShieldCheck className="h-3 w-3 text-emerald-600" />
                    Appointed Statutory Auditor
                  </span>
                )}
              </div>
              <p className="text-xs text-gray-500 font-medium mt-0.5">
                {currentAuditorFirm} • Chartered Accountants (Sri Lanka)
              </p>

              {/* Status explanation */}
              <p className="mt-1 text-[11px] text-gray-400 flex items-center gap-1">
                <CheckCircle2 className="h-3 w-3 text-brand-blue" />
                {isPending
                  ? "Engagement invitation dispatched. Awaiting auditor sign-off to commence review."
                  : "Sole appointed auditor for Tax Year 2025/26 (Sec. 154 Companies Act)"}
              </p>
            </div>
          </div>

          {/* Action Trigger Buttons */}
          <div className="shrink-0 flex items-center gap-2 self-stretch sm:self-auto justify-end">
            {isPending ? (
              <Button
                type="button"
                variant="secondary"
                icon={<XCircle className="h-4 w-4 text-red-500" />}
                className="text-xs py-2 px-3.5 text-red-600 hover:bg-red-50 hover:border-red-200 border-gray-200 shadow-2xs transition-colors"
                onClick={() => setCancelModalOpen(true)}
              >
                Cancel Request
              </Button>
            ) : (
              <Button
                type="button"
                variant={clientRating ? "secondary" : "primary"}
                icon={<Star className={`h-4 w-4 ${clientRating ? "fill-amber-400 text-amber-500" : "text-white"}`} />}
                className="text-xs py-2 px-3.5 shadow-sm"
                onClick={() => setRateModalOpen(true)}
              >
                {clientRating ? `Rated ${clientRating} ★ (Update)` : "Rate Assigned Auditor"}
              </Button>
            )}
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
                    : isPending
                    ? "warning"
                    : currentStatus.toLowerCase().includes("waiting")
                    ? "critical"
                    : "success"
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
              {currentSubmittedDate}
            </p>
          </div>
          <div>
            <p className="text-[11px] font-medium text-gray-400 uppercase tracking-wider">
              RAMIS Sign-off Target
            </p>
            <p className="mt-1 text-sm font-semibold text-gray-700">
              {currentExpectedDate}
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

      {/* Cancel Request Confirmation Modal */}
      {cancelModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <Card className="w-full max-w-md p-6 shadow-xl relative animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-start gap-3.5">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-red-50 text-red-600">
                <AlertTriangle className="h-6 w-6 text-red-600" />
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-gray-900 text-base">
                  Cancel Auditor Invitation?
                </h3>
                <p className="mt-1.5 text-xs text-gray-500 leading-relaxed">
                  Are you sure you want to withdraw the statutory audit appointment invitation sent to{" "}
                  <strong className="text-gray-800">{currentAuditorName}</strong> ({currentAuditorFirm})?
                </p>
                <p className="mt-1 text-xs text-gray-400">
                  The invitation will be cancelled immediately, freeing the appointment lock so you can invite another auditor right away.
                </p>
              </div>
            </div>

            {cancelError && (
              <div className="mt-3.5 rounded-lg bg-red-50 border border-red-200 p-2.5 text-xs text-red-700">
                {cancelError}
              </div>
            )}

            <div className="mt-6 flex items-center justify-end gap-2.5 border-t border-gray-100 pt-4">
              <Button
                type="button"
                variant="secondary"
                disabled={isCancelling}
                onClick={() => setCancelModalOpen(false)}
                className="text-xs"
              >
                Keep Invitation
              </Button>
              <Button
                type="button"
                variant="primary"
                disabled={isCancelling}
                onClick={handleCancelInvitation}
                className="text-xs bg-red-600 hover:bg-red-700 text-white shadow-xs"
                icon={isCancelling ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <XCircle className="h-3.5 w-3.5" />}
              >
                {isCancelling ? "Cancelling..." : "Confirm & Cancel Request"}
              </Button>
            </div>
          </Card>
        </div>
      )}

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
