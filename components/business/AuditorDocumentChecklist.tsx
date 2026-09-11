"use client";

import { useMemo, useState, useEffect, useCallback } from "react";
import {
  ClipboardCheck,
  CheckCircle2,
  AlertTriangle,
  Clock,
  ArrowRight,
  ShieldCheck,
  FileCheck,
  Upload,
  Sparkles,
} from "lucide-react";
import Card from "@/components/ui/Card";
import ProgressBar from "@/components/ui/ProgressBar";
import { DocumentRow } from "@/lib/types";

export interface ChecklistItem {
  id: string;
  name: string;
  category: string;
  description: string;
  required: boolean;
  auditorNote?: string;
}

export const STATUTORY_CIT_CHECKLIST: ChecklistItem[] = [
  {
    id: "chk_fs",
    name: "Financial Statements",
    category: "Financial Statements",
    description: "Audited Balance Sheet, Income Statement & Notes",
    required: true,
  },
  {
    id: "chk_tb",
    name: "Final Trial Balance",
    category: "Trial Balance",
    description: "Balanced debit/credit year-end closing trial balance",
    required: true,
  },
  {
    id: "chk_gl",
    name: "General Ledger Dump",
    category: "General Ledger",
    description: "Detailed ledger transactions for expense verification",
    required: true,
  },
  {
    id: "chk_fa",
    name: "Fixed Asset Schedule",
    category: "Fixed Assets",
    description: "Tax depreciation schedule & capital allowances",
    required: true,
    auditorNote: "Required for RAMIS capital allowance claims",
  },
  {
    id: "chk_cit",
    name: "Previous CIT Return",
    category: "Previous CIT",
    description: "Prior year assessment & tax losses brought forward",
    required: true,
  },
  {
    id: "chk_bank",
    name: "Bank Reconciliation",
    category: "Bank Reconciliation",
    description: "Year-end bank confirmation & reconciliation statements",
    required: false,
  },
];

interface Props {
  documents: DocumentRow[];
  selectedCategory: string | null;
  onSelectCategory: (category: string | null) => void;
  onBrowseForCategory: (category: string) => void;
  companyName?: string;
  assignedAuditorName?: string;
  assignedAuditorFirm?: string;
}

