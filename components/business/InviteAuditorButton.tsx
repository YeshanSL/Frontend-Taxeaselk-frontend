"use client";

import { useState, useEffect } from "react";
import {
  UserPlus,
  X,
  Check,
  Star,
  ShieldCheck,
  Building2,
  Search,
  Mail,
  Award,
} from "lucide-react";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";
import { Field, Input } from "@/components/ui/Input";
import { useLanguage } from "@/lib/i18n/LanguageContext";

interface SuggestedAuditor {
  id: string;
  name: string;
  credentials: string;
  firm: string;
  rating: number;
  reviewCount: number;
  specialization: string;
  completedAudits: string;
  email: string;
  initials: string;
}

const SUGGESTED_AUDITORS: SuggestedAuditor[] = [
  {
    id: "aud-1",
    name: "Nisal Fernando",
    credentials: "FCA, FCMA",
    firm: "Fernando & Associates Chartered Accountants",
    rating: 4.9,
    reviewCount: 68,
    specialization: "Corporate Income Tax (CIT) & Transfer Pricing",
    completedAudits: "140+ Audits",
    email: "nisal.fernando@chartered.lk",
    initials: "NF",
  },
  {
    id: "aud-2",
    name: "Chamari Jayasuriya",
    credentials: "ACA, B.Sc. Accounting",
    firm: "Apex Tax & Advisory Partners",
    rating: 4.9,
    reviewCount: 45,
    specialization: "Manufacturing & SME CIT Tax Compliance",
    completedAudits: "95+ Audits",
    email: "chamari@apextax.lk",
    initials: "CJ",
  },
  {
    id: "aud-3",
    name: "K. B. Karunaratne",
    credentials: "FCA, Senior Partner",
    firm: "Karunaratne & Co. Tax Consultants",
    rating: 4.8,
    reviewCount: 82,
    specialization: "Inland Revenue RAMIS Compliance & Appeals",
    completedAudits: "210+ Audits",
    email: "kb.karunaratne@taxconsult.lk",
    initials: "KK",
  },
  {
    id: "aud-4",
    name: "Dilini Ratnayake",
    credentials: "ACCA, Certified Tax Advisor",
    firm: "Ratnayake Assurance & Tax Services",
    rating: 4.8,
    reviewCount: 39,
    specialization: "Services & Tech Sector CIT Filings",
    completedAudits: "70+ Audits",
    email: "dilini@ratnayaketax.lk",
    initials: "DR",
  },
];

