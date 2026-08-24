import Badge, { BadgeTone } from "@/components/ui/Badge";

const TONE_MAP: Record<string, BadgeTone> = {
  success: "success",
  warning: "warning",
  info: "info",
  pending: "pending",
};

// Renders the colored "action" pill in the Audit Log table
// (e.g. "CIT Computation Approved" in green, "Issue Flagged" in amber).
export default function AuditActionBadge({
  action,
  tone,
}: {
  action: string;
  tone: "success" | "warning" | "info" | "pending";
}) {
  return <Badge tone={TONE_MAP[tone]}>{action}</Badge>;
}
