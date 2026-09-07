"use client";

import { useState, useMemo } from "react";
import {
  Search,
  Download,
  CheckCircle2,
  AlertCircle,
  FileText,
  Building2,
  ArrowRight,
  ArrowLeft,
  Calendar,
  FolderOpen,
  Check,
  Sparkles,
  MoreVertical,
  Eye,
} from "lucide-react";
import Card from "@/components/ui/Card";
import StatCard from "@/components/ui/StatCard";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import ProgressBar from "@/components/ui/ProgressBar";
import MiniConfidenceBar from "@/components/ui/MiniConfidenceBar";
import T from "@/components/layout/T";
import { AuditorDocumentRow, AuditorDocumentsSummary } from "@/lib/types";

interface AuditorDocumentsManagerProps {
  initialData: AuditorDocumentsSummary;
}

export default function AuditorDocumentsManager({
  initialData,
}: AuditorDocumentsManagerProps) {
  const [documents, setDocuments] = useState<AuditorDocumentRow[]>(initialData.documents);
  const [selectedCompany, setSelectedCompany] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"ALL" | "REVIEW_REQUIRED" | "VERIFIED">("ALL");
  const [toastMessage, setToastMessage] = useState("");
  const [openActionMenuId, setOpenActionMenuId] = useState<string | null>(null);

  // Group documents by company
  const companyPacks = useMemo(() => {
    const map = new Map<
      string,
      {
        companyName: string;
        documents: AuditorDocumentRow[];
        totalCount: number;
        pendingCount: number;
        verifiedCount: number;
        latestDate: string;
      }
    >();

    documents.forEach((doc) => {
      const existing = map.get(doc.companyName) || {
        companyName: doc.companyName,
        documents: [],
        totalCount: 0,
        pendingCount: 0,
        verifiedCount: 0,
        latestDate: doc.uploadedDate,
      };
      existing.documents.push(doc);
      existing.totalCount += 1;
      if (doc.status === "review_required") existing.pendingCount += 1;
      if (doc.status === "verified") existing.verifiedCount += 1;
      map.set(doc.companyName, existing);
    });

    return Array.from(map.values());
  }, [documents]);

  const activeCompanyPack = useMemo(() => {
    if (!selectedCompany) return null;
    return companyPacks.find((p) => p.companyName === selectedCompany) || null;
  }, [selectedCompany, companyPacks]);

  // Filtered documents for the active company
  const activeCompanyDocuments = useMemo(() => {
    if (!activeCompanyPack) return [];
    return activeCompanyPack.documents.filter((doc) => {
      const q = searchQuery.toLowerCase().trim();
      const matchesQuery =
        !q ||
        doc.documentName.toLowerCase().includes(q) ||
        doc.documentType.toLowerCase().includes(q);

      if (!matchesQuery) return false;
      if (statusFilter === "REVIEW_REQUIRED") return doc.status === "review_required";
      if (statusFilter === "VERIFIED") return doc.status === "verified";
      return true;
    });
  }, [activeCompanyPack, searchQuery, statusFilter]);

  // Filtered companies for overview
  const filteredCompanyPacks = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    return companyPacks.filter((pack) => {
      const matchesSearch =
        !q ||
        pack.companyName.toLowerCase().includes(q) ||
        pack.documents.some((d) => d.documentName.toLowerCase().includes(q));

      if (!matchesSearch) return false;
      if (statusFilter === "REVIEW_REQUIRED") return pack.pendingCount > 0;
      if (statusFilter === "VERIFIED") return pack.pendingCount === 0;
      return true;
    });
  }, [companyPacks, searchQuery, statusFilter]);

  // Verify single document
  function handleVerifyDoc(docId: string, docName: string) {
    setDocuments((prev) =>
      prev.map((d) => (d.id === docId ? { ...d, status: "verified" as const } : d))
    );
    setToastMessage(`"${docName}" verified and approved!`);
    setTimeout(() => setToastMessage(""), 3500);

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
      const token = typeof window !== "undefined" ? localStorage.getItem("taxease_token") : null;
      const headers: Record<string, string> = {};
      if (token) headers["Authorization"] = `Bearer ${token}`;
      fetch(`${apiUrl}/api/auditor/documents/${docId}/verify`, {
        method: "POST",
        headers,
      }).catch(() => {});
    } catch {
      // Offline fallback
    }
  }

  // Verify all in this company pack
  function handleVerifyAll() {
    if (!selectedCompany) return;
    setDocuments((prev) =>
      prev.map((d) => (d.companyName === selectedCompany ? { ...d, status: "verified" as const } : d))
    );
    setToastMessage(`All documents for ${selectedCompany} marked as verified!`);
    setTimeout(() => setToastMessage(""), 3500);
  }

  return (
    <div>
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2.5 text-xs font-semibold text-white shadow-lg animate-in fade-in slide-in-from-bottom-2 duration-150">
          <Check className="h-4 w-4" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* ================================================================= */}
      {/* VIEW 1: COMPANIES OVERVIEW (Select a company to review)          */}
      {/* ================================================================= */}
      {!selectedCompany && (
        <div>
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                <T k="pages.auditorDocuments.title" />
              </h1>
              <p className="mt-1 text-sm text-gray-500">
                <T k="pages.auditorDocuments.subtitle" />
              </p>
            </div>
            <div className="flex gap-2">
              <Button variant="secondary" icon={<Download className="h-4 w-4" />}>
                Export All Archives
              </Button>
            </div>
          </div>

          {/* Search & Filters */}
          <Card className="mt-6 p-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="relative flex-1">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <input
                  type="search"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search client companies..."
                  className="w-full rounded-lg border border-gray-200 py-2 pl-9 pr-3 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-1 focus:ring-brand-blue"
                />
              </div>

              {/* Status filter pills */}
              <div className="flex items-center gap-1.5 text-xs">
                <button
                  onClick={() => setStatusFilter("ALL")}
                  className={`rounded-md px-3 py-1.5 font-medium transition-colors ${
                    statusFilter === "ALL"
                      ? "bg-brand-blue text-white"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  All Companies ({companyPacks.length})
                </button>
                <button
                  onClick={() => setStatusFilter("REVIEW_REQUIRED")}
                  className={`rounded-md px-3 py-1.5 font-medium transition-colors ${
                    statusFilter === "REVIEW_REQUIRED"
                      ? "bg-amber-600 text-white"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  Needs Review ({companyPacks.filter((c) => c.pendingCount > 0).length})
                </button>
                <button
                  onClick={() => setStatusFilter("VERIFIED")}
                  className={`rounded-md px-3 py-1.5 font-medium transition-colors ${
                    statusFilter === "VERIFIED"
                      ? "bg-emerald-600 text-white"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  Fully Verified ({companyPacks.filter((c) => c.pendingCount === 0).length})
                </button>
              </div>
            </div>
          </Card>

          {/* Company Document Packs Grid */}
          <div className="mt-6 grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
            {filteredCompanyPacks.length === 0 ? (
              <div className="col-span-full py-12 text-center text-gray-400">
                <FolderOpen className="mx-auto h-12 w-12 stroke-1 text-gray-300 mb-2" />
                <p className="text-sm font-medium">No company document packs match your filter.</p>
              </div>
            ) : (
              filteredCompanyPacks.map((pack) => {
                const percent = Math.round((pack.verifiedCount / pack.totalCount) * 100) || 0;
                const isFullyVerified = pack.pendingCount === 0;

                return (
                  <Card
                    key={pack.companyName}
                    className="flex flex-col justify-between p-5 border border-gray-100 transition-all hover:border-blue-200 hover:shadow-md"
                  >
                    <div>
                      {/* Top Header */}
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-2.5">
                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-brand-blue">
                            <Building2 className="h-5 w-5" />
                          </div>
                          <div>
                            <h3 className="font-bold text-gray-900 text-sm leading-tight">
                              {pack.companyName}
                            </h3>
                            <span className="text-[11px] text-gray-400">FY 2025/26 Pack</span>
                          </div>
                        </div>

                        {isFullyVerified ? (
                          <Badge tone="success" className="text-[10px]">
                            ✓ Complete
                          </Badge>
                        ) : (
                          <Badge tone="warning" className="text-[10px]">
                            {pack.pendingCount} Pending
                          </Badge>
                        )}
                      </div>

                      {/* Document Counters */}
                      <div className="mt-4 grid grid-cols-3 gap-2 rounded-lg bg-gray-50/70 p-2.5 text-center text-xs">
                        <div>
                          <p className="text-[10px] text-gray-400 font-medium">Total Docs</p>
                          <p className="font-bold text-gray-800 text-sm mt-0.5">{pack.totalCount}</p>
                        </div>
                        <div>
                          <p className="text-[10px] text-amber-600 font-medium">Pending</p>
                          <p className="font-bold text-amber-600 text-sm mt-0.5">{pack.pendingCount}</p>
                        </div>
                        <div>
                          <p className="text-[10px] text-emerald-600 font-medium">Verified</p>
                          <p className="font-bold text-emerald-600 text-sm mt-0.5">{pack.verifiedCount}</p>
                        </div>
                      </div>

                      {/* Verification Progress */}
                      <div className="mt-3.5">
                        <div className="flex justify-between text-[11px] text-gray-400 mb-1">
                          <span>Verification Progress</span>
                          <span className="font-semibold text-gray-600">{percent}%</span>
                        </div>
                        <ProgressBar value={percent} />
                      </div>
                    </div>

                    {/* Footer & Start Review Action */}
                    <div className="mt-5 pt-3 border-t border-gray-100 flex items-center justify-between">
                      <div className="flex items-center gap-1 text-[11px] text-gray-400">
                        <Calendar className="h-3 w-3" />
                        <span>Updated {pack.latestDate}</span>
                      </div>

                      <Button
                        variant="primary"
                        className="text-xs py-1.5 px-3 font-semibold shadow-xs"
                        icon={<ArrowRight className="h-3.5 w-3.5" />}
                        onClick={() => {
                          setSelectedCompany(pack.companyName);
                          setSearchQuery("");
                          setStatusFilter("ALL");
                        }}
                      >
                        Start Review
                      </Button>
                    </div>
                  </Card>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* ================================================================= */}
      {/* VIEW 2: COMPANY DOCUMENT PACK (When auditor clicks Start Review)   */}
      {/* ================================================================= */}
      {selectedCompany && activeCompanyPack && (
        <div>
          {/* Back Button & Company Header */}
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <button
                type="button"
                onClick={() => {
                  setSelectedCompany(null);
                  setSearchQuery("");
                  setStatusFilter("ALL");
                }}
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-brand-blue hover:text-blue-800 transition-colors mb-2"
              >
                <ArrowLeft className="h-4 w-4" />
                <span>Back to All Companies</span>
              </button>
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-brand-blue">
                  <Building2 className="h-5 w-5" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">{selectedCompany}</h1>
                  <p className="mt-0.5 text-xs text-gray-500">
                    Client Document Pack &amp; Verification • Financial Year 2025/26
                  </p>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="secondary"
                className="text-xs"
                icon={<CheckCircle2 className="h-4 w-4 text-emerald-600" />}
                onClick={handleVerifyAll}
              >
                Mark All Verified
              </Button>
              <Button variant="secondary" className="text-xs" icon={<Download className="h-4 w-4" />}>
                Export Pack (.ZIP)
              </Button>
            </div>
          </div>

          {/* =============================================================== */}
          {/* THE 3 STAT CARDS (Specifically for this active company!)        */}
          {/* =============================================================== */}
          <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
            <StatCard
              label="Total Uploaded Documents"
              value={String(activeCompanyPack.totalCount)}
              hint={`Uploaded files for ${selectedCompany}`}
            />
            <StatCard
              label="Pending Review"
              value={String(activeCompanyPack.pendingCount)}
              valueClassName={activeCompanyPack.pendingCount > 0 ? "text-amber-600" : ""}
              hint="AI flagged or awaiting verification"
            />
            <StatCard
              label="Verified & Approved"
              value={String(activeCompanyPack.verifiedCount)}
              valueClassName="text-green-600"
              hint="Auditor signed-off"
            />
          </div>

          {/* Search & Filter bar within Company Pack */}
          <Card className="mt-6 p-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="relative flex-1">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <input
                  type="search"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={`Search ${selectedCompany}'s documents...`}
                  className="w-full rounded-lg border border-gray-200 py-2 pl-9 pr-3 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-1 focus:ring-brand-blue"
                />
              </div>

              {/* Status pills */}
              <div className="flex items-center gap-1.5 text-xs">
                <button
                  onClick={() => setStatusFilter("ALL")}
                  className={`rounded-md px-3 py-1.5 font-medium transition-colors ${
                    statusFilter === "ALL"
                      ? "bg-brand-blue text-white"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  All ({activeCompanyPack.totalCount})
                </button>
                <button
                  onClick={() => setStatusFilter("REVIEW_REQUIRED")}
                  className={`rounded-md px-3 py-1.5 font-medium transition-colors ${
                    statusFilter === "REVIEW_REQUIRED"
                      ? "bg-amber-600 text-white"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  Review Required ({activeCompanyPack.pendingCount})
                </button>
                <button
                  onClick={() => setStatusFilter("VERIFIED")}
                  className={`rounded-md px-3 py-1.5 font-medium transition-colors ${
                    statusFilter === "VERIFIED"
                      ? "bg-emerald-600 text-white"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  Verified ({activeCompanyPack.verifiedCount})
                </button>
              </div>
            </div>
          </Card>

          {/* Company Documents Table */}
          <Card className="mt-4 overflow-x-auto">
            <table className="w-full min-w-[850px] text-left text-sm">
              <thead>
                <tr className="border-b border-gray-100 text-xs font-medium uppercase tracking-wide text-gray-400">
                  <th className="px-5 py-3">Document</th>
                  <th className="px-5 py-3">Type</th>
                  <th className="px-5 py-3">Status</th>
                  <th className="px-5 py-3">AI Confidence</th>
                  <th className="px-5 py-3">Uploaded Date</th>
                  <th className="px-5 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {activeCompanyDocuments.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-5 py-10 text-center text-sm text-gray-400">
                      No documents match your filter.
                    </td>
                  </tr>
                ) : (
                  activeCompanyDocuments.map((doc) => (
                    <tr key={doc.id} className="hover:bg-gray-50/50">
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-brand-blue">
                            <FileText className="h-5 w-5" />
                          </div>
                          <div>
                            <p className="font-semibold text-gray-800">{doc.documentName}</p>
                            <p className="text-xs text-gray-400">{doc.sizeLabel}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-4 text-gray-600">{doc.documentType}</td>
                      <td className="px-5 py-4">
                        {doc.status === "verified" && (
                          <Badge tone="success" className="inline-flex items-center gap-1">
                            <CheckCircle2 className="h-3 w-3" />
                            Verified
                          </Badge>
                        )}
                        {doc.status === "review_required" && (
                          <Badge tone="warning" className="inline-flex items-center gap-1">
                            <AlertCircle className="h-3 w-3" />
                            Review Required
                          </Badge>
                        )}
                        {doc.status === "processed" && (
                          <Badge tone="info">Processed</Badge>
                        )}
                      </td>
                      <td className="px-5 py-4">
                        <MiniConfidenceBar percent={doc.aiConfidencePercent} />
                      </td>
                      <td className="px-5 py-4 text-gray-500">{doc.uploadedDate}</td>
                      <td className="px-5 py-4 text-right relative">
                        <div className="flex items-center justify-end">
                          <button
                            type="button"
                            onClick={() =>
                              setOpenActionMenuId(openActionMenuId === doc.id ? null : doc.id)
                            }
                            className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-700 transition-colors"
                            title="Document actions"
                          >
                            <MoreVertical className="h-4 w-4" />
                          </button>

                          {openActionMenuId === doc.id && (
                            <>
                              <div
                                className="fixed inset-0 z-10"
                                onClick={() => setOpenActionMenuId(null)}
                              />
                              <div className="absolute right-5 top-12 z-20 w-44 rounded-xl border border-gray-100 bg-white p-1.5 shadow-lg text-left text-xs animate-in fade-in zoom-in-95 duration-100">
                                {doc.status === "review_required" ? (
                                  <button
                                    type="button"
                                    onClick={() => {
                                      handleVerifyDoc(doc.id, doc.documentName);
                                      setOpenActionMenuId(null);
                                    }}
                                    className="flex w-full items-center gap-2 rounded-lg px-2.5 py-2 font-medium text-emerald-700 hover:bg-emerald-50 transition-colors"
                                  >
                                    <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                                    <span>Verify Document</span>
                                  </button>
                                ) : (
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setDocuments((prev) =>
                                        prev.map((d) =>
                                          d.id === doc.id
                                            ? { ...d, status: "review_required" as const }
                                            : d
                                        )
                                      );
                                      setOpenActionMenuId(null);
                                      setToastMessage(`"${doc.documentName}" marked as review required.`);
                                      setTimeout(() => setToastMessage(""), 3500);
                                    }}
                                    className="flex w-full items-center gap-2 rounded-lg px-2.5 py-2 font-medium text-amber-700 hover:bg-amber-50 transition-colors"
                                  >
                                    <AlertCircle className="h-4 w-4 text-amber-600" />
                                    <span>Mark for Review</span>
                                  </button>
                                )}

                                <button
                                  type="button"
                                  onClick={() => {
                                    setOpenActionMenuId(null);
                                    setToastMessage(`Downloading ${doc.documentName}...`);
                                    setTimeout(() => setToastMessage(""), 3000);
                                  }}
                                  className="flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-gray-700 hover:bg-gray-50 transition-colors"
                                >
                                  <Download className="h-4 w-4 text-gray-400" />
                                  <span>Download</span>
                                </button>

                                <button
                                  type="button"
                                  onClick={() => {
                                    setOpenActionMenuId(null);
                                    setToastMessage(`Opening ${doc.documentName}...`);
                                    setTimeout(() => setToastMessage(""), 3000);
                                  }}
                                  className="flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-gray-700 hover:bg-gray-50 transition-colors"
                                >
                                  <Eye className="h-4 w-4 text-gray-400" />
                                  <span>View Preview</span>
                                </button>
                              </div>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </Card>
        </div>
      )}
    </div>
  );
}
