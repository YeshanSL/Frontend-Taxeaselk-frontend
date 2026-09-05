"use client";

import { useState, useMemo } from "react";
import { Search, Plus, Upload, MoreVertical, X, Check } from "lucide-react";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import ProgressBar from "@/components/ui/ProgressBar";
import CitStatusBadge from "@/components/auditor/CitStatusBadge";
import IssueCountPair from "@/components/auditor/IssueCountPair";
import T from "@/components/layout/T";
import { Field, Input } from "@/components/ui/Input";
import { CompaniesSummary, CompanyRow } from "@/lib/types";

export default function CompaniesManager({ initial }: { initial: CompaniesSummary }) {
  const [companies, setCompanies] = useState<CompanyRow[]>(initial.companies);
  const [searchQuery, setSearchQuery] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
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

  const filteredCompanies = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return companies;
    return companies.filter(
      (c) => c.name.toLowerCase().includes(q) || c.tin.toLowerCase().includes(q)
    );
  }, [companies, searchQuery]);

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
          <Button variant="secondary" icon={<Upload className="h-4 w-4" />}>
            Import Companies
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

      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <Card className="w-full max-w-lg p-6">
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
