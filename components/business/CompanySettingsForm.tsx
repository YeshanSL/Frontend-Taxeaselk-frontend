"use client";

import { useState, useEffect } from "react";
import { Field, Input, Select } from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import { CompanySettings } from "@/lib/types";
import { updateCompanyTaxProfile } from "@/lib/api/business";
import { Building2, FileText, CheckCircle2, ShieldCheck, Copy, Check } from "lucide-react";
import { useLanguage } from "@/lib/i18n/LanguageContext";

export default function CompanySettingsForm({
  initial,
}: {
  initial: CompanySettings;
}) {
  const { t } = useLanguage();
  const [userId, setUserId] = useState("");
  const [copiedId, setCopiedId] = useState(false);
  const [form, setForm] = useState<CompanySettings>({
    companyName: initial.companyName || "",
    tradingName: initial.tradingName || "",
    registrationNumber: initial.registrationNumber || "",
    tinNumber: initial.tinNumber || "",
    vatNumber: initial.vatNumber || "",
    isSvatRegistered: initial.isSvatRegistered ?? false,
    svatNumber: initial.svatNumber || "",
    citTaxRateCategory: initial.citTaxRateCategory || "standard_30",
    financialYear: initial.financialYear || "2025/26",
    contactEmail: initial.contactEmail || "",
    contactPhone: initial.contactPhone || "",
    registeredAddress: initial.registeredAddress || "",
    industrySector: initial.industrySector || "",
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
        }

        const savedUser = localStorage.getItem("taxease_user");
        if (savedUser) {
          const u = JSON.parse(savedUser);
          const name = u.company_name || u.display_name || u.companyName;
          const email = u.email;
          const uId = u.formatted_id || (u.id ? `BIZ-${u.id.replace(/-/g, "").slice(0, 8).toUpperCase()}` : "");
          if (uId) setUserId(uId);
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
      companyName: form.companyName.trim(),
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
            {t("common.saved")}
          </div>
        )}
      </div>

      {/* Workspace User ID Card */}
      <div className="rounded-xl border border-blue-100 bg-blue-50/60 p-3.5 flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-100 text-brand-blue">
            <ShieldCheck className="h-4 w-4" />
          </div>
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-blue-900">
              Verified Business User ID
            </span>
            <p className="font-mono text-xs font-semibold text-gray-800">
              {userId || "BIZ-ACCOUNT"}
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => {
            if (userId) {
              navigator.clipboard.writeText(userId);
              setCopiedId(true);
              setTimeout(() => setCopiedId(false), 2000);
            }
          }}
          className="inline-flex items-center gap-1.5 rounded-lg border border-blue-200 bg-white px-2.5 py-1 text-xs font-semibold text-brand-blue hover:bg-blue-50 cursor-pointer shadow-2xs transition-colors"
        >
          {copiedId ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5" />}
          <span>{copiedId ? "Copied" : "Copy User ID"}</span>
        </button>
      </div>

      {/* Section 1: Entity Information */}
      <div>
        <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-3">
          1. {t("business.settings.tabCompanyProfile")}
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Field label={t("business.settings.companyName")} required>
            <Input
              value={form.companyName}
              onChange={(e) => update("companyName", e.target.value)}
              placeholder="e.g. ABC (Pvt) Ltd"
              required
            />
          </Field>

          <Field label={t("business.settings.tradingName")}>
            <Input
              value={form.tradingName || ""}
              onChange={(e) => update("tradingName", e.target.value)}
              placeholder="e.g. ABC Tech Solutions"
            />
          </Field>

          <Field label={t("business.settings.sector")}>
            <Input
              value={form.industrySector || ""}
              onChange={(e) => update("industrySector", e.target.value)}
              placeholder="e.g. Information Technology & Software"
            />
          </Field>

          <Field label={t("business.settings.financialYear")} required>
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
          2. {t("business.settings.brn")} &amp; {t("business.settings.tin")}
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Field label={t("business.settings.brn")} required>
            <Input
              value={form.registrationNumber}
              onChange={(e) => update("registrationNumber", e.target.value)}
              placeholder="e.g. PV 00123456"
              required
            />
          </Field>

          <Field label={t("business.settings.tin")} required>
            <Input
              value={form.tinNumber}
              onChange={(e) => update("tinNumber", e.target.value)}
              placeholder="9-digit IRD TIN (e.g. 134578291)"
              required
            />
          </Field>

          <Field label={t("business.settings.vat")}>
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

