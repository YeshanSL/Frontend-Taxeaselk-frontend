"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import {
  Download,
  FileText,
  FileSpreadsheet,
  CheckCircle2,
  Clock,
  AlertCircle,
  Building2,
  Search,
  Check,
  RotateCcw,
  MessageSquare,
  X,
  Send,
  ExternalLink,
  PackageCheck,
} from "lucide-react";
import Card from "@/components/ui/Card";
import StatCard from "@/components/ui/StatCard";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import T from "@/components/layout/T";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import {
  AuditorResponsesSummary,
  ClientResponseItem,
  AttachedResponseFile,
} from "@/lib/types";
import { resolveAuditorResponse, requestAuditorRevision } from "@/lib/api/auditor";

export default function AuditorResponsesManager({
  initial,
}: {
  initial: AuditorResponsesSummary;
}) {
  const { t } = useLanguage();
  const [responses, setResponses] = useState<ClientResponseItem[]>(initial.responses);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState<"all" | "unreviewed" | "resolved" | "revision_requested">("all");
  const [grabbedFileIds, setGrabbedFileIds] = useState<Record<string, boolean>>({});
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Revision Modal State
  const [revisionModalOpen, setRevisionModalOpen] = useState(false);
  const [selectedResponse, setSelectedResponse] = useState<ClientResponseItem | null>(null);
  const [revisionNote, setRevisionNote] = useState("");
  const [submittingRevision, setSubmittingRevision] = useState(false);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage((current) => (current === msg ? null : current));
    }, 4000);
  };

  // Stats calculation
  const totalCount = responses.length;
  const unreviewedCount = useMemo(
    () => responses.filter((r) => r.status === "unreviewed").length,
    [responses]
  );
  const resolvedCount = useMemo(
    () => responses.filter((r) => r.status === "resolved").length,
    [responses]
  );
  const revisionCount = useMemo(
    () => responses.filter((r) => r.status === "revision_requested").length,
    [responses]
  );

  // Filtering
  const filteredResponses = useMemo(() => {
    return responses.filter((resp) => {
      if (activeFilter !== "all" && resp.status !== activeFilter) {
        return false;
      }

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchesCompany = resp.companyName.toLowerCase().includes(q);
        const matchesTitle = resp.requestTitle.toLowerCase().includes(q);
        const matchesId = resp.requestId.toLowerCase().includes(q);
        const matchesCategory = resp.category.toLowerCase().includes(q);
        const matchesNote = resp.clientResponseNote.toLowerCase().includes(q);
        const matchesFiles = resp.attachedFiles.some((f) =>
          f.name.toLowerCase().includes(q)
        );
        return (
          matchesCompany ||
          matchesTitle ||
          matchesId ||
          matchesCategory ||
          matchesNote ||
          matchesFiles
        );
      }

      return true;
    });
  }, [responses, activeFilter, searchQuery]);

  // Handle Grab Single File
  const handleGrabFile = (file: AttachedResponseFile, companyName: string) => {
    const dummyContent = 'TaxEaseLK Document Export\nFile: ' + file.name + '\nCompany: ' + companyName + '\nDate: ' + file.uploadedAt + '\nVerification Status: Verified for CIT Review';
    const blob = new Blob([dummyContent], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = file.name;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    setGrabbedFileIds((prev) => ({ ...prev, [file.id]: true }));
    showToast('Grabbed "' + file.name + '" successfully!');
  };

  // Handle Grab All Files for a response
  const handleGrabAllFiles = (resp: ClientResponseItem) => {
    resp.attachedFiles.forEach((file, idx) => {
      setTimeout(() => {
        handleGrabFile(file, resp.companyName);
      }, idx * 300);
    });
    showToast('Grabbing all ' + resp.attachedFiles.length + ' files from ' + resp.companyName + '...');
  };

  // Handle Accept & Resolve
  const handleAccept = async (responseId: string) => {
    await resolveAuditorResponse(responseId);
    setResponses((prev) =>
      prev.map((r) => (r.id === responseId ? { ...r, status: "resolved" } : r))
    );
    showToast("Response accepted & marked as resolved!");
  };

  // Open Revision Modal
  const handleOpenRevisionModal = (resp: ClientResponseItem) => {
    setSelectedResponse(resp);
    setRevisionNote("");
    setRevisionModalOpen(true);
  };

  // Submit Revision
  const handleSubmitRevision = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedResponse || !revisionNote.trim()) return;

    setSubmittingRevision(true);
    await requestAuditorRevision(selectedResponse.id, revisionNote.trim());
    setResponses((prev) =>
      prev.map((r) =>
        r.id === selectedResponse.id
          ? {
              ...r,
              status: "revision_requested",
              revisionNote: revisionNote.trim(),
            }
          : r
      )
    );
    setSubmittingRevision(false);
    setRevisionModalOpen(false);
    showToast('Revision request sent to ' + selectedResponse.companyName);
  };

  return (
    <div className="space-y-6">
      {/* Toast notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2 rounded-xl bg-gray-900 px-4 py-3 text-sm font-medium text-white shadow-xl">
          <CheckCircle2 className="h-4 w-4 text-green-400" />
          <span>{toastMessage}</span>
          <button
            onClick={() => setToastMessage(null)}
            className="ml-2 text-gray-400 hover:text-white"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            <T k="pages.responses.title" />
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            <T k="pages.responses.subtitle" />
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link href="/requests">
            <Button variant="secondary" icon={<ExternalLink className="h-4 w-4" />}>
              View Sent Requests
            </Button>
          </Link>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard
          label="Total Responses"
          value={String(totalCount)}
          hint="From all client companies"
        />
        <StatCard
          label="Awaiting Your Review"
          value={String(unreviewedCount)}
          valueClassName="text-amber-600"
          hint="Action required to verify"
        />
        <StatCard
          label="Accepted & Resolved"
          value={String(resolvedCount)}
          valueClassName="text-green-600"
          hint="Fulfilled auditor requests"
        />
      </div>

      {/* Search & Filter Toolbar */}
      <Card className="p-4">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          {/* Search */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search by company, request title, file name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-lg border border-gray-200 py-2 pl-9 pr-4 text-sm focus:border-brand-blue focus:outline-none focus:ring-1 focus:ring-brand-blue"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>

          {/* Filter tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0">
            <button
              onClick={() => setActiveFilter("all")}
              className={'rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors ' + (activeFilter === "all" ? "bg-brand-blue text-white shadow-sm" : "bg-gray-100 text-gray-600 hover:bg-gray-200")}
            >
              All ({totalCount})
            </button>
            <button
              onClick={() => setActiveFilter("unreviewed")}
              className={'flex items-center gap-1 rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors ' + (activeFilter === "unreviewed" ? "bg-amber-500 text-white shadow-sm" : "bg-amber-50 text-amber-700 hover:bg-amber-100")}
            >
              <span className="h-1.5 w-1.5 rounded-full bg-amber-400"></span>
              Needs Review ({unreviewedCount})
            </button>
            <button
              onClick={() => setActiveFilter("resolved")}
              className={'flex items-center gap-1 rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors ' + (activeFilter === "resolved" ? "bg-green-600 text-white shadow-sm" : "bg-green-50 text-green-700 hover:bg-green-100")}
            >
              <span className="h-1.5 w-1.5 rounded-full bg-green-500"></span>
              Resolved ({resolvedCount})
            </button>
            {revisionCount > 0 && (
              <button
                onClick={() => setActiveFilter("revision_requested")}
                className={'rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors ' + (activeFilter === "revision_requested" ? "bg-orange-500 text-white shadow-sm" : "bg-orange-50 text-orange-700 hover:bg-orange-100")}
              >
                Revision ({revisionCount})
              </button>
            )}
          </div>
        </div>
      </Card>

      {/* Responses List */}
      <div className="space-y-4">
        {filteredResponses.length === 0 ? (
          <Card className="py-12 text-center">
            <PackageCheck className="mx-auto h-12 w-12 text-gray-300" />
            <h3 className="mt-3 text-base font-semibold text-gray-700">
              No matching responses found
            </h3>
            <p className="mt-1 text-sm text-gray-400">
              {searchQuery
                ? 'No client responses match "' + searchQuery + '"'
                : "There are currently no responses under this filter."}
            </p>
          </Card>
        ) : (
          filteredResponses.map((resp) => {
            const hasFiles = resp.attachedFiles && resp.attachedFiles.length > 0;

            return (
              <Card key={resp.id} className="p-6 transition-all hover:border-gray-300">
                {/* Response Top Bar */}
                <div className="flex flex-col gap-3 pb-4 border-b border-gray-100 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-brand-blue">
                      <Building2 className="h-5 w-5" />
                    </div>
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-base font-bold text-gray-900">
                          {resp.companyName}
                        </span>
                        <span className="font-mono text-xs font-semibold text-gray-500 bg-gray-100 px-2 py-0.5 rounded">
                          {resp.requestId}
                        </span>
                        <Badge tone="neutral">{resp.category}</Badge>
                      </div>
                      <div className="mt-1 flex items-center gap-2 text-xs text-gray-500">
                        <span>Submitted by <strong className="text-gray-700">{resp.submittedBy}</strong></span>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <Clock className="h-3.5 w-3.5 text-gray-400" />
                          {resp.submittedAt}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Status Indicator */}
                  <div>
                    {resp.status === "unreviewed" && (
                      <Badge tone="warning">Awaiting Review</Badge>
                    )}
                    {resp.status === "resolved" && (
                      <Badge tone="success">Accepted & Resolved</Badge>
                    )}
                    {resp.status === "revision_requested" && (
                      <Badge tone="critical">Revision Requested</Badge>
                    )}
                  </div>
                </div>

                {/* Original Request Info Box */}
                <div className="mt-4 rounded-lg bg-blue-50/60 p-3 text-sm text-gray-700">
                  <span className="font-semibold text-brand-blue">Auditor Request: </span>
                  <span className="text-gray-800">{resp.requestTitle}</span>
                </div>

                {/* Client Explanation Note */}
                <div className="mt-3">
                  <div className="rounded-lg border border-gray-100 bg-gray-50/70 p-3 text-sm text-gray-700">
                    <p className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-1">
                      Client Response & Explanation
                    </p>
                    <p className="italic text-gray-800">&ldquo;{resp.clientResponseNote}&rdquo;</p>
                  </div>
                </div>

                {/* Revision Note Banner if any */}
                {resp.status === "revision_requested" && resp.revisionNote && (
                  <div className="mt-3 flex items-start gap-2 rounded-lg bg-orange-50 p-3 text-sm text-orange-800 border border-orange-200">
                    <AlertCircle className="h-4 w-4 shrink-0 text-orange-600 mt-0.5" />
                    <div>
                      <span className="font-semibold">Revision instructions sent: </span>
                      <span>{resp.revisionNote}</span>
                    </div>
                  </div>
                )}

                {/* Attached Files to Grab */}
                {hasFiles && (
                  <div className="mt-4 pt-3 border-t border-gray-100">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">
                        Attached Files to Grab ({resp.attachedFiles.length})
                      </p>
                      {resp.attachedFiles.length > 1 && (
                        <button
                          onClick={() => handleGrabAllFiles(resp)}
                          className="flex items-center gap-1 text-xs font-semibold text-brand-blue hover:text-blue-700"
                        >
                          <Download className="h-3.5 w-3.5" />
                          Grab All Files ({resp.attachedFiles.length})
                        </button>
                      )}
                    </div>

                    <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
                      {resp.attachedFiles.map((file) => {
                        const isGrabbed = grabbedFileIds[file.id];
                        const isSpreadsheet =
                          file.name.endsWith(".xlsx") ||
                          file.name.endsWith(".xls") ||
                          file.type.toLowerCase().includes("spreadsheet");

                        return (
                          <div
                            key={file.id}
                            className="flex items-center justify-between rounded-xl border border-gray-200 bg-white p-3 hover:border-brand-blue/50 transition-colors shadow-sm"
                          >
                            <div className="flex items-center gap-2.5 min-w-0 flex-1 mr-3">
                              <div
                                className={'flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ' + (isSpreadsheet ? "bg-emerald-50 text-emerald-600" : "bg-rose-50 text-rose-600")}
                              >
                                {isSpreadsheet ? (
                                  <FileSpreadsheet className="h-5 w-5" />
                                ) : (
                                  <FileText className="h-5 w-5" />
                                )}
                              </div>
                              <div className="min-w-0 flex-1">
                                <p className="truncate text-sm font-medium text-gray-900" title={file.name}>
                                  {file.name}
                                </p>
                                <p className="text-xs text-gray-400">
                                  {file.size} • {file.uploadedAt}
                                </p>
                              </div>
                            </div>

                            {/* Grab File Button */}
                            <Button
                              variant={isGrabbed ? "secondary" : "primary"}
                              icon={
                                isGrabbed ? (
                                  <Check className="h-3.5 w-3.5 text-green-600" />
                                ) : (
                                  <Download className="h-3.5 w-3.5" />
                                )
                              }
                              onClick={() => handleGrabFile(file, resp.companyName)}
                              className={isGrabbed ? "!px-3 !py-1.5 !text-xs border-green-300 bg-green-50 text-green-700" : "!px-3 !py-1.5 !text-xs"}
                            >
                              {isGrabbed ? "Grabbed" : "Grab File"}
                            </Button>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Auditor Action Buttons */}
                <div className="mt-5 flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-gray-100">
                  <div className="flex items-center gap-2">
                    {resp.status !== "resolved" ? (
                      <Button
                        variant="success"
                        icon={<CheckCircle2 className="h-4 w-4" />}
                        onClick={() => handleAccept(resp.id)}
                      >
                        {t("auditor.responses.markVerified")}
                      </Button>
                    ) : (
                      <div className="flex items-center gap-1.5 text-sm font-semibold text-green-700 bg-green-50 px-3 py-1.5 rounded-lg">
                        <CheckCircle2 className="h-4 w-4 text-green-600" />
                        {t("auditor.documents.verified")}
                      </div>
                    )}

                    {resp.status !== "revision_requested" && (
                      <Button
                        variant="secondary"
                        icon={<RotateCcw className="h-4 w-4 text-orange-600" />}
                        onClick={() => handleOpenRevisionModal(resp)}
                      >
                        {t("auditor.responses.requestClarification")}
                      </Button>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    <Link href="/auditor-discussions">
                      <Button
                        variant="secondary"
                        icon={<MessageSquare className="h-4 w-4" />}
                        className="!px-3 !py-1.5 !text-xs"
                      >
                        {t("discussions.title")}
                      </Button>
                    </Link>
                  </div>
                </div>
              </Card>
            );
          })
        )}
      </div>

      {/* Revision Modal */}
      {revisionModalOpen && selectedResponse && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <RotateCcw className="h-5 w-5 text-orange-600" />
                <h2 className="text-lg font-bold text-gray-900">
                  {t("auditor.responses.requestClarification")}
                </h2>
              </div>
              <button
                onClick={() => setRevisionModalOpen(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitRevision} className="mt-4 space-y-4">
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  {t("common.company")}
                </p>
                <p className="text-sm font-bold text-gray-900 mt-0.5">
                  {selectedResponse.companyName} ({selectedResponse.requestId})
                </p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                  Revision Instructions for Client
                </label>
                <textarea
                  required
                  rows={4}
                  value={revisionNote}
                  onChange={(e) => setRevisionNote(e.target.value)}
                  placeholder="Explain what is missing, incomplete, or requires clarification (e.g. 'Invoice #4021 is illegible, please upload a clear scan with breakdown')..."
                  className="w-full rounded-lg border border-gray-300 p-3 text-sm focus:border-brand-blue focus:outline-none focus:ring-1 focus:ring-brand-blue"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-gray-100">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => setRevisionModalOpen(false)}
                >
                  {t("common.cancel")}
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  icon={<Send className="h-4 w-4" />}
                  disabled={submittingRevision || !revisionNote.trim()}
                >
                  {submittingRevision ? t("common.saving") : t("common.send")}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
