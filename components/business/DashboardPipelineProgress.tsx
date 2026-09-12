"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  FileText,
  FolderOpen,
  Sparkles,
  Send,
  MessagesSquare,
  ShieldCheck,
  AlertTriangle,
  Clock,
  CheckCircle2,
  ChevronRight,
} from "lucide-react";
import Card from "@/components/ui/Card";
import ProgressBar from "@/components/ui/ProgressBar";
import { DashboardSummary, DashboardStep } from "@/lib/types";

const STAGE_CONFIGS: Record<
  string,
  {
    icon: React.ComponentType<{ className?: string }>;
    color: string;
    bgColor: string;
    borderColor: string;
    defaultHref: string;
  }
> = {
  "Document Gathering": {
    icon: FolderOpen,
    color: "text-blue-600",
    bgColor: "bg-blue-50",
    borderColor: "border-blue-100",
    defaultHref: "/documents",
  },
  "Financial Data": {
    icon: FolderOpen,
    color: "text-blue-600",
    bgColor: "bg-blue-50",
    borderColor: "border-blue-100",
    defaultHref: "/documents",
  },
  "AI Extraction": {
    icon: Sparkles,
    color: "text-purple-600",
    bgColor: "bg-purple-50",
    borderColor: "border-purple-100",
    defaultHref: "/documents",
  },
  "Auditor Handover": {
    icon: Send,
    color: "text-indigo-600",
    bgColor: "bg-indigo-50",
    borderColor: "border-indigo-100",
    defaultHref: "/documents",
  },
  "Auditor Inquiries": {
    icon: MessagesSquare,
    color: "text-amber-600",
    bgColor: "bg-amber-50",
    borderColor: "border-amber-100",
    defaultHref: "/auditor-review",
  },
  "Audit Sign-Off": {
    icon: ShieldCheck,
    color: "text-emerald-600",
    bgColor: "bg-emerald-50",
    borderColor: "border-emerald-100",
    defaultHref: "/auditor-review",
  },
  "Auditor Review": {
    icon: ShieldCheck,
    color: "text-emerald-600",
    bgColor: "bg-emerald-50",
    borderColor: "border-emerald-100",
    defaultHref: "/auditor-review",
  },
};

