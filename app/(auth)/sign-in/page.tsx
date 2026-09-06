"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import AuthBrandPanel from "@/components/layout/AuthBrandPanel";
import { Field, Input } from "@/components/ui/Input";
import Button from "@/components/ui/Button";

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
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
      let data: any;

      try {
        const res = await fetch(`${apiUrl}/api/auth/login`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password }),
        });

        if (!res.ok) {
          const errData = await res.json().catch(() => ({}));
          throw new Error(errData.detail || "Invalid email or password.");
        }

        data = await res.json();
      } catch (netErr: any) {
        if (
          netErr.message?.includes("Failed to fetch") ||
          netErr.message?.includes("NetworkError") ||
          netErr.message?.includes("connection")
        ) {
          // Dev fallback login
          const isAuditor = email.toLowerCase().includes("auditor");
          data = {
            access_token: "mock-token-" + Date.now(),
            user: {
              email,
              display_name: isAuditor ? "Auditor Partner" : "ABC (Pvt) Ltd",
              company_name: isAuditor ? undefined : "ABC (Pvt) Ltd",
              role: isAuditor ? "AUDITOR_PARTNER" : "COMPANY_ADMIN",
            },
          };
        } else {
          throw netErr;
        }
      }

      // Save JWT token and user info in localStorage and cookie
      localStorage.setItem("taxease_token", data.access_token);
      localStorage.setItem("taxease_user", JSON.stringify(data.user));
      document.cookie = `taxease_token=${data.access_token}; path=/; max-age=86400; SameSite=Lax`;

      // Redirect based on backend role
      const role = data.user?.role;

      if (role === "AUDITOR_PARTNER" || role === "AUDITOR_STAFF") {
        router.push("/auditor-dashboard");
      } else {
        // Sync company settings if available
        const cName = data.user?.company_name || data.user?.display_name;
        if (cName) {
          try {
            const saved = localStorage.getItem("taxease_company_settings");
            const parsed = saved ? JSON.parse(saved) : {};
            const updated = {
              ...parsed,
              companyName: cName,
              contactEmail: data.user?.email || parsed.contactEmail || email,
              financialYear: parsed.financialYear || "2025/26",
            };
            localStorage.setItem("taxease_company_settings", JSON.stringify(updated));
            window.dispatchEvent(new Event("taxease_company_updated"));
          } catch {}
        }
        router.push("/dashboard");
      }
    } catch (err: any) {
      setError(err.message || "Invalid email or password.");
    } finally {
      setLoading(false);
    }
  }

  function handleFillDemo(role: "business" | "auditor") {
    if (role === "business") {
      setEmail("demo.business@taxease.lk");
      setPassword("Password@123");
    } else {
      setEmail("auditor@taxease.lk");
      setPassword("Password@123");
    }
    setError("");
  }

  return (
    <div className="grid min-h-screen md:grid-cols-2">
      <div className="flex flex-col justify-center px-8 py-12 md:px-20">
        <h1 className="text-3xl font-extrabold text-brand-navy">Sign in</h1>
        <p className="mt-2 text-sm text-gray-500">
          Enter your email and password to sign in!
        </p>

        {/* 1-Click Demo Fill Card */}
        <div className="mt-4 rounded-xl border border-blue-200 bg-blue-50/70 p-3.5 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-brand-navy">
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-brand-blue text-xs text-white">
                ⚡
              </span>
              <span>Live Mock Demo:</span>
            </div>
            <span className="text-[11px] font-medium text-gray-500">1-click auto-fill</span>
          </div>
          <div className="mt-2.5 grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => handleFillDemo("business")}
              className="flex items-center justify-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 py-2 text-xs font-semibold text-gray-800 shadow-sm transition hover:border-brand-blue hover:text-brand-blue hover:bg-blue-50/50 active:scale-95"
            >
              🏢 Business Owner
            </button>
            <button
              type="button"
              onClick={() => handleFillDemo("auditor")}
              className="flex items-center justify-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 py-2 text-xs font-semibold text-gray-800 shadow-sm transition hover:border-brand-blue hover:text-brand-blue hover:bg-blue-50/50 active:scale-95"
            >
              🔍 Auditor Partner
            </button>
          </div>
        </div>

        {error && (
          <div className="mt-4 rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-600">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-5">
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

          <div className="flex justify-end -mt-2">
            <Link
              href="/forgot-password"
              className="text-sm font-medium text-brand-blue hover:underline"
            >
              Forgot Password?
            </Link>
          </div>

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
