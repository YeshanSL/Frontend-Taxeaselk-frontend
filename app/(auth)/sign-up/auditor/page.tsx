"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import AuthBrandPanel from "@/components/layout/AuthBrandPanel";
import { Field, Input, Select } from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import { supabase } from "@/lib/supabase";

const SPECIALIZATIONS = [
  "Corporate Tax",
  "VAT & Indirect Tax",
  "Audit & Assurance",
  "Accounting & Bookkeeping",
  "Financial Advisory",
  "Other",
];

export default function AuditorSignUpPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
    specialization: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  function update<K extends keyof typeof form>(key: K, value: string) {
    setForm((f) => ({ ...f, [key]: value }));
    setError("");
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (form.password !== form.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    if (form.password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    setLoading(true);

    try {
      // 1. Sign up with Supabase Auth
      const { data, error: signUpError } = await supabase.auth.signUp({
        email: form.email,
        password: form.password,
        options: {
          data: {
            full_name: form.fullName,
          },
        },
      });

      if (signUpError) throw signUpError;

      if (!data.user) throw new Error("Signup failed. Please try again.");

      // 2. Update role to auditor in profiles table
      const { error: roleError } = await supabase
        .from("profiles")
        .update({ role: "auditor" })
        .eq("id", data.user.id);

      if (roleError) throw roleError;

      // 3. Create auditor profile row
      const { error: profileError } = await supabase
        .from("auditor_profiles")
        .insert({
          id: data.user.id,
          designation: form.specialization,
        });

      if (profileError) throw profileError;

      // 4. Redirect to auditor dashboard
      router.push("/auditor-dashboard");

    } catch (err: any) {
      setError(err.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
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
        <p className="mt-2 text-sm text-gray-500">Create your auditor account</p>

        {error && (
          <div className="mt-4 rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-600">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-5">
          <Field label="Full name">
            <Input
              value={form.fullName}
              onChange={(e) => update("fullName", e.target.value)}
              placeholder="Your full name"
              required
            />
          </Field>
          <Field label="Email">
            <Input
              type="email"
              value={form.email}
              onChange={(e) => update("email", e.target.value)}
              placeholder="you@firm.com"
              required
            />
          </Field>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Password">
              <Input
                type="password"
                value={form.password}
                onChange={(e) => update("password", e.target.value)}
                placeholder="Min 6 characters"
                required
              />
            </Field>
            <Field label="Confirm Password">
              <Input
                type="password"
                value={form.confirmPassword}
                onChange={(e) => update("confirmPassword", e.target.value)}
                placeholder="Repeat password"
                required
              />
            </Field>
          </div>
          <Field label="Specialization">
            <Select
              value={form.specialization}
              onChange={(e) => update("specialization", e.target.value)}
              required
            >
              <option value="" disabled>
                Select your specialization
              </option>
              {SPECIALIZATIONS.map((s) => (
                <option key={s} value={s}>
                  {s}
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
