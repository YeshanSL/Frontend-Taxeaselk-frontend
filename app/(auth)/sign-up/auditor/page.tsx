"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import AuthBrandPanel from "@/components/layout/AuthBrandPanel";
import { Field, Input, Select } from "@/components/ui/Input";
import Button from "@/components/ui/Button";

// Figma's auditor sign-up reused the "Business Category" field/label
// verbatim, which looks like a copy-paste leftover from the business
// form. Kept the same field here for now (labeled generically) so the
// two forms line up — flag this to your team before demo day in case
// it should read "Specialization" instead.
const CATEGORIES = [
  "Manufacturing",
  "Trading / Retail",
  "Services",
  "Construction",
  "Hospitality",
  "Other",
];

export default function AuditorSignUpPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    category: "",
  });
  const [loading, setLoading] = useState(false);

  function update<K extends keyof typeof form>(key: K, value: string) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    // TODO (Week 2): supabase.auth.signUp(...) then create the auditor
    // profile record via the FastAPI backend. Until then, fake a short
    // delay and route into the auditor dashboard for testing/demo.
    setTimeout(() => {
      setLoading(false);
      router.push("/auditor-dashboard");
    }, 400);
  }

  return (
    <div className="grid min-h-screen md:grid-cols-2">
      <div className="flex flex-col justify-center px-8 py-12 md:px-20">
        <Link
          href="/role"
          className="mb-6 inline-flex w-fit items-center gap-1 text-sm text-gray-500 hover:text-gray-700"
        >
          <ChevronLeft className="h-4 w-4" />
          Back
        </Link>

        <h1 className="text-3xl font-extrabold text-brand-navy">Sign up</h1>

        <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-5">
          <Field label="Auditor name">
            <Input
              value={form.name}
              onChange={(e) => update("name", e.target.value)}
              required
            />
          </Field>
          <Field label="Email">
            <Input
              type="email"
              value={form.email}
              onChange={(e) => update("email", e.target.value)}
              required
            />
          </Field>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Password">
              <Input
                type="password"
                value={form.password}
                onChange={(e) => update("password", e.target.value)}
                required
              />
            </Field>
            <Field label="Confirm Password">
              <Input
                type="password"
                value={form.confirmPassword}
                onChange={(e) => update("confirmPassword", e.target.value)}
                required
              />
            </Field>
          </div>
          <Field label="Business Category">
            <Select
              value={form.category}
              onChange={(e) => update("category", e.target.value)}
              required
            >
              <option value="" disabled>
                Select a category
              </option>
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </Select>
          </Field>

          <Button
            type="submit"
            disabled={loading}
            className="mt-2 w-full bg-brand-blue-dark py-3 hover:bg-brand-navy"
          >
            {loading ? "Creating account..." : "Sign up"}
          </Button>

          <p className="text-sm text-gray-500">
            Already have an account?{" "}
            <Link href="/sign-in" className="text-brand-blue hover:underline">
              Sign In
            </Link>
          </p>
        </form>
      </div>

      <AuthBrandPanel />
    </div>
  );
}
