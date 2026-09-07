"use client";

import { useState, useEffect } from "react";
import { Search, Send, MessagesSquare, Building2, User, CheckCircle2 } from "lucide-react";
import Card from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import T from "@/components/layout/T";
import { DiscussionThread } from "@/lib/types";

const INITIAL_THREADS: DiscussionThread[] = [
  {
    id: "disc_1",
    companyName: "ABC Holdings (Pvt) Ltd",
    topic: "Reconciliation of Taxable Income & GL Variance",
    lastMessage: "We have attached the updated breakdown for the November discrepancy.",
    lastUpdated: "10 mins ago",
    unreadCount: 2,
    status: "Open",
    messages: [
      {
        id: "m_1",
        sender: "Professional Auditor",
        senderRole: "Auditor",
        text: "Hello ABC team, we noticed a minor variance in November 2025 General Ledger reconciliation. Could you clarify the entries on line 42?",
        timestamp: "Yesterday, 14:30",
      },
      {
        id: "m_2",
        sender: "Admin User (ABC Holdings)",
        senderRole: "Company",
        text: "Hello! Our finance team reviewed the ledger. It was a timing difference in supplier invoice recognition.",
        timestamp: "Today, 09:15",
      },
      {
        id: "m_3",
        sender: "Admin User (ABC Holdings)",
        senderRole: "Company",
        text: "We have attached the updated breakdown for the November discrepancy.",
        timestamp: "10 mins ago",
      },
    ],
  },
  {
    id: "disc_2",
    companyName: "Lanka Trading (Pvt) Ltd",
    topic: "Depreciation Rates Confirmation for FY2025/26",
    lastMessage: "Auditor: Please confirm if straight-line basis was maintained.",
    lastUpdated: "2 hours ago",
    unreadCount: 0,
    status: "Open",
    messages: [
      {
        id: "m_4",
        sender: "Professional Auditor",
        senderRole: "Auditor",
        text: "Please confirm if straight-line basis was maintained consistently with the previous financial year.",
        timestamp: "2 hours ago",
      },
    ],
  },
  {
    id: "disc_3",
    companyName: "Ocean Foods (Pvt) Ltd",
    topic: "Tax Exemption Certificate Submission",
    lastMessage: "Auditor: Verified and approved. Thank you!",
    lastUpdated: "1 day ago",
    unreadCount: 0,
    status: "Closed",
    messages: [
      {
        id: "m_5",
        sender: "Ocean Foods Accountant",
        senderRole: "Company",
        text: "We have uploaded our BOI tax exemption certificate for fisheries export.",
        timestamp: "2 days ago",
      },
      {
        id: "m_6",
        sender: "Professional Auditor",
        senderRole: "Auditor",
        text: "Verified and approved. Thank you!",
        timestamp: "1 day ago",
      },
    ],
  },
];