export default function AuditorDocumentChecklist({
  documents,
  selectedCategory,
  onSelectCategory,
  onBrowseForCategory,
  companyName = "ABC Holdings (Pvt) Ltd",
  assignedAuditorName = "Mr. A. Karunaratne (FCA)",
  assignedAuditorFirm = "Karunaratne & Associates",
}: Props) {
  const [checklistItems, setChecklistItems] = useState<ChecklistItem[]>(STATUTORY_CIT_CHECKLIST);

  const loadChecklist = useCallback(() => {
    if (!companyName) return;
    try {
      const saved = localStorage.getItem(`taxease_checklist_${companyName}`);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setChecklistItems(parsed);
          return;
        }
      }
    } catch {
      // Fallback
    }
    setChecklistItems(STATUTORY_CIT_CHECKLIST);
  }, [companyName]);

  useEffect(() => {
    loadChecklist();

    function handleChecklistUpdated(e: Event) {
      const customEvt = e as CustomEvent;
      if (customEvt.detail?.companyName === companyName && Array.isArray(customEvt.detail?.items)) {
        setChecklistItems(customEvt.detail.items);
      } else {
        loadChecklist();
      }
    }

    window.addEventListener("taxease_checklist_updated", handleChecklistUpdated);
    window.addEventListener("storage", loadChecklist);

    // Also fetch from API if available
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
    fetch(`${apiUrl}/api/checklists/${encodeURIComponent(companyName)}`)
      .then((res) => {
        if (res.ok) return res.json();
        return null;
      })
      .then((data) => {
        if (data && Array.isArray(data.items) && data.items.length > 0) {
          setChecklistItems(data.items);
        }
      })
      .catch(() => null);

    return () => {
      window.removeEventListener("taxease_checklist_updated", handleChecklistUpdated);
      window.removeEventListener("storage", loadChecklist);
    };
  }, [companyName, loadChecklist]);

  // Compute matching status for each checklist item
  const itemStatuses = useMemo(() => {
    return checklistItems.map((item) => {
      // Find matching document by category, item name or keyword
      const matched = documents.find((doc) => {
        const dType = (doc.type || "").toLowerCase();
        const cType = item.category.toLowerCase();
        const iName = item.name.toLowerCase();
        const dName = (doc.name || "").toLowerCase();

        if (dType.includes(cType) || cType.includes(dType)) return true;
        if (dType.includes(iName) || iName.includes(dType)) return true;
        if (dName.includes(cType) || dName.includes(iName)) return true;

        if (item.id === "chk_fs" && (dName.includes("financial") || dName.includes("p&l") || dName.includes("statement"))) return true;
        if (item.id === "chk_tb" && (dName.includes("trial") || dName.includes("tb"))) return true;
        if (item.id === "chk_gl" && (dName.includes("ledger") || dName.includes("gl"))) return true;
        if (item.id === "chk_fa" && (dName.includes("asset") || dName.includes("depreciation"))) return true;
        if (item.id === "chk_cit" && (dName.includes("cit") || dName.includes("return") || dName.includes("tax"))) return true;
        if (item.id === "chk_bank" && (dName.includes("bank") || dName.includes("reconciliation"))) return true;
        if (item.id === "chk_boi" && (dName.includes("boi") || dName.includes("agreement"))) return true;
        if (item.id === "chk_export" && (dName.includes("export") || dName.includes("realization"))) return true;
        if (item.id === "chk_inventory" && (dName.includes("inventory") || dName.includes("stock"))) return true;
        if (item.id === "chk_wht" && (dName.includes("wht") || dName.includes("withholding") || dName.includes("schedule 10"))) return true;

        return false;
      });

      let status: "fulfilled" | "review_required" | "processing" | "missing" = "missing";
      if (matched) {
        if (matched.status === "review_required") {
          status = "review_required";
        } else if (matched.status === "processing") {
          status = "processing";
        } else {
          status = "fulfilled";
        }
      }

      return {
        item,
        matchedDocument: matched,
        status,
      };
    });
  }, [checklistItems, documents]);

  // Checklist statistics
  const stats = useMemo(() => {
    const requiredItems = itemStatuses.filter(({ item }) => item.required);
    const totalRequired = requiredItems.length;
    const fulfilledCount = requiredItems.filter(({ status }) => status === "fulfilled" || status === "review_required").length;
    const allDone = fulfilledCount >= totalRequired;
    const percentage = totalRequired > 0 ? Math.round((fulfilledCount / totalRequired) * 100) : 0;

    return { totalRequired, fulfilledCount, allDone, percentage };
  }, [itemStatuses]);

  return (
    <Card className="flex flex-col h-full overflow-hidden p-0 shadow-sm border border-gray-200/90 bg-white">
      {/* Header */}
      <div className="border-b border-gray-100 bg-gradient-to-r from-slate-50/80 to-blue-50/40 p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-100/80 text-brand-blue shadow-2xs">
              <ClipboardCheck className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-gray-900 flex items-center gap-1.5">
                Auditor&apos;s Document Checklist
                <span className="rounded-full bg-blue-100 px-2 py-0.2 text-[10px] font-bold text-brand-blue">
                  CIT 2025/26
                </span>
              </h3>
              <p className="text-[11px] text-gray-500 mt-0.5 flex items-center gap-1.5">
                <ShieldCheck className="h-3 w-3 text-emerald-600 shrink-0" />
                <span>Requested by {assignedAuditorName}</span>
                <span className="text-gray-300">•</span>
                <span className="truncate max-w-[140px]">{assignedAuditorFirm}</span>
              </p>
            </div>
          </div>

          <div className="text-right">
            <span
              className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-bold ${
                stats.allDone
                  ? "bg-emerald-100 text-emerald-800 border border-emerald-200"
                  : "bg-blue-50 text-brand-blue border border-blue-200"
              }`}
            >
              {stats.fulfilledCount}/{stats.totalRequired} Provided
            </span>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mt-3">
          <div className="flex items-center justify-between text-[11px] mb-1">
            <span className="font-semibold text-gray-600">Audit Pack Readiness</span>
            <span className={`font-bold ${stats.allDone ? "text-emerald-600" : "text-brand-blue"}`}>
              {stats.percentage}%
            </span>
          </div>
          <ProgressBar value={stats.percentage} />
        </div>
      </div>

      {/* Checklist Items List */}
      <div className="flex-1 overflow-y-auto p-3.5 space-y-2 divide-y divide-gray-50">
        {itemStatuses.map(({ item, matchedDocument, status }) => {
          const isSelected = selectedCategory === item.category;

          return (
            <div
              key={item.id}
              onClick={() => {
                if (status === "missing") {
                  onBrowseForCategory(item.category);
                } else {
                  onSelectCategory(isSelected ? null : item.category);
                }
              }}
              className={`group flex items-center justify-between rounded-xl p-2.5 transition-all cursor-pointer ${
                isSelected
                  ? "bg-blue-50/90 border border-blue-200 shadow-2xs ring-1 ring-blue-300"
                  : status === "fulfilled"
                  ? "hover:bg-gray-50/90 border border-transparent"
                  : "hover:bg-amber-50/60 border border-transparent"
              }`}
            >
              <div className="flex items-start gap-2.5 min-w-0 pr-2">
                {/* Status Icon Indicator */}
                <div className="mt-0.5 shrink-0">
                  {status === "fulfilled" ? (
                    <div className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
                      <CheckCircle2 className="h-4 w-4" />
                    </div>
                  ) : status === "review_required" ? (
                    <div className="flex h-5 w-5 items-center justify-center rounded-full bg-amber-100 text-amber-600">
                      <AlertTriangle className="h-3.5 w-3.5" />
                    </div>
                  ) : status === "processing" ? (
                    <div className="flex h-5 w-5 items-center justify-center rounded-full bg-blue-100 text-brand-blue animate-pulse">
                      <Clock className="h-3.5 w-3.5" />
                    </div>
                  ) : (
                    <div className="flex h-5 w-5 items-center justify-center rounded-full border border-gray-300 bg-white text-gray-300 group-hover:border-brand-blue group-hover:text-brand-blue">
                      <div className="h-1.5 w-1.5 rounded-full bg-gray-300 group-hover:bg-brand-blue" />
                    </div>
                  )}
                </div>

                {/* Item Details */}
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="text-xs font-bold text-gray-900 group-hover:text-brand-blue transition-colors">
                      {item.name}
                    </span>
                    {item.required ? (
                      <span className="text-[9px] font-semibold uppercase tracking-wider text-rose-600 bg-rose-50 border border-rose-200/80 px-1.5 py-0.2 rounded">
                        Required
                      </span>
                    ) : (
                      <span className="text-[9px] font-semibold text-gray-500 bg-gray-100 px-1.5 py-0.2 rounded">
                        Optional
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-gray-500 truncate mt-0.5">
                    {matchedDocument ? matchedDocument.name : item.description}
                  </p>
                </div>
              </div>

              {/* Action / State Tag */}
              <div className="shrink-0 flex items-center gap-1.5">
                {status === "fulfilled" ? (
                  <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200/80 px-2 py-0.5 rounded-md">
                    <FileCheck className="h-3 w-3" />
                    Uploaded
                  </span>
                ) : status === "review_required" ? (
                  <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-700 bg-amber-50 border border-amber-200/80 px-2 py-0.5 rounded-md">
                    In Review
                  </span>
                ) : (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onBrowseForCategory(item.category);
                    }}
                    className="inline-flex items-center gap-1 text-[11px] font-semibold text-brand-blue bg-blue-50/80 hover:bg-blue-100 border border-blue-200 px-2.5 py-1 rounded-lg transition-colors shadow-2xs"
                  >
                    <Upload className="h-3 w-3" />
                    Upload
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Footer Banner */}
      <div className="border-t border-gray-100 bg-slate-50/80 p-3 text-center">
        {stats.allDone ? (
          <div className="flex items-center justify-center gap-1.5 text-xs font-semibold text-emerald-700">
            <Sparkles className="h-3.5 w-3.5 text-emerald-600" />
            <span>All statutory checklist documents uploaded! Pack ready for review.</span>
          </div>
        ) : (
          <div className="flex items-center justify-between text-xs text-gray-500">
            <span className="text-[11px]">Click any missing item to browse and upload</span>
            <span className="font-semibold text-brand-blue flex items-center gap-1">
              {stats.totalRequired - stats.fulfilledCount} items remaining
              <ArrowRight className="h-3 w-3" />
            </span>
          </div>
        )}
      </div>
    </Card>
  );
}