export default function DashboardPipelineProgress({
  summary,
}: {
  summary: DashboardSummary;
}) {
  const { progressPercent, progressUpdatedAt, steps } = summary;
  const [liveStatus, setLiveStatus] = useState<string | null>(null);

  useEffect(() => {
    function handleUpdate(e: any) {
      if (e.detail?.status) {
        setLiveStatus(e.detail.status);
      }
    }
    const saved = localStorage.getItem("taxease_last_audit_status");
    if (saved) setLiveStatus(saved);

    window.addEventListener("taxease_audit_status_updated", handleUpdate);
    return () => window.removeEventListener("taxease_audit_status_updated", handleUpdate);
  }, []);

  const isApproved = liveStatus === "Approved" || progressPercent >= 100;
  const effectivePercent = progressPercent;

  return (
    <Card className="mt-6 p-6 shadow-sm border border-gray-200/90 bg-white">
      {/* Overall Header */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="font-bold text-gray-900 text-lg">
              Audit Handover & Verification Pipeline
            </h2>
            <span
              className={`rounded-full px-2.5 py-0.5 text-xs font-bold ${
                effectivePercent >= 100
                  ? "bg-emerald-100 text-emerald-800 border border-emerald-200"
                  : effectivePercent >= 60
                  ? "bg-blue-50 text-brand-blue border border-blue-200"
                  : "bg-amber-50 text-amber-800 border border-amber-200"
              }`}
            >
              {effectivePercent >= 100
                ? "Audit Pack Signed Off"
                : effectivePercent >= 60
                ? "Handover In Progress"
                : "Awaiting Documents"}
            </span>
          </div>
          <p className="text-xs text-gray-400 mt-1">
            Real-time document collection, AI parsing & auditor verification • Last synced {progressUpdatedAt}
          </p>
        </div>

        <div className="text-right">
          <div className="flex items-baseline justify-end gap-1">
            <span className="text-3xl font-extrabold text-brand-blue tracking-tight">
              {effectivePercent}%
            </span>
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
              Complete
            </span>
          </div>
          <p className="text-[11px] text-gray-400 mt-0.5">
            Composite weighted tax pack progress
          </p>
        </div>
      </div>

      {/* Main Overall Progress Bar */}
      <div className="mt-4">
        <ProgressBar value={effectivePercent} />
      </div>

      {/* 5 Real Data-Driven Pipeline Stage Progress Cards */}
      <div className="mt-6 grid grid-cols-1 gap-3.5 sm:grid-cols-2 lg:grid-cols-5">
        {steps.map((step: DashboardStep, index: number) => {
          const cfg = STAGE_CONFIGS[step.label] || {
            icon: CheckCircle2,
            color: "text-blue-600",
            bgColor: "bg-blue-50",
            borderColor: "border-blue-100",
            defaultHref: "/documents",
          };
          const Icon = cfg.icon;
          const href = step.href || cfg.defaultHref;
          const currentStepPercent = step.progressPercent;
          const isDone = currentStepPercent >= 100 || step.state === "done";
          const isWarning = !isDone && step.state === "warning";
          const displayRatio = step.ratioLabel;
          const displaySublabel = step.sublabel;


          return (
            <Link
              key={step.label}
              href={href}
              className="group relative flex flex-col justify-between rounded-xl border border-gray-200/90 bg-white p-3.5 hover:border-brand-blue/50 hover:shadow-md transition-all duration-150 cursor-pointer"
            >
              <div>
                {/* Stage Header */}
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <div
                      className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg ${cfg.bgColor} ${cfg.color}`}
                    >
                      <Icon className="h-4 w-4" />
                    </div>
                    <span className="text-[11px] font-bold text-gray-400">
                      Stage {index + 1}
                    </span>
                  </div>

                  {/* Status Indicator */}
                  {isDone ? (
                    <span className="inline-flex items-center gap-1 rounded-md bg-emerald-50 px-1.5 py-0.5 text-[10px] font-bold text-emerald-700">
                      <CheckCircle2 className="h-3 w-3" />
                      100%
                    </span>
                  ) : isWarning ? (
                    <span className="inline-flex items-center gap-1 rounded-md bg-amber-50 px-1.5 py-0.5 text-[10px] font-bold text-amber-700">
                      <AlertTriangle className="h-3 w-3" />
                      {currentStepPercent}%
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 rounded-md bg-blue-50 px-1.5 py-0.5 text-[10px] font-bold text-brand-blue">
                      <Clock className="h-3 w-3" />
                      {currentStepPercent}%
                    </span>
                  )}
                </div>

                {/* Title & Ratio */}
                <div className="mt-2.5">
                  <h4 className="text-xs font-bold text-gray-900 group-hover:text-brand-blue transition-colors flex items-center justify-between">
                    <span>{step.label}</span>
                    <ChevronRight className="h-3 w-3 text-gray-300 group-hover:text-brand-blue group-hover:translate-x-0.5 transition-all" />
                  </h4>
                  {displayRatio && (
                    <p className="mt-0.5 text-[11px] font-semibold text-gray-600">
                      {displayRatio}
                    </p>
                  )}
                </div>
              </div>

              {/* Sub-Progress Bar & Subtitle */}
              <div className="mt-3 pt-2 border-t border-gray-100">
                <div className="h-1.5 w-full rounded-full bg-gray-100 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-300 ${
                      isDone
                        ? "bg-emerald-500"
                        : isWarning
                        ? "bg-amber-500"
                        : "bg-brand-blue"
                    }`}
                    style={{ width: `${Math.min(100, Math.max(0, currentStepPercent))}%` }}
                  />
                </div>
                {displaySublabel && (
                  <p className="mt-1.5 text-[10px] text-gray-400 truncate" title={displaySublabel}>
                    {displaySublabel}
                  </p>
                )}
              </div>
            </Link>
          );
        })}
      </div>
    </Card>
  );
}

