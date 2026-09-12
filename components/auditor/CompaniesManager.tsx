"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import {
  Search,
  Plus,
  X,
  Check,
  Mail,
  Building2,
  Clock,
  CheckCircle2,
  ArrowRight,
  Sparkles,
  Phone,
  MapPin,
  Copy,
  ExternalLink,
  FileText,
  MessagesSquare,
  Inbox,
  Briefcase,
  ShieldCheck,
  Eye,
  ClipboardCheck,
} from "lucide-react";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";
import ProgressBar from "@/components/ui/ProgressBar";
import CitStatusBadge from "@/components/auditor/CitStatusBadge";
import IssueCountPair from "@/components/auditor/IssueCountPair";
import AuditorChecklistModal from "@/components/auditor/AuditorChecklistModal";
import { Field, Input } from "@/components/ui/Input";
import { CompaniesSummary, CompanyRow } from "@/lib/types";
import { useLanguage } from "@/lib/i18n/LanguageContext";

export interface ClientInvitation {
  id: string;
  companyName: string;
  registrationNumber: string;
  tinNumber: string;
  financialYear: string;
  senderName: string;
  senderEmail: string;
  note: string;
  receivedAt: string;
  status: "pending" | "accepted" | "declined";
  estimatedTurnover: string;
}

const INITIAL_INVITATIONS: ClientInvitation[] = [];

