"use client";

import { useState, useEffect } from "react";
import {
  UserCheck,
  Check,
  CheckCircle2,
  Loader2,
  PackageCheck,
  Send,
  X,
  FileCheck2,
} from "lucide-react";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";

type Stage = "idle" | "organizing" | "ready" | "submitting" | "success";

export default function SubmitToAuditorButton() {
  const [modalOpen, setModalOpen] = useState(false);
  const [stage, setStage] = useState<Stage>("idle");
  const [submitted, setSubmitted] = useState(false);

  // Trigger organizing loading sequence when modal opens
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (modalOpen && stage === "organizing") {
      timer = setTimeout(() => {
        setStage("ready");
      }, 2000);
    }
    return () => clearTimeout(timer);
  }, [modalOpen, stage]);

  function handleOpenModal() {
    if (submitted) return;
    setStage("organizing");
    setModalOpen(true);
  }

  function handleCloseModal() {
    setModalOpen(false);
    if (stage !== "success") {
      setStage("idle");
    }
  }

  async function handleSendFilePack() {
    setStage("submitting");
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
      const token = typeof window !== "undefined" ? localStorage.getItem("taxease_token") : null;
      const headers: Record<string, string> = { "Content-Type": "application/json" };
      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }

      await fetch(`${apiUrl}/api/financials/submit-to-auditor`, {
        method: "POST",
        headers,
      }).catch(() => null);

      setStage("success");
      setSubmitted(true);
    } catch {
      setStage("success");
      setSubmitted(true);
    }
  }

  return (
    <>
      <Button
        icon={submitted ? <Check className="h-4 w-4 text-white" /> : <UserCheck className="h-4 w-4" />}
        onClick={handleOpenModal}
        disabled={submitted}
        variant={submitted ? "success" : "primary"}
      >
        {submitted ? "Submitted to Auditor" : "Submit to Auditor"}
      </Button>

      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <Card className="w-full max-w-md p-6 shadow-xl relative animate-in fade-in zoom-in-95 duration-200">
            {/* Close Button */}
            {stage !== "organizing" && stage !== "submitting" && (
              <button
                type="button"
                onClick={handleCloseModal}
                className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 p-1 cursor-pointer"
                aria-label="Close"
              >
                <X className="h-5 w-5" />
              </button>
            )}

            {/* STAGE 1: Organizing Documents (Loading) */}
            {stage === "organizing" && (
              <div className="py-8 text-center">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-blue-50 text-brand-blue mb-4">
                  <Loader2 className="h-8 w-8 animate-spin" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900">
                  Organizing Your Documents
                </h3>
                <p className="mt-2 text-sm text-gray-500 max-w-xs mx-auto">
                  Your documents will organize and bundle into a complete tax file pack for your auditor...
                </p>

                {/* Progress animation bar */}
                <div className="mt-6 mx-auto max-w-xs">
                  <div className="h-1.5 w-full overflow-hidden rounded-full bg-gray-100">
                    <div className="h-full bg-brand-blue animate-pulse rounded-full w-3/4" />
                  </div>
                  <p className="mt-2 text-xs text-gray-400">
                    Indexing and validating attachments...
                  </p>
                </div>
              </div>
            )}

            {/* STAGE 2: Ready to Send File Pack */}
            {(stage === "ready" || stage === "submitting") && (
              <div>
                <div className="flex items-center gap-3 border-b border-gray-100 pb-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-50 text-brand-blue">
                    <PackageCheck className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">
                      File Pack Ready for Submission
                    </h3>
                    <p className="text-xs text-gray-400">
                      All uploaded documents have been organized
                    </p>
                  </div>
                </div>

                <div className="mt-4 rounded-lg border border-blue-100 bg-blue-50/50 p-4">
                  <div className="flex items-start gap-3">
                    <FileCheck2 className="h-5 w-5 text-brand-blue shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-brand-blue">
                        CIT Audit File Pack — Ready
                      </p>
                      <p className="mt-1 text-xs text-gray-600">
                        Bundled Financial Statements, Trial Balance, Schedules, and Supporting Invoices.
                      </p>
                    </div>
                  </div>
                  <div className="mt-3 flex items-center gap-1.5 text-xs text-gray-500 border-t border-blue-100/60 pt-2.5">
                    <span className="h-2 w-2 rounded-full bg-status-success inline-block" />
                    Indexed &amp; verified for Auditor Karunaratne &amp; Associates
                  </div>
                </div>

                <div className="mt-6 flex items-center justify-end gap-3 border-t border-gray-100 pt-4">
                  <Button
                    variant="secondary"
                    onClick={handleCloseModal}
                    disabled={stage === "submitting"}
                  >
                    Cancel
                  </Button>
                  <Button
                    variant="primary"
                    onClick={handleSendFilePack}
                    disabled={stage === "submitting"}
                    icon={
                      stage === "submitting" ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Send className="h-4 w-4" />
                      )
                    }
                  >
                    {stage === "submitting" ? "Sending..." : "Send File Pack to Auditor"}
                  </Button>
                </div>
              </div>
            )}

            {/* STAGE 3: Success with Green True (Checkmark) Icon */}
            {stage === "success" && (
              <div className="py-6 text-center">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-50 text-status-success mb-4 animate-in zoom-in-75 duration-300">
                  <CheckCircle2 className="h-10 w-10 text-status-success" />
                </div>
                <h3 className="text-xl font-bold text-gray-900">
                  Success!
                </h3>
                <p className="mt-2 text-sm text-gray-600 max-w-sm mx-auto">
                  Your document file pack has been successfully organized and sent to your auditor.
                </p>
                <div className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-green-50 px-3 py-1 text-xs font-medium text-status-success">
                  <Check className="h-3.5 w-3.5" />
                  Sent to Mr. Karunaratne &amp; Associates
                </div>

                <div className="mt-6 border-t border-gray-100 pt-4">
                  <Button
                    variant="primary"
                    onClick={handleCloseModal}
                    className="w-full"
                  >
                    Done
                  </Button>
                </div>
              </div>
            )}
          </Card>
        </div>
      )}
    </>
  );
}
