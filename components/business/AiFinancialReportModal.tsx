"use client";

import { useState } from "react";
import { 
  X, 
  Sparkles, 
  Printer, 
  Share2, 
  Download, 
  CheckCircle2, 
  AlertTriangle, 
  ShieldCheck, 
  Building2, 
  Calendar, 
  FileText,
  TrendingUp,
  Percent
} from "lucide-react";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";
import { AiFinancialReportData } from "@/lib/types";

interface AiFinancialReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  reportData: AiFinancialReportData;
}

export default function AiFinancialReportModal({
  isOpen,
  onClose,
  reportData,
}: AiFinancialReportModalProps) {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handlePrint = () => {
    window.print();
  };

  const handleShare = () => {
    navigator.clipboard.writeText(
      `AI Tax & Financial Report for ${reportData.companyName} (${reportData.taxYear}): Estimated Taxable Income ${reportData.taxReconciliation.taxableIncome}, Est. CIT: ${reportData.taxReconciliation.estimatedLiability}`
    );
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-4xl rounded-2xl bg-white shadow-2xl border border-gray-100 max-h-[90vh] flex flex-col my-auto">
        {/* Modal Top Bar */}
        <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4 bg-gradient-to-r from-blue-900 via-indigo-900 to-blue-950 text-white rounded-t-2xl">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10 text-blue-200">
              <Sparkles className="h-5 w-5 text-amber-300" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-bold text-white">
                  AI Executive Audit Handover & Financial Summary
                </h3>
                <span className="rounded-md bg-amber-400/20 px-2 py-0.5 text-xs font-semibold text-amber-300 border border-amber-300/30">
                  For Auditor Review
                </span>
              </div>
              <p className="text-xs text-blue-200 flex items-center gap-2 mt-0.5">
                <span>{reportData.companyName}</span>
                <span>•</span>
                <span>Assessment Year: {reportData.taxYear}</span>
                <span>•</span>
                <span>Generated: {reportData.generatedAt}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 rounded-lg bg-white/10 px-3 py-1.5 text-xs font-medium text-white hover:bg-white/20 transition-colors"
            >
              <Printer className="h-3.5 w-3.5" /> Print / PDF
            </button>
            <button
              onClick={handleShare}
              className="flex items-center gap-1.5 rounded-lg bg-white/10 px-3 py-1.5 text-xs font-medium text-white hover:bg-white/20 transition-colors"
            >
              <Share2 className="h-3.5 w-3.5" /> {copied ? "Copied!" : "Share"}
            </button>
            <button
              onClick={onClose}
              className="rounded-lg p-1.5 text-white/80 hover:bg-white/10 hover:text-white transition-colors ml-2"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Modal Scrollable Body */}
        <div className="overflow-y-auto p-6 space-y-6 text-gray-800 text-sm">
          {/* Executive Summary Card */}
          <div className="rounded-xl border border-blue-100 bg-blue-50/40 p-5">
            <h4 className="text-sm font-bold text-brand-blue flex items-center gap-2 mb-2">
              <Sparkles className="h-4 w-4 text-brand-blue" />
              Executive Financial & Tax Synthesis
            </h4>
            <p className="text-sm text-gray-700 leading-relaxed">
              {reportData.executiveSummary}
            </p>
          </div>

          {/* KPI Snapshot Grid */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-3">
              Commercial Performance & Margins
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
              <div className="rounded-lg border border-gray-100 bg-gray-50/70 p-3">
                <span className="text-xs text-gray-500">Gross Turnover</span>
                <p className="text-base font-bold text-gray-900 mt-1">{reportData.profitabilityAnalysis.revenue}</p>
              </div>
              <div className="rounded-lg border border-gray-100 bg-gray-50/70 p-3">
                <span className="text-xs text-gray-500">Gross Profit</span>
                <p className="text-base font-bold text-gray-900 mt-1">{reportData.profitabilityAnalysis.grossProfit}</p>
              </div>
              <div className="rounded-lg border border-gray-100 bg-gray-50/70 p-3">
                <span className="text-xs text-gray-500">Gross Margin</span>
                <p className="text-base font-bold text-emerald-600 mt-1">{reportData.profitabilityAnalysis.grossMargin}</p>
              </div>
              <div className="rounded-lg border border-gray-100 bg-gray-50/70 p-3">
                <span className="text-xs text-gray-500">Operating Expenses</span>
                <p className="text-base font-bold text-gray-900 mt-1">{reportData.profitabilityAnalysis.operatingExpenses}</p>
              </div>
              <div className="rounded-lg border border-blue-200 bg-blue-50/50 p-3">
                <span className="text-xs text-brand-blue font-medium">Accounting PBT</span>
                <p className="text-base font-bold text-brand-blue mt-1">{reportData.profitabilityAnalysis.netPbt}</p>
              </div>
            </div>
          </div>

          {/* Statutory Tax Reconciliation Schedule */}
          <div className="rounded-xl border border-gray-200 overflow-hidden shadow-2xs">
            <div className="bg-gray-100/70 px-4 py-3 border-b border-gray-200 flex items-center justify-between">
              <h4 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                <Building2 className="h-4 w-4 text-brand-blue" />
                Statutory Corporate Tax Reconciliation (Inland Revenue Act No. 24)
              </h4>
              <span className="text-xs text-gray-500">Standard CIT Rate: {reportData.taxReconciliation.citRate}</span>
            </div>

            <table className="w-full text-left text-xs sm:text-sm">
              <tbody className="divide-y divide-gray-100">
                <tr className="bg-white hover:bg-gray-50/60">
                  <td className="px-4 py-3 font-semibold text-gray-800">Commercial Net Profit Before Tax (PBT)</td>
                  <td className="px-4 py-3 text-right font-bold text-gray-900">{reportData.taxReconciliation.accountingProfit}</td>
                </tr>
                <tr className="bg-amber-50/40">
                  <td className="px-4 py-3 text-amber-900">
                    <span className="font-semibold">(+) Disallowable Expenses Add-back (Section 11)</span>
                    <span className="block text-xs text-amber-700">Accounting Depreciation & Entertainment expenses disallowed for tax purposes.</span>
                  </td>
                  <td className="px-4 py-3 text-right font-bold text-amber-800">+{reportData.taxReconciliation.disallowablesTotal}</td>
                </tr>
                {reportData.taxReconciliation.disallowablesItems.map((item, idx) => (
                  <tr key={idx} className="text-xs text-gray-600 bg-white/70">
                    <td className="pl-8 pr-4 py-1.5">• {item.item} ({item.reason})</td>
                    <td className="px-4 py-1.5 text-right font-medium text-amber-700">{item.amount}</td>
                  </tr>
                ))}
                <tr className="bg-blue-50/40">
                  <td className="px-4 py-3 text-blue-900">
                    <span className="font-semibold">(-) Deductible Tax Capital Allowances (Fourth Schedule)</span>
                    <span className="block text-xs text-blue-700">Allowances on qualifying Plant, Equipment & Buildings.</span>
                  </td>
                  <td className="px-4 py-3 text-right font-bold text-blue-800">-{reportData.taxReconciliation.capitalAllowancesTotal}</td>
                </tr>
                <tr className="bg-gray-50 font-semibold text-gray-900 border-t-2 border-gray-300">
                  <td className="px-4 py-3 text-sm">(=) Estimated Taxable Business Income</td>
                  <td className="px-4 py-3 text-right text-base font-bold text-gray-900">{reportData.taxReconciliation.taxableIncome}</td>
                </tr>
                <tr className="bg-brand-blue/10 font-bold text-brand-blue border-t border-brand-blue/20">
                  <td className="px-4 py-3.5 text-sm">
                    Estimated Corporate Income Tax (CIT) Liability ({reportData.taxReconciliation.citRate})
                  </td>
                  <td className="px-4 py-3.5 text-right text-lg font-black text-brand-blue">{reportData.taxReconciliation.estimatedLiability}</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Tax Risks & Compliance Health */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="rounded-xl border border-amber-200 bg-amber-50/30 p-4">
              <h5 className="font-bold text-amber-900 flex items-center gap-1.5 text-xs uppercase tracking-wider mb-2">
                <AlertTriangle className="h-4 w-4 text-amber-600" />
                Key Tax Risks & Observations
              </h5>
              <ul className="space-y-1.5 text-xs text-gray-700">
                {reportData.keyTaxRisks.map((risk, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-amber-500 mt-1.5 shrink-0" />
                    <span>{risk}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="rounded-xl border border-emerald-200 bg-emerald-50/30 p-4">
              <h5 className="font-bold text-emerald-900 flex items-center gap-1.5 text-xs uppercase tracking-wider mb-2">
                <ShieldCheck className="h-4 w-4 text-emerald-600" />
                Recommended Auditor Action Points
              </h5>
              <ul className="space-y-1.5 text-xs text-gray-700">
                {reportData.recommendations.map((rec, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 shrink-0 mt-0.5" />
                    <span>{rec}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="flex flex-col sm:flex-row items-center justify-between border-t border-gray-100 bg-gray-50 px-6 py-4 rounded-b-2xl gap-2">
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <ShieldCheck className="h-4 w-4 text-emerald-600 shrink-0" />
            <span>Audit Handover Readiness: <strong className="text-gray-900">{reportData.complianceScore}/100</strong> • Subject to statutory auditor certification</span>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="secondary" onClick={onClose} className="px-3.5 py-1.5 text-xs">
              Close
            </Button>
            <Button onClick={handlePrint} className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs">
              <Download className="h-3.5 w-3.5" /> Export PDF
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
