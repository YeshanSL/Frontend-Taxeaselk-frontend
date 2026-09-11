"use client";

import { useState } from "react";
import { 
  Calculator, 
  ChevronDown, 
  ChevronUp, 
  HelpCircle, 
  ShieldAlert, 
  CheckCircle2, 
  TrendingUp, 
  FileText,
  Building2,
  Info
} from "lucide-react";
import Card from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";
import { FinancialsSummary } from "@/lib/types";

interface CitTaxComputationBannerProps {
  data: FinancialsSummary;
}

export default function CitTaxComputationBanner({ data }: CitTaxComputationBannerProps) {
  const [showDetails, setShowDetails] = useState(false);

  const accountingProfit = data.accountingProfit || "Rs. 4,600,000";
  const disallowables = data.disallowableAddBacks || "Rs. 2,100,000";
  const allowances = data.taxCapitalAllowances || "Rs. 1,500,000";
  const taxableIncome = data.taxableIncome || "Rs. 5,200,000";
  const citRate = data.citRatePercent || 30;
  const citLiability = data.estCitLiability || "Rs. 1,560,000";
  const auditorStatus = data.auditorStatus || "Under Review by Auditor";
  const irdGazette = data.irdGazetteRef || "Inland Revenue Act No. 24 of 2017 (Gazette 2311/38 — 30% Standard Rate)";

  const isApproved = auditorStatus.toLowerCase().includes("approved") || auditorStatus.toLowerCase().includes("completed");

  return (
    <Card className="mt-6 border-l-4 border-l-brand-blue bg-gradient-to-br from-white via-blue-50/20 to-white shadow-sm overflow-hidden">
      {/* Header section */}
      <div className="flex flex-col gap-3 p-5 sm:flex-row sm:items-center sm:justify-between border-b border-gray-100">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-brand-blue/10 text-brand-blue">
            <Calculator className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-base font-bold text-gray-900">
                Auditor Working Paper: Preliminary Tax & Reconciliation Guide
              </h2>
              <span className="inline-flex items-center gap-1 rounded-md bg-blue-100/80 px-2 py-0.5 text-xs font-semibold text-brand-blue">
                <Building2 className="h-3 w-3" /> IRD Statutory Reference
              </span>
            </div>
            <p className="mt-0.5 text-xs text-gray-500">
              Extracted from uploaded records to facilitate statutory auditor inspection, adjustments, and certification under Inland Revenue Act No. 24.
            </p>
          </div>
        </div>

        {/* Auditor & Status tags */}
        <div className="flex items-center gap-2 shrink-0">
          <div className="flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 py-1.5 shadow-2xs">
            <span className="text-xs text-gray-500">Auditor Status:</span>
            {isApproved ? (
              <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" /> Approved
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 text-xs font-semibold text-amber-700">
                <span className="h-2 w-2 rounded-full bg-amber-500 animate-pulse" /> {auditorStatus}
              </span>
            )}
          </div>
          <button
            onClick={() => setShowDetails(!showDetails)}
            className="flex items-center gap-1 rounded-lg border border-gray-200 bg-white px-2.5 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-colors"
          >
            {showDetails ? (
              <>Less <ChevronUp className="h-3.5 w-3.5" /></>
            ) : (
              <>Breakdown <ChevronDown className="h-3.5 w-3.5" /></>
            )}
          </button>
        </div>
      </div>

      {/* Waterfall computation cards */}
      <div className="grid grid-cols-1 divide-y divide-gray-100 sm:grid-cols-5 sm:divide-y-0 sm:divide-x p-5 bg-white/70">
        {/* Step 1: Accounting PBT */}
        <div className="py-2 sm:px-3 first:sm:pl-0">
          <div className="text-xs font-medium uppercase tracking-wider text-gray-400">1. Accounting PBT</div>
          <div className="mt-1.5 text-lg font-bold text-gray-900">{accountingProfit}</div>
          <div className="mt-1 flex items-center gap-1 text-[11px] text-gray-500">
            <span>Per Audited / Draft P&L</span>
          </div>
        </div>

        {/* Step 2: Disallowables (+ Add back) */}
        <div className="py-2 sm:px-3">
          <div className="flex items-center justify-between text-xs font-medium uppercase tracking-wider text-amber-700">
            <span>2. (+) Disallowables</span>
            <span className="rounded bg-amber-100 px-1 py-0.2 text-[10px] font-bold text-amber-800">Sec 11</span>
          </div>
          <div className="mt-1.5 text-lg font-bold text-amber-700">+{disallowables}</div>
          <div className="mt-1 text-[11px] text-gray-500">
            Depreciation + Entertainment
          </div>
        </div>

        {/* Step 3: Capital Allowances (- Deductions) */}
        <div className="py-2 sm:px-3">
          <div className="flex items-center justify-between text-xs font-medium uppercase tracking-wider text-blue-700">
            <span>3. (-) Allowances</span>
            <span className="rounded bg-blue-100 px-1 py-0.2 text-[10px] font-bold text-blue-800">4th Sched</span>
          </div>
          <div className="mt-1.5 text-lg font-bold text-blue-700">-{allowances}</div>
          <div className="mt-1 text-[11px] text-gray-500">
            Tax Capital Depreciation
          </div>
        </div>

        {/* Step 4: Taxable Income */}
        <div className="py-2 sm:px-3">
          <div className="text-xs font-medium uppercase tracking-wider text-gray-500">4. Taxable Income</div>
          <div className="mt-1.5 text-lg font-bold text-gray-900">{taxableIncome}</div>
          <div className="mt-1 text-[11px] text-gray-500">
            Assessable Business Profit
          </div>
        </div>

        {/* Step 5: Indicative CIT Liability */}
        <div className="py-2 sm:px-3 sm:pr-0 bg-brand-blue/5 -my-2 -mr-5 p-4 rounded-r-lg">
          <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-wider text-brand-blue">
            <span>5. Indicative CIT ({citRate}%)</span>
            <span className="rounded-full bg-brand-blue text-white text-[10px] font-bold px-1.5 py-0.2">Draft</span>
          </div>
          <div className="mt-1.5 text-xl font-extrabold text-brand-blue">{citLiability}</div>
          <div className="mt-1 flex items-center gap-1 text-[11px] text-gray-500 font-medium">
            <span>Subject to Auditor Sign-off</span>
          </div>
        </div>
      </div>

      {/* Expandable detailed tax reconciliation notes */}
      {showDetails && (
        <div className="border-t border-gray-100 bg-gray-50/70 p-5 text-xs text-gray-600 transition-all">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <h4 className="font-semibold text-gray-800 flex items-center gap-1.5">
                <ShieldAlert className="h-4 w-4 text-amber-600" />
                Section 11 Non-Deductible Add-Back Details:
              </h4>
              <ul className="space-y-1 pl-5 list-disc text-gray-600">
                <li>
                  <span className="font-medium text-gray-700">Accounting Depreciation (Rs. 1,800,000):</span> Inadmissible under Section 11(1)(b); completely replaced by Tax Capital Allowances.
                </li>
                <li>
                  <span className="font-medium text-gray-700">Entertainment Expenses (Rs. 300,000):</span> Disallowed under Section 11(1)(c) for client hospitality and staff dining above statutory allowances.
                </li>
                <li>
                  <span className="font-medium text-gray-700">Fines & Penalties:</span> Rs. 0.00 detected in extracted ledgers.
                </li>
              </ul>
            </div>

            <div className="space-y-2">
              <h4 className="font-semibold text-gray-800 flex items-center gap-1.5">
                <TrendingUp className="h-4 w-4 text-blue-600" />
                Fourth Schedule Capital Allowances Breakdown:
              </h4>
              <ul className="space-y-1 pl-5 list-disc text-gray-600">
                <li>
                  <span className="font-medium text-gray-700">Office Equipment & Computers (20% p.a.):</span> Rs. 420,000 deductible allowance.
                </li>
                <li>
                  <span className="font-medium text-gray-700">Commercial Buildings (5% p.a. straight line):</span> Rs. 800,000 allowance.
                </li>
                <li>
                  <span className="font-medium text-gray-700">Motor Vehicles (Section 16 restrictions):</span> Rs. 280,000 eligible allowance (subject to statutory cap).
                </li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Statutory citation & handover disclaimer footer */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-2 border-t border-gray-100 bg-gray-50/50 px-5 py-2.5 text-[11px] text-gray-500">
        <div className="flex items-center gap-1.5">
          <Info className="h-3.5 w-3.5 text-brand-blue shrink-0" />
          <span>Statutory Authority: {irdGazette}</span>
        </div>
        <div className="text-gray-400 text-right">
          * Indicative working paper for collaborative auditor review. Final tax return must be certified by the licensed statutory auditor.
        </div>
      </div>
    </Card>
  );
}

