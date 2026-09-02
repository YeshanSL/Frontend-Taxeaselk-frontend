"use client";

import { useState } from "react";
import clsx from "clsx";
import Card from "@/components/ui/Card";
import UsersTab from "./UsersTab";

// ─── Types ────────────────────────────────────────────────────────────────────
// All data here uses the shape your API will return.
// Replace the MOCK_* constants below with real fetch() calls when the
// backend is ready — the components themselves won't need to change.

interface UserRow {
  id: string;
  name: string;
  initials: string;
  role: "Owner" | "Admin" | "Auditor";
  email: string;
  status: "Active" | "Inactive";
}

interface SecuritySettings {
  twoFactorAuth: boolean;
  sessionTimeout: boolean;
  auditTrail: boolean;
  ipRestriction: boolean;
}

interface NotificationPrefs {
  auditorReview: boolean;
  auditorRequestedDocs: boolean;
  citValidationIssues: boolean;
  citApproved: boolean;
  newDocumentUploaded: boolean;
  financialValueModified: boolean;
}

interface AuditLogEntry {
  id: string;
  action: string;
  actor: string;
  actorRole: string;
  timeAgo: string;
}

// ─── Mock data ────────────────────────────────────────────────────────────────
// Swap each of these for an API call when the backend is ready.

const MOCK_USERS: UserRow[] = [
  {
    id: "u1",
    name: "Samantha Perera",
    initials: "SP",
    role: "Owner",
    email: "samantha@abc.pvt.lk",
    status: "Active",
  },
  {
    id: "u2",
    name: "Nihal Fernando",
    initials: "NF",
    role: "Admin",
    email: "nihal@abc.pvt.lk",
    status: "Active",
  },
  {
    id: "u3",
    name: "Mr. Karunaratne",
    initials: "MK",
    role: "Auditor",
    email: "audit@karunaratne.lk",
    status: "Active",
  },
];

const MOCK_SECURITY: SecuritySettings = {
  twoFactorAuth: true,
  sessionTimeout: true,
  auditTrail: true,
  ipRestriction: false,
};

const MOCK_NOTIFICATIONS: NotificationPrefs = {
  auditorReview: true,
  auditorRequestedDocs: true,
  citValidationIssues: true,
  citApproved: true,
  newDocumentUploaded: true,
  financialValueModified: true,
};

const MOCK_AUDIT_LOG: AuditLogEntry[] = [
  { id: "al1", action: "Submitted for Auditor Review", actor: "Samantha Perera", actorRole: "Company Admin", timeAgo: "2 hours ago" },
  { id: "al2", action: "CIT calculation generated", actor: "Samantha Perera", actorRole: "Company Admin", timeAgo: "3 hours ago" },
  { id: "al3", action: "Tax adjustments reviewed", actor: "Samantha Perera", actorRole: "Company Admin", timeAgo: "5 hours ago" },
  { id: "al4", action: "AI extraction completed — 109 values extracted", actor: "AI Engine", actorRole: "AI Engine", timeAgo: "6 hours ago" },
  { id: "al5", action: "Document validation completed", actor: "Samantha Perera", actorRole: "Company Admin", timeAgo: "7 hours ago" },
  { id: "al6", action: "Financial Statements.pdf uploaded", actor: "Samantha Perera", actorRole: "Company Admin", timeAgo: "8 hours ago" },
  { id: "al7", action: "Previous CIT Return.pdf uploaded", actor: "Samantha Perera", actorRole: "Company Admin", timeAgo: "9 hours ago" },
  { id: "al8", action: "Company profile updated", actor: "Samantha Perera", actorRole: "Company Admin", timeAgo: "1 day ago" },
];

// ─── Sub-components ───────────────────────────────────────────────────────────

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

function Checkbox({
  checked,
  onChange,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <input
      type="checkbox"
      checked={checked}
      onChange={(e) => onChange(e.target.checked)}
      className="h-4 w-4 rounded border-gray-300 text-brand-blue focus:ring-brand-blue cursor-pointer"
    />
  );
}

function RoleBadge({ role }: { role: UserRow["role"] }) {
  const colors: Record<UserRow["role"], string> = {
    Owner: "bg-purple-100 text-purple-700",
    Admin: "bg-blue-100 text-blue-700",
    Auditor: "bg-amber-100 text-amber-700",
  };
  return (
    <span className={clsx("rounded-full px-2.5 py-0.5 text-xs font-medium", colors[role])}>
      {role}
    </span>
  );
}

