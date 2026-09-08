"use client";

import { useRef, useState, useEffect } from "react";
import { Field, Input } from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import { AuditorProfileSettings } from "@/lib/types";

// The "Profile" tab form from the auditor Settings Figma screen.
export default function AuditorProfileForm({
  initial,
}: {
  initial: AuditorProfileSettings;
}) {
  const [form, setForm] = useState(initial);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);
  const photoInputRef = useRef<HTMLInputElement>(null);

  // Revoke the object URL when it's replaced or the component unmounts,
  // so we don't leak memory across repeated photo changes.
  useEffect(() => {
    return () => {
      if (photoUrl) URL.revokeObjectURL(photoUrl);
    };
  }, [photoUrl]);

  function handlePhotoSelected(file: File | undefined) {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      alert("Please choose an image file (PNG or JPG).");
      return;
    }
    // Local-only preview — this reads the file straight from the
    // browser, no upload needed to show it here. Actually persisting
    // the photo happens once Supabase storage is wired up (Week 2).
    setPhotoUrl(URL.createObjectURL(file));
  }

  function update<K extends keyof AuditorProfileSettings>(key: K, value: string) {
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
      const res = await fetch(`${apiUrl}/api/auditor/profile`, {
        method: "PUT",
        headers,
        body: JSON.stringify(form),
      });
      if (res.ok) {
        const data = await res.json();
        setForm((prev) => ({ ...prev, ...data }));
        setSaved(true);
        setTimeout(() => setSaved(false), 2500);
      }
    } catch (err) {
      console.error("Failed to update auditor profile:", err);
    } finally {
      setSaving(false);
    }
  }


  return (
    <form onSubmit={handleSave}>
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          {photoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element -- local blob preview, not a static asset
            <img
              src={photoUrl}
              alt="Profile photo preview"
              className="h-14 w-14 rounded-full object-cover"
            />
          ) : (
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-brand-blue text-lg font-semibold text-white">
              {initial.fullName
                .split(" ")
                .map((n) => n[0])
                .join("")}
            </div>
          )}
          <div>
            <p className="font-semibold text-gray-900">{form.fullName}</p>
            <p className="text-sm text-gray-400">{form.designation}</p>
          </div>
        </div>
        <Button
          type="button"
          variant="secondary"
          onClick={() => photoInputRef.current?.click()}
        >
          Change Photo
        </Button>
        <input
          ref={photoInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => handlePhotoSelected(e.target.files?.[0])}
        />
      </div>

      {/* Section: Personal & Contact Details */}
      <div className="mb-6">
        <h3 className="text-sm font-bold uppercase tracking-wider text-gray-500 mb-3">
          Personal &amp; Contact Details
        </h3>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <Field label="Full Name" required>
            <Input
              value={form.fullName}
              onChange={(e) => update("fullName", e.target.value)}
            />
          </Field>
          <Field label="Official Email Address" required>
            <Input
              type="email"
              value={form.email}
              onChange={(e) => update("email", e.target.value)}
            />
          </Field>
          <Field label="Phone Number">
            <Input
              value={form.phone}
              onChange={(e) => update("phone", e.target.value)}
            />
          </Field>
          <Field label="Designation / Role in Practice">
            <Input
              value={form.designation}
              onChange={(e) => update("designation", e.target.value)}
            />
          </Field>
        </div>
      </div>

      {/* Section: Professional Accreditation (Sri Lanka) */}
      <div className="mb-6 pt-5 border-t border-gray-100">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-bold uppercase tracking-wider text-gray-500">
            Professional Accreditation (Sri Lanka)
          </h3>
          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-semibold text-emerald-700">
            ✓ Verified Practitioner
          </span>
        </div>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <Field label="CA Sri Lanka (ICASL) Member No." required>
            <Input
              placeholder="e.g. FCA 14892"
              value={form.caSriLankaNo || form.licenseNumber}
              onChange={(e) => {
                update("caSriLankaNo", e.target.value);
                update("licenseNumber", e.target.value);
              }}
            />
          </Field>
          <Field label="IRD Tax Practitioner Reg. No." required>
            <Input
              placeholder="e.g. TP-2024-8841"
              value={form.irdPractitionerNo || "TP-2024-8841"}
              onChange={(e) => update("irdPractitionerNo", e.target.value)}
            />
          </Field>
          <Field label="Practicing Certificate No.">
            <Input
              placeholder="e.g. PC-2025/26-042"
              value={form.licenseNumber}
              onChange={(e) => update("licenseNumber", e.target.value)}
            />
          </Field>
        </div>
      </div>

      {/* Section: Audit Firm & Practice */}
      <div className="mb-6 pt-5 border-t border-gray-100">
        <h3 className="text-sm font-bold uppercase tracking-wider text-gray-500 mb-3">
          Audit Firm &amp; Office Details
        </h3>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <Field label="Audit Firm Name" required>
            <Input
              value={form.organization}
              onChange={(e) => update("organization", e.target.value)}
            />
          </Field>
          <Field label="Firm Registration No.">
            <Input
              placeholder="e.g. PV-98214 / CA-AF-552"
              value={form.firmRegNo || "PV-98214 / CA-AF-552"}
              onChange={(e) => update("firmRegNo", e.target.value)}
            />
          </Field>
          <div className="md:col-span-2">
            <Field label="Registered Office Address">
              <Input
                placeholder="e.g. Level 7, World Trade Center, Colombo 01"
                value={form.firmAddress || "Level 7, West Tower, World Trade Center, Echelon Square, Colombo 01"}
                onChange={(e) => update("firmAddress", e.target.value)}
              />
            </Field>
          </div>
        </div>
      </div>

      {/* Section: Digital Audit Seal & Signature Stamp */}
      <div className="mb-6 pt-5 border-t border-gray-100">
        <h3 className="text-sm font-bold uppercase tracking-wider text-gray-500 mb-2">
          Digital Audit Seal &amp; Certification Stamp
        </h3>
        <p className="text-xs text-gray-500 mb-4">
          This official stamp is affixed to completed Corporate Income Tax certification letters and clearance schedules.
        </p>
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 rounded-xl border border-dashed border-gray-300 bg-gray-50/70 p-4">
          <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-lg border border-blue-200 bg-white shadow-sm">
            <div className="text-center p-1">
              <div className="text-[9px] font-bold text-brand-blue uppercase tracking-tighter leading-none">
                CA SRI LANKA
              </div>
              <div className="my-1 border-t border-b border-brand-blue py-0.5 text-[8px] font-semibold text-gray-700">
                AUDIT SEAL
              </div>
              <div className="text-[8px] font-mono text-gray-500 leading-none">
                #14892
              </div>
            </div>
          </div>
          <div className="flex-1">
            <p className="text-sm font-semibold text-gray-800">
              Official Chartered Accountant Digital Seal
            </p>
            <p className="text-xs text-gray-500 mt-0.5">
              PNG or SVG with transparent background recommended (Max 2MB).
            </p>
            <div className="mt-2 flex items-center gap-2">
              <Button type="button" variant="secondary" className="!px-3 !py-1.5 !text-xs">
                Upload New Stamp
              </Button>
              <span className="text-xs text-emerald-600 font-medium">✓ Active on all CIT Certifications</span>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-6 flex gap-3 border-t border-gray-100 pt-5">
        <Button type="submit" disabled={saving}>
          {saved ? "Saved Successfully!" : saving ? "Saving..." : "Save Profile & Credentials"}
        </Button>
      </div>
    </form>
  );
}
