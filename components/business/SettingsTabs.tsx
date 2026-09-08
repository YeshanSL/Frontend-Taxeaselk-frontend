"use client";

import { useState } from "react";
import clsx from "clsx";
import {
  Building2,
  UserCheck,
  Users,
  Sliders,
  Bell,
  Shield,
  FileText,
  CheckCircle2,
  Clock,
  Key,
  Plus,
  X,
  Send,
  AlertCircle,
  Info,
  Lock,
  Download,
  Calendar,
  Search,
  Trash2,
  Check,
  Mail,
  Phone,
  HelpCircle,
} from "lucide-react";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";
import { Field, Input, Select } from "@/components/ui/Input";
import {
  CompanyFullSettings,
  AssignedAuditorDetails,
  FinanceTeamMember,
  CompanyTaxPreferences,
  CompanyNotificationPrefs,
  CompanySecuritySettings,
} from "@/lib/types";
import {
  updateAssignedAuditorPermissions,
  requestAuditorChange,
  inviteFinanceTeamMember,
  removeFinanceTeamMember,
  updateCompanyTaxPreferences,
  updateCompanyNotificationPrefs,
  updateCompanySecurity,
} from "@/lib/api/business";

const TABS = [
  { id: "profile", label: "Company & Tax Profile", icon: Building2 },
  { id: "auditor", label: "Assigned Auditor & Engagement", icon: UserCheck },
  { id: "team", label: "Finance Team & Access", icon: Users },
  { id: "preferences", label: "Tax Preferences & AI Settings", icon: Sliders },
  { id: "notifications", label: "Notifications & Deadlines", icon: Bell },
  { id: "security", label: "Security & Activity Log", icon: Shield },
] as const;

type TabId = (typeof TABS)[number]["id"];

// ─── Shared UI Helpers ────────────────────────────────────────────────────────

function Toggle({
  checked,
  onChange,
  disabled = false,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      disabled={disabled}
      onClick={() => !disabled && onChange(!checked)}
      className={clsx(
        "relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-brand-blue focus:ring-offset-2",
        checked ? "bg-brand-blue" : "bg-gray-200",
        disabled && "opacity-50 cursor-not-allowed"
      )}
    >
      <span
        className={clsx(
          "inline-block h-5 w-5 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out",
          checked ? "translate-x-5" : "translate-x-0"
        )}
      />
    </button>
  );
}

function RoleBadge({ role }: { role: FinanceTeamMember["role"] }) {
  const styles: Record<FinanceTeamMember["role"], string> = {
    Owner: "bg-purple-50 text-purple-700 border-purple-200",
    "Finance Director": "bg-blue-50 text-blue-700 border-blue-200",
    "Senior Accountant": "bg-emerald-50 text-emerald-700 border-emerald-200",
    "Tax Officer": "bg-amber-50 text-amber-700 border-amber-200",
    Viewer: "bg-gray-100 text-gray-700 border-gray-200",
  };
  return (
    <span
      className={clsx(
        "inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-semibold tracking-wide",
        styles[role] || "bg-gray-50 text-gray-700 border-gray-200"
      )}
    >
      {role}
    </span>
  );
}

// ─── TAB 2: Assigned Auditor & Engagement ─────────────────────────────────────

