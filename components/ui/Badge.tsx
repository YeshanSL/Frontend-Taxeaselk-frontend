import { ReactNode } from "react";
import clsx from "clsx";

// The colored status pills used everywhere: "Processed", "Critical",
// "Approved", "Waiting for Review", etc. One component, one set of
// color rules, so every status pill in the app looks the same.
export type BadgeTone =
  | "success"
  | "warning"
  | "critical"
  | "info"
  | "pending"
  | "neutral";

const toneClasses: Record<BadgeTone, string> = {
  success: "bg-status-success-bg text-status-success",
  warning: "bg-status-warning-bg text-status-warning",
  critical: "bg-status-critical-bg text-status-critical",
  info: "bg-status-info-bg text-status-info",
  pending: "bg-status-pending-bg text-status-pending",
  neutral: "bg-gray-100 text-gray-600",
};

export default function Badge({
  tone = "neutral",
  children,
}: {
  tone?: BadgeTone;
  children: ReactNode;
}) {
  return (
    <span
      className={clsx(
        "inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium",
        toneClasses[tone]
      )}
    >
      {children}
    </span>
  );
}
