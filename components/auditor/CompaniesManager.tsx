"use client";

import { useState, useMemo } from "react";
import {
  Search,
  Plus,
  MoreVertical,
  X,
  Check,
  Mail,
  Building2,
  Clock,
  CheckCircle2,
  ArrowRight,
  Sparkles,
} from "lucide-react";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";
import ProgressBar from "@/components/ui/ProgressBar";
import CitStatusBadge from "@/components/auditor/CitStatusBadge";
import IssueCountPair from "@/components/auditor/IssueCountPair";
import T from "@/components/layout/T";
import { Field, Input } from "@/components/ui/Input";
import { CompaniesSummary, CompanyRow } from "@/lib/types";

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

const INITIAL_INVITATIONS: ClientInvitation[] = [
  {
    id: "inv_1",
    companyName: "ABC Holdings (Pvt) Ltd",
    registrationNumber: "PV 00123456",
    tinNumber: "134578291",
    financialYear: "2025/26",
    senderName: "Admin User (Finance Director)",
    senderEmail: "admin@abc.lk",
    note: "We have finalized our year-end Trial Balance and Income Statement. Requesting your firm to perform our statutory CIT audit and RAMIS tax sign-off.",
    receivedAt: "10 mins ago",
    status: "pending",
    estimatedTurnover: "Rs. 25.0M",
  },
  {
    id: "inv_2",
    companyName: "Apex Agro Exports (Pvt) Ltd",
    registrationNumber: "PV 00987123",
    tinNumber: "109823471",
    financialYear: "2025/26",
    senderName: "Nimal Wickramasinghe (Managing Director)",
    senderEmail: "nimal@apexagro.lk",
    note: "Seeking Corporate Income Tax audit review for FY2025/26 including BOI agricultural export tax concessions and WHT credits.",
    receivedAt: "2 hours ago",
    status: "pending",
    estimatedTurnover: "Rs. 48.5M",
  },
  {
    id: "inv_3",
    companyName: "Lanka Logistics & Shipping (Pvt) Ltd",
    registrationNumber: "PV 00341829",
    tinNumber: "128471923",
    financialYear: "2025/26",
    senderName: "Kavinda Perera (Chief Accountant)",
    senderEmail: "kavinda@lankalogistics.lk",
    note: "Requesting external audit verification for RAMIS CIT schedule filing and withholding tax reconciliation.",
    receivedAt: "Yesterday",
    status: "accepted",
    estimatedTurnover: "Rs. 85.2M",
  },
];

export default function CompaniesManager({ initial }: { initial: CompaniesSummary }) {
  const [companies, setCompanies] = useState<CompanyRow[]>(initial.companies);
  const [searchQuery, setSearchQuery] = useState("");
  const [modalOpen, setModalOpen] = useState(false);

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

      if (res.ok) {
        const newCo = await res.json();
        const mappedRow: CompanyRow = {
          id: String(newCo.id),
          name: newCo.name,
          tin: newCo.tin_number || form.tin_number,
          financialYear: newCo.current_fiscal_year || form.current_fiscal_year,
          citStatus: "Draft",
          subStatusLabel: "Not Started",
          criticalCount: 0,
          warningsCount: 0,
          progressPercent: 0,
          dueDate: "30 Sep",
        };
        setCompanies((prev) => [mappedRow, ...prev]);
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
      }
    } catch (err) {
      console.error("Failed to add company:", err);
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
            <T k="pages.companies.title" />
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            <T k="pages.companies.subtitle" />
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="secondary"
            icon={<Mail className="h-4 w-4 text-brand-blue" />}
            onClick={() => setInvitationsModalOpen(true)}
            className="relative"
          >
            <span>Invitations</span>
            {pendingCount > 0 && (
              <span className="ml-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-brand-blue text-[10px] font-bold text-white shadow-xs">
                {pendingCount}
              </span>
            )}
          </Button>
          <Button icon={<Plus className="h-4 w-4" />} onClick={() => setModalOpen(true)}>
            Add Company
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
            placeholder="Search company..."
            className="w-full rounded-lg border border-gray-200 py-2.5 pl-9 pr-3 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-1 focus:ring-brand-blue"
          />
        </div>
      </Card>

      <Card className="mt-4 overflow-x-auto">
        <table className="w-full min-w-[900px] text-left text-sm">
          <thead>
            <tr className="border-b border-gray-100 text-xs font-medium uppercase tracking-wide text-gray-400">
              <th className="px-5 py-3">Company</th>
              <th className="px-5 py-3">TIN</th>
              <th className="px-5 py-3">FY</th>
              <th className="px-5 py-3">CIT Status</th>
              <th className="px-5 py-3">Issues</th>
              <th className="px-5 py-3">Progress</th>
              <th className="px-5 py-3">Due Date</th>
              <th className="px-5 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredCompanies.length === 0 && (
              <tr>
                <td colSpan={8} className="px-5 py-10 text-center text-sm text-gray-400">
                  No companies found matching your search.
                </td>
              </tr>
            )}
            {filteredCompanies.map((c) => (
              <tr
                key={c.id}
                className="border-b border-gray-50 last:border-0 hover:bg-gray-50/60"
              >
                <td className="px-5 py-3.5">
                  <p className="font-medium text-gray-900">{c.name}</p>
                  <p className="text-xs text-gray-400">{c.subStatusLabel}</p>
                </td>
                <td className="px-5 py-3.5 text-gray-600">{c.tin}</td>
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
                <td className="px-5 py-3.5 text-gray-600">{c.dueDate}</td>
                <td className="px-5 py-3.5 text-right">
                  <a href="/review-queue" className="text-gray-400 hover:text-gray-600">
                    <MoreVertical className="ml-auto h-4 w-4" />
                  </a>
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
    </div>
  );
}
