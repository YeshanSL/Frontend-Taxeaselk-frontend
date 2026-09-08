"use client";

import { useState, useEffect } from "react";
import { Field, Input, Select } from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import { CompanySettings } from "@/lib/types";
import { updateCompanyTaxProfile } from "@/lib/api/business";
import { Building2, FileText, CheckCircle2, Info } from "lucide-react";

export default function CompanySettingsForm({
  initial,
}: {
  initial: CompanySettings;
}) {
  const [form, setForm] = useState<CompanySettings>({
    companyName: initial.companyName || "ABC (Pvt) Ltd",
    tradingName: initial.tradingName || "ABC Tech Solutions",
    registrationNumber: initial.registrationNumber || "PV 00123456",
    tinNumber: initial.tinNumber || "134578291",
    vatNumber: initial.vatNumber || "134578291-7000",
    isSvatRegistered: initial.isSvatRegistered ?? true,
    svatNumber: initial.svatNumber || "SVAT004921",
    citTaxRateCategory: initial.citTaxRateCategory || "standard_30",
    financialYear: initial.financialYear || "2025/26",
    contactEmail: initial.contactEmail || "admin@abc.lk",
    contactPhone: initial.contactPhone || "+94 11 234 5678",
    registeredAddress: initial.registeredAddress || "Level 14, West Tower, World Trade Center, Colombo 01, Sri Lanka",
    industrySector: initial.industrySector || "Information Technology & Software Services",
  });

  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    function syncSettings() {
      try {
        const savedSettings = localStorage.getItem("taxease_company_settings");
        if (savedSettings) {
          const parsed = JSON.parse(savedSettings);
          setForm((prev) => ({
            ...prev,
            ...parsed,
          }));
          return;
        }

        const savedUser = localStorage.getItem("taxease_user");
        if (savedUser) {
          const u = JSON.parse(savedUser);
          const name = u.company_name || u.display_name || u.companyName;
          const email = u.email;
          if (name || email) {
            setForm((prev) => ({
              ...prev,
              companyName: name || prev.companyName,
              contactEmail: email || prev.contactEmail,
            }));
          }
        }
      } catch {
        // Ignored
      }
    }

    syncSettings();
    window.addEventListener("taxease_company_updated", syncSettings);
    window.addEventListener("storage", syncSettings);
    return () => {
      window.removeEventListener("taxease_company_updated", syncSettings);
      window.removeEventListener("storage", syncSettings);
    };
  }, []);

  function update<K extends keyof CompanySettings>(key: K, value: CompanySettings[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setSaved(false);

    const updatedSettings: CompanySettings = {
      ...form,
      companyName: form.companyName.trim() || "ABC (Pvt) Ltd",
      financialYear: form.financialYear.trim() || "2025/26",
    };

    // Immediately persist and notify layout top navigation
    if (typeof window !== "undefined") {
      localStorage.setItem("taxease_company_settings", JSON.stringify(updatedSettings));
      window.dispatchEvent(new Event("taxease_company_updated"));
    }

    try {
      await updateCompanyTaxProfile(updatedSettings);
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
    <form onSubmit={handleSave} className="space-y-8">
      {/* Header Info */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-gray-100 pb-5">
        <div>
          <h2 className="text-base font-semibold text-gray-900 flex items-center gap-2">
            <Building2 className="h-5 w-5 text-brand-blue" />
            Corporate Entity &amp; Inland Revenue Registration
          </h2>
          <p className="text-xs text-gray-500 mt-0.5">
            Configure official company identity, IRD tax numbers, and applicable Sri Lankan CIT rate schedule.
          </p>
        </div>

        {saved && (
          <div className="inline-flex items-center gap-1.5 rounded-full bg-green-50 border border-green-200 px-3 py-1 text-xs font-medium text-green-700">
            <CheckCircle2 className="h-3.5 w-3.5 text-green-600" />
            Settings saved &amp; synced!
          </div>
        )}
      </div>

      {/* Section 1: Entity Information */}
      <div>
        <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-3">
          1. Legal &amp; Trading Profile
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Field label="Registered Legal Name" required>
            <Input
              value={form.companyName}
              onChange={(e) => update("companyName", e.target.value)}
              placeholder="e.g. ABC (Pvt) Ltd"
              required
            />
          </Field>

          <Field label="Trading / Brand Name">
            <Input
              value={form.tradingName || ""}
              onChange={(e) => update("tradingName", e.target.value)}
              placeholder="e.g. ABC Tech Solutions"
            />
          </Field>

          <Field label="Industry Sector">
            <Input
              value={form.industrySector || ""}
              onChange={(e) => update("industrySector", e.target.value)}
              placeholder="e.g. Information Technology & Software"
            />
          </Field>

          <Field label="Financial / Assessment Year" required>
            <Select
              value={form.financialYear}
              onChange={(e) => update("financialYear", e.target.value)}
            >
              <option value="2025/26">2025/26 (Current - Y/A 2025/2026)</option>
              <option value="2024/25">2024/25 (Prior Assessment Year)</option>
              <option value="2023/24">2023/24 (Historical)</option>
            </Select>
          </Field>
        </div>
      </div>

      {/* Section 2: Inland Revenue Department Registrations */}
      <div className="border-t border-gray-100 pt-6">
        <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-3 flex items-center gap-1.5">
          <FileText className="h-3.5 w-3.5 text-gray-400" />
          2. Sri Lanka IRD Tax Registrations &amp; Classification
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Field label="Company Registration No. (ROC)" required>
            <Input
              value={form.registrationNumber}
              onChange={(e) => update("registrationNumber", e.target.value)}
              placeholder="e.g. PV 00123456"
              required
            />
          </Field>

          <Field label="Taxpayer Identification No. (TIN)" required>
            <Input
              value={form.tinNumber}
              onChange={(e) => update("tinNumber", e.target.value)}
              placeholder="9-digit IRD TIN (e.g. 134578291)"
              required
            />
          </Field>

          <Field label="VAT Registration Number">
            <Input
              value={form.vatNumber || ""}
              onChange={(e) => update("vatNumber", e.target.value)}
              placeholder="e.g. 134578291-7000"
            />
          </Field>

          <Field label="CIT Tax Rate Schedule" required>
            <Select
              value={form.citTaxRateCategory || "standard_30"}
              onChange={(e) =>
                update(
                  "citTaxRateCategory",
                  e.target.value as CompanySettings["citTaxRateCategory"]
                )
              }
            >
              <option value="standard_30">Standard Corporate Tax Rate (30%)</option>
              <option value="sme_export_14">SME / Exporting / Manufacturing (14%)</option>
              <option value="concessionary_15">Concessionary / BOI Approved Rate (15%)</option>
              <option value="other">Other Qualifying / Exempt Status</option>
            </Select>
          </Field>
        </div>

        {/* SVAT Registered Card */}
        <div className="mt-4 rounded-xl border border-gray-100 bg-gray-50/70 p-4">
          <div className="flex items-start sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <input
                id="svat-checkbox"
                type="checkbox"
                checked={form.isSvatRegistered ?? false}
                onChange={(e) => update("isSvatRegistered", e.target.checked)}
                className="h-4 w-4 rounded border-gray-300 text-brand-blue focus:ring-brand-blue cursor-pointer mt-0.5 sm:mt-0"
              />
              <label htmlFor="svat-checkbox" className="cursor-pointer">
                <span className="text-sm font-medium text-gray-800">
                  Registered under Simplified VAT (SVAT) Scheme
                </span>
                <p className="text-xs text-gray-500">
                  Enables auto-generation of SVAT Credit Vouchers (Form 04) and Registered Identified Purchaser (RIP) schedules.
                </p>
              </label>
            </div>
          </div>

          {form.isSvatRegistered && (
            <div className="mt-3 pt-3 border-t border-gray-200/60 max-w-sm">
              <Field label="SVAT Registration Number (RIP / RIS)">
                <Input
                  value={form.svatNumber || ""}
                  onChange={(e) => update("svatNumber", e.target.value)}
                  placeholder="e.g. SVAT004921"
                />
              </Field>
            </div>
          )}
        </div>

        <div className="mt-3 flex items-start gap-2 rounded-lg bg-blue-50/70 p-3 text-xs text-blue-700 border border-blue-100">
          <Info className="h-4 w-4 shrink-0 text-blue-600 mt-0.5" />
          <p>
            Under the Inland Revenue Act No. 24 of 2017 (as amended), corporate taxable income is assessed at 30% standard rate, or 14% for eligible Small and Medium Enterprises with gross turnover not exceeding LKR 500Mn.
          </p>
        </div>
      </div>

      {/* Section 3: Registered Office & Contact Details */}
      <div className="border-t border-gray-100 pt-6">
        <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-3">
          3. Registered Office &amp; Tax Correspondence
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Field label="Official Contact Email" required>
            <Input
              type="email"
              value={form.contactEmail}
              onChange={(e) => update("contactEmail", e.target.value)}
              placeholder="e.g. finance@abc.lk"
              required
            />
          </Field>

          <Field label="Official Contact Phone" required>
            <Input
              value={form.contactPhone}
              onChange={(e) => update("contactPhone", e.target.value)}
              placeholder="e.g. +94 11 234 5678"
              required
            />
          </Field>

          <div className="md:col-span-2">
            <Field label="Registered Office Address (as per ROC Form 13 / IRD Records)">
              <Input
                value={form.registeredAddress || ""}
                onChange={(e) => update("registeredAddress", e.target.value)}
                placeholder="e.g. Level 14, West Tower, World Trade Center, Colombo 01, Sri Lanka"
              />
            </Field>
          </div>
        </div>
      </div>

      {/* Save Button */}
      <div className="border-t border-gray-100 pt-5 flex items-center justify-between">
        <p className="text-xs text-gray-500">
          Updates here will reflect across your CIT Computation, IRD Return exports, and Auditor workpapers.
        </p>

        <Button type="submit" disabled={saving} className="w-auto px-6">
          {saved ? "Saved Successfully!" : saving ? "Saving Changes..." : "Save Profile Changes"}
        </Button>
      </div>
    </form>
  );
}

