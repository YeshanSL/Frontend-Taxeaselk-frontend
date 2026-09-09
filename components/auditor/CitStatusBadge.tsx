import Badge, { BadgeTone } from "@/components/ui/Badge";
import T from "@/components/layout/T";
import { CitStatus } from "@/lib/types";
import { TranslationKey } from "@/lib/i18n/translations";

const STATUS_TONE: Record<CitStatus, BadgeTone> = {
  Draft: "neutral",
  "Under Review": "info",
  "Ready for Auditor": "success",
  Approved: "success",
  "Waiting for Company": "pending",
};

const STATUS_KEYS: Record<CitStatus, TranslationKey> = {
  Draft: "status.draft",
  "Under Review": "status.underReview",
  "Ready for Auditor": "status.readyForAuditor",
  Approved: "status.approved",
  "Waiting for Company": "status.waitingForCompany",
};

// Maps a company's CIT status to the right Badge tone, used on both
// the Companies table and the Auditor Dashboard's priority list.
export default function CitStatusBadge({ status }: { status: CitStatus }) {
  const k = STATUS_KEYS[status] || "status.draft";
  return (
    <Badge tone={STATUS_TONE[status]}>
      <T k={k} />
    </Badge>
  );
}