export default function DiscussionsPage() {
  const [threads, setThreads] = useState<DiscussionThread[]>(INITIAL_THREADS);
  const [activeThreadId, setActiveThreadId] = useState<string>("disc_1");
  const [replyText, setReplyText] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState<string>("");

  useEffect(() => {
    async function loadDiscussions() {
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
        const token = typeof window !== "undefined" ? localStorage.getItem("taxease_token") : null;
        const headers: Record<string, string> = {};
        if (token) {
          headers["Authorization"] = `Bearer ${token}`;
        }
        const res = await fetch(`${apiUrl}/api/auditor/discussions`, {
          cache: "no-store",
          headers,
        });
        if (res.ok) {
          const data = await res.json();
          const list = Array.isArray(data) ? data : Array.isArray(data.threads) ? data.threads : [];
          if (list.length > 0) {
            const mapped = list.map((t: any) => ({
              id: String(t.id),
              companyName: t.company_name || t.companyName || "Assigned Company",
              topic: t.title || t.topic || "Discussion",
              lastMessage: t.last_message || t.lastMessage || "",
              lastUpdated: t.last_updated || t.lastUpdated || "Recently",
              unreadCount: t.unread_count ?? t.unreadCount ?? 0,
              status: (t.status === "Closed" ? "Closed" : "Open") as any,
              messages: Array.isArray(t.messages)
                ? t.messages.map((m: any) => ({
                    id: String(m.id),
                    sender: m.sender_name || m.sender || "User",
                    senderRole: (m.is_auditor || m.sender_role === "Auditor" || m.senderRole === "Auditor" ? "Auditor" : "Company") as any,
                    text: m.message || m.text || "",
                    timestamp: m.timestamp || "Recently",
                  }))
                : [],
            }));
            setThreads(mapped);
            setActiveThreadId(mapped[0].id);
          }
        }
      } catch {
        // Fallback
      }
    }
    loadDiscussions();
  }, []);

  const activeThread = threads.find((t) => t.id === activeThreadId) || threads[0];

  const filteredThreads = threads.filter(
    (t) =>
      t.companyName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.topic.toLowerCase().includes(searchQuery.toLowerCase())
  );

  async function handleSendReply(e: React.FormEvent) {
    e.preventDefault();
    if (!replyText.trim() || !activeThread) return;

    const trimmed = replyText.trim();
    const newMessage = {
      id: `m_${Date.now()}`,
      sender: "Professional Auditor",
      senderRole: "Auditor" as const,
      text: trimmed,
      timestamp: "Just now",
    };

    setThreads((prev) =>
      prev.map((t) =>
        t.id === activeThread.id
          ? {
              ...t,
              messages: [...t.messages, newMessage],
              lastMessage: `Auditor: ${trimmed}`,
              lastUpdated: "Just now",
            }
          : t
      )
    );

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
      const token = typeof window !== "undefined" ? localStorage.getItem("taxease_token") : null;
      const headers: Record<string, string> = { "Content-Type": "application/json" };
      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }
      await fetch(`${apiUrl}/api/auditor/discussions/${activeThread.id}/messages`, {
        method: "POST",
        headers,
        body: JSON.stringify({
          message: trimmed,
        }),
      });
    } catch {
      // Ignored
    }

    setReplyText("");
  }


  return (
    <div>
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            <T k="pages.discussions.title" />
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            <T k="pages.discussions.subtitle" />
          </p>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-[340px_1fr]">
        {/* Left: Threads list */}
        <Card className="flex h-[640px] flex-col overflow-hidden p-0">
          <div className="border-b border-gray-100 p-3">
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <input
                type="search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search conversations..."
                className="w-full rounded-lg border border-gray-200 py-2 pl-9 pr-3 text-xs placeholder:text-gray-400 focus:outline-none focus:ring-1 focus:ring-brand-blue"
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto divide-y divide-gray-50">
            {filteredThreads.map((thread) => {
              const isActive = thread.id === activeThread?.id;
              return (
                <button
                  key={thread.id}
                  onClick={() => setActiveThreadId(thread.id)}
                  className={`w-full p-4 text-left transition-colors hover:bg-gray-50 ${
                    isActive ? "bg-blue-50/50 border-l-4 border-brand-blue" : ""
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-1.5 text-xs font-semibold text-gray-800">
                      <Building2 className="h-3.5 w-3.5 text-gray-400" />
                      {thread.companyName}
                    </span>
                    <span className="text-[11px] text-gray-400">{thread.lastUpdated}</span>
                  </div>
                  <p className="mt-1 text-xs font-medium text-gray-900 line-clamp-1">
                    {thread.topic}
                  </p>
                  <p className="mt-1 text-xs text-gray-500 line-clamp-1">
                    {thread.lastMessage}
                  </p>
                  <div className="mt-2 flex items-center justify-between">
                    <Badge
                      tone={thread.status === "Open" ? "info" : "neutral"}
                      className="text-[10px] px-1.5 py-0.5"
                    >
                      {thread.status}
                    </Badge>
                    {thread.unreadCount > 0 && (
                      <span className="flex h-5 w-5 items-center justify-center rounded-full bg-brand-blue text-[11px] font-bold text-white">
                        {thread.unreadCount}
                      </span>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </Card>

        {/* Right: Message history & composer */}
        <Card className="flex h-[640px] flex-col overflow-hidden p-0">
          {activeThread ? (
            <>
              {/* Header */}
              <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="font-bold text-gray-900">{activeThread.topic}</h2>
                    <Badge tone={activeThread.status === "Open" ? "info" : "neutral"}>
                      {activeThread.status}
                    </Badge>
                  </div>
                  <p className="text-xs text-gray-500 mt-0.5">
                    Discussion with {activeThread.companyName}
                  </p>
                </div>
                {activeThread.status === "Open" && (
                  <Button
                    variant="secondary"
                    className="text-xs"
                    icon={<CheckCircle2 className="h-3.5 w-3.5" />}
                    onClick={() => {
                      setThreads((prev) =>
                        prev.map((t) =>
                          t.id === activeThread.id ? { ...t, status: "Closed" } : t
                        )
                      );
                      try {
                        const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
                        const token = typeof window !== "undefined" ? localStorage.getItem("taxease_token") : null;
                        const headers: Record<string, string> = {};
                        if (token) {
                          headers["Authorization"] = `Bearer ${token}`;
                        }
                        fetch(`${apiUrl}/api/auditor/discussions/${activeThread.id}/resolve`, {
                          method: "POST",
                          headers,
                        }).catch(() => {});
                      } catch {
                        // Ignored
                      }
                    }}
                  >
                    Mark as Resolved
                  </Button>

                )}
              </div>

              {/* Messages area */}
              <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-gray-50/40">
                {activeThread.messages.map((msg) => {
                  const isAuditor = msg.senderRole === "Auditor";
                  return (
                    <div
                      key={msg.id}
                      className={`flex gap-3 ${isAuditor ? "flex-row-reverse" : "flex-row"}`}
                    >
                      <div
                        className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-semibold ${
                          isAuditor
                            ? "bg-brand-blue text-white"
                            : "bg-gray-200 text-gray-700"
                        }`}
                      >
                        {isAuditor ? "PA" : <User className="h-4 w-4" />}
                      </div>
                      <div
                        className={`max-w-md rounded-xl p-3.5 shadow-sm text-sm ${
                          isAuditor
                            ? "bg-brand-blue text-white"
                            : "bg-white border border-gray-200 text-gray-800"
                        }`}
                      >
                        <div
                          className={`flex items-center gap-2 text-[11px] mb-1 font-medium ${
                            isAuditor ? "text-blue-100" : "text-gray-400"
                          }`}
                        >
                          <span>{msg.sender}</span>
                          <span>•</span>
                          <span>{msg.timestamp}</span>
                        </div>
                        <p className="leading-relaxed">{msg.text}</p>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Reply box */}
              <form
                onSubmit={handleSendReply}
                className="border-t border-gray-100 p-4 bg-white flex items-center gap-3"
              >
                <input
                  type="text"
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  placeholder="Type your response or clarification query..."
                  className="flex-1 rounded-lg border border-gray-200 px-4 py-2.5 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-1 focus:ring-brand-blue"
                />
                <Button type="submit" icon={<Send className="h-4 w-4" />}>
                  Send
                </Button>
              </form>
            </>
          ) : (
            <div className="flex flex-1 flex-col items-center justify-center text-gray-400">
              <MessagesSquare className="h-12 w-12 stroke-1" />
              <p className="mt-2 text-sm">Select a discussion thread to view</p>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}

