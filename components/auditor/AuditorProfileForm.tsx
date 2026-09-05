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

      <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
        <Field label="Full Name" required>
          <Input
            value={form.fullName}
            onChange={(e) => update("fullName", e.target.value)}
          />
        </Field>
        <Field label="Email Address" required>
          <Input
            type="email"
            value={form.email}
            onChange={(e) => update("email", e.target.value)}
          />
        </Field>
        <Field label="Phone Number">
          <Input value={form.phone} onChange={(e) => update("phone", e.target.value)} />
        </Field>
        <Field label="Professional License No.">
          <Input
            value={form.licenseNumber}
            onChange={(e) => update("licenseNumber", e.target.value)}
          />
        </Field>
        <Field label="Organization">
          <Input
            value={form.organization}
            onChange={(e) => update("organization", e.target.value)}
          />
        </Field>
        <Field label="Designation">
          <Input
            value={form.designation}
            onChange={(e) => update("designation", e.target.value)}
          />
        </Field>
      </div>

      <div className="mt-6 flex gap-3 border-t border-gray-100 pt-5">
        <Button type="submit" disabled={saving}>
          {saved ? "Saved!" : saving ? "Saving..." : "Save Changes"}
        </Button>

        <Button type="button" variant="secondary">
          Cancel
        </Button>
      </div>
    </form>
  );
}
