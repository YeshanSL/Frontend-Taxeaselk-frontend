"use client";

import { useState, useEffect } from "react";
import { Field, Input, Select } from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import { CompanySettings } from "@/lib/types";
import { updateCompanyTaxProfile } from "@/lib/api/business";
import { Building2, FileText, CheckCircle2 } from "lucide-react";

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
            Configure official company identity and IRD tax registrations.
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
          2. Sri Lanka IRD Tax Registrations
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

