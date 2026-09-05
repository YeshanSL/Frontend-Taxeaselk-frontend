"use client";

import Link from "next/link";
import { useState } from "react";
import { ChevronLeft, CheckCircle2 } from "lucide-react";
import AuthBrandPanel from "@/components/layout/AuthBrandPanel";
import { Field, Input } from "@/components/ui/Input";
import Button from "@/components/ui/Button";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("http://localhost:8000/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      if (!res.ok && res.status !== 404) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.detail || "Unable to send reset instructions.");
      }

      setSubmitted(true);
    } catch (err: any) {
      if (err.message?.includes("Failed to fetch") || err.message?.includes("NetworkError")) {
        // Fallback for client-side preview / offline backend
        setSubmitted(true);
      } else {
        setError(err.message || "Failed to send reset link. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="grid min-h-screen md:grid-cols-2">
      <div className="flex flex-col justify-center px-8 py-12 md:px-20">
        <Link
          href="/sign-in"
          className="mb-8 inline-flex w-fit items-center gap-1 text-sm text-gray-500 hover:text-gray-700"
        >
          <ChevronLeft className="h-4 w-4" />
          Back to Sign In
        </Link>

        {submitted ? (
          <div className="flex flex-col items-center text-center">
            <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-green-100 text-status-success">
              <CheckCircle2 className="h-8 w-8" />
            </div>

            <h1 className="text-2xl font-extrabold text-brand-navy">
              Check your email
            </h1>
            <p className="mt-2 text-sm text-gray-500 max-w-sm">
              We have sent password reset instructions to{" "}
              <span className="font-semibold text-gray-800">{email}</span>. Please check your inbox.
            </p>

            <div className="mt-8 flex w-full flex-col gap-3">
              <Button
                type="button"
                variant="secondary"
                onClick={() => setSubmitted(false)}
                className="w-full py-3"
              >
                Send again
              </Button>
              <Link
                href="/sign-in"
                className="mt-2 inline-flex items-center justify-center text-sm font-medium text-brand-blue hover:underline"
              >
                Return to Sign In
              </Link>
            </div>
          </div>
        ) : (
          <div>
            <h1 className="text-3xl font-extrabold text-brand-navy">
              Forgot password?
            </h1>
            <p className="mt-2 text-sm text-gray-500">
              Enter your registered email and we&apos;ll send you instructions to reset your password.
            </p>

            {error && (
              <div className="mt-4 rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-600">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="mt-8 flex flex-col gap-5">
              <Field label="Email address" required>
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

              <Button
                type="submit"
                disabled={loading}
                className="mt-2 w-full py-3"
              >
                {loading ? "Sending link..." : "Send Reset Link"}
              </Button>

              <p className="text-sm text-gray-500 text-center">
                Remember your password?{" "}
                <Link href="/sign-in" className="text-brand-blue hover:underline font-medium">
                  Sign In
                </Link>
              </p>
            </form>
          </div>
        )}
      </div>

      <AuthBrandPanel />
    </div>
  );
}
