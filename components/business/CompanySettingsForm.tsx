"use client";

import { useState } from "react";
import { Field, Input } from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import { CompanySettings } from "@/lib/types";

// The "Company Information" form from the Figma Settings screen.
// Takes the initially-fetched settings as a prop and manages edits
// locally until Save Changes is wired up to the backend.
export default function CompanySettingsForm({
  initial,
}: {
  initial: CompanySettings;
}) {
  const [form, setForm] = useState(initial);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  function update<K extends keyof CompanySettings>(key: K, value: string) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setSaved(false);
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
        body: JSON.stringify(form),
      });
      if (res.ok) {
        const data = await res.json();
        const comp = data.company || data;
        setForm((prev) => ({
          ...prev,
          companyName: comp.companyName || comp.name || prev.companyName,
          registrationNumber: comp.registrationNumber || comp.registration_number || prev.registrationNumber,
          tinNumber: comp.tinNumber || comp.tin_number || prev.tinNumber,
          financialYear: comp.financialYear || comp.current_fiscal_year || prev.financialYear,
          contactEmail: comp.contactEmail || comp.contact_email || prev.contactEmail,
          contactPhone: comp.contactPhone || comp.contact_phone || prev.contactPhone,
        }));
        setSaved(true);
        setTimeout(() => setSaved(false), 2500);
      }
    } catch (err) {
      console.error("Failed to save company settings:", err);
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
