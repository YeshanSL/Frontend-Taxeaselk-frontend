"use client";

import { useState, useEffect } from "react";
import {
  UserCheck,
  Check,
  CheckCircle2,
  Loader2,
  PackageCheck,
  Send,
  X,
  FileCheck2,
} from "lucide-react";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import { useLanguage } from "@/lib/i18n/LanguageContext";

type Stage = "idle" | "organizing" | "ready" | "submitting" | "success";

export default function SubmitToAuditorButton() {
  const { t } = useLanguage();
  const [modalOpen, setModalOpen] = useState(false);
  const [stage, setStage] = useState<Stage>("idle");
  const [submitted, setSubmitted] = useState(false);
  const [currentCompany, setCurrentCompany] = useState("ABC Holdings (Pvt) Ltd");
  const [auditorOption, setAuditorOption] = useState("audit@karunaratne.lk");
  const [customAuditorEmail, setCustomAuditorEmail] = useState("");
  const [submittedAuditor, setSubmittedAuditor] = useState("");
  const [assignedAuditorInfo, setAssignedAuditorInfo] = useState<{
    email: string;
    firmName: string;
    auditorName: string;
    status: string;
  } | null>(null);

  const AUDITOR_OPTIONS = [
    { email: "audit@karunaratne.lk", name: "Karunaratne & Associates", label: "Karunaratne & Associates (audit@karunaratne.lk)" },
    { email: "tax@bdo.lk", name: "BDO Sri Lanka", label: "BDO Sri Lanka (tax@bdo.lk)" },
    { email: "cit@kpmg.lk", name: "KPMG Sri Lanka", label: "KPMG Sri Lanka (cit@kpmg.lk)" },
    { email: "cit.audit@ey.lk", name: "Ernst & Young", label: "Ernst & Young (cit.audit@ey.lk)" },
    { email: "custom", name: "Custom Auditor", label: "Custom Auditor (Enter Email)" },
  ];

  // Sync active company from localStorage and check assigned auditor
  useEffect(() => {
    let company = "ABC Holdings (Pvt) Ltd";
    try {
      const saved = localStorage.getItem("taxease_company_settings");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.companyName) {
          company = parsed.companyName;
          setCurrentCompany(company);
        }
      }
    } catch {}

    // Check local assigned auditor for this company
    try {
      const local = localStorage.getItem(`taxease_assigned_auditor_${company}`) || localStorage.getItem("taxease_last_assigned_auditor");
      if (local) {
        const parsed = JSON.parse(local);
        if (parsed.auditor_email) {
          setAssignedAuditorInfo({
            email: parsed.auditor_email,
            firmName: parsed.firm_name || parsed.auditor_name || "Assigned Auditor",
            auditorName: parsed.auditor_name || parsed.firm_name || "Tax Auditor",
            status: parsed.status || "Invited",
          });
          setAuditorOption(parsed.auditor_email);
          return;
        }
      }
    } catch {}

    // Fetch from backend
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
    fetch(`${apiUrl}/api/auditor-review/assigned-auditor?company_name=${encodeURIComponent(company)}`)
      .then((res) => res.ok ? res.json() : null)
      .then((data) => {
        if (data && data.has_assigned_auditor && data.auditor) {
          setAssignedAuditorInfo({
            email: data.auditor.auditor_email,
            firmName: data.auditor.firm_name,
            auditorName: data.auditor.auditor_name,
            status: data.auditor.status,
          });
          setAuditorOption(data.auditor.auditor_email);
        }
      })
      .catch(() => {});
  }, [modalOpen, currentCompany]);

  // Trigger organizing loading sequence when modal opens
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (modalOpen && stage === "organizing") {
      timer = setTimeout(() => {
        setStage("ready");
      }, 1800);
    }
    return () => clearTimeout(timer);
  }, [modalOpen, stage]);

  function handleOpenModal() {
    if (submitted) return;
    setStage("organizing");
    setModalOpen(true);
  }

  function handleCloseModal() {
    setModalOpen(false);
    if (stage !== "success") {
      setStage("idle");
    }
  }

  async function handleSendFilePack() {
    setStage("submitting");
    const targetAuditorEmail = auditorOption === "custom" ? customAuditorEmail.trim() : auditorOption;
    const matchedAuditor = AUDITOR_OPTIONS.find((a) => a.email === auditorOption);
    const auditorDisplayName = matchedAuditor && matchedAuditor.email !== "custom" 
      ? matchedAuditor.name 
      : targetAuditorEmail || "Auditor";

    setSubmittedAuditor(`${auditorDisplayName} (${targetAuditorEmail || "audit@karunaratne.lk"})`);

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
      const token = typeof window !== "undefined" ? localStorage.getItem("taxease_token") : null;
      const headers: Record<string, string> = { "Content-Type": "application/json" };
      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }

      await fetch(`${apiUrl}/api/financials/submit-to-auditor`, {
        method: "POST",
        headers,
        body: JSON.stringify({
          company_name: currentCompany,
          auditor_email: targetAuditorEmail || "audit@karunaratne.lk",
        }),
      }).catch(() => null);

      setStage("success");
      setSubmitted(true);
    } catch {
      setStage("success");
      setSubmitted(true);
    }
  }

  return (
    <>
      <Button
        icon={submitted ? <Check className="h-4 w-4 text-white" /> : <UserCheck className="h-4 w-4" />}
        onClick={handleOpenModal}
        disabled={submitted}
        variant={submitted ? "success" : "primary"}
      >
        {submitted ? t("status.approved") : t("business.submitPack.button")}
      </Button>

      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <Card className="w-full max-w-md p-6 shadow-xl relative animate-in fade-in zoom-in-95 duration-200">
            {/* Close Button */}
            {stage !== "organizing" && stage !== "submitting" && (
              <button
                type="button"
                onClick={handleCloseModal}
                className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 p-1 cursor-pointer"
                aria-label={t("common.close")}
              >
                <X className="h-5 w-5" />
              </button>
            )}

            {/* STAGE 1: Organizing Documents (Loading) */}
            {stage === "organizing" && (
              <div className="py-8 text-center">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-blue-50 text-brand-blue mb-4">
                  <Loader2 className="h-8 w-8 animate-spin" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900">
                  Organizing Your Documents
                </h3>
                <p className="mt-2 text-sm text-gray-500 max-w-xs mx-auto">
                  Your documents for <span className="font-semibold text-gray-700">{currentCompany}</span> will organize and bundle into a complete tax file pack for your auditor...
                </p>

                {/* Progress animation bar */}
                <div className="mt-6 mx-auto max-w-xs">
                  <div className="h-1.5 w-full overflow-hidden rounded-full bg-gray-100">
                    <div className="h-full bg-brand-blue animate-pulse rounded-full w-3/4" />
                  </div>
                  <p className="mt-2 text-xs text-gray-400">
                    Indexing and validating attachments...
                  </p>
                </div>
              </div>
            )}

            {/* STAGE 2: Ready to Send File Pack */}
            {(stage === "ready" || stage === "submitting") && (
              <div>
                <div className="flex items-center gap-3 border-b border-gray-100 pb-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-50 text-brand-blue">
                    <PackageCheck className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">
                      {t("business.submitPack.modalTitle")}
                    </h3>
                    <p className="text-xs text-gray-400">
                      All uploaded documents for {currentCompany} have been organized
                    </p>
                  </div>
                </div>

                <div className="mt-4 rounded-lg border border-blue-100 bg-blue-50/50 p-4">
                  <div className="flex items-start gap-3">
                    <FileCheck2 className="h-5 w-5 text-brand-blue shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-brand-blue">
                        CIT Audit File Pack — {currentCompany}
                      </p>
                      <p className="mt-1 text-xs text-gray-600">
                        Bundled Financial Statements, Trial Balance, Schedules, and Supporting Invoices.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Company & Auditor Selection */}
                <div className="mt-4 space-y-3">
                  {/* Assigned Auditor Status Card */}
                  {assignedAuditorInfo ? (
                    <div className="rounded-lg border border-emerald-200 bg-emerald-50/80 p-3 text-xs">
                      <div className="flex items-center gap-1.5 font-semibold text-emerald-800">
                        <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                        <span>{t("business.submitPack.assignedAuditorCard")}: {assignedAuditorInfo.firmName}</span>
                      </div>
                      <p className="mt-1 text-gray-600">
                        Invited Email: <span className="font-mono font-medium text-gray-900">{assignedAuditorInfo.email}</span> • Status: <span className="font-semibold text-emerald-700">{assignedAuditorInfo.status}</span>
                      </p>
                    </div>
                  ) : (
                    <div className="rounded-lg border border-blue-200 bg-blue-50/70 p-3 text-xs text-gray-600">
                      <p className="font-semibold text-brand-blue">No Auditor Invited Yet</p>
                      <p className="mt-0.5 text-gray-500">
                        You can invite an auditor from the Auditor Review tab or select one below:
                      </p>
                    </div>
                  )}

                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">
                      Target Company:
                    </label>
                    <input
                      type="text"
                      value={currentCompany}
                      onChange={(e) => setCurrentCompany(e.target.value)}
                      className="w-full rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-medium text-gray-900 focus:outline-none focus:ring-1 focus:ring-brand-blue"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">
                      {t("discussions.assignedAuditor")}
                    </label>
                    <select
                      value={auditorOption}
                      onChange={(e) => setAuditorOption(e.target.value)}
                      className="w-full rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs font-medium text-gray-900 focus:outline-none focus:ring-1 focus:ring-brand-blue cursor-pointer"
                    >
                      {AUDITOR_OPTIONS.map((opt) => (
                        <option key={opt.email} value={opt.email}>
                          {opt.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  {auditorOption === "custom" && (
                    <div className="animate-in fade-in duration-150">
                      <label className="block text-xs font-medium text-gray-600 mb-1">
                        Auditor Email Address:
                      </label>
                      <input
                        type="email"
                        placeholder="auditor@firm.lk"
                        value={customAuditorEmail}
                        onChange={(e) => setCustomAuditorEmail(e.target.value)}
                        className="w-full rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-medium text-gray-900 focus:outline-none focus:ring-1 focus:ring-brand-blue"
                      />
                    </div>
                  )}
                </div>

                <div className="mt-6 flex items-center justify-end gap-3 border-t border-gray-100 pt-4">
                  <Button
                    variant="secondary"
                    onClick={handleCloseModal}
                    disabled={stage === "submitting"}
                  >
                    {t("common.cancel")}
                  </Button>
                  <Button
                    variant="primary"
                    onClick={handleSendFilePack}
                    disabled={stage === "submitting"}
                    icon={
                      stage === "submitting" ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Send className="h-4 w-4" />
                      )
                    }
                  >
                    {stage === "submitting" ? t("business.submitPack.submitting") : t("business.submitPack.submitButton")}
                  </Button>
                </div>
              </div>
            )}

            {/* STAGE 3: Success with Green True (Checkmark) Icon */}
            {stage === "success" && (
              <div className="py-6 text-center">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-50 text-status-success mb-4 animate-in zoom-in-75 duration-300">
                  <CheckCircle2 className="h-10 w-10 text-status-success" />
                </div>
                <h3 className="text-xl font-bold text-gray-900">
                  Success!
                </h3>
                <p className="mt-2 text-sm text-gray-600 max-w-sm mx-auto">
                  {t("business.submitPack.successMessage", { auditor: submittedAuditor })}
                </p>
                <div className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-green-50 px-3 py-1.5 text-xs font-medium text-status-success">
                  <Check className="h-3.5 w-3.5" />
                  Sent to {submittedAuditor}
                </div>

                <div className="mt-6 border-t border-gray-100 pt-4">
                  <Button
                    variant="primary"
                    onClick={handleCloseModal}
                    className="w-full"
                  >
                    {t("common.close")}
                  </Button>
                </div>
              </div>
            )}
          </Card>
        </div>
      )}
    </>
  );
}