function Avatar({ initials, role }: { initials: string; role: UserRow["role"] }) {
  const colors: Record<UserRow["role"], string> = {
    Owner: "bg-purple-100 text-purple-700",
    Admin: "bg-blue-100 text-blue-700",
    Auditor: "bg-amber-100 text-amber-700",
  };
  return (
    <span className={clsx("inline-flex h-8 w-8 items-center justify-center rounded-full text-xs font-semibold", colors[role])}>
      {initials}
    </span>
  );
}

// ─── Tab content components ───────────────────────────────────────────────────

function UsersTab() {
  const users = MOCK_USERS; // replace with: const [users] = useState(await getUsers())

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <p className="font-semibold text-gray-800">Users &amp; Access</p>
      </div>

      <div className="overflow-hidden rounded-lg border border-gray-100">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50 text-left text-xs font-medium uppercase tracking-wide text-gray-500">
              <th className="px-4 py-3">Name</th>
              <th className="px-4 py-3">Role</th>
              <th className="px-4 py-3">Email</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {users.map((u) => (
              <tr key={u.id} className="bg-white">
                <td className="flex items-center gap-3 px-4 py-3">
                  <Avatar initials={u.initials} role={u.role} />
                  <span className="font-medium text-gray-800">{u.name}</span>
                </td>
                <td className="px-4 py-3">
                  <RoleBadge role={u.role} />
                </td>
                <td className="px-4 py-3 text-gray-500">{u.email}</td>
                <td className="px-4 py-3">
                  <span className="inline-flex items-center gap-1.5 text-xs font-medium text-green-700">
                    <span className="h-1.5 w-1.5 rounded-full bg-green-500" />
                    {u.status}
                  </span>
                </td>
                <td className="px-4 py-3 text-right">
                  {u.role !== "Auditor" && (
                    <button className="text-xs text-brand-blue hover:underline">
                      Edit
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p className="mt-3 flex items-center gap-1.5 text-xs text-amber-600">
        <svg className="h-3.5 w-3.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M8.485 2.495c.673-1.167 2.357-1.167 3.03 0l6.28 10.875c.673 1.167-.17 2.625-1.516 2.625H3.72c-1.347 0-2.189-1.458-1.515-2.625L8.485 2.495zM10 5a.75.75 0 01.75.75v3.5a.75.75 0 01-1.5 0v-3.5A.75.75 0 0110 5zm0 9a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
        </svg>
        The company cannot modify Auditor accounts. Auditor access is read-only from the company side.
      </p>
    </div>
  );
}

function SecurityTab() {
  const [settings, setSettings] = useState<SecuritySettings>(MOCK_SECURITY);
  // replace MOCK_SECURITY with: await getSecuritySettings()

  function update<K extends keyof SecuritySettings>(key: K, value: boolean) {
    setSettings((s) => ({ ...s, [key]: value }));
    // TODO: PATCH /companies/me/settings/security
  }

  const rows: { key: keyof SecuritySettings; label: string; description: string }[] = [
    { key: "twoFactorAuth", label: "Two-Factor Authentication", description: "Require 2FA for all logins" },
    { key: "sessionTimeout", label: "Session Timeout", description: "Auto logout after 60 minutes of inactivity" },
    { key: "auditTrail", label: "Audit Trail", description: "Record all user actions (cannot be disabled)" },
    { key: "ipRestriction", label: "IP Restriction", description: "Limit access to specific IP ranges" },
  ];

  return (
    <div>
      <p className="mb-4 font-semibold text-gray-800">Security Settings</p>
      <div className="flex flex-col gap-4">
        {rows.map(({ key, label, description }) => (
          <div key={key} className="flex items-center justify-between rounded-lg border border-gray-100 bg-gray-50 px-4 py-3">
            <div>
              <p className="text-sm font-medium text-gray-800">{label}</p>
              <p className="text-xs text-gray-500">{description}</p>
            </div>
            <Toggle
              checked={settings[key]}
              onChange={(v) => key !== "auditTrail" && update(key, v)}
            />
          </div>
        ))}
      </div>

      <p className="mt-4 flex items-center gap-1.5 rounded-lg border border-blue-100 bg-blue-50 px-4 py-3 text-xs text-blue-700">
        <svg className="h-3.5 w-3.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a.75.75 0 000 1.5h.253a.25.25 0 01.244.304l-.459 2.066A1.75 1.75 0 0010.747 15H11a.75.75 0 000-1.5h-.253a.25.25 0 01-.244-.304l.459-2.066A1.75 1.75 0 009.253 9H9z" clipRule="evenodd" />
        </svg>
        All data is encrypted at rest and in transit. SSL/TLS enforced. Role-based access controls active.
      </p>
    </div>
  );
}

function NotificationsTab() {
  const [prefs, setPrefs] = useState<NotificationPrefs>(MOCK_NOTIFICATIONS);
  // replace MOCK_NOTIFICATIONS with: await getNotificationPrefs()

  function update<K extends keyof NotificationPrefs>(key: K, value: boolean) {
    setPrefs((p) => ({ ...p, [key]: value }));
    // TODO: PATCH /companies/me/settings/notifications
  }

  const rows: { key: keyof NotificationPrefs; label: string }[] = [
    { key: "auditorReview", label: "Your CIT computation requires Auditor review." },
    { key: "auditorRequestedDocs", label: "Auditor requested supporting documentation." },
    { key: "citValidationIssues", label: "CIT validation found issues." },
    { key: "citApproved", label: "Your CIT computation has been approved." },
    { key: "newDocumentUploaded", label: "New document uploaded." },
    { key: "financialValueModified", label: "Financial value modified." },
  ];

  return (
    <div>
      <p className="mb-4 font-semibold text-gray-800">Notification Preferences</p>
      <div className="flex flex-col divide-y divide-gray-100">
        {rows.map(({ key, label }) => (
          <div key={key} className="flex items-center justify-between py-3">
            <p className="text-sm text-gray-700">{label}</p>
            <Checkbox
              checked={prefs[key]}
              onChange={(v) => update(key, v)}
            />
          </div>
        ))}
      </div>
    </div>
  );
}

function AuditLogTab() {
  const entries = MOCK_AUDIT_LOG; // replace with: await getCompanyAuditLog()

  return (
    <div>
      <p className="mb-4 font-semibold text-gray-800">Audit Log</p>
      <ul className="flex flex-col gap-1">
        {entries.map((e) => (
          <li key={e.id} className="flex items-start gap-3 rounded-lg px-3 py-2.5 hover:bg-gray-50">
            <span className="mt-1.5 h-2 w-2 flex-shrink-0 rounded-full bg-brand-blue" />
            <div className="flex-1 min-w-0">
              <p className="text-sm text-gray-800">{e.action}</p>
              <p className="text-xs text-gray-400">
                {e.actorRole === "AI Engine" ? "AI Engine" : `User: ${e.actor}`}
                {" · "}
                {e.timeAgo}
              </p>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

// ─── Main SettingsTabs ────────────────────────────────────────────────────────

const TABS = ["Company", "Users", "Security", "Notifications", "Audit Log"] as const;
type Tab = (typeof TABS)[number];

export default function SettingsTabs({ companyTabContent }: { companyTabContent: React.ReactNode }) {
  const [activeTab, setActiveTab] = useState<Tab>("Company");

  return (
    <div>
      <div className="mb-4 flex flex-wrap gap-2">
        {TABS.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={clsx(
              "rounded-lg border px-4 py-2 text-sm font-medium transition-colors",
              activeTab === tab
                ? "border-brand-blue bg-brand-blue text-white"
                : "border-gray-200 bg-white text-gray-600 hover:bg-gray-50"
            )}
          >
            {tab}
          </button>
        ))}
      </div>



      <Card className="p-6">
<<<<<<< HEAD
        {activeTab === "Company" && companyTabContent}
        {activeTab === "Users" && <UsersTab />}
        {activeTab === "Security" && <SecurityTab />}
        {activeTab === "Notifications" && <NotificationsTab />}
        {activeTab === "Audit Log" && <AuditLogTab />}
=======
        {activeTab === "Company" ? (
          companyTabContent
        ) : activeTab === "Users" ? (
          <UsersTab />
        ) : (
          <p className="py-10 text-center text-sm text-gray-400">
            {activeTab} settings — coming soon.
          </p>
        )}
>>>>>>> 89f93c8419cb822f9f1a60cadfcd5925751e575c
      </Card>
    </div>
  );
}
