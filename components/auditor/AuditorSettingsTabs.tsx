"use client";

import { useState } from "react";
import clsx from "clsx";
import {
  User,
  Building2,
  Sliders,
  Bell,
  Shield,
  Plus,
  Mail,
  CheckCircle2,
  Clock,
  Laptop,
  Smartphone,
  Key,
  X,
  Send,
  AlertCircle,
  FileCheck2,
} from "lucide-react";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";
import { Field, Input, Select } from "@/components/ui/Input";
import {
  AuditorFullSettings,
  AuditorTeamMember,
  AuditPreferences,
  AuditorSecuritySettings,
  AuditorNotificationPrefs,
} from "@/lib/types";
import {
  updateAuditPreferences,
  updateAuditorSecurity,
  updateAuditorNotifications,
  inviteAuditorTeamMember,
} from "@/lib/api/auditor";
import { useLanguage } from "@/lib/i18n/LanguageContext";

const TABS = [
  { id: "profile", label: "Profile & Credentials", icon: User },
  { id: "team", label: "Firm & Team", icon: Building2 },
  { id: "preferences", label: "Audit Preferences", icon: Sliders },
  { id: "notifications", label: "Notifications", icon: Bell },
  { id: "security", label: "Security & Access", icon: Shield },
] as const;

type TabId = (typeof TABS)[number]["id"];

function Toggle({
  checked,
  onChange,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={clsx(
        "relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors focus:outline-none focus:ring-2 focus:ring-brand-blue focus:ring-offset-2",
        checked ? "bg-brand-blue" : "bg-gray-200"
      )}
    >
      <span
        className={clsx(
          "inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition-transform",
          checked ? "translate-x-5" : "translate-x-0"
        )}
      />
    </button>
  );
}

function RoleBadge({ role }: { role: AuditorTeamMember["role"] }) {
  const tones: Record<AuditorTeamMember["role"], string> = {
    "Audit Partner": "bg-purple-100 text-purple-700",
    "Senior Auditor": "bg-blue-100 text-blue-700",
    "Audit Assistant": "bg-emerald-100 text-emerald-700",
    "Tax Specialist": "bg-amber-100 text-amber-700",
  };
  return (
    <span className={clsx("rounded-full px-2.5 py-0.5 text-xs font-semibold", tones[role])}>
      {role}
    </span>
  );
}

