"use client";

import { useState, useRef, useEffect } from "react";
import {
  Search,
  Send,
  MessagesSquare,
  CheckCircle2,
  Plus,
  X,
  Tag,
  ShieldCheck,
  RotateCcw,
  Sparkles,
  Building2,
} from "lucide-react";
import Card from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import { DiscussionThread, DiscussionMessage, BusinessDiscussionSummary } from "@/lib/types";
import {
  getBusinessDiscussions,
  sendBusinessDiscussionMessage,
  createBusinessDiscussion,
  resolveBusinessDiscussion,
} from "@/lib/api/business";
import { useLanguage } from "@/lib/i18n/LanguageContext";

interface BusinessDiscussionsManagerProps {
  initialData: BusinessDiscussionSummary;
}

const CATEGORIES = [
  "Tax Computation",
  "Document Clarification",
  "Fixed Assets & Depreciation",
  "Exemptions & Reliefs",
  "General Audit Inquiry",
];

export default function BusinessDiscussionsManager({
  initialData,
}: BusinessDiscussionsManagerProps) {
  const { t } = useLanguage();
  const [threads, setThreads] = useState<DiscussionThread[]>(initialData.threads);
  const [activeThreadId, setActiveThreadId] = useState<string>(
    initialData.threads[0]?.id || ""
  );
  const [currentCompany, setCurrentCompany] = useState<string>("ABC Holdings (Pvt) Ltd");
  const [isLoadingThreads, setIsLoadingThreads] = useState(false);
  const [filterStatus, setFilterStatus] = useState<"ALL" | "OPEN" | "CLOSED">("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [replyText, setReplyText] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // New Topic Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newTopic, setNewTopic] = useState("");
  const [newCategory, setNewCategory] = useState(CATEGORIES[0]);
  const [newInitialMessage, setNewInitialMessage] = useState("");
  const [isCreatingTopic, setIsCreatingTopic] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const activeThread = threads.find((t) => t.id === activeThreadId) || threads[0];

  // Auto-scroll messages to bottom when active thread or messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [activeThread?.messages?.length, activeThreadId]);

  // Sync company from localStorage (taxease_company_settings / taxease_user)
  useEffect(() => {
    function syncCompany() {
      try {
        const saved = localStorage.getItem("taxease_company_settings");
        if (saved) {
          const parsed = JSON.parse(saved);
          if (parsed.companyName) {
            setCurrentCompany(parsed.companyName);
            return;
          }
        }
        const user = localStorage.getItem("taxease_user");
        if (user) {
          const parsed = JSON.parse(user);
          const name = parsed.company_name || parsed.display_name || parsed.companyName;
          if (name) {
            setCurrentCompany(name);
          }
        }
      } catch {
        // Ignored
      }
    }
    syncCompany();
    window.addEventListener("taxease_company_updated", syncCompany);
    window.addEventListener("storage", syncCompany);
    return () => {
      window.removeEventListener("taxease_company_updated", syncCompany);
      window.removeEventListener("storage", syncCompany);
    };
  }, []);

  // Fetch discussion threads dynamically when active company changes
  useEffect(() => {
    let isCancelled = false;
    async function loadThreadsForCompany() {
      setIsLoadingThreads(true);
      try {
        const res = await getBusinessDiscussions(currentCompany);
        if (!isCancelled && res && Array.isArray(res.threads)) {
          setThreads(res.threads);
          if (res.threads.length > 0) {
            setActiveThreadId(res.threads[0].id);
          }
        }
      } catch {
        // Graceful
      } finally {
        if (!isCancelled) setIsLoadingThreads(false);
      }
    }
    loadThreadsForCompany();
    return () => {
      isCancelled = true;
    };
  }, [currentCompany]);

  const filteredThreads = threads.filter((t) => {
    const matchesSearch =
      t.topic.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (t.category && t.category.toLowerCase().includes(searchQuery.toLowerCase())) ||
      t.messages.some((m) => m.text.toLowerCase().includes(searchQuery.toLowerCase()));

    if (!matchesSearch) return false;
    if (filterStatus === "OPEN") return t.status === "Open";
    if (filterStatus === "CLOSED") return t.status === "Closed";
    return true;
  });

  // Send message in existing thread
  async function handleSendReply(e: React.FormEvent) {
    e.preventDefault();
    if (!replyText.trim() || !activeThread || isSubmitting) return;

    const trimmed = replyText.trim();
    const newMsg: DiscussionMessage = {
      id: `msg_${Date.now()}`,
      sender: "Admin User (You)",
      senderRole: "Company",
      text: trimmed,
      timestamp: "Just now",
    };

    setIsSubmitting(true);
    setThreads((prev) =>
      prev.map((t) =>
        t.id === activeThread.id
          ? {
              ...t,
              messages: [...t.messages, newMsg],
              lastMessage: `You: ${trimmed}`,
              lastUpdated: "Just now",
              // If previously closed, auto-reopen upon new question
              status: "Open",
            }
          : t
      )
    );
    setReplyText("");

    try {
      await sendBusinessDiscussionMessage(activeThread.id, trimmed);
    } catch {
      // Handled gracefully in mock
    } finally {
      setIsSubmitting(false);
    }
  }

  // Toggle resolve / reopen
  async function handleToggleResolve() {
    if (!activeThread) return;
    const nextStatus = activeThread.status === "Open" ? "Closed" : "Open";

    setThreads((prev) =>
      prev.map((t) =>
        t.id === activeThread.id ? { ...t, status: nextStatus } : t
      )
    );

    try {
      await resolveBusinessDiscussion(activeThread.id);
    } catch {
      // Ignored
    }
  }

  // Create new topic
  async function handleCreateNewTopic(e: React.FormEvent) {
    e.preventDefault();
    if (!newTopic.trim() || !newInitialMessage.trim() || isCreatingTopic) return;

    setIsCreatingTopic(true);
    const newId = `disc_${Date.now()}`;
    const firstMsg: DiscussionMessage = {
      id: `msg_${Date.now()}`,
      sender: "Admin User (You)",
      senderRole: "Company",
      text: newInitialMessage.trim(),
      timestamp: "Just now",
    };

    const newThread: DiscussionThread = {
      id: newId,
      companyName: currentCompany,
      auditorName: initialData.assignedAuditor?.name || "Mr. Karunaratne & Associates",
      topic: newTopic.trim(),
      category: newCategory,
      lastMessage: `You: ${newInitialMessage.trim()}`,
      lastUpdated: "Just now",
      unreadCount: 0,
      status: "Open",
      messages: [firstMsg],
    };

    setThreads((prev) => [newThread, ...prev]);
    setActiveThreadId(newId);

    try {
      await createBusinessDiscussion(
        newTopic.trim(),
        newCategory,
        newInitialMessage.trim(),
        currentCompany
      );
    } catch {
      // Handled
    } finally {
      setIsCreatingTopic(false);
      setIsModalOpen(false);
      setNewTopic("");
      setNewCategory(CATEGORIES[0]);
      setNewInitialMessage("");
    }
  }

  return (
    <div className="mt-6 space-y-4">
      {/* Active Company Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-blue-100 bg-blue-50/70 p-3.5 shadow-sm">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-100 text-brand-blue">
            <Building2 className="h-4 w-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-gray-500">
                {t("business.documents.activeCompany")}
              </span>
              <span className="inline-flex items-center rounded-md bg-emerald-100 px-2 py-0.5 text-[11px] font-semibold text-emerald-800">
                {t("status.connected")}
              </span>
              {isLoadingThreads && (
                <span className="inline-flex items-center text-[10px] text-gray-400 animate-pulse">
                  {t("discussions.syncingDiscussions")}
                </span>
              )}
            </div>
            <p className="text-sm font-bold text-gray-900">{currentCompany}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[380px_1fr]">
        {/* Left Column: Threads list */}
        <Card className="flex h-[700px] flex-col overflow-hidden p-0 border border-gray-100 shadow-sm">
          {/* Header & New Topic Button */}
          <div className="p-4 border-b border-gray-100 bg-white">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <MessagesSquare className="h-5 w-5 text-brand-blue" />
                <h3 className="font-bold text-gray-900 text-sm">{t("discussions.title")}</h3>
                <span className="rounded-full bg-blue-50 px-2 py-0.5 text-xs font-semibold text-brand-blue">
                  {threads.length}
                </span>
              </div>
              <Button
                variant="primary"
                className="text-xs py-1.5 px-3 shadow-sm"
                icon={<Plus className="h-3.5 w-3.5" />}
                onClick={() => setIsModalOpen(true)}
              >
                {t("discussions.newTopic")}
              </Button>
            </div>

            {/* Search Input */}
            <div className="relative mb-3">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-gray-400" />
              <input
                type="search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={t("discussions.searchPlaceholder")}
                className="w-full rounded-lg border border-gray-200 py-1.5 pl-8 pr-3 text-xs placeholder:text-gray-400 focus:border-brand-blue focus:outline-none focus:ring-1 focus:ring-brand-blue"
              />
            </div>

            {/* Filter Pills */}
            <div className="flex items-center gap-1.5 text-xs">
              <button
                onClick={() => setFilterStatus("ALL")}
                className={`rounded-md px-2.5 py-1 font-medium transition-colors ${
                  filterStatus === "ALL"
                    ? "bg-brand-blue text-white"
                    : "text-gray-600 hover:bg-gray-100"
                }`}
              >
                {t("common.all")} ({threads.length})
              </button>
              <button
                onClick={() => setFilterStatus("OPEN")}
                className={`rounded-md px-2.5 py-1 font-medium transition-colors ${
                  filterStatus === "OPEN"
                    ? "bg-brand-blue text-white"
                    : "text-gray-600 hover:bg-gray-100"
                }`}
              >
                {t("discussions.openWithCount", { count: threads.filter((t) => t.status === "Open").length })}
              </button>
              <button
                onClick={() => setFilterStatus("CLOSED")}
                className={`rounded-md px-2.5 py-1 font-medium transition-colors ${
                  filterStatus === "CLOSED"
                    ? "bg-brand-blue text-white"
                    : "text-gray-600 hover:bg-gray-100"
                }`}
              >
                {t("discussions.resolvedWithCount", { count: threads.filter((t) => t.status === "Closed").length })}
              </button>
            </div>
          </div>

          {/* Threads List Items */}
          <div className="flex-1 overflow-y-auto divide-y divide-gray-50 bg-white">
            {filteredThreads.length === 0 ? (
              <div className="p-8 text-center text-gray-400">
                <MessagesSquare className="mx-auto h-8 w-8 stroke-1 text-gray-300 mb-2" />
                <p className="text-xs font-medium">{t("discussions.noTopicsFound")}</p>
                <p className="text-[11px] text-gray-400 mt-0.5">
                  {t("discussions.noTopicsSubtitle")}
                </p>
              </div>
            ) : (
              filteredThreads.map((thread) => {
                const isActive = thread.id === activeThread?.id;
                return (
                  <button
                    key={thread.id}
                    onClick={() => setActiveThreadId(thread.id)}
                    className={`w-full p-4 text-left transition-colors hover:bg-blue-50/30 ${
                      isActive
                        ? "bg-blue-50/60 border-l-4 border-brand-blue"
                        : "border-l-4 border-transparent"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <p
                        className={`text-xs font-semibold line-clamp-1 ${
                          isActive ? "text-brand-blue" : "text-gray-900"
                        }`}
                      >
                        {thread.topic}
                      </p>
                      <span className="shrink-0 text-[10px] text-gray-400">
                        {thread.lastUpdated}
                      </span>
                    </div>

                    <p className="mt-1 text-xs text-gray-500 line-clamp-2 leading-relaxed">
                      {thread.lastMessage}
                    </p>

                    <div className="mt-2.5 flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <Badge
                          tone={thread.status === "Open" ? "info" : "neutral"}
                          className="text-[10px] px-1.5 py-0.5"
                        >
                          {thread.status === "Open" ? "Active" : "Resolved"}
                        </Badge>
                        {thread.category && (
                          <span className="flex items-center gap-1 rounded bg-gray-100 px-1.5 py-0.5 text-[10px] font-medium text-gray-600">
                            <Tag className="h-2.5 w-2.5" />
                            {thread.category}
                          </span>
                        )}
                      </div>
                      {thread.unreadCount > 0 && (
                        <span className="flex h-5 w-5 items-center justify-center rounded-full bg-brand-blue text-[10px] font-bold text-white">
                          {thread.unreadCount}
                        </span>
                      )}
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </Card>

        {/* Right Column: Active Conversation */}
        <Card className="flex h-[700px] flex-col overflow-hidden p-0 border border-gray-100 shadow-sm">
          {activeThread ? (
            <>
              {/* Header */}
              <div className="border-b border-gray-100 bg-white px-6 py-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="text-base font-bold text-gray-900">
                        {activeThread.topic}
                      </h2>
                      <Badge
                        tone={activeThread.status === "Open" ? "info" : "neutral"}
                      >
                        {activeThread.status === "Open" ? "Active" : "Resolved"}
                      </Badge>
                      {activeThread.category && (
                        <span className="rounded bg-blue-50 px-2 py-0.5 text-xs font-semibold text-brand-blue">
                          {activeThread.category}
                        </span>
                      )}
                    </div>

                    {/* Assigned Auditor Info bar */}
                    <div className="mt-1.5 flex items-center gap-2 text-xs text-gray-500">
                      <div className="flex items-center gap-1 font-medium text-gray-700">
                        <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
                        <span>{t("discussions.assignedAuditor")}</span>
                        <span className="text-gray-900 font-semibold">
                          {initialData.assignedAuditor?.name || "Mr. Karunaratne & Associates"}
                        </span>
                      </div>
                      <span className="text-gray-300">•</span>
                      <span>{initialData.assignedAuditor?.firm || "Chartered Accountants"}</span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div>
                    {activeThread.status === "Open" ? (
                      <Button
                        variant="secondary"
                        className="text-xs"
                        icon={<CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />}
                        onClick={handleToggleResolve}
                      >
                        {t("discussions.markResolved")}
                      </Button>
                    ) : (
                      <Button
                        variant="secondary"
                        className="text-xs"
                        icon={<RotateCcw className="h-3.5 w-3.5" />}
                        onClick={handleToggleResolve}
                      >
                        {t("discussions.reopen")}
                      </Button>
                    )}
                  </div>
                </div>
              </div>

              {/* Messages Area */}
              <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-slate-50/50">
                {activeThread.messages.map((msg) => {
                  const isBusinessUser = msg.senderRole === "Company";

                  return (
                    <div
                      key={msg.id}
                      className={`flex gap-3 ${
                        isBusinessUser ? "flex-row-reverse" : "flex-row"
                      }`}
                    >
                      {/* Avatar */}
                      <div
                        className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-xs font-bold shadow-sm ${
                          isBusinessUser
                            ? "bg-brand-blue text-white"
                            : "bg-slate-800 text-white"
                        }`}
                      >
                        {isBusinessUser ? "AU" : "PA"}
                      </div>

                      {/* Bubble */}
                      <div
                        className={`max-w-lg rounded-2xl p-4 shadow-sm text-sm ${
                          isBusinessUser
                            ? "bg-brand-blue text-white rounded-tr-none"
                            : "bg-white border border-gray-200 text-gray-800 rounded-tl-none"
                        }`}
                      >
                        <div
                          className={`flex items-center gap-2 text-[11px] mb-1.5 font-medium ${
                            isBusinessUser ? "text-blue-100" : "text-gray-400"
                          }`}
                        >
                          <span className="font-semibold">{msg.sender}</span>
                          <span>•</span>
                          <span>{msg.timestamp}</span>
                        </div>
                        <p className="leading-relaxed whitespace-pre-wrap">{msg.text}</p>
                      </div>
                    </div>
                  );
                })}
                <div ref={messagesEndRef} />
              </div>

              {/* Resolved notification notice if closed */}
              {activeThread.status === "Closed" && (
                <div className="bg-amber-50/80 border-t border-amber-100 px-4 py-2 text-xs text-amber-800 flex items-center justify-between">
                  <span>
                    ✓ This topic has been marked as resolved. Sending a new message will automatically reopen it.
                  </span>
                </div>
              )}

              {/* Composer */}
              <form
                onSubmit={handleSendReply}
                className="border-t border-gray-100 p-4 bg-white flex items-center gap-3"
              >
                <input
                  type="text"
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  placeholder={t("discussions.typePlaceholder")}
                  className="flex-1 rounded-lg border border-gray-200 px-4 py-2.5 text-sm placeholder:text-gray-400 focus:border-brand-blue focus:outline-none focus:ring-1 focus:ring-brand-blue"
                />
                <Button
                  type="submit"
                  disabled={!replyText.trim() || isSubmitting}
                  icon={<Send className="h-4 w-4" />}
                >
                  {t("common.send")}
                </Button>
              </form>
            </>
          ) : (
            <div className="flex flex-1 flex-col items-center justify-center text-gray-400 p-8">
              <MessagesSquare className="h-12 w-12 stroke-1 text-gray-300" />
              <p className="mt-3 text-sm font-semibold text-gray-600">
                {t("discussions.selectThreadPrompt")}
              </p>
              <p className="text-xs text-gray-400 mt-1 max-w-sm text-center">
                {t("discussions.selectThreadSubtitle")}
              </p>
              <Button
                variant="primary"
                className="mt-4 text-xs"
                icon={<Plus className="h-3.5 w-3.5" />}
                onClick={() => setIsModalOpen(true)}
              >
                {t("discussions.startNewDiscussion")}
              </Button>
            </div>
          )}
        </Card>
      </div>

      {/* New Discussion Topic Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg rounded-xl bg-white p-6 shadow-xl animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50 text-brand-blue">
                  <Sparkles className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 text-sm">
                    {t("discussions.modalTitle")}
                  </h3>
                  <p className="text-xs text-gray-500">
                    {t("discussions.modalWithAuditor", {
                      auditor: initialData.assignedAuditor?.name || "Mr. Karunaratne & Associates",
                      company: currentCompany,
                    })}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleCreateNewTopic} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  {t("discussions.topicSubject")} <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={newTopic}
                  onChange={(e) => setNewTopic(e.target.value)}
                  placeholder={t("discussions.topicPlaceholder")}
                  className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-brand-blue focus:outline-none focus:ring-1 focus:ring-brand-blue placeholder:text-gray-400"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  {t("discussions.category")} <span className="text-red-500">*</span>
                </label>
                <select
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                  className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-brand-blue focus:outline-none focus:ring-1 focus:ring-brand-blue text-gray-700"
                >
                  {CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  {t("discussions.initialMessage")} <span className="text-red-500">*</span>
                </label>
                <textarea
                  required
                  rows={4}
                  value={newInitialMessage}
                  onChange={(e) => setNewInitialMessage(e.target.value)}
                  placeholder={t("discussions.initialMessagePlaceholder")}
                  className="w-full rounded-lg border border-gray-200 p-3 text-sm focus:border-brand-blue focus:outline-none focus:ring-1 focus:ring-brand-blue placeholder:text-gray-400 resize-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-gray-100">
                <Button
                  type="button"
                  variant="secondary"
                  className="text-xs"
                  onClick={() => setIsModalOpen(false)}
                >
                  {t("common.cancel")}
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  className="text-xs"
                  disabled={!newTopic.trim() || !newInitialMessage.trim() || isCreatingTopic}
                >
                  {isCreatingTopic ? t("discussions.creating") : t("discussions.startNewDiscussion")}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

