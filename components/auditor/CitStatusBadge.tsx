import Badge, { BadgeTone } from "@/components/ui/Badge";
import { CitStatus } from "@/lib/types";

const STATUS_TONE: Record<CitStatus, BadgeTone> = {
  Draft: "neutral",
  "Under Review": "info",
  "Ready for Auditor": "success",
  Approved: "success",
  "Waiting for Company": "pending",
};

// Maps a company's CIT status to the right Badge tone, used on both
// the Companies table and the Auditor Dashboard's priority list.
export default function CitStatusBadge({ status }: { status: CitStatus }) {
  return <Badge tone={STATUS_TONE[status]}>{status}</Badge>;
}