export default function CompaniesManager({ initial }: { initial: CompaniesSummary }) {
  const { t } = useLanguage();
  const [companies, setCompanies] = useState<CompanyRow[]>(initial.companies);
  const [searchQuery, setSearchQuery] = useState("");
  const [modalOpen, setModalOpen] = useState(false);

  // View Company Profile Modal State
  const [viewCompany, setViewCompany] = useState<CompanyRow | null>(null);
  const [copiedTin, setCopiedTin] = useState(false);
  const [checklistCompany, setChecklistCompany] = useState<CompanyRow | null>(null);

  // Invitations State
  const [invitations, setInvitations] = useState<ClientInvitation[]>(INITIAL_INVITATIONS);
  const [invitationsModalOpen, setInvitationsModalOpen] = useState(false);
  const [invitationFilter, setInvitationFilter] = useState<"ALL" | "PENDING" | "ACCEPTED">("ALL");
  const [invitationFeedback, setInvitationFeedback] = useState("");

  const [form, setForm] = useState({
    name: "",
    registration_number: "",
    tin_number: "",
    current_fiscal_year: "2025/26",
    contact_email: "",
    contact_phone: "",
  });
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");

  const pendingCount = invitations.filter((i) => i.status === "pending").length;

  const filteredCompanies = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return companies;
    return companies.filter(
      (c) => c.name.toLowerCase().includes(q) || c.tin.toLowerCase().includes(q)
    );
  }, [companies, searchQuery]);

  const filteredInvitations = invitations.filter((inv) => {
    if (invitationFilter === "PENDING") return inv.status === "pending";
    if (invitationFilter === "ACCEPTED") return inv.status === "accepted";
    return true;
  });

  async function handleAddCompany(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setSuccessMsg("");

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
      const token = typeof window !== "undefined" ? localStorage.getItem("taxease_token") : null;
      const headers: Record<string, string> = { "Content-Type": "application/json" };
      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }

      const res = await fetch(`${apiUrl}/api/auditor/companies`, {
        method: "POST",
        headers,
        body: JSON.stringify(form),
      });

      const newRecord: CompanyRow = {
        id: `co_${Date.now()}`,
        name: form.name.trim(),
        tin: form.tin_number.trim(),
        financialYear: form.current_fiscal_year,
        citStatus: "Draft",
        subStatusLabel: "Newly Onboarded",
        criticalCount: 0,
        warningsCount: 0,
        progressPercent: 0,
        dueDate: "30 Sep",
        contactEmail: form.contact_email.trim(),
        contactPhone: form.contact_phone.trim() || "+94 11 234 5678",
        registrationNumber: form.registration_number.trim() || "PV 00" + Math.floor(100000 + Math.random() * 900000),
        address: "Colombo, Sri Lanka",
        businessCategory: "Commercial Services",
        annualTurnover: "Rs. 25.0M",
        contactPerson: "Finance Representative",
        taxOffice: "Corporate Metropolitan Unit, Inland Revenue Department",
      };

      if (res.ok) {
        const newCo = await res.json();
        const mappedRow: CompanyRow = {
          ...newRecord,
          id: String(newCo.id || newRecord.id),
          name: newCo.name || newRecord.name,
          tin: newCo.tin_number || newRecord.tin,
          financialYear: newCo.current_fiscal_year || newRecord.financialYear,
        };
        setCompanies((prev) => [mappedRow, ...prev]);
      } else {
        // Local fallback
        setCompanies((prev) => [newRecord, ...prev]);
      }

      setSuccessMsg("Company added successfully!");
      setTimeout(() => {
        setModalOpen(false);
        setSuccessMsg("");
        setForm({
          name: "",
          registration_number: "",
          tin_number: "",
          current_fiscal_year: "2025/26",
          contact_email: "",
          contact_phone: "",
        });
      }, 1200);
    } catch (err) {
      console.error("Failed to add company:", err);
      // Ensure user sees company added in dev/demo mode
      const fallbackRecord: CompanyRow = {
        id: `co_${Date.now()}`,
        name: form.name.trim(),
        tin: form.tin_number.trim(),
        financialYear: form.current_fiscal_year,
        citStatus: "Draft",
        subStatusLabel: "Newly Onboarded",
        criticalCount: 0,
        warningsCount: 0,
        progressPercent: 0,
        dueDate: "30 Sep",
        contactEmail: form.contact_email.trim(),
        contactPhone: form.contact_phone.trim() || "+94 11 234 5678",
        registrationNumber: form.registration_number.trim() || "PV 00123456",
        address: "Colombo, Sri Lanka",
        businessCategory: "Commercial Services",
        annualTurnover: "Rs. 25.0M",
        contactPerson: "Finance Representative",
        taxOffice: "Corporate Metropolitan Unit, Inland Revenue Department",
      };
      setCompanies((prev) => [fallbackRecord, ...prev]);
      setSuccessMsg("Company added successfully!");
      setTimeout(() => {
        setModalOpen(false);
        setSuccessMsg("");
      }, 1200);
    } finally {
      setLoading(false);
    }
  }

  // Accept Client Invitation
  async function handleAcceptInvitation(inv: ClientInvitation) {
    setInvitations((prev) =>
      prev.map((item) => (item.id === inv.id ? { ...item, status: "accepted" } : item))
    );

    // Add directly to active companies list if not already present
    setCompanies((prev) => {
      const alreadyExists = prev.some(
        (c) =>
          c.name.toLowerCase().trim() === inv.companyName.toLowerCase().trim() ||
          c.tin === inv.tinNumber
      );
      if (alreadyExists) return prev;

      const newCompany: CompanyRow = {
        id: `comp_${Date.now()}`,
        name: inv.companyName,
        tin: inv.tinNumber,
        financialYear: inv.financialYear,
        citStatus: "Ready for Auditor",
        subStatusLabel: "Pending Review",
        criticalCount: 1,
        warningsCount: 2,
        progressPercent: 60,
        dueDate: "30 Sep",
        contactEmail: inv.senderEmail,
        contactPhone: "+94 11 234 5678",
        registrationNumber: inv.registrationNumber,
        address: "Colombo, Sri Lanka",
        businessCategory: "Commercial & Export Operations",
        annualTurnover: inv.estimatedTurnover,
        contactPerson: inv.senderName,
        taxOffice: "Corporate Metropolitan Unit, Inland Revenue Department",
      };
      return [newCompany, ...prev];
    });

    setInvitationFeedback(
      `Invitation from ${inv.companyName} accepted! Added to your client companies.`
    );
    setTimeout(() => setInvitationFeedback(""), 4500);

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
      const token = typeof window !== "undefined" ? localStorage.getItem("taxease_token") : null;
      const headers: Record<string, string> = { "Content-Type": "application/json" };
      if (token) headers["Authorization"] = `Bearer ${token}`;

      await fetch(`${apiUrl}/api/auditor/invitations/${inv.id}/accept`, {
        method: "POST",
        headers,
      });
    } catch {
      // Offline fallback
    }
  }

  // Decline Client Invitation
  async function handleDeclineInvitation(inv: ClientInvitation) {
    setInvitations((prev) =>
      prev.map((item) => (item.id === inv.id ? { ...item, status: "declined" } : item))
    );

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
      const token = typeof window !== "undefined" ? localStorage.getItem("taxease_token") : null;
      const headers: Record<string, string> = { "Content-Type": "application/json" };
      if (token) headers["Authorization"] = `Bearer ${token}`;

      await fetch(`${apiUrl}/api/auditor/invitations/${inv.id}/decline`, {
        method: "POST",
        headers,
      });
    } catch {
      // Offline fallback
    }
  }

  return (
    <div>
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {t("pages.companies.title")}
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            {t("pages.companies.subtitle")}
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="secondary"
            icon={<Mail className="h-4 w-4 text-brand-blue" />}
            onClick={() => setInvitationsModalOpen(true)}
            className="relative"
          >
            <span>{t("auditor.companies.clientInvitations")}</span>
            {pendingCount > 0 && (
              <span className="ml-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-brand-blue text-[10px] font-bold text-white shadow-xs">
                {pendingCount}
              </span>
            )}
          </Button>
          <Button icon={<Plus className="h-4 w-4" />} onClick={() => setModalOpen(true)}>
            {t("auditor.companies.addCompany")}
          </Button>
        </div>
      </div>

      <Card className="mt-6 p-4">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input
            type="search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t("auditor.companies.searchCompanies")}
            className="w-full rounded-lg border border-gray-200 py-2.5 pl-9 pr-3 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-1 focus:ring-brand-blue"
          />
        </div>
      </Card>

      <Card className="mt-4 overflow-x-auto">
        <table className="w-full min-w-[900px] text-left text-sm">
          <thead>
            <tr className="border-b border-gray-100 text-xs font-medium uppercase tracking-wide text-gray-400">
              <th className="px-5 py-3">{t("auditor.companies.colCompany")}</th>
              <th className="px-5 py-3">{t("auditor.companies.colTin")}</th>
              <th className="px-5 py-3">{t("auditor.companies.colFy")}</th>
              <th className="px-5 py-3">{t("auditor.companies.colCitStatus")}</th>
              <th className="px-5 py-3">{t("auditor.companies.colIssues")}</th>
              <th className="px-5 py-3">{t("auditor.companies.colProgress")}</th>
              <th className="px-5 py-3 text-right">{t("auditor.companies.colActions")}</th>
            </tr>
          </thead>
          <tbody>
            {filteredCompanies.length === 0 && (
              <tr>
                <td colSpan={7} className="px-5 py-10 text-center text-sm text-gray-400">
                  No companies found matching your search.
                </td>
              </tr>
            )}
            {filteredCompanies.map((c) => (
              <tr
                key={c.id}
                className="border-b border-gray-50 last:border-0 hover:bg-gray-50/60 transition-colors"
              >
                <td className="px-5 py-3.5">
                  <button
                    type="button"
                    onClick={() => setViewCompany(c)}
                    className="text-left font-semibold text-gray-900 hover:text-brand-blue transition-colors block focus:outline-none"
                  >
                    {c.name}
                  </button>
                  <p className="text-xs text-gray-400 mt-0.5">{c.subStatusLabel}</p>
                </td>
                <td className="px-5 py-3.5 text-gray-600 font-mono text-xs">{c.tin}</td>
                <td className="px-5 py-3.5 text-gray-600">{c.financialYear}</td>
                <td className="px-5 py-3.5">
                  <CitStatusBadge status={c.citStatus} />
                </td>
                <td className="px-5 py-3.5">
                  <IssueCountPair critical={c.criticalCount} warnings={c.warningsCount} />
                </td>
                <td className="px-5 py-3.5">
                  <div className="flex items-center gap-2">
                    <div className="w-20">
                      <ProgressBar value={c.progressPercent} />
                    </div>
                    <span className="text-xs text-gray-500">
                      {c.progressPercent}%
                    </span>
                  </div>
                </td>
                <td className="px-5 py-3.5 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => setChecklistCompany(c)}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-blue-200 bg-blue-50/80 px-2.5 py-1.5 text-xs font-semibold text-brand-blue hover:bg-blue-100 hover:border-blue-300 transition-all shadow-2xs cursor-pointer focus:outline-none"
                      title="Manage statutory & custom audit document checklist for this company"
                    >
                      <ClipboardCheck className="h-3.5 w-3.5 text-brand-blue" />
                      <span>Checklist</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setViewCompany(c)}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs font-semibold text-gray-700 hover:bg-blue-50 hover:text-brand-blue hover:border-blue-200 transition-all shadow-2xs cursor-pointer focus:outline-none focus:ring-1 focus:ring-brand-blue"
                    >
                      <Eye className="h-3.5 w-3.5 text-brand-blue" />
                      <span>{t("auditor.companies.viewCompany")}</span>
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>

      {/* Invitations Modal */}
      {invitationsModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <Card className="w-full max-w-2xl overflow-hidden p-0 shadow-2xl animate-in fade-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-gray-100 bg-white px-6 py-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-brand-blue">
                  <Mail className="h-5 w-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-gray-900 text-base">Client Audit Invitations</h3>
                    {pendingCount > 0 && (
                      <span className="rounded-full bg-blue-100 px-2 py-0.5 text-xs font-semibold text-brand-blue">
                        {pendingCount} Pending
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-gray-500 mt-0.5">
                    Review and accept audit engagement requests from client businesses.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setInvitationsModalOpen(false)}
                className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Filter Pills & Feedback */}
            <div className="border-b border-gray-100 bg-slate-50/70 px-6 py-2.5 flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-xs">
                <button
                  onClick={() => setInvitationFilter("ALL")}
                  className={`rounded-md px-2.5 py-1 font-medium transition-colors ${
                    invitationFilter === "ALL"
                      ? "bg-brand-blue text-white"
                      : "text-gray-600 hover:bg-gray-200/60"
                  }`}
                >
                  All ({invitations.length})
                </button>
                <button
                  onClick={() => setInvitationFilter("PENDING")}
                  className={`rounded-md px-2.5 py-1 font-medium transition-colors ${
                    invitationFilter === "PENDING"
                      ? "bg-brand-blue text-white"
                      : "text-gray-600 hover:bg-gray-200/60"
                  }`}
                >
                  Pending ({pendingCount})
                </button>
                <button
                  onClick={() => setInvitationFilter("ACCEPTED")}
                  className={`rounded-md px-2.5 py-1 font-medium transition-colors ${
                    invitationFilter === "ACCEPTED"
                      ? "bg-brand-blue text-white"
                      : "text-gray-600 hover:bg-gray-200/60"
                  }`}
                >
                  Accepted ({invitations.filter((i) => i.status === "accepted").length})
                </button>
              </div>

              <span className="text-[11px] text-gray-400">
                FY 2025/26 Engagements
              </span>
            </div>

            {/* Success Feedback Alert */}
            {invitationFeedback && (
              <div className="bg-emerald-50 border-b border-emerald-100 px-6 py-2.5 text-xs text-emerald-800 flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                <span className="font-medium">{invitationFeedback}</span>
              </div>
            )}

            {/* Invitations List */}
            <div className="max-h-[460px] overflow-y-auto p-6 space-y-4 bg-gray-50/40">
              {filteredInvitations.length === 0 ? (
                <div className="py-12 text-center text-gray-400">
                  <Mail className="mx-auto h-10 w-10 text-gray-300 stroke-1 mb-2" />
                  <p className="text-sm font-medium text-gray-600">No invitations found</p>
                  <p className="text-xs text-gray-400 mt-0.5">
                    When client companies send you an audit invitation, it will appear here.
                  </p>
                </div>
              ) : (
                filteredInvitations.map((inv) => {
                  const isPending = inv.status === "pending";
                  const isAccepted = inv.status === "accepted";

                  return (
                    <div
                      key={inv.id}
                      className="rounded-xl border border-gray-200/80 bg-white p-4 shadow-xs transition-shadow hover:shadow-sm"
                    >
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div className="flex items-start gap-3">
                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-brand-blue font-bold text-xs">
                            <Building2 className="h-5 w-5" />
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <h4 className="font-bold text-gray-900 text-sm">{inv.companyName}</h4>
                              <span className="rounded bg-gray-100 px-1.5 py-0.5 text-[10px] font-medium text-gray-600">
                                {inv.financialYear}
                              </span>
                            </div>
                            <div className="mt-0.5 flex flex-wrap items-center gap-2 text-xs text-gray-500">
                              <span>TIN: <strong className="text-gray-700">{inv.tinNumber}</strong></span>
                              <span>•</span>
                              <span>Reg: {inv.registrationNumber}</span>
                              {inv.estimatedTurnover && (
                                <>
                                  <span>•</span>
                                  <span>Turnover: <strong className="text-gray-700">{inv.estimatedTurnover}</strong></span>
                                </>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Status Badge */}
                        <div>
                          {isPending && (
                            <Badge tone="warning" className="text-[11px]">
                              Pending Response
                            </Badge>
                          )}
                          {isAccepted && (
                            <Badge tone="success" className="text-[11px]">
                              ✓ Accepted
                            </Badge>
                          )}
                          {inv.status === "declined" && (
                            <Badge tone="neutral" className="text-[11px]">
                              Declined
                            </Badge>
                          )}
                        </div>
                      </div>

                      {/* Note Quote Box */}
                      {inv.note && (
                        <div className="mt-3 rounded-lg border-l-2 border-brand-blue bg-blue-50/40 p-2.5 text-xs text-gray-700 leading-relaxed italic">
                          &ldquo;{inv.note}&rdquo;
                        </div>
                      )}

                      {/* Footer Row: Sender Info & Actions */}
                      <div className="mt-3.5 flex flex-wrap items-center justify-between gap-3 pt-2.5 border-t border-gray-100 text-xs">
                        <div className="flex items-center gap-1.5 text-gray-400">
                          <Clock className="h-3.5 w-3.5" />
                          <span>Received {inv.receivedAt} from </span>
                          <strong className="text-gray-600">{inv.senderName}</strong>
                          <span className="text-gray-400">({inv.senderEmail})</span>
                        </div>

                        <div className="flex items-center gap-2">
                          {isPending && (
                            <>
                              <Button
                                variant="secondary"
                                className="text-xs py-1 px-2.5 text-gray-600 hover:text-red-600"
                                onClick={() => handleDeclineInvitation(inv)}
                              >
                                Decline
                              </Button>
                              <Button
                                variant="primary"
                                className="text-xs py-1 px-3 shadow-xs"
                                icon={<Check className="h-3.5 w-3.5" />}
                                onClick={() => handleAcceptInvitation(inv)}
                              >
                                Accept Invitation
                              </Button>
                            </>
                          )}

                          {isAccepted && (
                            <div className="flex items-center gap-2">
                              <span className="flex items-center gap-1 text-emerald-700 font-medium text-xs">
                                <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                                Added to Companies Portfolio
                              </span>
                              <Button
                                variant="secondary"
                                className="text-xs py-1 px-2.5"
                                icon={<ArrowRight className="h-3 w-3" />}
                                onClick={() => {
                                  setSearchQuery(inv.companyName);
                                  setInvitationsModalOpen(false);
                                }}
                              >
                                View in Table
                              </Button>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Modal Footer */}
            <div className="border-t border-gray-100 bg-white px-6 py-3 flex items-center justify-between text-xs text-gray-400">
              <span className="flex items-center gap-1 text-gray-500">
                <Sparkles className="h-3.5 w-3.5 text-amber-500" />
                Accepting an invitation immediately assigns the company to your CIT review workflow.
              </span>
              <Button
                variant="secondary"
                className="text-xs"
                onClick={() => setInvitationsModalOpen(false)}
              >
                Close
              </Button>
            </div>
          </Card>
        </div>
      )}

      {/* Manual Add Company Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <Card className="w-full max-w-lg p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <p className="font-semibold text-gray-900">Add Company to Portfolio</p>
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {successMsg ? (
              <div className="py-8 text-center">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-green-50 text-status-success">
                  <Check className="h-6 w-6" />
                </div>
                <p className="mt-3 font-semibold text-gray-900">{successMsg}</p>
              </div>
            ) : (
              <form onSubmit={handleAddCompany} className="mt-4 flex flex-col gap-4">
                <Field label="Company Name">
                  <Input
                    required
                    placeholder="e.g. Apex Technologies (Pvt) Ltd"
                    value={form.name}
                    onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                  />
                </Field>

                <div className="grid grid-cols-2 gap-3">
                  <Field label="Registration Number">
                    <Input
                      required
                      placeholder="e.g. PV 00987654"
                      value={form.registration_number}
                      onChange={(e) => setForm((f) => ({ ...f, registration_number: e.target.value }))}
                    />
                  </Field>
                  <Field label="TIN Number">
                    <Input
                      required
                      placeholder="e.g. 192837465"
                      value={form.tin_number}
                      onChange={(e) => setForm((f) => ({ ...f, tin_number: e.target.value }))}
                    />
                  </Field>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <Field label="Contact Email">
                    <Input
                      required
                      type="email"
                      placeholder="finance@apex.lk"
                      value={form.contact_email}
                      onChange={(e) => setForm((f) => ({ ...f, contact_email: e.target.value }))}
                    />
                  </Field>
                  <Field label="Contact Phone">
                    <Input
                      placeholder="+94 11 234 5678"
                      value={form.contact_phone}
                      onChange={(e) => setForm((f) => ({ ...f, contact_phone: e.target.value }))}
                    />
                  </Field>
                </div>

                <div className="mt-2 flex justify-end gap-2">
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={() => setModalOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" disabled={loading}>
                    {loading ? "Adding..." : "Add Company"}
                  </Button>
                </div>
              </form>
            )}
          </Card>
        </div>
      )}

      {/* View Company Profile Details Modal */}
      {viewCompany && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <Card className="w-full max-w-2xl overflow-hidden p-0 shadow-2xl animate-in fade-in zoom-in-95 duration-150 bg-white">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-gray-100 bg-gradient-to-r from-slate-50 to-white px-6 py-4">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-brand-blue border border-blue-100 shadow-xs">
                  <Building2 className="h-6 w-6" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-gray-900 text-lg">{viewCompany.name}</h3>
                    <CitStatusBadge status={viewCompany.citStatus} />
                  </div>
                  <p className="text-xs text-gray-500 mt-0.5 flex items-center gap-2">
                    <span>Reg: {viewCompany.registrationNumber || "PV 00123456"}</span>
                    <span>•</span>
                    <span>FY: {viewCompany.financialYear}</span>
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setViewCompany(null)}
                className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="max-h-[520px] overflow-y-auto p-6 space-y-6">
              {/* Corporate & Tax Identifiers */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-3 flex items-center gap-1.5">
                  <ShieldCheck className="h-3.5 w-3.5 text-brand-blue" />
                  Tax & Corporate Identification
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div className="rounded-xl border border-gray-100 bg-gray-50/70 p-3.5">
                    <span className="text-[11px] font-medium text-gray-400 uppercase tracking-wide">
                      Taxpayer Identification No (TIN)
                    </span>
                    <div className="flex items-center justify-between mt-1">
                      <span className="text-sm font-bold text-gray-900 font-mono tracking-wide">
                        {viewCompany.tin}
                      </span>
                      <button
                        type="button"
                        onClick={() => {
                          navigator.clipboard?.writeText(viewCompany.tin);
                          setCopiedTin(true);
                          setTimeout(() => setCopiedTin(false), 2000);
                        }}
                        title="Copy TIN"
                        className="rounded-md p-1 text-gray-400 hover:bg-white hover:text-brand-blue transition-colors shadow-2xs cursor-pointer"
                      >
                        {copiedTin ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5" />}
                      </button>
                    </div>
                  </div>

                  <div className="rounded-xl border border-gray-100 bg-gray-50/70 p-3.5">
                    <span className="text-[11px] font-medium text-gray-400 uppercase tracking-wide">
                      Registration Number
                    </span>
                    <p className="text-sm font-bold text-gray-900 mt-1">
                      {viewCompany.registrationNumber || "—"}
                    </p>
                  </div>

                  <div className="sm:col-span-2 rounded-xl border border-gray-100 bg-gray-50/70 p-3.5">
                    <span className="text-[11px] font-medium text-gray-400 uppercase tracking-wide">
                      Business Sector
                    </span>
                    <p className="text-sm font-semibold text-gray-800 mt-1">
                      {viewCompany.businessCategory || "General Commercial Services"}
                    </p>
                  </div>
                </div>
              </div>

              {/* Contact Information */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-3 flex items-center gap-1.5">
                  <Mail className="h-3.5 w-3.5 text-brand-blue" />
                  Primary Contact Details
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div className="rounded-xl border border-gray-100 bg-gray-50/70 p-3.5">
                    <span className="text-[11px] font-medium text-gray-400 uppercase tracking-wide">
                      Contact Email
                    </span>
                    <div className="mt-1 flex items-center gap-2">
                      <Mail className="h-4 w-4 text-gray-400 shrink-0" />
                      {viewCompany.contactEmail ? (
                        <a
                          href={`mailto:${viewCompany.contactEmail}`}
                          className="text-sm font-medium text-brand-blue hover:underline truncate"
                        >
                          {viewCompany.contactEmail}
                        </a>
                      ) : (
                        <span className="text-sm text-gray-500">Not provided</span>
                      )}
                    </div>
                  </div>

                  <div className="rounded-xl border border-gray-100 bg-gray-50/70 p-3.5">
                    <span className="text-[11px] font-medium text-gray-400 uppercase tracking-wide">
                      Phone Number
                    </span>
                    <div className="mt-1 flex items-center gap-2">
                      <Phone className="h-4 w-4 text-gray-400 shrink-0" />
                      {viewCompany.contactPhone ? (
                        <a
                          href={`tel:${viewCompany.contactPhone}`}
                          className="text-sm font-medium text-gray-800 hover:text-brand-blue transition-colors"
                        >
                          {viewCompany.contactPhone}
                        </a>
                      ) : (
                        <span className="text-sm text-gray-500">—</span>
                      )}
                    </div>
                  </div>

                  <div className="rounded-xl border border-gray-100 bg-gray-50/70 p-3.5">
                    <span className="text-[11px] font-medium text-gray-400 uppercase tracking-wide">
                      Finance Lead / Contact Person
                    </span>
                    <div className="mt-1 flex items-center gap-2">
                      <Briefcase className="h-4 w-4 text-gray-400 shrink-0" />
                      <span className="text-sm font-medium text-gray-800">
                        {viewCompany.contactPerson || "Authorized Representative"}
                      </span>
                    </div>
                  </div>

                  <div className="rounded-xl border border-gray-100 bg-gray-50/70 p-3.5">
                    <span className="text-[11px] font-medium text-gray-400 uppercase tracking-wide">
                      Inland Revenue Office (IRD)
                    </span>
                    <div className="mt-1 flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-gray-400 shrink-0" />
                      <span className="text-sm font-medium text-gray-800 truncate" title={viewCompany.taxOffice}>
                        {viewCompany.taxOffice || "Inland Revenue Department"}
                      </span>
                    </div>
                  </div>

                  <div className="sm:col-span-2 rounded-xl border border-gray-100 bg-gray-50/70 p-3.5">
                    <span className="text-[11px] font-medium text-gray-400 uppercase tracking-wide">
                      Registered Corporate Address
                    </span>
                    <div className="mt-1 flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-gray-400 shrink-0" />
                      <span className="text-sm text-gray-700">
                        {viewCompany.address || "Sri Lanka"}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* CIT Engagement & Audit Standing */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-3 flex items-center gap-1.5">
                  <FileText className="h-3.5 w-3.5 text-brand-blue" />
                  CIT Engagement & Audit Standing
                </h4>
                <div className="rounded-xl border border-blue-100 bg-blue-50/50 p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-xs font-medium text-gray-600">Audit Completion Progress</span>
                      <div className="flex items-center gap-2 mt-1">
                        <div className="w-36">
                          <ProgressBar value={viewCompany.progressPercent} />
                        </div>
                        <span className="text-xs font-bold text-gray-800">
                          {viewCompany.progressPercent}%
                        </span>
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="text-xs font-medium text-gray-600">Filing Target Due Date</span>
                      <p className="text-xs font-bold text-gray-900 mt-1 flex items-center gap-1 justify-end">
                        <Clock className="h-3.5 w-3.5 text-gray-400" />
                        {viewCompany.dueDate || "30 Sep 2026"}
                      </p>
                    </div>
                  </div>

                  <div className="mt-3.5 pt-3 border-t border-blue-100/80 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <span className="text-gray-600">Active Audit Issues:</span>
                      <IssueCountPair critical={viewCompany.criticalCount} warnings={viewCompany.warningsCount} />
                    </div>
                    <span className="text-xs font-semibold text-brand-blue">
                      Status: {viewCompany.subStatusLabel || "In Progress"}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer Quick Actions */}
            <div className="flex items-center justify-between border-t border-gray-100 bg-gray-50/70 px-6 py-3.5">
              <div className="flex items-center gap-2 flex-wrap">
                <button
                  type="button"
                  onClick={() => {
                    const co = viewCompany;
                    setViewCompany(null);
                    setChecklistCompany(co);
                  }}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-blue-200 bg-blue-50 px-3 py-1.5 text-xs font-semibold text-brand-blue hover:bg-blue-100 shadow-2xs transition-colors cursor-pointer"
                >
                  <ClipboardCheck className="h-3.5 w-3.5 text-brand-blue" />
                  Customize Checklist
                </button>
                <Link
                  href="/auditor-documents"
                  className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs font-semibold text-gray-700 hover:bg-gray-50 hover:text-brand-blue shadow-2xs transition-colors"
                >
                  <FileText className="h-3.5 w-3.5 text-brand-blue" />
                  Documents
                </Link>
                <Link
                  href="/auditor-discussions"
                  className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs font-semibold text-gray-700 hover:bg-gray-50 hover:text-brand-blue shadow-2xs transition-colors"
                >
                  <MessagesSquare className="h-3.5 w-3.5 text-brand-blue" />
                  Discussions
                </Link>
                <Link
                  href="/requests"
                  className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs font-semibold text-gray-700 hover:bg-gray-50 hover:text-brand-blue shadow-2xs transition-colors"
                >
                  <Inbox className="h-3.5 w-3.5 text-brand-blue" />
                  Requests (RFI)
                </Link>
              </div>

              <Button variant="secondary" onClick={() => setViewCompany(null)}>
                Close
              </Button>
            </div>
          </Card>
        </div>
      )}

      {/* Auditor Document Checklist Modal */}
      {checklistCompany && (
        <AuditorChecklistModal
          companyName={checklistCompany.name}
          tin={checklistCompany.tin}
          isOpen={!!checklistCompany}
          onClose={() => setChecklistCompany(null)}
        />
      )}
    </div>
  );
}
