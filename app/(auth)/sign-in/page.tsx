"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import AuthBrandPanel from "@/components/layout/AuthBrandPanel";
import { Field, Input, Select } from "@/components/ui/Input";
import Button from "@/components/ui/Button";

// Matches the "Sign in" Figma screen. Form state is local for now —
// Week 2 swaps handleSubmit's body for a Supabase auth call.
export default function SignInPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  // DEV ONLY: Supabase isn't wired up yet, so there's no real user/role
  // to route by. This picker lets you preview either portal. Delete it
  // once real auth returns the user's role automatically.
  const [devRole, setDevRole] = useState<"business" | "auditor">("business");
  const [loading, setLoading] = useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    // TODO (Week 2): replace with supabase.auth.signInWithPassword({ email, password })
    // then route based on the returned user's role instead of devRole.
    setTimeout(() => {
      setLoading(false);
      router.push(devRole === "business" ? "/dashboard" : "/auditor-dashboard");
    }, 400);
  }

  return (
    <div className="grid min-h-screen md:grid-cols-2">
      <div className="flex flex-col justify-center px-8 py-12 md:px-20">
        <h1 className="text-3xl font-extrabold text-brand-navy">Sign in</h1>
        <p className="mt-2 text-sm text-gray-500">
          Enter your email and password to sign in!
        </p>

        <form onSubmit={handleSubmit} className="mt-8 flex flex-col gap-5">
          <Field label="Email">
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </Field>
          <Field label="Password">
            <Input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </Field>

          <Field label="Preview as (dev only, remove after real auth is wired up)">
            <Select
              value={devRole}
              onChange={(e) => setDevRole(e.target.value as "business" | "auditor")}
            >
              <option value="business">Business Owner</option>
              <option value="auditor">Auditor</option>
            </Select>
          </Field>

          <Link
            href="#"
            className="-mt-2 self-end text-sm text-brand-blue hover:underline"
          >
            Forgot Password
          </Link>

          <Button type="submit" disabled={loading} className="w-full py-3">
            {loading ? "Signing in..." : "Sign In"}
          </Button>

          <p className="text-sm text-gray-500">
            Don&apos;t have an account?{" "}
            <Link href="/role" className="text-brand-blue hover:underline">
              Sign Up
            </Link>
          </p>
        </form>
      </div>

      <AuthBrandPanel />
    </div>
  );
}
