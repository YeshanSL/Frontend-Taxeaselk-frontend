"use client";

import { useState } from "react";
import { 
  Sparkles, 
  Download, 
  FileText, 
  TrendingUp, 
  DollarSign, 
  Building, 
  Percent,
  Calendar,
  Layers,
  ArrowUpRight,
  ShieldCheck
} from "lucide-react";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import T from "@/components/layout/T";
import { FinancialsSummary, AiFinancialReportData } from "@/lib/types";
import CitTaxComputationBanner from "@/components/business/CitTaxComputationBanner";
import FinancialsTable from "@/components/business/FinancialsTable";
import AiFinancialReportModal from "@/components/business/AiFinancialReportModal";

interface FinancialsViewProps {
  data: FinancialsSummary;
  initialReport: AiFinancialReportData;
}

export default function FinancialsView({ data, initialReport }: FinancialsViewProps) {
  const [reportModalOpen, setReportModalOpen] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  const handleExportPack = async () => {
    setIsExporting(true);
    try {
      window.print();
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div>
      {/* Top Header & Executive Actions */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-gray-900">
              <T k="pages.financials.title" />
            </h1>
            <span className="rounded-full bg-blue-50 border border-blue-200 px-2.5 py-0.5 text-xs font-semibold text-brand-blue">
              AY 2025/2026
            </span>
          </div>
          <p className="mt-1 text-sm text-gray-500">
            <T k="pages.financials.subtitle" />
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            variant="secondary"
            onClick={handleExportPack}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold"
            disabled={isExporting}
          >
            <Download className="h-4 w-4" />
            <span>Export Handover Pack</span>
          </Button>

          <Button
            onClick={() => setReportModalOpen(true)}
            className="flex items-center gap-1.5 bg-gradient-to-r from-brand-blue to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-xs px-3.5 py-1.5 text-xs font-semibold"
          >
            <Sparkles className="h-4 w-4 text-amber-300" />
            <span>AI Audit Summary</span>
          </Button>
        </div>
      </div>

      {/* 5-Metric Commercial Performance Grid */}
      <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-5">
        {/* Metric 1: Turnover */}
        <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-gray-500">Gross Turnover</span>
            <span className="rounded bg-gray-100 p-1 text-gray-600">
              <DollarSign className="h-3.5 w-3.5" />
            </span>
          </div>
          <div className="mt-2 text-xl font-bold text-gray-900">{data.revenue}</div>
          <div className="mt-1 flex items-center gap-1 text-[11px] text-emerald-600 font-medium">
            <ArrowUpRight className="h-3 w-3" />
            <span>Commercial Inflows</span>
          </div>
        </div>

        {/* Metric 2: Cost of Sales */}
        <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-gray-500">Cost of Sales</span>
            <span className="rounded bg-gray-100 p-1 text-gray-600">
              <Layers className="h-3.5 w-3.5" />
            </span>
          </div>
          <div className="mt-2 text-xl font-bold text-gray-900">{data.costOfSales || "Rs. 15.2M"}</div>
          <div className="mt-1 text-[11px] text-gray-400 font-medium">
            <span>Direct Production Costs</span>
          </div>
        </div>

        {/* Metric 3: Gross Profit */}
        <div className="rounded-xl border border-emerald-100 bg-emerald-50/20 p-4 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-emerald-900">Gross Profit</span>
            <span className="rounded-full bg-emerald-100 px-1.5 py-0.5 text-[10px] font-bold text-emerald-800">
              {data.grossMarginPercent || 39.2}%
            </span>
          </div>
          <div className="mt-2 text-xl font-bold text-emerald-700">{data.grossProfit || "Rs. 9.8M"}</div>
          <div className="mt-1 text-[11px] text-emerald-600 font-medium">
            <span>Trading Margin</span>
          </div>
        </div>

        {/* Metric 4: Operating Expenses */}
        <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-gray-500">Operating OPEX</span>
            <span className="rounded bg-gray-100 p-1 text-gray-600">
              <TrendingUp className="h-3.5 w-3.5" />
            </span>
          </div>
          <div className="mt-2 text-xl font-bold text-gray-900">{data.operatingExpenses || "Rs. 5.2M"}</div>
          <div className="mt-1 text-[11px] text-gray-400 font-medium">
            <span>Admin & Sales Overheads</span>
          </div>
        </div>

        {/* Metric 5: Accounting Profit PBT */}
        <div className="rounded-xl border border-blue-200 bg-blue-50/40 p-4 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-brand-blue">Accounting PBT</span>
            <span className="rounded-full bg-blue-100 px-1.5 py-0.5 text-[10px] font-bold text-brand-blue">
              18.4% Net
            </span>
          </div>
          <div className="mt-2 text-xl font-extrabold text-brand-blue">{data.accountingProfit}</div>
          <div className="mt-1 flex items-center gap-1 text-[11px] text-brand-blue font-medium">
            <ShieldCheck className="h-3 w-3" />
            <span>Draft for Auditor Review</span>
          </div>
        </div>
      </div>

      {/* Statutory CIT Tax Computation & Prediction Waterfall Banner */}
      <CitTaxComputationBanner data={data} />

      {/* Interactive Sub-tabbed Line Items & Schedules */}
      <FinancialsTable data={data} />

      {/* AI Financial & Tax Executive Report Modal */}
      <AiFinancialReportModal
        isOpen={reportModalOpen}
        onClose={() => setReportModalOpen(false)}
        reportData={initialReport}
      />
    </div>
  );
}
