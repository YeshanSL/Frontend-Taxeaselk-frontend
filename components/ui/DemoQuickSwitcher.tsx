"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRightLeft, X, Zap } from "lucide-react";

interface Props {
  currentRole: "business" | "auditor";
}

export default function DemoQuickSwitcher({ currentRole }: Props) {
  const [minimized, setMinimized] = useState(false);

  const targetHref = currentRole === "business" ? "/auditor-dashboard" : "/dashboard";
  const targetLabel = currentRole === "business" ? "Switch to Auditor Portal" : "Switch to Business Portal";

  if (minimized) {
    return (
      <button
        onClick={() => setMinimized(false)}
        className="fixed bottom-4 right-4 z-50 flex items-center gap-1.5 rounded-full bg-brand-navy px-3 py-1.5 text-xs font-semibold text-white shadow-xl hover:bg-black transition-transform active:scale-95"
        title="Open Demo Switcher"
      >
        <Zap className="h-3.5 w-3.5 text-amber-400" />
        Demo
      </button>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 flex items-center gap-2 rounded-full border border-blue-200 bg-white/95 px-3 py-1.5 shadow-2xl backdrop-blur-md">
      <div className="flex items-center gap-1.5 text-xs font-semibold text-gray-700">
        <span className="flex h-5 w-5 items-center justify-center rounded-full bg-amber-400/20 text-amber-600 text-xs">
          ⚡
        </span>
        <span className="hidden sm:inline text-gray-500 font-normal">Demo:</span>
      </div>

      <Link
        href={targetHref}
        className="flex items-center gap-1.5 rounded-full bg-brand-navy px-3 py-1 text-xs font-semibold text-white shadow-sm transition hover:bg-brand-blue-dark active:scale-95"
      >
        <ArrowRightLeft className="h-3 w-3 text-amber-400" />
        <span>{targetLabel}</span>
      </Link>

      <button
        onClick={() => setMinimized(true)}
        className="ml-1 rounded-full p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
        title="Minimize"
      >
        <X className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}
