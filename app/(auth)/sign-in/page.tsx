"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import AuthBrandPanel from "@/components/layout/AuthBrandPanel";
import { Field, Input } from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import { supabase } from "@/lib/supabase";

export default function SignInPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      // 1. Sign in with Supabase Auth
      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (signInError) throw signInError;

      if (!data.user) throw new Error("Sign in failed. Please try again.");

      // 2. Get user role from profiles table
      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", data.user.id)
        .single();

      if (profileError) throw profileError;

      // 3. Redirect based on role
      const role = profile?.role;

      if (role === "auditor") {
        router.push("/auditor-dashboard");
      } else {
        // business_owner, business_admin, accountant, viewer
        router.push("/dashboard");
      }

    } catch (err: any) {
      setError(err.message || "Invalid email or password.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="grid min-h-screen md:grid-cols-2">
      <div className="flex flex-col justify-center px-8 py-12 md:px-20">
        <h1 className="text-3xl font-extrabold text-brand-navy">Sign in</h1>
        <p className="mt-2 text-sm text-gray-500">
          Enter your email and password to sign in!
        </p>

        {error && (
          <div className="mt-4 rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-600">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-8 flex flex-col gap-5">
          <Field label="Email">
            <Input
              type="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                setError("");
              }}
              placeholder="you@company.com"
              required
            />
          </Field>
          <Field label="Password">
            <Input
              type="password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setError("");
              }}
              placeholder="Your password"
              required
            />
          </Field>

          <Link
            href="/forgot-password"
            className="-mt-2 self-end text-sm text-brand-blue hover:underline"
          >
            Forgot Password?
          </Link>

          <Button
            type="submit"
            disabled={loading}
            className="w-full py-3"
          >
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
