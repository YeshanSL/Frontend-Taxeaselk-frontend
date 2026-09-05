"use client";

import { useState, useMemo } from "react";
import { Search, Plus, Clock, CheckCircle2, AlertTriangle, Send, X, Check } from "lucide-react";
import Card from "@/components/ui/Card";
import StatCard from "@/components/ui/StatCard";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import T from "@/components/layout/T";
import { Field, Input, Select } from "@/components/ui/Input";
import { AuditorRequestsSummary, AuditorRequestRow } from "@/lib/types";

export default function RequestsManager({ initial }: { initial: AuditorRequestsSummary }) {
  const [requests, setRequests] = useState<AuditorRequestRow[]>(initial.requests);
  const [searchQuery, setSearchQuery] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [remindingId, setRemindingId] = useState<string | null>(null);
  const [notification, setNotification] = useState<string | null>(null);

  // Form State
  const [form, setForm] = useState({
    company_id: "c0000000-0000-0000-0000-000000000001",
    title: "",
    description: "",
    category: "General Inquiry",
    priority: "MEDIUM",
    due_date: "2026-08-30",
  });

  const filteredRequests = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return requests;
    return requests.filter(
      (r) =>
        r.title.toLowerCase().includes(q) ||
        r.requestId.toLowerCase().includes(q) ||
        r.companyName.toLowerCase().includes(q) ||
        r.category.toLowerCase().includes(q)
    );
  }, [requests, searchQuery]);

  const pendingCount = useMemo(
    () => requests.filter((r) => r.status === "pending").length,
    [requests]
  );
  const respondedCount = useMemo(
    () => requests.filter((r) => r.status === "responded").length,
    [requests]
  );
  const resolvedCount = useMemo(
    () => requests.filter((r) => r.status === "resolved").length,
    [requests]
  );

  async function handleCreateRequest(e: React.FormEvent) {
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

      const res = await fetch(`${apiUrl}/api/auditor/requests`, {
        method: "POST",
        headers,
        body: JSON.stringify(form),
      });

      if (res.ok) {
        const newRfi = await res.json();
        const mappedRow: AuditorRequestRow = {
          id: String(newRfi.id),
          requestId: newRfi.reference_code || `REQ-2026-00${requests.length + 1}`,
          companyName: newRfi.company_name || "Assigned Company",
          title: newRfi.title,
          description: newRfi.description,
          category: newRfi.category,
          status: "pending",
          priority: (newRfi.priority?.toLowerCase() === "high"
            ? "high"
            : newRfi.priority?.toLowerCase() === "medium"
            ? "medium"
            : "low") as any,
          requestedDate: "Today",
          dueDate: newRfi.due_date || form.due_date,
        };

        setRequests((prev) => [mappedRow, ...prev]);
        setSuccessMsg("Request created and sent to company successfully!");
        setTimeout(() => {
          setModalOpen(false);
          setSuccessMsg("");
          setForm({
            company_id: "c0000000-0000-0000-0000-000000000001",
            title: "",
            description: "",
            category: "General Inquiry",
            priority: "MEDIUM",
            due_date: "2026-08-30",
          });
        }, 1200);
      }
    } catch {
      // Ignored
    } finally {
      setLoading(false);
    }
  }

  async function handleRemind(reqId: string, companyName: string) {
    setRemindingId(reqId);
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
      const token = typeof window !== "undefined" ? localStorage.getItem("taxease_token") : null;
      const headers: Record<string, string> = { "Content-Type": "application/json" };
      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }

      await fetch(`${apiUrl}/api/auditor/requests/${reqId}/remind`, {
        method: "POST",
        headers,
      });

      setNotification(`Reminder successfully sent to ${companyName}!`);
      setTimeout(() => setNotification(null), 3500);
    } catch {
      // Ignored
    } finally {
      setRemindingId(null);
    }
  }

  return (
    <div>
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            <T k="pages.requests.title" />
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            <T k="pages.requests.subtitle" />
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            icon={<Plus className="h-4 w-4" />}
            onClick={() => setModalOpen(true)}
          >
            Create New Request
          </Button>
        </div>
      </div>

      {notification && (
        <div className="mt-4 rounded-lg border border-green-200 bg-green-50 p-3 text-sm font-medium text-green-800 flex items-center justify-between">
          <span>{notification}</span>
          <button onClick={() => setNotification(null)} className="text-green-600 hover:text-green-800">
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-4">
        <StatCard
          label="Total Requests"
          value={String(requests.length)}
          hint="All client requests"
        />
        <StatCard
          label="Awaiting Response"
          value={String(pendingCount)}
          valueClassName={pendingCount > 0 ? "text-amber-600" : ""}
          hint="Action required by company"
        />
        <StatCard
          label="Responses Received"
          value={String(respondedCount)}
          valueClassName="text-blue-600"
          hint="Ready for auditor review"
        />
        <StatCard
          label="Resolved"
          value={String(resolvedCount)}
          valueClassName="text-green-600"
          hint="Closed inquiries"
        />
      </div>

      <Card className="mt-6 p-4">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input
            type="search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search requests by title, reference, or company..."
            className="w-full rounded-lg border border-gray-200 py-2.5 pl-9 pr-3 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-1 focus:ring-brand-blue"
          />
        </div>
      </Card>

      <Card className="mt-4 overflow-x-auto">
        <table className="w-full min-w-[900px] text-left text-sm">
          <thead>
            <tr className="border-b border-gray-100 text-xs font-medium uppercase tracking-wide text-gray-400">
              <th className="px-5 py-3">Reference</th>
              <th className="px-5 py-3">Company</th>
              <th className="px-5 py-3">Request Details</th>
              <th className="px-5 py-3">Priority</th>
              <th className="px-5 py-3">Status</th>
              <th className="px-5 py-3">Due Date</th>
              <th className="px-5 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {filteredRequests.map((req) => (
              <tr key={req.id} className="hover:bg-gray-50/50">
                <td className="px-5 py-4 font-mono text-xs font-semibold text-gray-500">
                  {req.requestId}
                </td>
                <td className="px-5 py-4 font-medium text-gray-800">
                  {req.companyName}
                </td>
                <td className="px-5 py-4 max-w-sm">
                  <p className="font-semibold text-gray-900">{req.title}</p>
                  <p className="mt-0.5 text-xs text-gray-500 line-clamp-1">
                    {req.description}
                  </p>
                  <span className="mt-1 inline-block rounded bg-gray-100 px-2 py-0.5 text-[11px] font-medium text-gray-600">
                    {req.category}
                  </span>
                </td>
                <td className="px-5 py-4">
                  {req.priority === "high" && (
                    <Badge tone="critical" className="inline-flex items-center gap-1">
                      <AlertTriangle className="h-3 w-3" />
                      High
                    </Badge>
                  )}
                  {req.priority === "medium" && (
                    <Badge tone="warning">Medium</Badge>
                  )}
                  {req.priority === "low" && (
                    <Badge tone="neutral">Low</Badge>
                  )}
                </td>
                <td className="px-5 py-4">
                  {req.status === "pending" && (
                    <Badge tone="warning" className="inline-flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      Pending
                    </Badge>
                  )}
                  {req.status === "responded" && (
                    <Badge tone="info" className="inline-flex items-center gap-1">
                      <Send className="h-3 w-3" />
                      Responded
                    </Badge>
                  )}
                  {req.status === "resolved" && (
                    <Badge tone="success" className="inline-flex items-center gap-1">
                      <CheckCircle2 className="h-3 w-3" />
                      Resolved
                    </Badge>
                  )}
                </td>
                <td className="px-5 py-4 text-gray-500">{req.dueDate}</td>
                <td className="px-5 py-4 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <Button variant="secondary" className="px-2.5 py-1 text-xs">
                      View
                    </Button>
                    {req.status === "pending" && (
                      <Button
                        variant="secondary"
                        className="px-2.5 py-1 text-xs text-brand-blue"
                        onClick={() => handleRemind(req.id, req.companyName)}
                        disabled={remindingId === req.id}
                      >
                        {remindingId === req.id ? "Sending..." : "Remind"}
                      </Button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>

      {/* Create New Request Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <Card className="w-full max-w-lg p-6">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <p className="font-semibold text-gray-900">Create New Request (RFI)</p>
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
              <form onSubmit={handleCreateRequest} className="mt-4 flex flex-col gap-4">
                <Field label="Request Title">
                  <Input
                    required
                    placeholder="e.g. Clarification on Entertainment Expense Invoices"
                    value={form.title}
                    onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                  />
                </Field>

                <Field label="Description & Specific Inquiries">
                  <textarea
                    required
                    rows={3}
                    className="w-full rounded-lg border border-gray-300 px-3.5 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 focus:border-brand-blue focus:outline-none focus:ring-1 focus:ring-brand-blue"
                    placeholder="Please specify which schedules or invoices are requested..."
                    value={form.description}
                    onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                  />
                </Field>

                <div className="grid grid-cols-2 gap-3">
                  <Field label="Category">
                    <Input
                      required
                      placeholder="e.g. Entertainment Expenses"
                      value={form.category}
                      onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
                    />
                  </Field>
                  <Field label="Priority">
                    <Select
                      value={form.priority}
                      onChange={(e) => setForm((f) => ({ ...f, priority: e.target.value }))}
                    >
                      <option value="LOW">Low</option>
                      <option value="MEDIUM">Medium</option>
                      <option value="HIGH">High</option>
                    </Select>
                  </Field>
                </div>

                <Field label="Due Date">
                  <Input
                    type="date"
                    required
                    value={form.due_date}
                    onChange={(e) => setForm((f) => ({ ...f, due_date: e.target.value }))}
                  />
                </Field>

                <div className="mt-2 flex justify-end gap-2">
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={() => setModalOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" disabled={loading}>
                    {loading ? "Sending..." : "Create & Send Request"}
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