export default function AuditorSettingsTabs({
  initial,
  profileTabContent,
}: {
  initial: AuditorFullSettings;
  profileTabContent: React.ReactNode;
}) {
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState<TabId>("profile");
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Sub-states
  const [team, setTeam] = useState<AuditorTeamMember[]>(initial.team);
  const [preferences, setPreferences] = useState<AuditPreferences>(initial.preferences);
  const [notifications, setNotifications] = useState<AuditorNotificationPrefs>(initial.notifications);
  const [security, setSecurity] = useState<AuditorSecuritySettings>(initial.security);

  // Invite Modal
  const [inviteModalOpen, setInviteModalOpen] = useState(false);
  const [inviteForm, setInviteForm] = useState({
    name: "",
    email: "",
    role: "Senior Auditor" as AuditorTeamMember["role"],
  });
  const [inviting, setInviting] = useState(false);

  // Password state
  const [passwordForm, setPasswordForm] = useState({
    current: "",
    newPassword: "",
    confirm: "",
  });
  const [passwordMsg, setPasswordMsg] = useState("");

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage((c) => (c === msg ? null : c));
    }, 3500);
  };

  // --- Handlers ---
  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteForm.name || !inviteForm.email) return;
    setInviting(true);
    const created = await inviteAuditorTeamMember(inviteForm);
    setTeam((prev) => [...prev, created]);
    setInviting(false);
    setInviteModalOpen(false);
    setInviteForm({ name: "", email: "", role: "Senior Auditor" });
    showToast(`Invitation sent to ${created.email}`);
  };

  const handleUpdatePreferences = async (newPrefs: Partial<AuditPreferences>) => {
    const updated = { ...preferences, ...newPrefs };
    setPreferences(updated);
    await updateAuditPreferences(newPrefs);
    showToast("Audit preferences saved!");
  };

  const handleUpdateNotifications = async (newNotifs: Partial<AuditorNotificationPrefs>) => {
    const updated = { ...notifications, ...newNotifs };
    setNotifications(updated);
    await updateAuditorNotifications(newNotifs);
    showToast("Notification preferences updated!");
  };

  const handleUpdateSecurity = async (newSec: Partial<AuditorSecuritySettings>) => {
    const updated = { ...security, ...newSec };
    setSecurity(updated);
    await updateAuditorSecurity(newSec);
    showToast("Security settings updated!");
  };

  const handleChangePassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (!passwordForm.current || !passwordForm.newPassword) return;
    if (passwordForm.newPassword !== passwordForm.confirm) {
      setPasswordMsg("New passwords do not match.");
      return;
    }
    setPasswordMsg("Password updated successfully!");
    setPasswordForm({ current: "", newPassword: "", confirm: "" });
    showToast("Account password changed successfully!");
    setTimeout(() => setPasswordMsg(""), 4000);
  };

  return (
    <div>
      {/* Floating Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2 rounded-xl bg-gray-900 px-4 py-3 text-sm font-medium text-white shadow-xl">
          <CheckCircle2 className="h-4 w-4 text-green-400" />
          <span>{toastMessage}</span>
          <button
            onClick={() => setToastMessage(null)}
            className="ml-2 text-gray-400 hover:text-white"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Tab Pills Header */}
      <div className="mb-6 flex flex-wrap items-center gap-2 border-b border-gray-200 pb-3">
        {TABS.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          const labelMap: Record<string, string> = {
            profile: t("auditor.settings.tabProfile"),
            team: t("auditor.settings.tabFirmTeam"),
            preferences: t("auditor.settings.tabPreferences"),
            notifications: t("auditor.settings.tabNotifications"),
            security: t("auditor.settings.tabSecurity"),
          };
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={clsx(
                "flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition-all",
                isActive
                  ? "bg-brand-blue text-white shadow-sm"
                  : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-50 hover:text-gray-900"
              )}
            >
              <Icon className={clsx("h-4 w-4", isActive ? "text-white" : "text-gray-400")} />
              {labelMap[tab.id] || tab.label}
            </button>
          );
        })}
      </div>

      {/* Tab Panels */}
      <Card className="p-6 sm:p-8">
        {/* Tab 1: Profile & Credentials */}
        {activeTab === "profile" && profileTabContent}

        {/* Tab 2: Firm & Team */}
        {activeTab === "team" && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-5 border-b border-gray-100">
              <div>
                <h2 className="text-lg font-bold text-gray-900">
                  Audit Firm &amp; Practice Team
                </h2>
                <p className="text-xs text-gray-500 mt-1">
                  Manage colleagues, audit assistants, and partner permissions for assigned client audits.
                </p>
              </div>
              <Button
                icon={<Plus className="h-4 w-4" />}
                onClick={() => setInviteModalOpen(true)}
              >
                Invite Staff Member
              </Button>
            </div>

            {/* Firm Overview Card */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 rounded-xl border border-gray-200 bg-gray-50/70 p-4">
              <div>
                <span className="text-xs font-semibold uppercase tracking-wider text-gray-400">
                  {t("auditor.settings.org")}
                </span>
                <p className="text-sm font-bold text-gray-900 mt-0.5">
                  {initial.profile.organization}
                </p>
              </div>
              <div>
                <span className="text-xs font-semibold uppercase tracking-wider text-gray-400">
                  {t("auditor.settings.firmReg")}
                </span>
                <p className="text-sm font-bold text-gray-900 mt-0.5">
                  {initial.profile.firmRegNo || "PV-98214 / CA-AF-552"}
                </p>
              </div>
              <div>
                <span className="text-xs font-semibold uppercase tracking-wider text-gray-400">
                  Registered Office
                </span>
                <p className="text-sm font-medium text-gray-700 mt-0.5 truncate">
                  {initial.profile.firmAddress || "Level 7, World Trade Center, Colombo 01"}
                </p>
              </div>
            </div>

            {/* Team Table */}
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-3">
                Team Members ({team.length})
              </h3>
              <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="border-b border-gray-200 bg-gray-50 text-xs font-semibold uppercase tracking-wide text-gray-500">
                      <th className="px-4 py-3">Member</th>
                      <th className="px-4 py-3">Audit Role</th>
                      <th className="px-4 py-3">Assigned Clients</th>
                      <th className="px-4 py-3">Status</th>
                      <th className="px-4 py-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {team.map((member) => (
                      <tr key={member.id} className="hover:bg-gray-50/60 transition-colors">
                        <td className="px-4 py-3.5">
                          <div className="flex items-center gap-3">
                            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-blue-100 text-xs font-bold text-brand-blue">
                              {member.initials}
                            </div>
                            <div>
                              <p className="font-semibold text-gray-900">{member.name}</p>
                              <p className="text-xs text-gray-400">{member.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3.5">
                          <RoleBadge role={member.role} />
                        </td>
                        <td className="px-4 py-3.5 text-xs text-gray-600 font-medium">
                          {member.assignedCompaniesCount} Companies
                        </td>
                        <td className="px-4 py-3.5">
                          <span
                            className={clsx(
                              "inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium",
                              member.status === "Active"
                                ? "bg-emerald-50 text-emerald-700"
                                : "bg-amber-50 text-amber-700"
                            )}
                          >
                            <span
                              className={clsx(
                                "h-1.5 w-1.5 rounded-full",
                                member.status === "Active" ? "bg-emerald-500" : "bg-amber-500"
                              )}
                            />
                            {member.status}
                          </span>
                        </td>
                        <td className="px-4 py-3.5 text-right">
                          <button
                            onClick={() => showToast(`Settings for ${member.name} opened`)}
                            className="text-xs font-semibold text-brand-blue hover:underline"
                          >
                            Manage
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Tab 3: Audit Preferences & Standards */}
        {activeTab === "preferences" && (
          <div className="space-y-6">
            <div className="pb-5 border-b border-gray-100">
              <h2 className="text-lg font-bold text-gray-900">
                Audit Preferences &amp; Frameworks
              </h2>
              <p className="text-xs text-gray-500 mt-1">
                Configure default accounting rules, tax year cycles, and automated client communication templates.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <Field label={t("auditor.settings.taxYear")}>
                <Select
                  value={preferences.defaultTaxYear}
                  onChange={(e) =>
                    handleUpdatePreferences({ defaultTaxYear: e.target.value })
                  }
                >
                  <option value="2025/26 (Apr 1 - Mar 31)">2025/26 (Apr 1, 2025 - Mar 31, 2026)</option>
                  <option value="2024/25 (Apr 1 - Mar 31)">2024/25 (Apr 1, 2024 - Mar 31, 2025)</option>
                  <option value="2026/27 (Apr 1 - Mar 31)">2026/27 (Apr 1, 2026 - Mar 31, 2027)</option>
                </Select>
              </Field>

              <Field label={t("auditor.settings.framework")}>
                <Select
                  value={preferences.accountingStandard}
                  onChange={(e) =>
                    handleUpdatePreferences({
                      accountingStandard: e.target.value as AuditPreferences["accountingStandard"],
                    })
                  }
                >
                  <option value="SLFRS / LKAS for SMEs">SLFRS / LKAS for SMEs (Standard Corporate)</option>
                  <option value="Full SLFRS">Full SLFRS (Listed &amp; Financial Entities)</option>
                  <option value="Tax Basis of Accounting">Tax Basis of Accounting (Inland Revenue Act)</option>
                </Select>
              </Field>

              <Field label={t("auditor.settings.threshold")}>
                <div className="flex items-center gap-3">
                  <Input
                    type="number"
                    step="0.5"
                    min="1"
                    max="10"
                    value={preferences.materialityThresholdPercent}
                    onChange={(e) =>
                      handleUpdatePreferences({
                        materialityThresholdPercent: parseFloat(e.target.value) || 5.0,
                      })
                    }
                  />
                  <span className="text-xs text-gray-500 font-medium">
                    (Standard benchmark: 5.0%)
                  </span>
                </div>
              </Field>
            </div>

            {/* Workflow Automation Rules */}
            <div className="pt-5 border-t border-gray-100">
              <h3 className="text-sm font-bold uppercase tracking-wider text-gray-500 mb-3">
                Automation &amp; Client Onboarding Rules
              </h3>

              <div className="space-y-3">
                <div className="flex items-center justify-between rounded-xl border border-gray-200 bg-gray-50/70 p-4">
                  <div>
                    <p className="text-sm font-semibold text-gray-900">
                      Auto-request standard document pack on new client connection
                    </p>
                    <p className="text-xs text-gray-500 mt-0.5">
                      Automatically generates requests for Trial Balance, General Ledger, and Fixed Asset Schedule upon client invite acceptance.
                    </p>
                  </div>
                  <Toggle
                    checked={preferences.autoRequestStandardPackOnConnect}
                    onChange={(v) =>
                      handleUpdatePreferences({ autoRequestStandardPackOnConnect: v })
                    }
                  />
                </div>

                <div className="flex items-center justify-between rounded-xl border border-gray-200 bg-gray-50/70 p-4">
                  <div>
                    <p className="text-sm font-semibold text-gray-900">
                      Strict RAMIS Inland Revenue VAT Reconciliation
                    </p>
                    <p className="text-xs text-gray-500 mt-0.5">
                      Flag any variance exceeding Rs. 25,000 between general ledger sales and quarterly RAMIS VAT returns.
                    </p>
                  </div>
                  <Toggle
                    checked={preferences.strictVatReconciliation}
                    onChange={(v) =>
                      handleUpdatePreferences({ strictVatReconciliation: v })
                    }
                  />
                </div>
              </div>
            </div>

            {/* Client Reminder Schedule */}
            <div className="pt-5 border-t border-gray-100">
              <h3 className="text-sm font-bold uppercase tracking-wider text-gray-500 mb-2">
                Automated Filing Deadline Reminders
              </h3>
              <p className="text-xs text-gray-500 mb-3">
                Automatically dispatch notification alerts to clients before the November 30th statutory Corporate Income Tax filing deadline:
              </p>
              <div className="flex flex-wrap items-center gap-3">
                {[14, 7, 3].map((days) => {
                  const isChecked = preferences.autoRemindDaysBeforeDeadline.includes(days);
                  return (
                    <button
                      key={days}
                      type="button"
                      onClick={() => {
                        const next = isChecked
                          ? preferences.autoRemindDaysBeforeDeadline.filter((d) => d !== days)
                          : [...preferences.autoRemindDaysBeforeDeadline, days];
                        handleUpdatePreferences({ autoRemindDaysBeforeDeadline: next });
                      }}
                      className={clsx(
                        "flex items-center gap-2 rounded-lg border px-3.5 py-2 text-xs font-semibold transition-colors",
                        isChecked
                          ? "border-brand-blue bg-blue-50 text-brand-blue"
                          : "border-gray-200 bg-white text-gray-600 hover:bg-gray-50"
                      )}
                    >
                      <span
                        className={clsx(
                          "h-2 w-2 rounded-full",
                          isChecked ? "bg-brand-blue" : "bg-gray-300"
                        )}
                      />
                      {days} Days Before Deadline
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* Tab 4: Notifications & Alerts */}
        {activeTab === "notifications" && (
          <div className="space-y-6">
            <div className="pb-5 border-b border-gray-100">
              <h2 className="text-lg font-bold text-gray-900">
                Auditor Notification Preferences
              </h2>
              <p className="text-xs text-gray-500 mt-1">
                Choose what events trigger immediate alerts or email summaries during tax review periods.
              </p>
            </div>

            <div className="space-y-3">
              {[
                {
                  key: "clientDocumentUploaded" as const,
                  title: "New Client Financial Document Uploaded",
                  desc: "Instant notification when an assigned company uploads new financial statements, ledgers, or schedules.",
                },
                {
                  key: "clientResponseReceived" as const,
                  title: "Client Responded to Auditor Request",
                  desc: "Get notified as soon as a client submits answers or files in the Responses tab.",
                },
                {
                  key: "discussionMessageReceived" as const,
                  title: "New Message in Audit Discussions",
                  desc: "Alerts for questions, clarifications, or replies in company discussion threads.",
                },
                {
                  key: "deadlineApproaching" as const,
                  title: "CIT Statutory Deadline Approaching",
                  desc: "Receive countdown alerts 14, 7, and 3 days before Inland Revenue filing cut-offs.",
                },
                {
                  key: "clientInvitationReceived" as const,
                  title: "Client Audit Engagement Invitations",
                  desc: "Immediate notification when a new business invites your firm for tax preparation review.",
                },
              ].map(({ key, title, desc }) => (
                <div
                  key={key}
                  className="flex items-center justify-between rounded-xl border border-gray-200 bg-gray-50/70 p-4"
                >
                  <div>
                    <p className="text-sm font-semibold text-gray-900">{title}</p>
                    <p className="text-xs text-gray-500 mt-0.5">{desc}</p>
                  </div>
                  <Toggle
                    checked={notifications[key]}
                    onChange={(v) => handleUpdateNotifications({ [key]: v })}
                  />
                </div>
              ))}
            </div>

            {/* Email Digest Frequency */}
            <div className="pt-5 border-t border-gray-100">
              <h3 className="text-sm font-bold uppercase tracking-wider text-gray-500 mb-3">
                Email Summary Frequency
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {[
                  { id: "instant", label: "Instant Alerts", hint: "Immediate emails for each item" },
                  { id: "daily_digest", label: "Daily Summary", hint: "Single digest every morning (8:00 AM)" },
                  { id: "weekly", label: "Weekly Report", hint: "Summary every Monday" },
                ].map((option) => (
                  <button
                    key={option.id}
                    type="button"
                    onClick={() =>
                      handleUpdateNotifications({
                        digestFrequency: option.id as AuditorNotificationPrefs["digestFrequency"],
                      })
                    }
                    className={clsx(
                      "flex flex-col text-left rounded-xl border p-4 transition-all",
                      notifications.digestFrequency === option.id
                        ? "border-brand-blue bg-blue-50/50 shadow-sm"
                        : "border-gray-200 bg-white hover:bg-gray-50"
                    )}
                  >
                    <span className="text-sm font-bold text-gray-900">{option.label}</span>
                    <span className="text-xs text-gray-500 mt-1">{option.hint}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Tab 5: Security & Access */}
        {activeTab === "security" && (
          <div className="space-y-6">
            <div className="pb-5 border-b border-gray-100">
              <h2 className="text-lg font-bold text-gray-900">
                Security &amp; Practitioner Access
              </h2>
              <p className="text-xs text-gray-500 mt-1">
                Safeguard confidential client financial data with multi-factor authentication and session policies.
              </p>
            </div>

            {/* Security Toggles */}
            <div className="space-y-3">
              <div className="flex items-center justify-between rounded-xl border border-gray-200 bg-gray-50/70 p-4">
                <div>
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-semibold text-gray-900">
                      Two-Factor Authentication (2FA)
                    </p>
                    <Badge tone={security.twoFactorEnabled ? "success" : "warning"}>
                      {security.twoFactorEnabled ? "Enabled" : "Disabled"}
                    </Badge>
                  </div>
                  <p className="text-xs text-gray-500 mt-0.5">
                    Require Google Authenticator or SMS verification code on login.
                  </p>
                </div>
                <Toggle
                  checked={security.twoFactorEnabled}
                  onChange={(v) => handleUpdateSecurity({ twoFactorEnabled: v })}
                />
              </div>

              <div className="flex items-center justify-between rounded-xl border border-gray-200 bg-gray-50/70 p-4">
                <div>
                  <p className="text-sm font-semibold text-gray-900">
                    Session Inactivity Timeout
                  </p>
                  <p className="text-xs text-gray-500 mt-0.5">
                    Automatically log out after inactivity to protect client books on unattended workstations.
                  </p>
                </div>
                <select
                  value={security.sessionTimeoutMinutes}
                  onChange={(e) =>
                    handleUpdateSecurity({ sessionTimeoutMinutes: parseInt(e.target.value, 10) })
                  }
                  className="rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-xs font-semibold text-gray-700 focus:border-brand-blue focus:outline-none"
                >
                  <option value={15}>15 Minutes</option>
                  <option value={30}>30 Minutes</option>
                  <option value={60}>60 Minutes</option>
                  <option value={120}>2 Hours</option>
                </select>
              </div>

              <div className="flex items-center justify-between rounded-xl border border-gray-200 bg-gray-50/70 p-4">
                <div>
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-semibold text-gray-900">
                      Immutable Audit Trail Logging
                    </p>
                    <Badge tone="neutral">Standard Enforced</Badge>
                  </div>
                  <p className="text-xs text-gray-500 mt-0.5">
                    Complies with ICASL regulations: all approvals, variance flags, and modifications are recorded immutably.
                  </p>
                </div>
                <Toggle checked={true} onChange={() => null} />
              </div>
            </div>

            {/* Change Password */}
            <div className="pt-5 border-t border-gray-100">
              <h3 className="text-sm font-bold uppercase tracking-wider text-gray-500 mb-3">
                Change Account Password
              </h3>
              <form onSubmit={handleChangePassword} className="max-w-md space-y-3">
                {passwordMsg && (
                  <p
                    className={clsx(
                      "text-xs font-semibold",
                      passwordMsg.includes("success") ? "text-emerald-600" : "text-rose-600"
                    )}
                  >
                    {passwordMsg}
                  </p>
                )}
                <Field label="Current Password">
                  <Input
                    type="password"
                    value={passwordForm.current}
                    onChange={(e) =>
                      setPasswordForm((p) => ({ ...p, current: e.target.value }))
                    }
                    placeholder="••••••••"
                  />
                </Field>
                <Field label="New Password">
                  <Input
                    type="password"
                    value={passwordForm.newPassword}
                    onChange={(e) =>
                      setPasswordForm((p) => ({ ...p, newPassword: e.target.value }))
                    }
                    placeholder="••••••••"
                  />
                </Field>
                <Field label="Confirm New Password">
                  <Input
                    type="password"
                    value={passwordForm.confirm}
                    onChange={(e) =>
                      setPasswordForm((p) => ({ ...p, confirm: e.target.value }))
                    }
                    placeholder="••••••••"
                  />
                </Field>
                <div className="pt-2">
                  <Button type="submit">Update Password</Button>
                </div>
              </form>
            </div>

            {/* Active Sessions */}
            <div className="pt-5 border-t border-gray-100">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-bold uppercase tracking-wider text-gray-500">
                  Active Login Sessions
                </h3>
                <button
                  type="button"
                  onClick={() => showToast("Terminated other active sessions")}
                  className="text-xs font-semibold text-rose-600 hover:underline"
                >
                  Log Out All Other Sessions
                </button>
              </div>

              <div className="space-y-2.5">
                {security.activeSessions.map((s) => (
                  <div
                    key={s.id}
                    className="flex items-center justify-between rounded-xl border border-gray-200 bg-white p-3.5 shadow-sm"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gray-100 text-gray-600">
                        {s.device.toLowerCase().includes("pc") ? (
                          <Laptop className="h-5 w-5" />
                        ) : (
                          <Smartphone className="h-5 w-5" />
                        )}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-bold text-gray-900">{s.device}</p>
                          {s.isCurrent && (
                            <span className="rounded bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-700">
                              Current Device
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-gray-400">
                          {s.browser} • {s.ipAddress}
                        </p>
                      </div>
                    </div>
                    <span className="text-xs font-medium text-gray-500">{s.lastActive}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </Card>

      {/* Invite Member Modal */}
      {inviteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 animate-in fade-in">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <h3 className="text-base font-bold text-gray-900">
                Invite Staff Member to Firm
              </h3>
              <button
                onClick={() => setInviteModalOpen(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleInvite} className="mt-4 space-y-4">
              <Field label="Full Name" required>
                <Input
                  required
                  placeholder="e.g. Ruwan Jayasuriya"
                  value={inviteForm.name}
                  onChange={(e) =>
                    setInviteForm((f) => ({ ...f, name: e.target.value }))
                  }
                />
              </Field>

              <Field label="Work Email Address" required>
                <Input
                  type="email"
                  required
                  placeholder="e.g. ruwan.j@karunaratne.lk"
                  value={inviteForm.email}
                  onChange={(e) =>
                    setInviteForm((f) => ({ ...f, email: e.target.value }))
                  }
                />
              </Field>

              <Field label="Audit Practice Role" required>
                <Select
                  value={inviteForm.role}
                  onChange={(e) =>
                    setInviteForm((f) => ({
                      ...f,
                      role: e.target.value as AuditorTeamMember["role"],
                    }))
                  }
                >
                  <option value="Senior Auditor">Senior Auditor</option>
                  <option value="Audit Assistant">Audit Assistant</option>
                  <option value="Tax Specialist">Tax Specialist</option>
                  <option value="Audit Partner">Audit Partner</option>
                </Select>
              </Field>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-gray-100">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => setInviteModalOpen(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={inviting}>
                  {inviting ? "Sending Invite..." : "Send Invitation"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
