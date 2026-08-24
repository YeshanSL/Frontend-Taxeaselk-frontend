import { CheckCircle2, AlertTriangle, XCircle, Loader2 } from "lucide-react";
import Badge from "@/components/ui/Badge";
import { DocumentStatus } from "@/lib/types";

// Maps a document's status to the right Badge tone + icon + label, so
// the table markup itself stays simple.
export default function DocumentStatusBadge({
  status,
}: {
  status: DocumentStatus;
}) {
  if (status === "processing") {
    return (
      <Badge tone="info">
        <Loader2 className="mr-1 h-3 w-3 animate-spin" /> Processing
      </Badge>
    );
  }
  if (status === "processed") {
    return (
      <Badge tone="success">
        <CheckCircle2 className="mr-1 h-3 w-3" /> Processed
      </Badge>
    );
  }
  if (status === "review_required") {
    return (
      <Badge tone="warning">
        <AlertTriangle className="mr-1 h-3 w-3" /> Review Required
      </Badge>
    );
  }
  return (
    <Badge tone="critical">
      <XCircle className="mr-1 h-3 w-3" /> Missing
    </Badge>
  );
}