export default function InviteAuditorButton() {
  const { t } = useLanguage();
  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState<"suggested" | "manual">("suggested");
  const [searchQuery, setSearchQuery] = useState("");
  const [email, setEmail] = useState("");
  const [firmName, setFirmName] = useState("");
  const [loading, setLoading] = useState(false);
  const [invitedAuditor, setInvitedAuditor] = useState<string | null>(null);
  const [currentCompany, setCurrentCompany] = useState<string>("");
  const [assignedAuditor, setAssignedAuditor] = useState<{ firm: string; email: string; name?: string } | null>(null);
  const [confirmSwitchTarget, setConfirmSwitchTarget] = useState<{ email: string; firm: string; name?: string } | null>(null);
  const [disengaging, setDisengaging] = useState(false);

  useEffect(() => {
    async function syncCompanyAndAuditor() {
      try {
        let company = "";
        const savedSettings = localStorage.getItem("taxease_company_settings");
        if (savedSettings) {
          const parsed = JSON.parse(savedSettings);
          if (parsed.companyName) company = parsed.companyName;
        }
        if (!company) {
          const userStr = localStorage.getItem("taxease_user");
          if (userStr) {
            const u = JSON.parse(userStr);
            if (u.company_name || u.companyName) company = u.company_name || u.companyName;
          }
        }
        setCurrentCompany(company);

        if (!company) {
          setAssignedAuditor(null);
          return;
        }

        // Fetch from backend engagement endpoint
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
        try {
          const res = await fetch(`${apiUrl}/api/auditor-engagement/${encodeURIComponent(company)}`);
          if (res.ok) {
            const data = await res.json();
            if (data.has_active_auditor && data.engagement) {
              setAssignedAuditor({
                firm: data.engagement.auditor_firm,
                email: data.engagement.auditor_email,
                name: data.engagement.auditor_name,
              });
              return;
            }
          }
        } catch {
          // fallback to localStorage
        }

        const savedAuditor = localStorage.getItem(`taxease_assigned_auditor_${company}`) || localStorage.getItem("taxease_last_assigned_auditor");
        if (savedAuditor) {
          const parsedAuditor = JSON.parse(savedAuditor);
          if (parsedAuditor.auditor_email) {
            setAssignedAuditor({
              firm: parsedAuditor.firm_name || parsedAuditor.auditor_name || "Assigned Auditor",
              email: parsedAuditor.auditor_email,
              name: parsedAuditor.auditor_name,
            });
          }
        }
      } catch {}
    }

    syncCompanyAndAuditor();
    window.addEventListener("taxease_company_updated", syncCompanyAndAuditor);
    window.addEventListener("taxease_auditor_assigned", syncCompanyAndAuditor);
    return () => {
      window.removeEventListener("taxease_company_updated", syncCompanyAndAuditor);
      window.removeEventListener("taxease_auditor_assigned", syncCompanyAndAuditor);
    };
  }, []);

  async function handleDisengage() {
    setDisengaging(true);
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
      await fetch(`${apiUrl}/api/auditor-engagement/disengage`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          company_name: currentCompany,
          tax_year: "2025/26",
          reason: "Concluded by client",
        }),
      }).catch(() => {});

      localStorage.removeItem(`taxease_assigned_auditor_${currentCompany}`);
      localStorage.removeItem("taxease_last_assigned_auditor");
      setAssignedAuditor(null);
      window.dispatchEvent(new CustomEvent("taxease_auditor_assigned", { detail: null }));
    } catch (err) {
      console.error("Disengage failed:", err);
    } finally {
      setDisengaging(false);
    }
  }

  async function sendInvitation(targetEmail: string, targetFirm: string, auditorName?: string) {
    // If different auditor is already active, request confirmation before replacing
    if (assignedAuditor && assignedAuditor.email !== targetEmail && !confirmSwitchTarget) {
      setConfirmSwitchTarget({ email: targetEmail, firm: targetFirm, name: auditorName });
      return;
    }

    setLoading(true);
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
      const token = typeof window !== "undefined" ? localStorage.getItem("taxease_token") : null;
      const headers: Record<string, string> = { "Content-Type": "application/json" };
      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }

      // If switching, disengage previous auditor first
      if (assignedAuditor && assignedAuditor.email !== targetEmail) {
        await fetch(`${apiUrl}/api/auditor-engagement/disengage`, {
          method: "POST",
          headers,
          body: JSON.stringify({
            company_name: currentCompany,
            tax_year: "2025/26",
            reason: `Transferred appointment to ${auditorName || targetFirm}`,
          }),
        }).catch(() => {});
      }

      // Appoint new auditor
      await fetch(`${apiUrl}/api/auditor-engagement`, {
        method: "POST",
        headers,
        body: JSON.stringify({
          company_name: currentCompany,
          tax_year: "2025/26",
          auditor_email: targetEmail,
          auditor_name: auditorName || targetFirm,
          auditor_firm: targetFirm,
        }),
      }).catch(() => {});

      await fetch(`${apiUrl}/api/auditor-review/invite`, {
        method: "POST",
        headers,
        body: JSON.stringify({
          email: targetEmail,
          firmName: targetFirm,
          auditorName,
          company_name: currentCompany,
        }),
      }).catch(() => {});

      const assignedRecord = {
        company_name: currentCompany,
        auditor_email: targetEmail,
        firm_name: targetFirm,
        auditor_name: auditorName || targetFirm,
        status: "Active",
      };
      localStorage.setItem(`taxease_assigned_auditor_${currentCompany}`, JSON.stringify(assignedRecord));
      localStorage.setItem("taxease_last_assigned_auditor", JSON.stringify(assignedRecord));
      window.dispatchEvent(new CustomEvent("taxease_auditor_assigned", { detail: assignedRecord }));

      setAssignedAuditor({ firm: targetFirm, email: targetEmail, name: auditorName });
      setInvitedAuditor(auditorName || targetFirm || targetEmail);
      setConfirmSwitchTarget(null);

      setTimeout(() => {
        setOpen(false);
        setInvitedAuditor(null);
        setEmail("");
        setFirmName("");
        setTab("suggested");
        setSearchQuery("");
      }, 2000);
    } catch (err) {
      console.error("Failed to appoint auditor:", err);
    } finally {
      setLoading(false);
    }
  }

  function handleManualInvite(e: React.FormEvent) {
    e.preventDefault();
    if (!email || !firmName) return;
    sendInvitation(email, firmName);
  }

  const filteredAuditors = SUGGESTED_AUDITORS.filter((aud) => {
    const q = searchQuery.toLowerCase();
    return (
      aud.name.toLowerCase().includes(q) ||
      aud.firm.toLowerCase().includes(q) ||
      aud.specialization.toLowerCase().includes(q)
    );
  });

  return (
    <>
      <Button
        variant={assignedAuditor ? "secondary" : "primary"}
        icon={<UserPlus className="h-4 w-4" />}
        className="shrink-0"
        onClick={() => setOpen(true)}
      >
        {assignedAuditor
          ? t("business.inviteAuditor.assignedButton", { name: assignedAuditor.firm })
          : t("business.inviteAuditor.button")}
      </Button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
          <Card className="flex max-h-[90vh] w-full max-w-2xl flex-col overflow-hidden p-0 shadow-2xl">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
              <div className="flex items-center gap-2.5">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-50 text-brand-blue">
                  <UserPlus className="h-5 w-5" />
                </div>
                <div>
                  <p className="font-bold text-gray-900">{t("business.inviteAuditor.modalTitle")}</p>
                  <p className="text-xs text-gray-500">
                    {t("business.inviteAuditor.modalSubtitle")}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Success State */}
            {invitedAuditor ? (
              <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-50 text-status-success">
                  <Check className="h-8 w-8" />
                </div>
                <p className="mt-4 text-xl font-bold text-gray-900">
                  Appointment Confirmed!
                </p>
                <p className="mt-1.5 max-w-md text-sm text-gray-500">
                  <span className="font-semibold text-gray-800">{invitedAuditor}</span> is now appointed as your statutory auditor for Corporate Income Tax review.
                </p>
              </div>
            ) : (
              <>
                {/* Active Auditor Statutory Notice */}
                {assignedAuditor && (
                  <div className="mx-6 mt-4 flex items-center justify-between rounded-xl bg-blue-50/80 border border-blue-200/70 p-3.5">
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-brand-blue text-white shadow-sm">
                        <ShieldCheck className="h-5 w-5" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="text-xs font-bold text-gray-900">
                            Active Statutory Auditor Appointed
                          </p>
                          <span className="rounded-full bg-blue-100 px-2 py-0.2 text-[10px] font-bold text-brand-blue">
                            1 Auditor Limit
                          </span>
                        </div>
                        <p className="text-[11px] text-gray-600">
                          <strong className="font-semibold text-gray-800">{assignedAuditor.firm}</strong> ({assignedAuditor.email})
                        </p>
                        <p className="text-[10px] text-gray-400 mt-0.5">
                          Inland Revenue Act & Companies Act: Strictly 1 appointed auditor allowed per company per tax year.
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={handleDisengage}
                      disabled={disengaging}
                      className="shrink-0 text-xs font-semibold text-rose-600 hover:text-rose-700 bg-white hover:bg-rose-50 border border-rose-200 rounded-lg px-2.5 py-1.5 transition ml-2"
                    >
                      {disengaging ? "Concluding..." : "Disengage"}
                    </button>
                  </div>
                )}

                {/* Transfer Appointment Confirmation Modal Overlay */}
                {confirmSwitchTarget && (
                  <div className="mx-6 mt-4 rounded-xl border border-amber-300 bg-amber-50 p-4">
                    <p className="text-xs font-bold text-amber-900">
                      Confirm Statutory Auditor Reassignment?
                    </p>
                    <p className="mt-1 text-xs text-amber-800">
                      Sri Lankan Corporate Law allows only <strong>1 appointed auditor or audit firm</strong> per tax year. Appointing <strong>{confirmSwitchTarget.name || confirmSwitchTarget.firm}</strong> will conclude your active appointment with <strong>{assignedAuditor?.firm}</strong>.
                    </p>
                    <div className="mt-3 flex items-center justify-end gap-2">
                      <Button
                        type="button"
                        variant="secondary"
                        className="text-xs py-1.5 px-3"
                        onClick={() => setConfirmSwitchTarget(null)}
                      >
                        Cancel
                      </Button>
                      <Button
                        type="button"
                        variant="primary"
                        className="text-xs py-1.5 px-3 bg-amber-600 hover:bg-amber-700 border-none text-white"
                        disabled={loading}
                        onClick={() =>
                          sendInvitation(
                            confirmSwitchTarget.email,
                            confirmSwitchTarget.firm,
                            confirmSwitchTarget.name
                          )
                        }
                      >
                        {loading ? "Reassigning..." : "Confirm & Transfer Appointment"}
                      </Button>
                    </div>
                  </div>
                )}

                {/* Navigation Tabs */}
                <div className="flex border-b border-gray-100 bg-gray-50/70 px-6 pt-3">
                  <button
                    type="button"
                    onClick={() => setTab("suggested")}
                    className={`flex items-center gap-2 border-b-2 px-4 py-2.5 text-xs font-semibold transition ${
                      tab === "suggested"
                        ? "border-brand-blue text-brand-blue"
                        : "border-transparent text-gray-500 hover:text-gray-700"
                    }`}
                  >
                    <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-500" />
                    {t("business.inviteAuditor.selectAccredited")}
                    <span className="rounded-full bg-blue-100 px-2 py-0.5 text-[10px] font-bold text-brand-blue">
                      {SUGGESTED_AUDITORS.length}
                    </span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setTab("manual")}
                    className={`flex items-center gap-2 border-b-2 px-4 py-2.5 text-xs font-semibold transition ${
                      tab === "manual"
                        ? "border-brand-blue text-brand-blue"
                        : "border-transparent text-gray-500 hover:text-gray-700"
                    }`}
                  >
                    <Mail className="h-3.5 w-3.5" />
                    {t("business.inviteAuditor.customEmailOption")}
                  </button>
                </div>

                {/* Tab Content */}
                <div className="flex-1 overflow-y-auto p-6">
                  {tab === "suggested" ? (
                    <div className="space-y-4">
                      {/* Search & Filter */}
                      <div className="relative">
                        <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                        <input
                          type="text"
                          placeholder="Search by auditor name, firm, or tax specialization..."
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          className="w-full rounded-lg border border-gray-200 py-2 pl-9 pr-4 text-xs placeholder:text-gray-400 focus:border-brand-blue focus:outline-none focus:ring-1 focus:ring-brand-blue"
                        />
                      </div>

                      {/* Suggested Auditors List */}
                      <div className="space-y-3">
                        {filteredAuditors.map((auditor) => {
                          const isCurrent = assignedAuditor?.email === auditor.email;
                          return (
                            <div
                              key={auditor.id}
                              className={`flex flex-col justify-between gap-3 rounded-xl border p-4 transition-all sm:flex-row sm:items-center ${
                                isCurrent
                                  ? "border-blue-300 bg-blue-50/30"
                                  : "border-gray-200 hover:border-brand-blue hover:bg-blue-50/20"
                              }`}
                            >
                              <div className="flex items-start gap-3">
                                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-brand-navy text-xs font-bold text-white shadow-sm">
                                  {auditor.initials}
                                </div>
                                <div>
                                  <div className="flex flex-wrap items-center gap-2">
                                    <p className="font-semibold text-gray-900 text-sm">
                                      {auditor.name}
                                    </p>
                                    <span className="text-xs font-medium text-gray-500">
                                      ({auditor.credentials})
                                    </span>
                                    {isCurrent && (
                                      <span className="rounded bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-800">
                                        Currently Appointed
                                      </span>
                                    )}
                                    <div className="flex items-center gap-1 rounded bg-amber-50 px-1.5 py-0.5 text-xs font-bold text-amber-700">
                                      <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                                      {auditor.rating}
                                      <span className="font-normal text-amber-600/70">
                                        ({auditor.reviewCount})
                                      </span>
                                    </div>
                                  </div>

                                  <div className="mt-1 flex items-center gap-1.5 text-xs text-gray-600">
                                    <Building2 className="h-3.5 w-3.5 text-gray-400" />
                                    <span>{auditor.firm}</span>
                                  </div>

                                  <div className="mt-2 flex flex-wrap items-center gap-2">
                                    <span className="rounded bg-gray-100 px-2 py-0.5 text-[11px] font-medium text-gray-700">
                                      {auditor.specialization}
                                    </span>
                                    <span className="flex items-center gap-1 text-[11px] text-gray-400">
                                      <Award className="h-3 w-3 text-status-success" />
                                      {auditor.completedAudits}
                                    </span>
                                  </div>
                                </div>
                              </div>

                              <Button
                                variant="secondary"
                                className="shrink-0 text-xs font-semibold hover:bg-brand-blue hover:text-white"
                                disabled={loading || isCurrent}
                                onClick={() =>
                                  sendInvitation(auditor.email, auditor.firm, auditor.name)
                                }
                              >
                                <ShieldCheck className="mr-1.5 h-3.5 w-3.5 text-status-success" />
                                {isCurrent
                                  ? "Appointed"
                                  : assignedAuditor
                                  ? "Reassign Auditor"
                                  : t("business.inviteAuditor.button")}
                              </Button>
                            </div>
                          );
                        })}

                        {filteredAuditors.length === 0 && (
                          <div className="py-8 text-center text-xs text-gray-500">
                            No auditors match your search query. Try another keyword or invite manually.
                          </div>
                        )}
                      </div>
                    </div>
                  ) : (
                    /* Manual Invitation Form */
                    <form onSubmit={handleManualInvite} className="space-y-4">
                      <p className="text-xs text-gray-500">
                        Enter your auditor's Practitioner ID (e.g. <strong className="font-mono text-brand-blue">AUD-XXXXXXXX</strong>) or their registered email to grant them exclusive access to your statutory workspace.
                      </p>

                      <Field label="Auditor Email or User ID">
                        <Input
                          type="text"
                          placeholder="auditor@firm.lk or AUD-XXXXXXXX"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          required
                        />
                      </Field>

                      <Field label={t("business.inviteAuditor.auditorFirm")}>
                        <Input
                          type="text"
                          placeholder="e.g. KPMG / Ernst & Young / Private Firm"
                          value={firmName}
                          onChange={(e) => setFirmName(e.target.value)}
                        />
                      </Field>

                      <div className="mt-6 flex justify-end gap-2 pt-2">
                        <Button
                          type="button"
                          variant="secondary"
                          onClick={() => setOpen(false)}
                        >
                          {t("common.cancel")}
                        </Button>
                        <Button type="submit" disabled={loading}>
                          {loading ? t("business.inviteAuditor.sending") : t("business.inviteAuditor.sendButton")}
                        </Button>
                      </div>
                    </form>
                  )}
                </div>
              </>
            )}
          </Card>
        </div>
      )}
    </>
  );
}
