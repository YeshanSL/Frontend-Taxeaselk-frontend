"use client";

import { useState, useEffect } from "react";
import { Field, Input } from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import { CompanySettings } from "@/lib/types";

// The "Company Information" form from the Figma Settings screen.
// Takes the initially-fetched settings as a prop and manages edits
// locally, syncing changes live with the Top Bar and backend.
export default function CompanySettingsForm({
  initial,
}: {
  initial: CompanySettings;
}) {
  const [form, setForm] = useState(initial);
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
            companyName: parsed.companyName || prev.companyName,
            registrationNumber: parsed.registrationNumber || prev.registrationNumber,
            tinNumber: parsed.tinNumber || prev.tinNumber,
            financialYear: parsed.financialYear || prev.financialYear,
            contactEmail: parsed.contactEmail || prev.contactEmail,
            contactPhone: parsed.contactPhone || prev.contactPhone,
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

  function update<K extends keyof CompanySettings>(key: K, value: string) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setSaved(false);

    const updatedSettings = {
      ...form,
      companyName: form.companyName.trim() || "ABC (Pvt) Ltd",
      financialYear: form.financialYear.trim() || "2025/26",
    };

    // Immediately persist and notify top nav bar
    if (typeof window !== "undefined") {
      localStorage.setItem("taxease_company_settings", JSON.stringify(updatedSettings));
      window.dispatchEvent(new Event("taxease_company_updated"));
    }

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
      const token = typeof window !== "undefined" ? localStorage.getItem("taxease_token") : null;
      const headers: Record<string, string> = { "Content-Type": "application/json" };
      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }
      const res = await fetch(`${apiUrl}/api/settings`, {
        method: "PUT",
        headers,
        body: JSON.stringify(updatedSettings),
      });
      if (res.ok) {
        const data = await res.json();
        const comp = data.company || data;
        const finalForm = {
          ...form,
          companyName: comp.companyName || comp.name || updatedSettings.companyName,
          registrationNumber: comp.registrationNumber || comp.registration_number || updatedSettings.registrationNumber,
          tinNumber: comp.tinNumber || comp.tin_number || updatedSettings.tinNumber,
          financialYear: comp.financialYear || comp.current_fiscal_year || updatedSettings.financialYear,
          contactEmail: comp.contactEmail || comp.contact_email || updatedSettings.contactEmail,
          contactPhone: comp.contactPhone || comp.contact_phone || updatedSettings.contactPhone,
        };
        setForm(finalForm);
        if (typeof window !== "undefined") {
          localStorage.setItem("taxease_company_settings", JSON.stringify(finalForm));
          window.dispatchEvent(new Event("taxease_company_updated"));
        }
      }
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
    <form onSubmit={handleSave} className="flex flex-col gap-5">
      <p className="font-semibold text-gray-800">Company Information</p>

      <Field label="Company Name">
        <Input
          value={form.companyName}
          onChange={(e) => update("companyName", e.target.value)}
        />
      </Field>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <Field label="Company Registration Number">
          <Input
            value={form.registrationNumber}
            onChange={(e) => update("registrationNumber", e.target.value)}
          />
        </Field>
        <Field label="TIN Number">
          <Input
            value={form.tinNumber}
            onChange={(e) => update("tinNumber", e.target.value)}
          />
        </Field>
        <Field label="Financial Year">
          <Input
            value={form.financialYear}
            onChange={(e) => update("financialYear", e.target.value)}
          />
        </Field>
        <Field label="Contact Email">
          <Input
            type="email"
            value={form.contactEmail}
            onChange={(e) => update("contactEmail", e.target.value)}
          />
        </Field>
        <Field label="Contact Phone">
          <Input
            value={form.contactPhone}
            onChange={(e) => update("contactPhone", e.target.value)}
          />
        </Field>
      </div>

      <Button type="submit" disabled={saving} className="mt-2 w-fit">
        {saved ? "Saved!" : saving ? "Saving..." : "Save Changes"}
      </Button>

    </form>
  );
}
