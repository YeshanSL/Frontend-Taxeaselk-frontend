"use client";

import { useState } from "react";
import { UserCheck, Check } from "lucide-react";
import Button from "@/components/ui/Button";

export default function SubmitToAuditorButton() {
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  async function handleSubmit() {
    setSubmitting(true);
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
      const token = typeof window !== "undefined" ? localStorage.getItem("taxease_token") : null;
      const headers: Record<string, string> = { "Content-Type": "application/json" };
      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }
      const res = await fetch(`${apiUrl}/api/financials/submit-to-auditor`, {
        method: "POST",
        headers,
      });
      if (res.ok) {
        setSubmitted(true);
      }
    } catch (err) {
      console.error("Failed to submit to auditor:", err);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Button
      icon={submitted ? <Check className="h-4 w-4 text-white" /> : <UserCheck className="h-4 w-4" />}
      onClick={handleSubmit}
      disabled={submitting}
    >
      {submitting ? "Submitting..." : submitted ? "Submitted to Auditor" : "Submit to Auditor"}
    </Button>
  );
}
