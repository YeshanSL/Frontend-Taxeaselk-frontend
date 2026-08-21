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

  function update<K extends keyof CompanySettings>(key: K, value: string) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    // TODO (Week 2): PUT/PATCH to `${API_BASE_URL}/companies/{id}/settings`
    setTimeout(() => setSaving(false), 400);
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
        {saving ? "Saving..." : "Save Changes"}
      </Button>
    </form>
  );
}