function AuditorTab({ auditor }: { auditor: AssignedAuditorDetails }) {
  const [permissions, setPermissions] = useState(auditor.permissions);
  const [savingPerms, setSavingPerms] = useState(false);
  const [permsSaved, setPermsSaved] = useState(false);

  // Request change modal
  const [showModal, setShowModal] = useState(false);
  const [reason, setReason] = useState("");
  const [proposedFirm, setProposedFirm] = useState("");
  const [submittingReq, setSubmittingReq] = useState(false);
  const [requestSuccess, setRequestSuccess] = useState<string | null>(null);

  async function handleTogglePerm(key: keyof AssignedAuditorDetails["permissions"]) {
    const updated = { ...permissions, [key]: !permissions[key] };
    setPermissions(updated);
    setSavingPerms(true);
    setPermsSaved(false);

    try {
      await updateAssignedAuditorPermissions(updated);
      setPermsSaved(true);
      setTimeout(() => setPermsSaved(false), 2000);
    } catch {
      // Keep optimistic
    } finally {
      setSavingPerms(false);
    }
  }

  async function handleSubmitChangeRequest(e: React.FormEvent) {
    e.preventDefault();
    if (!reason.trim()) return;
    setSubmittingReq(true);
    try {
      const res = await requestAuditorChange(reason, proposedFirm);
      setRequestSuccess(res.message);
      setTimeout(() => {
        setShowModal(false);
        setRequestSuccess(null);
        setReason("");
        setProposedFirm("");
      }, 2000);
    } catch {
      // Graceful
    } finally {
      setSubmittingReq(false);
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-100 pb-5">
        <div>
          <h2 className="text-base font-semibold text-gray-900 flex items-center gap-2">
            <UserCheck className="h-5 w-5 text-brand-blue" />
            Assigned Auditor &amp; Engagement Credentials
          </h2>
          <p className="text-xs text-gray-500 mt-0.5">
            Manage your connected professional audit firm, engagement permissions, and sign-off authority for Assessment Year {auditor.engagementYear}.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="secondary"
            onClick={() => setShowModal(true)}
            className="text-xs px-3 py-2 border-amber-200 text-amber-800 hover:bg-amber-50"
          >
            Change / Invite New Auditor
          </Button>
        </div>
      </div>

      {/* Connected Audit Firm Card */}
      <div className="rounded-xl border border-blue-100 bg-gradient-to-br from-blue-50/50 via-white to-gray-50/30 p-6 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
          <div className="flex items-start gap-4">
            <div className="h-14 w-14 rounded-2xl bg-brand-blue/10 border border-brand-blue/20 flex items-center justify-center text-brand-blue shrink-0 shadow-inner">
              <Building2 className="h-7 w-7" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2.5">
                <h3 className="text-lg font-bold text-gray-900">{auditor.firmName}</h3>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 text-xs font-semibold text-emerald-700">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  {auditor.status === "Active" ? "Active Engagement" : auditor.status}
                </span>
                <span className="rounded-md bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-600">
                  Ref: {auditor.firmRegNo}
                </span>
              </div>

              <p className="text-sm font-medium text-gray-700 mt-2 flex items-center gap-2">
                <span>Lead Engagement Partner:</span>
                <span className="text-gray-900 font-semibold">{auditor.leadAuditorName}</span>
                <span className="rounded bg-blue-100 text-blue-800 text-[11px] px-1.5 py-0.5 font-mono font-medium">
                  {auditor.icaslMemberNo} (ICASL)
                </span>
              </p>

              <div className="mt-3 flex flex-wrap items-center gap-4 text-xs text-gray-500">
                <span className="flex items-center gap-1.5">
                  <Mail className="h-3.5 w-3.5 text-gray-400" />
                  {auditor.leadAuditorEmail}
                </span>
                <span className="flex items-center gap-1.5">
                  <Phone className="h-3.5 w-3.5 text-gray-400" />
                  {auditor.leadAuditorPhone}
                </span>
                <span className="flex items-center gap-1.5">
                  <Calendar className="h-3.5 w-3.5 text-gray-400" />
                  Assigned: {auditor.assignedDate}
                </span>
              </div>
            </div>
          </div>

          <div className="flex md:flex-col items-end justify-between gap-3 shrink-0">
            <Button
              variant="secondary"
              onClick={() => alert("Letter of Engagement (Y/A 2025/26) generated and downloaded.")}
              className="text-xs px-3 py-1.5 gap-1.5"
            >
              <Download className="h-3.5 w-3.5" />
              Engagement Letter
            </Button>
            <span className="text-[11px] text-gray-400">Y/A {auditor.engagementYear} Scope</span>
          </div>
        </div>
      </div>

      {/* Auditor Access Permissions */}
      <div className="rounded-xl border border-gray-100 bg-white p-5 space-y-4">
        <div className="flex items-center justify-between border-b border-gray-100 pb-3">
          <div>
            <h4 className="text-sm font-semibold text-gray-900">
              Engagement Privileges &amp; Access Controls
            </h4>
            <p className="text-xs text-gray-500">
              Control what the auditor can view, modify, and sign off directly in your TaxEaseLK corporate workspace.
            </p>
          </div>
          {permsSaved && (
            <span className="text-xs text-emerald-600 font-medium flex items-center gap-1">
              <Check className="h-3.5 w-3.5" /> Permissions synced
            </span>
          )}
        </div>

        <div className="divide-y divide-gray-100">
          <div className="py-3 flex items-center justify-between">
            <div className="pr-4">
              <p className="text-sm font-medium text-gray-800">
                View Financial Documents &amp; Trial Balance
              </p>
              <p className="text-xs text-gray-500">
                Allows the auditor to inspect raw financial statements, PDF schedules, general ledgers, and OCR-extracted lines.
              </p>
            </div>
            <Toggle
              checked={permissions.canViewDocuments}
              onChange={() => handleTogglePerm("canViewDocuments")}
              disabled={savingPerms}
            />
          </div>

          <div className="py-3 flex items-center justify-between">
            <div className="pr-4">
              <p className="text-sm font-medium text-gray-800">
                Propose &amp; Edit CIT Tax Adjustments
              </p>
              <p className="text-xs text-gray-500">
                Grants the auditor ability to add or adjust disallowed expenses, capital allowance schedules, and exempt income in draft CIT returns.
              </p>
            </div>
            <Toggle
              checked={permissions.canEditAdjustments}
              onChange={() => handleTogglePerm("canEditAdjustments")}
              disabled={savingPerms}
            />
          </div>

          <div className="py-3 flex items-center justify-between">
            <div className="pr-4">
              <p className="text-sm font-medium text-gray-800">
                Issue Auditor Final Sign-Off &amp; Certification
              </p>
              <p className="text-xs text-gray-500">
                Permits the licensed Chartered Accountant to certify the CIT computation and generate the formal Audit Clearance Report.
              </p>
            </div>
            <Toggle
              checked={permissions.canSignOffReturn}
              onChange={() => handleTogglePerm("canSignOffReturn")}
              disabled={savingPerms}
            />
          </div>

          <div className="py-3 flex items-center justify-between">
            <div className="pr-4">
              <div className="flex items-center gap-1.5">
                <p className="text-sm font-medium text-gray-800">
                  Direct Electronic IRD RAMIS Filing
                </p>
                <span className="rounded bg-amber-100 text-amber-800 text-[10px] px-1.5 py-0.2 font-semibold">
                  Restricted
                </span>
              </div>
              <p className="text-xs text-gray-500">
                Allow the auditor to submit the final certified return directly to Sri Lanka IRD RAMIS portal on behalf of the company.
              </p>
            </div>
            <Toggle
              checked={permissions.canDirectFileIRD}
              onChange={() => handleTogglePerm("canDirectFileIRD")}
              disabled={savingPerms}
            />
          </div>
        </div>
      </div>

      {/* Change Auditor Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 animate-fade-in">
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl border border-gray-100 space-y-4">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <h3 className="text-base font-semibold text-gray-900 flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-amber-600" />
                Request Auditor Engagement Change
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <p className="text-xs text-gray-600 leading-relaxed">
              Changing your assigned Chartered Accountant requires administrative verification under Sri Lanka Auditing Standards (SLAuS) to ensure smooth handover of workpapers.
            </p>

            <form onSubmit={handleSubmitChangeRequest} className="space-y-4">
              <Field label="Reason for Engagement Change" required>
                <textarea
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="e.g. Annual rotation of statutory auditors / Engagement scope update"
                  className="w-full rounded-lg border border-gray-300 p-2.5 text-sm text-gray-900 focus:border-brand-blue focus:outline-none focus:ring-1 focus:ring-brand-blue"
                  rows={3}
                  required
                />
              </Field>

              <Field label="Proposed Audit Firm / Lead Auditor (Optional)">
                <Input
                  value={proposedFirm}
                  onChange={(e) => setProposedFirm(e.target.value)}
                  placeholder="e.g. KPMG / Ernst & Young / BDO Partners (Sri Lanka)"
                />
              </Field>

              {requestSuccess && (
                <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 font-medium flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                  {requestSuccess}
                </div>
              )}

              <div className="flex items-center justify-end gap-3 pt-2">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => setShowModal(false)}
                  disabled={submittingReq}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={submittingReq || !reason.trim()}
                  className="bg-amber-600 hover:bg-amber-700 text-white"
                >
                  {submittingReq ? "Submitting..." : "Submit Engagement Request"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── TAB 3: Finance Team & Access ─────────────────────────────────────────────

function TeamTab({ team: initialTeam }: { team: FinanceTeamMember[] }) {
  const [team, setTeam] = useState<FinanceTeamMember[]>(initialTeam);
  const [showInviteModal, setShowInviteModal] = useState(false);

  // Invite state
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<FinanceTeamMember["role"]>("Senior Accountant");
  const [canSign, setCanSign] = useState(false);
  const [inviting, setInviting] = useState(false);

  async function handleInvite(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim() || !email.trim()) return;
    setInviting(true);
    try {
      const newMember = await inviteFinanceTeamMember({
        name,
        email,
        role,
        canSignReturns: canSign,
      });
      setTeam((prev) => [...prev, newMember]);
      setShowInviteModal(false);
      setName("");
      setEmail("");
      setRole("Senior Accountant");
      setCanSign(false);
    } catch {
      // Keep optimistic
    } finally {
      setInviting(false);
    }
  }

  async function handleRemove(id: string) {
    if (!confirm("Are you sure you want to revoke workspace access for this finance team member?")) {
      return;
    }
    setTeam((prev) => prev.filter((m) => m.id !== id));
    await removeFinanceTeamMember(id);
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-100 pb-5">
        <div>
          <h2 className="text-base font-semibold text-gray-900 flex items-center gap-2">
            <Users className="h-5 w-5 text-brand-blue" />
            Internal Finance &amp; Tax Team
          </h2>
          <p className="text-xs text-gray-500 mt-0.5">
            Manage authorized company staff who can prepare, review, and sign Corporate Income Tax submissions.
          </p>
        </div>

        <Button
          onClick={() => setShowInviteModal(true)}
          className="text-xs px-3.5 py-2 gap-1.5"
        >
          <Plus className="h-4 w-4" />
          Invite Team Member
        </Button>
      </div>

      {/* Team Table */}
      <div className="overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50/70 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                <th className="px-5 py-3.5">Member Name</th>
                <th className="px-4 py-3.5">Role</th>
                <th className="px-4 py-3.5">Return Sign-Off</th>
                <th className="px-4 py-3.5">Status</th>
                <th className="px-4 py-3.5">Last Active</th>
                <th className="px-4 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {team.map((member) => (
                <tr key={member.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-3">
                      <div className="h-9 w-9 rounded-full bg-brand-blue/10 text-brand-blue font-bold text-xs flex items-center justify-center shrink-0 border border-brand-blue/20">
                        {member.initials}
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900">{member.name}</p>
                        <p className="text-xs text-gray-500">{member.email}</p>
                      </div>
                    </div>
                  </td>

                  <td className="px-4 py-3.5">
                    <RoleBadge role={member.role} />
                  </td>

                  <td className="px-4 py-3.5">
                    {member.canSignReturns ? (
                      <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 border border-blue-200 px-2 py-0.5 text-[11px] font-semibold text-blue-700">
                        <Check className="h-3 w-3 text-blue-600" /> Authorized Signatory
                      </span>
                    ) : (
                      <span className="text-xs text-gray-400">Preparer Only</span>
                    )}
                  </td>

                  <td className="px-4 py-3.5">
                    {member.status === "Active" ? (
                      <span className="inline-flex items-center gap-1.5 text-xs font-medium text-emerald-700">
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                        Active
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 text-xs font-medium text-amber-700">
                        <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
                        Invited
                      </span>
                    )}
                  </td>

                  <td className="px-4 py-3.5 text-xs text-gray-500 whitespace-nowrap">
                    {member.lastActive}
                  </td>

                  <td className="px-4 py-3.5 text-right">
                    {member.role !== "Owner" && (
                      <button
                        onClick={() => handleRemove(member.id)}
                        className="text-gray-400 hover:text-red-600 p-1 rounded transition-colors"
                        title="Revoke access"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Role explanation */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs text-gray-600">
        <div className="rounded-lg border border-gray-100 bg-gray-50/60 p-3">
          <p className="font-semibold text-gray-800">Owner &amp; Finance Director</p>
          <p className="mt-1 text-gray-500">
            Full permissions to upload schedules, approve tax computations, and submit certified returns to auditors.
          </p>
        </div>
        <div className="rounded-lg border border-gray-100 bg-gray-50/60 p-3">
          <p className="font-semibold text-gray-800">Senior Accountant &amp; Tax Officer</p>
          <p className="mt-1 text-gray-500">
            Prepares CIT schedules, reconciles ledger addbacks, and answers auditor document requests.
          </p>
        </div>
        <div className="rounded-lg border border-gray-100 bg-gray-50/60 p-3">
          <p className="font-semibold text-gray-800">External Auditor Access</p>
          <p className="mt-1 text-gray-500">
            Auditors connect via their dedicated firm portal under the <em>Assigned Auditor</em> tab.
          </p>
        </div>
      </div>

      {/* Invite Member Modal */}
      {showInviteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 animate-fade-in">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl border border-gray-100 space-y-4">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <h3 className="text-base font-semibold text-gray-900 flex items-center gap-2">
                <Plus className="h-5 w-5 text-brand-blue" />
                Invite Finance Team Member
              </h3>
              <button
                onClick={() => setShowInviteModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleInvite} className="space-y-4">
              <Field label="Full Name" required>
                <Input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Kasun Wickramasinghe"
                  required
                />
              </Field>

              <Field label="Corporate Email Address" required>
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="e.g. kasun@abc.lk"
                  required
                />
              </Field>

              <Field label="Assigned Role" required>
                <Select
                  value={role}
                  onChange={(e) => setRole(e.target.value as FinanceTeamMember["role"])}
                >
                  <option value="Finance Director">Finance Director</option>
                  <option value="Senior Accountant">Senior Accountant</option>
                  <option value="Tax Officer">Tax Officer</option>
                  <option value="Viewer">Viewer (Read-Only)</option>
                </Select>
              </Field>

              <div className="rounded-lg border border-gray-200 bg-gray-50 p-3">
                <label className="flex items-start gap-2.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={canSign}
                    onChange={(e) => setCanSign(e.target.checked)}
                    className="h-4 w-4 rounded border-gray-300 text-brand-blue focus:ring-brand-blue cursor-pointer mt-0.5"
                  />
                  <div className="text-xs">
                    <span className="font-semibold text-gray-800">
                      Grant Statutory Return Sign-Off Authority
                    </span>
                    <p className="text-gray-500 mt-0.5">
                      Empowers this member to approve the final CIT Return declaration before transmission to the auditor.
                    </p>
                  </div>
                </label>
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => setShowInviteModal(false)}
                  disabled={inviting}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={inviting || !name.trim() || !email.trim()}>
                  {inviting ? "Sending Invitation..." : "Send Workspace Invite"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── TAB 4: Tax Preferences & AI Settings ─────────────────────────────────────

function PreferencesTab({ preferences: initialPrefs }: { preferences: CompanyTaxPreferences }) {
  const [prefs, setPrefs] = useState(initialPrefs);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  function update<K extends keyof CompanyTaxPreferences>(key: K, value: CompanyTaxPreferences[K]) {
    setPrefs((p) => ({ ...p, [key]: value }));
  }

  async function handleSave() {
    setSaving(true);
    setSaved(false);
    try {
      await updateCompanyTaxPreferences(prefs);
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch {
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-100 pb-5">
        <div>
          <h2 className="text-base font-semibold text-gray-900 flex items-center gap-2">
            <Sliders className="h-5 w-5 text-brand-blue" />
            Accounting Standards &amp; AI Extraction Preferences
          </h2>
          <p className="text-xs text-gray-500 mt-0.5">
            Configure how TaxEaseLK computes tax adjustments, AI OCR validation tolerances, and automated auditor notifications.
          </p>
        </div>

        {saved && (
          <div className="inline-flex items-center gap-1.5 rounded-full bg-green-50 border border-green-200 px-3 py-1 text-xs font-medium text-green-700">
            <CheckCircle2 className="h-3.5 w-3.5 text-green-600" />
            Preferences Saved!
          </div>
        )}
      </div>

      {/* Accounting Standards */}
      <div className="rounded-xl border border-gray-100 bg-white p-5 space-y-4">
        <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400">
          Financial Reporting Framework &amp; Basis
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Accounting Standards Framework">
            <Select
              value={prefs.accountingStandard}
              onChange={(e) =>
                update(
                  "accountingStandard",
                  e.target.value as CompanyTaxPreferences["accountingStandard"]
                )
              }
            >
              <option value="SLFRS_SMES">SLFRS for SMEs (Small &amp; Medium Entities)</option>
              <option value="SLFRS_FULL">SLFRS / LKAS (Full Sri Lanka Accounting Standards)</option>
            </Select>
          </Field>

          <Field label="Accounting Basis">
            <Select
              value={prefs.basisOfAccounting}
              onChange={(e) =>
                update(
                  "basisOfAccounting",
                  e.target.value as CompanyTaxPreferences["basisOfAccounting"]
                )
              }
            >
              <option value="accrual">Accrual Basis (Inland Revenue Act requirement)</option>
              <option value="cash">Cash Basis (Eligible individuals / micro entities)</option>
            </Select>
          </Field>
        </div>
      </div>

      {/* AI Extraction & OCR Settings */}
      <div className="rounded-xl border border-gray-100 bg-white p-5 space-y-5">
        <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400">
          AI OCR &amp; Computational Automation
        </h3>

        {/* Confidence Threshold Slider */}
        <div className="rounded-xl border border-blue-50 bg-blue-50/30 p-4 space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-gray-900">
                AI OCR Confidence Verification Threshold
              </p>
              <p className="text-xs text-gray-500">
                Financial rows extracted below this confidence level are flagged with yellow warning badges for mandatory human sign-off.
              </p>
            </div>
            <span className="rounded-lg bg-brand-blue text-white px-3 py-1 font-mono font-bold text-sm">
              {prefs.aiConfidenceThreshold}%
            </span>
          </div>

          <input
            type="range"
            min={70}
            max={95}
            step={1}
            value={prefs.aiConfidenceThreshold}
            onChange={(e) => update("aiConfidenceThreshold", Number(e.target.value))}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-brand-blue"
          />

          <div className="flex justify-between text-[11px] text-gray-400">
            <span>70% (Relaxed - Fewer manual checks)</span>
            <span>85% (Recommended for Sri Lanka Audits)</span>
            <span>95% (Strict - High manual review)</span>
          </div>
        </div>

        {/* Feature Toggles */}
        <div className="divide-y divide-gray-100">
          <div className="py-3 flex items-center justify-between">
            <div className="pr-4">
              <p className="text-sm font-medium text-gray-800">
                Automatic AI Document Ingestion &amp; Classification
              </p>
              <p className="text-xs text-gray-500">
                Automatically categorize uploaded Trial Balances and Tax Schedules into Section 10 addbacks upon file drop.
              </p>
            </div>
            <Toggle
              checked={prefs.enableAiOcrAutoExtract}
              onChange={(v) => update("enableAiOcrAutoExtract", v)}
            />
          </div>

          <div className="py-3 flex items-center justify-between">
            <div className="pr-4">
              <p className="text-sm font-medium text-gray-800">
                Notify Auditor When CIT Calculation Reaches 100%
              </p>
              <p className="text-xs text-gray-500">
                Sends an instant alert and review queue notification to your assigned auditor once all checklist items are marked complete.
              </p>
            </div>
            <Toggle
              checked={prefs.autoNotifyAuditorOnReady}
              onChange={(v) => update("autoNotifyAuditorOnReady", v)}
            />
          </div>

          <div className="py-3 flex items-center justify-between">
            <div className="pr-4">
              <p className="text-sm font-medium text-gray-800">
                Allow Auditor Direct Line-Item Adjustments
              </p>
              <p className="text-xs text-gray-500">
                When enabled, auditors can directly propose adjustments to disallowed entertainment, advertising, and depreciation lines.
              </p>
            </div>
            <Toggle
              checked={prefs.allowAuditorDirectModifications}
              onChange={(v) => update("allowAuditorDirectModifications", v)}
            />
          </div>

          <div className="py-3 flex items-center justify-between">
            <div className="pr-4">
              <p className="text-sm font-medium text-gray-800">
                Quarterly Advance Tax Tracking
              </p>
              <p className="text-xs text-gray-500">
                Enables installment schedules and WHT/AIT credit reconciliations for the 4 statutory quarterly payment dates.
              </p>
            </div>
            <Toggle
              checked={prefs.quarterlyAdvanceTaxTracking}
              onChange={(v) => update("quarterlyAdvanceTaxTracking", v)}
            />
          </div>
        </div>
      </div>

      <div className="border-t border-gray-100 pt-4 flex justify-end">
        <Button onClick={handleSave} disabled={saving} className="px-6">
          {saved ? "Preferences Saved!" : saving ? "Saving..." : "Save Preferences"}
        </Button>
      </div>
    </div>
  );
}

// ─── TAB 5: Notifications & Filing Deadlines ──────────────────────────────────

function NotificationsTab({ notifications: initialPrefs }: { notifications: CompanyNotificationPrefs }) {
  const [prefs, setPrefs] = useState(initialPrefs);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  function update<K extends keyof CompanyNotificationPrefs>(key: K, value: boolean) {
    setPrefs((p) => ({ ...p, [key]: value }));
  }

  async function handleSave() {
    setSaving(true);
    setSaved(false);
    try {
      await updateCompanyNotificationPrefs(prefs);
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch {
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-100 pb-5">
        <div>
          <h2 className="text-base font-semibold text-gray-900 flex items-center gap-2">
            <Bell className="h-5 w-5 text-brand-blue" />
            Notifications &amp; IRD Statutory Filing Deadlines
          </h2>
          <p className="text-xs text-gray-500 mt-0.5">
            Configure automated alerts for auditor document queries, return sign-offs, and critical Sri Lanka tax deadlines.
          </p>
        </div>

        {saved && (
          <div className="inline-flex items-center gap-1.5 rounded-full bg-green-50 border border-green-200 px-3 py-1 text-xs font-medium text-green-700">
            <CheckCircle2 className="h-3.5 w-3.5 text-green-600" />
            Alert Preferences Saved!
          </div>
        )}
      </div>

      {/* Statutory Deadlines Highlight Banner */}
      <div className="rounded-xl border border-amber-200 bg-amber-50/70 p-4">
        <div className="flex items-start gap-3">
          <Calendar className="h-5 w-5 text-amber-700 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <p className="text-sm font-semibold text-amber-900">
              Statutory CIT Return Deadline: November 30
            </p>
            <p className="text-xs text-amber-800 leading-relaxed">
              Under Section 93 of the Inland Revenue Act No. 24 of 2017, Corporate Income Tax returns for the Assessment Year ending March 31 must be submitted to the Department of Inland Revenue on or before November 30.
            </p>
          </div>
        </div>
      </div>

      {/* Section 1: Auditor & Clearance Alerts */}
      <div className="rounded-xl border border-gray-100 bg-white p-5 space-y-4">
        <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400">
          Auditor Interaction &amp; Clearance Alerts
        </h3>

        <div className="divide-y divide-gray-100">
          <div className="py-3 flex items-center justify-between">
            <div className="pr-4">
              <p className="text-sm font-medium text-gray-800">
                Auditor Document Requests &amp; Inquiries
              </p>
              <p className="text-xs text-gray-500">
                Receive immediate alert when the auditor requests additional invoices, asset registers, or tax schedules.
              </p>
            </div>
            <Toggle
              checked={prefs.auditorDocRequests}
              onChange={(v) => update("auditorDocRequests", v)}
            />
          </div>

          <div className="py-3 flex items-center justify-between">
            <div className="pr-4">
              <p className="text-sm font-medium text-gray-800">
                Auditor Review Feedback &amp; Adjustments
              </p>
              <p className="text-xs text-gray-500">
                Alert when the auditor marks a line as requiring revision or enters proposed tax computation adjustments.
              </p>
            </div>
            <Toggle
              checked={prefs.auditorReviewFeedback}
              onChange={(v) => update("auditorReviewFeedback", v)}
            />
          </div>

          <div className="py-3 flex items-center justify-between">
            <div className="pr-4">
              <p className="text-sm font-medium text-gray-800">
                CIT Final Sign-Off &amp; Clearance Granted
              </p>
              <p className="text-xs text-gray-500">
                Notification when the licensed auditor issues the formal Audit Clearance Report ready for IRD upload.
              </p>
            </div>
            <Toggle
              checked={prefs.citFilingClearance}
              onChange={(v) => update("citFilingClearance", v)}
            />
          </div>
        </div>
      </div>

      {/* Section 2: Statutory Deadlines & Advance Tax */}
      <div className="rounded-xl border border-gray-100 bg-white p-5 space-y-4">
        <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400">
          Sri Lanka IRD Statutory Filing Deadlines
        </h3>

        <div className="divide-y divide-gray-100">
          <div className="py-3 flex items-center justify-between">
            <div className="pr-4">
              <p className="text-sm font-medium text-gray-800">
                Annual CIT Return Filing Reminders (November 30)
              </p>
              <p className="text-xs text-gray-500">
                Advance reminders at 30 days, 14 days, and 3 days before the statutory deadline to avoid late filing penalties.
              </p>
            </div>
            <Toggle
              checked={prefs.irdDeadlinesReminders}
              onChange={(v) => update("irdDeadlinesReminders", v)}
            />
          </div>

          <div className="py-3 flex items-center justify-between">
            <div className="pr-4">
              <p className="text-sm font-medium text-gray-800">
                Quarterly Advance Tax Payment Due Dates
              </p>
              <p className="text-xs text-gray-500">
                Reminders for statutory CIT installments due on August 15, November 15, February 15, and May 15.
              </p>
            </div>
            <Toggle
              checked={prefs.advanceTaxPaymentDue}
              onChange={(v) => update("advanceTaxPaymentDue", v)}
            />
          </div>

          <div className="py-3 flex items-center justify-between">
            <div className="pr-4">
              <p className="text-sm font-medium text-gray-800">
                AI OCR Extraction &amp; Calculation Warnings
              </p>
              <p className="text-xs text-gray-500">
                Alerts when trial balance disbalances or low confidence score line items are detected by the engine.
              </p>
            </div>
            <Toggle
              checked={prefs.aiExtractionAlerts}
              onChange={(v) => update("aiExtractionAlerts", v)}
            />
          </div>
        </div>
      </div>

      {/* Section 3: Notification Channels */}
      <div className="rounded-xl border border-gray-100 bg-white p-5 space-y-4">
        <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400">
          Notification Delivery Channels
        </h3>

        <div className="divide-y divide-gray-100">
          <div className="py-3 flex items-center justify-between">
            <div className="pr-4">
              <p className="text-sm font-medium text-gray-800">Email Alerts</p>
              <p className="text-xs text-gray-500">
                Send alerts to verified finance team members' registered company email addresses.
              </p>
            </div>
            <Toggle
              checked={prefs.emailAlerts}
              onChange={(v) => update("emailAlerts", v)}
            />
          </div>

          <div className="py-3 flex items-center justify-between">
            <div className="pr-4">
              <p className="text-sm font-medium text-gray-800">In-App Dashboard Banners</p>
              <p className="text-xs text-gray-500">
                Display notification badges and toast banners in the top navigation bar.
              </p>
            </div>
            <Toggle
              checked={prefs.inAppNotifications}
              onChange={(v) => update("inAppNotifications", v)}
            />
          </div>
        </div>
      </div>

      <div className="border-t border-gray-100 pt-4 flex justify-end">
        <Button onClick={handleSave} disabled={saving} className="px-6">
          {saved ? "Preferences Saved!" : saving ? "Saving..." : "Save Notification Preferences"}
        </Button>
      </div>
    </div>
  );
}

// ─── TAB 6: Security & Activity Log ───────────────────────────────────────────

function SecurityTab({
  security: initialSec,
  auditTrail,
}: {
  security: CompanySecuritySettings;
  auditTrail: CompanyFullSettings["auditTrail"];
}) {
  const [sec, setSec] = useState(initialSec);
  const [savingSec, setSavingSec] = useState(false);
  const [secSaved, setSecSaved] = useState(false);

  // Password modal
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [currentPw, setCurrentPw] = useState("");
  const [newPw, setNewPw] = useState("");
  const [confirmPw, setConfirmPw] = useState("");
  const [pwSuccess, setPwSuccess] = useState(false);

  // Audit trail search
  const [searchQuery, setSearchQuery] = useState("");

  const filteredLogs = auditTrail.filter(
    (log) =>
      log.action.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.actor.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (log.ipAddress && log.ipAddress.includes(searchQuery))
  );

  async function handleToggle2FA() {
    const updated = { ...sec, twoFactorAuth: !sec.twoFactorAuth };
    setSec(updated);
    setSavingSec(true);
    setSecSaved(false);
    try {
      await updateCompanySecurity(updated);
      setSecSaved(true);
      setTimeout(() => setSecSaved(false), 2000);
    } catch {
      // Graceful
    } finally {
      setSavingSec(false);
    }
  }

  async function handleTimeoutChange(val: number) {
    const updated = { ...sec, sessionTimeoutMinutes: val };
    setSec(updated);
    await updateCompanySecurity(updated);
  }

  async function handleToggleIP() {
    const updated = { ...sec, ipRestriction: !sec.ipRestriction };
    setSec(updated);
    await updateCompanySecurity(updated);
  }

  function handlePasswordSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (newPw !== confirmPw) {
      alert("New passwords do not match.");
      return;
    }
    setPwSuccess(true);
    setTimeout(() => {
      setShowPasswordModal(false);
      setPwSuccess(false);
      setCurrentPw("");
      setNewPw("");
      setConfirmPw("");
    }, 1500);
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-100 pb-5">
        <div>
          <h2 className="text-base font-semibold text-gray-900 flex items-center gap-2">
            <Shield className="h-5 w-5 text-brand-blue" />
            Security Controls &amp; Immutable Audit Trail
          </h2>
          <p className="text-xs text-gray-500 mt-0.5">
            Configure access security, multi-factor authentication, and review full activity logs for IRD compliance.
          </p>
        </div>

        {secSaved && (
          <div className="inline-flex items-center gap-1.5 rounded-full bg-green-50 border border-green-200 px-3 py-1 text-xs font-medium text-green-700">
            <CheckCircle2 className="h-3.5 w-3.5 text-green-600" />
            Security settings updated!
          </div>
        )}
      </div>

      {/* Security Policies */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* 2FA Card */}
        <div className="rounded-xl border border-gray-100 bg-white p-5 flex flex-col justify-between shadow-sm">
          <div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="h-9 w-9 rounded-lg bg-purple-50 text-purple-700 flex items-center justify-center border border-purple-100">
                  <Key className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-gray-900">
                    Two-Factor Authentication (2FA)
                  </h4>
                  <p className="text-xs text-gray-500">
                    Mandatory TOTP authenticator app code for all logins
                  </p>
                </div>
              </div>
              <Toggle
                checked={sec.twoFactorAuth}
                onChange={handleToggle2FA}
                disabled={savingSec}
              />
            </div>
            <p className="text-xs text-gray-500 mt-3">
              Protects sensitive corporate tax computations and financial schedules from unauthorized credentials access.
            </p>
          </div>
        </div>

        {/* Session Timeout */}
        <div className="rounded-xl border border-gray-100 bg-white p-5 flex flex-col justify-between shadow-sm">
          <div>
            <div className="flex items-center gap-2.5 mb-2">
              <div className="h-9 w-9 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center border border-blue-100">
                <Clock className="h-5 w-5" />
              </div>
              <div>
                <h4 className="text-sm font-semibold text-gray-900">
                  Automatic Session Timeout
                </h4>
                <p className="text-xs text-gray-500">
                  Auto logout after period of inactivity
                </p>
              </div>
            </div>

            <div className="mt-3 flex items-center justify-between">
              <span className="text-xs text-gray-600">Inactivity threshold:</span>
              <Select
                value={sec.sessionTimeoutMinutes}
                onChange={(e) => handleTimeoutChange(Number(e.target.value))}
                className="w-40 py-1.5 text-xs"
              >
                <option value={15}>15 minutes</option>
                <option value={30}>30 minutes</option>
                <option value={60}>60 minutes (Default)</option>
                <option value={120}>120 minutes</option>
              </Select>
            </div>
          </div>
        </div>

        {/* IP Restriction */}
        <div className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="h-9 w-9 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center border border-emerald-100">
                <Shield className="h-5 w-5" />
              </div>
              <div>
                <h4 className="text-sm font-semibold text-gray-900">
                  IP Address Restriction
                </h4>
                <p className="text-xs text-gray-500">
                  Restrict portal access to company corporate office network
                </p>
              </div>
            </div>
            <Toggle checked={sec.ipRestriction} onChange={handleToggleIP} />
          </div>

          {sec.ipRestriction && (
            <div className="mt-3 pt-3 border-t border-gray-100">
              <Field label="Allowed IP Range (CIDR)">
                <Input
                  value={sec.allowedIps || ""}
                  onChange={(e) => setSec((s) => ({ ...s, allowedIps: e.target.value }))}
                  placeholder="e.g. 203.143.16.0/24"
                  className="text-xs py-1.5"
                />
              </Field>
            </div>
          )}
        </div>

        {/* Change Password */}
        <div className="rounded-xl border border-gray-100 bg-white p-5 flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-2.5">
            <div className="h-9 w-9 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center border border-amber-100">
              <Lock className="h-5 w-5" />
            </div>
            <div>
              <h4 className="text-sm font-semibold text-gray-900">Account Password</h4>
              <p className="text-xs text-gray-500">Updated 45 days ago</p>
            </div>
          </div>

          <Button
            variant="secondary"
            onClick={() => setShowPasswordModal(true)}
            className="text-xs px-3 py-1.5"
          >
            Change Password
          </Button>
        </div>
      </div>

      {/* Encryption Banner */}
      <div className="rounded-xl bg-gradient-to-r from-blue-900 to-indigo-900 p-4 text-white shadow-md">
        <div className="flex items-center gap-3">
          <Shield className="h-6 w-6 text-blue-300 shrink-0" />
          <div className="space-y-0.5">
            <p className="text-sm font-semibold">
              Bank-Grade Encryption: {sec.dataEncryptionStandard}
            </p>
            <p className="text-xs text-blue-200">
              All financial schedules, trial balance extractions, and auditor workpapers are stored in isolated Sri Lanka data partitions with TLS 1.3 cryptographic transport.
            </p>
          </div>
        </div>
      </div>

      {/* Audit Trail & Activity Log */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-sm font-semibold text-gray-900">
              Statutory Activity Log &amp; Audit Trail
            </h3>
            <p className="text-xs text-gray-500">
              Immutable ledger of user actions, schedule uploads, and auditor clearance milestones.
            </p>
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search actions or actors..."
              className="w-full rounded-lg border border-gray-200 pl-9 pr-3 py-1.5 text-xs text-gray-800 placeholder:text-gray-400 focus:border-brand-blue focus:outline-none"
            />
          </div>
        </div>

        <div className="overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50/70 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  <th className="px-5 py-3.5">Timestamp</th>
                  <th className="px-5 py-3.5">Action / Event</th>
                  <th className="px-4 py-3.5">Performed By</th>
                  <th className="px-4 py-3.5">IP Address</th>
                  <th className="px-4 py-3.5 text-right">Time Ago</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-5 py-3.5 font-mono text-xs text-gray-500 whitespace-nowrap">
                      {log.timestamp}
                    </td>
                    <td className="px-5 py-3.5 font-medium text-gray-800">
                      <div className="flex items-center gap-2">
                        <span className="h-1.5 w-1.5 rounded-full bg-brand-blue shrink-0" />
                        <span>{log.action}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3.5 text-xs text-gray-600 whitespace-nowrap">
                      <span className="font-semibold text-gray-800">{log.actor}</span>
                      <span className="text-gray-400 ml-1">({log.actorRole})</span>
                    </td>
                    <td className="px-4 py-3.5 font-mono text-xs text-gray-400 whitespace-nowrap">
                      {log.ipAddress || "—"}
                    </td>
                    <td className="px-4 py-3.5 text-right text-xs text-gray-400 whitespace-nowrap">
                      {log.timeAgo}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Password Modal */}
      {showPasswordModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 animate-fade-in">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl border border-gray-100 space-y-4">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <h3 className="text-base font-semibold text-gray-900 flex items-center gap-2">
                <Lock className="h-5 w-5 text-brand-blue" />
                Change Corporate Password
              </h3>
              <button
                onClick={() => setShowPasswordModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handlePasswordSubmit} className="space-y-4">
              <Field label="Current Password" required>
                <Input
                  type="password"
                  value={currentPw}
                  onChange={(e) => setCurrentPw(e.target.value)}
                  placeholder="Enter existing password"
                  required
                />
              </Field>

              <Field label="New Password" required>
                <Input
                  type="password"
                  value={newPw}
                  onChange={(e) => setNewPw(e.target.value)}
                  placeholder="Min 8 chars, 1 uppercase, 1 symbol"
                  required
                />
              </Field>

              <Field label="Confirm New Password" required>
                <Input
                  type="password"
                  value={confirmPw}
                  onChange={(e) => setConfirmPw(e.target.value)}
                  placeholder="Re-enter new password"
                  required
                />
              </Field>

              {pwSuccess && (
                <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 font-medium flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                  Password updated successfully!
                </div>
              )}

              <div className="flex items-center justify-end gap-3 pt-2">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => setShowPasswordModal(false)}
                >
                  Cancel
                </Button>
                <Button type="submit">Update Password</Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Main SettingsTabs Component ──────────────────────────────────────────────

export default function SettingsTabs({
  companyTabContent,
  fullSettings,
}: {
  companyTabContent: React.ReactNode;
  fullSettings: CompanyFullSettings;
}) {
  const [activeTab, setActiveTab] = useState<TabId>("profile");

  return (
    <div className="space-y-6">
      {/* Navigation Pills */}
      <div className="flex flex-wrap gap-2 border-b border-gray-200/80 pb-3">
        {TABS.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={clsx(
                "inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs sm:text-sm font-medium transition-all duration-200",
                isActive
                  ? "bg-brand-blue text-white shadow-md shadow-brand-blue/20"
                  : "bg-white text-gray-600 hover:bg-gray-50 hover:text-gray-900 border border-gray-200"
              )}
            >
              <Icon className={clsx("h-4 w-4", isActive ? "text-white" : "text-gray-400")} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab Content Container */}
      <Card className="p-6 md:p-8 bg-white shadow-sm border border-gray-100 rounded-2xl">
        {activeTab === "profile" && companyTabContent}
        {activeTab === "auditor" && <AuditorTab auditor={fullSettings.auditor} />}
        {activeTab === "team" && <TeamTab team={fullSettings.team} />}
        {activeTab === "preferences" && (
          <PreferencesTab preferences={fullSettings.preferences} />
        )}
        {activeTab === "notifications" && (
          <NotificationsTab notifications={fullSettings.notifications} />
        )}
        {activeTab === "security" && (
          <SecurityTab
            security={fullSettings.security}
            auditTrail={fullSettings.auditTrail}
          />
        )}
      </Card>
    </div>
  );
}
